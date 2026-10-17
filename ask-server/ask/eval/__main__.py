"""python -m ask.eval — 질문셋을 돌려 지표를 docs/ask/eval-report.md 에 덧붙인다 (design §7).

  uv run python -m ask.eval --label baseline
  uv run python -m ask.eval --label hybrid --judge anthropic

결과는 덮어쓰지 않고 실행마다 한 절씩 쌓는다. 원자료(질문별 결과·심사 쌍)는 eval/runs/<시각>.json 으로 남긴다.
오프라인 모드(llm=fake 또는 embedder=hash) 결과에는 그 사실을 머리에 표시한다 — 지원서 수치로 쓰지 않는다.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
import statistics
import subprocess
import sys
import time
from collections import Counter
from dataclasses import asdict
from datetime import UTC, datetime
from pathlib import Path

import yaml

from .. import store
from ..config import REPO_ROOT, SERVER_ROOT, get_settings
from ..embed import make_embedder
from ..graph import citations
from ..graph.build import Deps, build_graph
from ..llm import detect_lang, make_llm
from ..models import Hit
from ..retrieve import retrieve
from .judge import MajorityJudge, Pair, majority

QUESTIONS = SERVER_ROOT / "eval" / "questions.yaml"
RUNS = SERVER_ROOT / "eval" / "runs"
REPORT = REPO_ROOT / "docs" / "ask" / "eval-report.md"


def id_matches(chunk_id: str, source: str) -> bool:
    """chunk_id가 source(doc_id 또는 chunk_id, a|b)에 해당하나. doc_id는 chunk_id의 # 앞이다."""
    doc_id = chunk_id.split("#")[0]
    return any(doc_id == s or chunk_id == s or chunk_id.startswith(s + "~") for s in source.split("|"))


def matches(hit: Hit, source: str) -> bool:
    return id_matches(hit.chunk_id, source)


def mention_scores(items: list[dict], answer: str, answered: bool, evidence: list[str]) -> list[dict]:
    """답의 항목 재현율 (D-34) — 기대 항목마다 답에 언급됐나, 그 항목의 근거가 판정을 통과했나.

    match는 정규식 목록(대소문자 무시)이고 하나라도 맞으면 언급이다. 답하지 못했으면 언급하지 않은 것으로 센다.
    """
    return [
        {
            "item": it["item"],
            "mentioned": answered and any(re.search(m, answer, re.IGNORECASE) for m in it["match"]),
            "in_evidence": any(id_matches(e, it["sources"]) for e in evidence),
        }
        for it in items
    ]


def retrieval_scores(hits: list[Hit], sources: list[str], k: int) -> tuple[bool, float]:
    top = hits[:k]
    found = [any(matches(h, s) for h in top) for s in sources]
    return any(found), sum(found) / len(found)


def pct(xs: list[bool]) -> str:
    return f"{100 * sum(xs) / len(xs):.1f}% ({sum(xs)}/{len(xs)})" if xs else "—"


def p(values: list[float], q: float) -> float:
    s = sorted(values)
    return s[min(len(s) - 1, round(q * (len(s) - 1)))]


class DraftRecorder:
    """생성 초안을 모두 남기는 LLM 래퍼 — 상태에는 마지막 초안만 남아 1차 실패 원인을 볼 수 없다 (D-36)."""

    def __init__(self, llm):
        self.llm, self.name, self.drafts = llm, llm.name, []

    def classify(self, question):
        return self.llm.classify(question)

    def grade(self, question, candidates):
        return self.llm.grade(question, candidates)

    def generate(self, question, evidence, lang, previous=None, feedback=None):
        draft, usage = self.llm.generate(question, evidence, lang, previous, feedback)
        self.drafts.append((draft, [h.body for h in evidence]))
        return draft, usage


