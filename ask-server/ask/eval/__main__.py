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
import statistics
import subprocess
import sys
import time
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
from .judge import Pair

QUESTIONS = SERVER_ROOT / "eval" / "questions.yaml"
RUNS = SERVER_ROOT / "eval" / "runs"
REPORT = REPO_ROOT / "docs" / "ask" / "eval-report.md"


def matches(hit: Hit, source: str) -> bool:
    return any(hit.doc_id == s or hit.chunk_id == s or hit.chunk_id.startswith(s + "~") for s in source.split("|"))


def retrieval_scores(hits: list[Hit], sources: list[str], k: int) -> tuple[bool, float]:
    top = hits[:k]
    found = [any(matches(h, s) for h in top) for s in sources]
    return any(found), sum(found) / len(found)


def pct(xs: list[bool]) -> str:
    return f"{100 * sum(xs) / len(xs):.1f}% ({sum(xs)}/{len(xs)})" if xs else "—"


def p(values: list[float], q: float) -> float:
    s = sorted(values)
    return s[min(len(s) - 1, round(q * (len(s) - 1)))]


def git_commit() -> str:
    try:
        return subprocess.check_output(["git", "describe", "--always", "--dirty"], cwd=REPO_ROOT, text=True).strip()
    except Exception:
        return "unknown"


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="python -m ask.eval")
    ap.add_argument("--label", default="run")
    ap.add_argument("--judge", choices=["none", "anthropic"], default="none")
    ap.add_argument("--only", help="질문 id 쉼표 목록")
    ap.add_argument("--no-report", action="store_true", help="eval-report.md에 쓰지 않는다")
    args = ap.parse_args(argv)

    s = get_settings()
    llm = make_llm(s.llm, s.anthropic_model)
    embedder = make_embedder(s.embedder)
    judge = None
    if args.judge == "anthropic":
        from .judge import AnthropicJudge

        judge = AnthropicJudge()

    questions = yaml.safe_load(QUESTIONS.read_text())
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
            t0 = time.perf_counter()
            st = graph.invoke({"question": q["question"]})
            latency = (time.perf_counter() - t0) * 1000
            rows.append(evaluate(q, st, raw, latency, judge))
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


def evaluate(q: dict, st: dict, raw: list[Hit], latency: float, judge) -> dict:
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
    }

    if sources:
        row["hit@5"], row["recall@5"] = retrieval_scores(raw, sources, 5)
        row["hit@8"], row["recall@8"] = retrieval_scores(raw, sources, 8)

    answered = outcome in ("answered", "fallback")
    abstained = outcome == "no_evidence" or (answered and any(p.search(answer) for p in citations.NO_INFO))
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
                pairs.append(Pair(q["id"], sent.text, sent.cites, tuple(ev[c - 1].body for c in sent.cites)))
        verdicts = [None] * len(pairs)
        if judge and pairs:
            verdicts, usage = judge.judge(pairs, ev)
            row["judge_cost_usd"] = usage.cost_usd
        row["pairs"] = [{**asdict(pr), "supported": v} for pr, v in zip(pairs, verdicts, strict=True)]
    return row


def summarize(rows: list[dict]) -> dict:
    ans = [r for r in rows if "hit@5" in r and r["expect"] == "answer"]
    by = lambda *types: [r for r in rows if r["type"] in types]  # noqa: E731
    answered = [r for r in rows if r["outcome"] in ("answered", "fallback")]
    pairs = [pr for r in rows for pr in r.get("pairs", [])]
    judged = [pr["supported"] for pr in pairs if pr["supported"] is not None]
    lat = [r["latency_ms"] for r in rows]
    cost = [r["cost_usd"] for r in rows]
    return {
        "hit@5": pct([r["hit@5"] for r in ans]),
        "hit@8": pct([r["hit@8"] for r in ans]),
        "recall@8 (multi)": (f"{statistics.mean(r['recall@8'] for r in by('multi')):.2f}" if by("multi") else "—"),
        "답해야 할 질문 → 답함": pct([not r["false_refusal"] for r in by("single", "multi")]),
        "잘못된 거절률": pct([r["false_refusal"] for r in by("single", "multi")]),
        "답 없는 질문 → 근거 없음": pct([r["behavior_ok"] for r in by("no_answer")]),
        "범위 밖·개인정보 → 거절": pct([r["behavior_ok"] for r in by("out_of_scope", "personal")]),
        "인젝션 → 거절 또는 안전 답변": pct([r["behavior_ok"] and r["must_not_ok"] for r in by("injection")]),
        "1차 검증 통과 (답한 것 중)": pct([r["attempts"] == 1 and r["outcome"] == "answered" for r in answered]),
        "재생성 후 통과": pct([r["attempts"] == 2 and r["outcome"] == "answered" for r in answered]),
        "fallback": pct([r["outcome"] == "fallback" for r in answered]),
        "필수 숫자 포함": pct([r["numbers_ok"] for r in rows if r.get("numbers_ok") is not None]),
        "인용 정확도 (심사)": pct(judged) if judged else "측정 안 함",
        "질문 언어로 답함": pct([r["lang_ok"] for r in rows]),
        "응답 시간 p50 / p95": f"{p(lat, 0.5):.0f}ms / {p(lat, 0.95):.0f}ms",
        "질문당 비용 평균 / 최대": f"${statistics.mean(cost):.5f} / ${max(cost):.5f}",
    }


def write_pairs_csv(rows: list[dict], path: Path) -> Path | None:
    """(문장, 인용) 쌍과 심사 결과. human 칸에 사람이 TRUE/FALSE를 적어 심사와의 일치율을 잰다."""
    pairs = [pr for r in rows for pr in r.get("pairs", [])]
    if not pairs:
        return None
    with path.open("w", newline="", encoding="utf-8-sig") as f:  # BOM — 엑셀에서 한글이 깨지지 않게
        w = csv.writer(f)
        w.writerow(["qid", "sentence", "cites", "sources", "judge_supported", "human"])
        for pr in pairs:
            sup = "" if pr["supported"] is None else str(pr["supported"]).upper()
            w.writerow(
                [pr["qid"], pr["sentence"], ",".join(map(str, pr["cites"])), "\n---\n".join(pr["sources"]), sup, ""]
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
        f"top_k {meta['top_k']} · min_score {meta['min_score']} · judge `{meta['judge']}` · 문항 {meta['questions']}",
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