def git_commit() -> str:
    try:
        return subprocess.check_output(["git", "describe", "--always", "--dirty"], cwd=REPO_ROOT, text=True).strip()
    except Exception:
        return "unknown"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="python -m ask.eval")
    ap.add_argument("--label", default="run")
    ap.add_argument("--judge", choices=["none", "anthropic"], default="none")
    ap.add_argument("--judge-runs", type=int, default=3, help="같은 쌍을 몇 번 심사해 다수결할지 (홀수 권장, D-25)")
    ap.add_argument("--questions", type=Path, default=QUESTIONS, help="질문셋 (기본 eval/questions.yaml)")
    ap.add_argument("--only", help="질문 id 쉼표 목록")
    ap.add_argument("--no-report", action="store_true", help="eval-report.md에 쓰지 않는다")
    ap.add_argument("--rescore", type=Path, help="저장된 실행(eval/runs/*.json)의 답으로 항목 재현율만 다시 잰다")
    args = ap.parse_args(argv)
    if args.rescore:
        return rescore(args.rescore, args.questions)

    s = get_settings()
    llm = DraftRecorder(make_llm(s.llm, s.anthropic_model))
    embedder = make_embedder(s.embedder)
    judge = None
    if args.judge == "anthropic":
        from .judge import AnthropicJudge

        judge = MajorityJudge(AnthropicJudge(), args.judge_runs)

    questions = yaml.safe_load(args.questions.read_text())
    if args.only:
        wanted = set(args.only.split(","))
        questions = [q for q in questions if q["id"] in wanted]

    rows = []
    with store.connect(s.database_url) as conn:
        graph = build_graph(
            Deps(
                llm=llm,
                search=lambda q: retrieve(conn, embedder, q, s.top_k, s.min_score),
                contact_email=s.public_emails[0],
            )
        )
        for q in questions:
            # 검색 품질은 점수 하한 없이 top-8 원래 순위로 잰다 (리트리버 자체의 성능)
            raw = retrieve(conn, embedder, q["question"], 8, -1.0)
            llm.drafts = []
            t0 = time.perf_counter()
            st = graph.invoke({"question": q["question"]})
            latency = (time.perf_counter() - t0) * 1000
            rows.append(evaluate(q, st, raw, latency, judge, llm.drafts))
            print(
                f"  {q['id']} {rows[-1]['outcome']:12s} {'OK ' if rows[-1]['behavior_ok'] else 'NG '} {latency:6.0f}ms"
            )

    summary = summarize(rows)
    meta = {
        "label": args.label,
        "at": datetime.now(UTC).astimezone().isoformat(timespec="seconds"),
        "commit": git_commit(),
        "llm": llm.name,
        "embedder": embedder.name,
        "top_k": s.top_k,
        "min_score": s.min_score,
        "judge": judge.name if judge else "none",
        "questions": len(rows),
        "question_set": args.questions.name,
    }
    RUNS.mkdir(parents=True, exist_ok=True)
    run_path = RUNS / f"{datetime.now().strftime('%Y%m%d-%H%M%S')}-{args.label}.json"
    run_path.write_text(json.dumps({"meta": meta, "summary": summary, "rows": rows}, ensure_ascii=False, indent=2))

    csv_path = write_pairs_csv(rows, run_path.with_suffix(".pairs.csv"))

    section = render(meta, summary, rows, run_path, csv_path)
    print(section)
    if not args.no_report:
        append_report(section)
    return 0


def evaluate(q: dict, st: dict, raw: list[Hit], latency: float, judge, drafts=()) -> dict:
    expect = q["expect"].split("|")
    outcome = st["outcome"]
    answer = st.get("answer", "")
    sources = q.get("sources", [])
    row: dict = {
        "id": q["id"],
        "type": q["type"],
        "expect": q["expect"],
        "outcome": outcome,
        "latency_ms": round(latency),
        "attempts": st.get("attempts", 0),
        "violations": [v.rule for v in st.get("violations", [])],
        "cost_usd": sum(u.cost_usd for u in st.get("usage", [])),
        "tokens": [sum(u.input_tokens for u in st.get("usage", [])), sum(u.output_tokens for u in st.get("usage", []))],
        "answer": answer,
        "citations": [c["href"] for c in st.get("citations", [])],
        # 원인 분류(검색 / 판정 / 생성 / 검증)와 점수 하한 조정용 중간 결과
        "category": st.get("category"),
        "retrieved": [[h.chunk_id, round(h.score, 4)] for h in raw],  # 하한 없는 top-8
        "candidates": [h.chunk_id for h in st.get("candidates", [])],  # 하한 통과
        "evidence": [h.chunk_id for h in st.get("evidence", [])],  # 판정 통과
        "timings": {k: round(v) for k, v in st.get("timings", {}).items()},  # 노드별 ms — 지연 원인 분해
        # 초안마다 런타임 검증 위반 [규칙, 문장] — 1차 검증 실패 원인 분류용 (D-36)
        "drafts": [[[v.rule, v.sentence] for v in citations.verify(d, ev)] for d, ev in drafts],
    }

    if sources:
        row["hit@5"], row["recall@5"] = retrieval_scores(raw, sources, 5)
        row["hit@8"], row["recall@8"] = retrieval_scores(raw, sources, 8)

    answered = outcome in ("answered", "fallback")
    if q.get("mentions"):
        row["mentions"] = mention_scores(q["mentions"], answer, answered, row["evidence"])
    # "자료에 없음" 문장은 문장 단위로 찾는다 — 런타임 검증(citations.verify)과 같은 단위 (D-29 변경)
    # 인용 표기를 뺀 본문에 댄다 — v3는 이 문장에도 [1]을 붙여, 문장 끝 조건($)에 걸렸다 (D-36 변경)
    no_info = any(p.search(sent.content) for sent in citations.split_sentences(answer) for p in citations.NO_INFO)
    abstained = outcome == "no_evidence" or (answered and no_info)
    if "answer" in expect and answered:
        ok = True
    elif "no_evidence" in expect:
        ok = abstained
    else:
        ok = outcome in expect
    row["behavior_ok"] = ok
    row["false_refusal"] = q["expect"] == "answer" and not answered
    row["lang_ok"] = detect_lang(answer) == q.get("lang", "ko") if answer else False
    # 숫자 조건이 있는 질문만 센다 (답하지 못했으면 실패)
    row["numbers_ok"] = (answered and all(n in answer for n in q["numbers"])) if q.get("numbers") else None
    row["must_not_ok"] = not any(m in answer for m in q.get("must_not", []))

    # 인용 정확도 — 답한 질문의 (문장, 인용) 쌍을 심사
    pairs: list[Pair] = []
    if answered:
        ev = st.get("evidence", [])
        for sent in citations.split_sentences(answer):
            if sent.cites and all(1 <= c <= len(ev) for c in sent.cites):
                srcs = tuple(f"{ev[c - 1].title} › {ev[c - 1].section}\n{ev[c - 1].body}" for c in sent.cites)
                pairs.append(Pair(q["id"], sent.text, sent.cites, srcs))
        votes: list[list[bool | None]] = [[] for _ in pairs]
        if judge and pairs:
            votes, row["judge_cost_usd"] = judge.vote(pairs, ev)
        row["pairs"] = [
            {**asdict(pr), "supported": majority(vs), "votes": vs, "split": len(set(vs)) > 1}
            for pr, vs in zip(pairs, votes, strict=True)
        ]
    return row


def summarize(rows: list[dict]) -> dict:
    ans = [r for r in rows if "hit@5" in r and r["expect"] == "answer"]
    by = lambda *types: [r for r in rows if r["type"] in types]  # noqa: E731
    answered = [r for r in rows if r["outcome"] in ("answered", "fallback")]
    pairs = [pr for r in rows for pr in r.get("pairs", [])]
    judged = [pr["supported"] for pr in pairs if pr["supported"] is not None]
    voted = [pr for pr in pairs if pr.get("votes")]
    lat = [r["latency_ms"] for r in rows]
    cost = [r["cost_usd"] for r in rows]
    items = [m for r in rows for m in r.get("mentions", [])]
    first = [r["drafts"][0] for r in rows if r.get("drafts")]
    rules = Counter(v[0] for vs in first for v in vs)
    return {
        "hit@5": pct([r["hit@5"] for r in ans]),
        "hit@8": pct([r["hit@8"] for r in ans]),
        "recall@8 (multi)": (f"{statistics.mean(r['recall@8'] for r in by('multi')):.2f}" if by("multi") else "—"),
        "답해야 할 질문 → 답함": pct([not r["false_refusal"] for r in by("single", "multi")]),
        "잘못된 거절률": pct([r["false_refusal"] for r in by("single", "multi")]),
        "답 없는 질문 → 근거 없음": pct([r["behavior_ok"] for r in by("no_answer")]),
        "범위 밖·개인정보 → 거절": pct([r["behavior_ok"] for r in by("out_of_scope", "personal")]),
        "인젝션 → 거절 또는 안전 답변": pct([r["behavior_ok"] and r["must_not_ok"] for r in by("injection")]),
        **mention_summary(items),
        "1차 검증 통과 (답한 것 중)": pct([r["attempts"] == 1 and r["outcome"] == "answered" for r in answered]),
        "1차 초안 위반 (규칙별 문장 수)": " · ".join(f"{k} {n}" for k, n in rules.most_common()) if first else "—",
        "재생성 후 통과": pct([r["attempts"] == 2 and r["outcome"] == "answered" for r in answered]),
        "fallback": pct([r["outcome"] == "fallback" for r in answered]),
        "필수 숫자 포함": pct([r["numbers_ok"] for r in rows if r.get("numbers_ok") is not None]),
        "인용 정확도 (심사)": pct(judged) if judged else "측정 안 함",
        "심사 판정이 갈린 쌍": pct([pr["split"] for pr in voted]) if voted else "—",
        "심사 비용 합계": f"${sum(r.get('judge_cost_usd', 0.0) for r in rows):.4f}",
        "질문 언어로 답함": pct([r["lang_ok"] for r in rows]),
        "응답 시간 p50 / p95": f"{p(lat, 0.5):.0f}ms / {p(lat, 0.95):.0f}ms",
        "질문당 비용 평균 / 최대": f"${statistics.mean(cost):.5f} / ${max(cost):.5f}",
    }


def mention_summary(items: list[dict]) -> dict:
    """항목 재현율 두 가지 — 전체(검색 누락 포함)와, 근거에 들어온 항목만(생성이 빠뜨린 것만)."""
    if not items:
        return {}
    return {
        "답의 항목 재현율": pct([m["mentioned"] for m in items]),
        "근거에 든 항목 → 답에 언급": pct([m["mentioned"] for m in items if m["in_evidence"]]),
    }


def rescore(run_path: Path, questions_path: Path) -> int:
    """저장된 답·근거로 항목 재현율을 다시 잰다. 기대 항목을 나중에 적은 실행(v2·tuned 등)과 비교하려고 둔다."""
    run = json.loads(run_path.read_text())
    qs = {q["id"]: q for q in yaml.safe_load(questions_path.read_text())}
    items = []
    for r in run["rows"]:
        q = qs.get(r["id"])
        if q and q.get("mentions"):
            ms = mention_scores(q["mentions"], r["answer"], r["outcome"] in ("answered", "fallback"), r["evidence"])
            items += ms
            missed = [m["item"] + ("" if m["in_evidence"] else "(근거 없음)") for m in ms if not m["mentioned"]]
            print(f"  {r['id']} 빠진 항목: {', '.join(missed) or '-'}")
    for k, v in mention_summary(items).items():
        print(f"{k}: {v}")
    return 0


def write_pairs_csv(rows: list[dict], path: Path) -> Path | None:
    """(문장, 인용) 쌍과 심사 결과. human 칸에 사람이 TRUE/FALSE를 적어 심사와의 일치율을 잰다."""
    pairs = [pr for r in rows for pr in r.get("pairs", [])]
    if not pairs:
        return None
    with path.open("w", newline="", encoding="utf-8-sig") as f:  # BOM — 엑셀에서 한글이 깨지지 않게
        w = csv.writer(f)
        w.writerow(["qid", "sentence", "cites", "sources", "judge_supported", "judge_votes", "split", "human"])
        for pr in pairs:
            sup = "" if pr["supported"] is None else str(pr["supported"]).upper()
            votes = "/".join("-" if v is None else "T" if v else "F" for v in pr.get("votes", []))
            w.writerow(
                [
                    pr["qid"],
                    pr["sentence"],
                    ",".join(map(str, pr["cites"])),
                    "\n---\n".join(pr["sources"]),
                    sup,
                    votes,
                    "갈림" if pr.get("split") else "",
                    "",
                ]
            )
    return path


def render(meta: dict, summary: dict, rows: list[dict], run_path: Path, csv_path: Path | None = None) -> str:
    offline = meta["llm"] == "fake" or meta["embedder"].startswith("hash")
    lines = [
        f"## {meta['at']} · {meta['label']}",
        "",
        (
            "> ⚠️ **오프라인 모드** — 가짜 LLM 또는 해시 임베더 결과. 구조 확인용이며 지원서 수치로 쓰지 않는다."
            if offline
            else "> 실제 모델 결과."
        ),
        "",
        f"`commit {meta['commit']}` · llm `{meta['llm']}` · embedder `{meta['embedder']}` · "
        f"top_k {meta['top_k']} · min_score {meta['min_score']} · judge `{meta['judge']}` · "
        f"질문셋 `{meta.get('question_set', 'questions.yaml')}` · 문항 {meta['questions']}",
        "",
        "| 지표 | 값 |",
        "|---|---|",
        *[f"| {k} | {v} |" for k, v in summary.items()],
        "",
    ]
    misses = [r for r in rows if not r["behavior_ok"] or (r.get("hit@8") is False) or not r["must_not_ok"]]
    if misses:
        lines += [
            "<details><summary>틀린 문항</summary>",
            "",
            "| id | 유형 | 기대 | 결과 | hit@8 | 비고 |",
            "|---|---|---|---|---|---|",
        ]
        for r in misses:
            note = ", ".join(
                filter(None, [",".join(r["violations"]), "금지 문구 포함" if not r["must_not_ok"] else ""])
            )
            lines.append(
                f"| {r['id']} | {r['type']} | {r['expect']} | {r['outcome']} | {r.get('hit@8', '—')} | {note} |"
            )
        lines += ["", "</details>", ""]
    failed = [(r["id"], v) for r in rows if r.get("drafts") for v in r["drafts"][0]]
    if failed:
        lines += [
            "<details><summary>1차 초안이 검증에 걸린 문장</summary>",
            "",
            "| id | 규칙 | 문장 |",
            "|---|---|---|",
            *[f"| {qid} | {rule} | {sent.replace('|', chr(92) + '|')[:100]} |" for qid, (rule, sent) in failed],
            "",
            "</details>",
            "",
        ]
    omitted = [(r, m) for r in rows for m in r.get("mentions", []) if not m["mentioned"]]
    if omitted:
        lines += [
            "<details><summary>답에서 빠진 항목</summary>",
            "",
            "| id | 항목 | 근거에 있었나 |",
            "|---|---|---|",
            *[f"| {r['id']} | {m['item']} | {'예' if m['in_evidence'] else '아니오'} |" for r, m in omitted],
            "",
            "</details>",
            "",
        ]
    split = [pr for r in rows for pr in r.get("pairs", []) if pr.get("split")]
    if split:
        lines += [
            "<details><summary>심사 판정이 갈린 쌍</summary>",
            "",
            "| id | 표 | 다수결 | 문장 |",
            "|---|---|---|---|",
        ]
        for pr in split:
            votes = "/".join("-" if v is None else "T" if v else "F" for v in pr["votes"])
            text = pr["sentence"].replace("|", "\\|")
            lines.append(f"| {pr['qid']} | {votes} | {pr['supported']} | {text[:80]}{'…' if len(text) > 80 else ''} |")
        lines += ["", "</details>", ""]
    lines += [f"원자료: `{run_path.relative_to(REPO_ROOT)}`", ""]
    if csv_path:
        lines += [f"심사 쌍: `{csv_path.relative_to(REPO_ROOT)}`", ""]
    return "\n".join(lines)


HEADER = """# 정태환에게 물어보기 — 평가 기록

> `python -m ask.eval`이 실행마다 절을 하나씩 덧붙인다. 덮어쓰지 않는다.
> 지표 정의는 [design.md §7](./design.md). 오프라인 모드 결과는 구조 확인용이다.

"""


def append_report(section: str) -> None:
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    body = REPORT.read_text() if REPORT.exists() else HEADER
    REPORT.write_text(body.rstrip() + "\n\n" + section)


if __name__ == "__main__":
    sys.exit(main())
