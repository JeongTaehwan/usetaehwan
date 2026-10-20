"""심사 TRUE 표본 사람 검수 — 심사가 TRUE로 판정한 쌍에서 무작위 표본을 뽑아 블라인드 채점 시트를 만든다.

  uv run python -m ask.eval.human_sample draw eval/runs/20261017-204907-prompt-v3-k15.json
  uv run python -m ask.eval.human_sample compare eval/runs/20261017-204907-prompt-v3-k15.true-sample.csv

v1 사람 검수는 심사 FALSE만 봤다. 이 표본은 "심사의 TRUE가 맞나"를 본다.
draw는 세 파일을 만든다. 시트(.csv)와 체크 페이지(.html)에는 심사 결과가 없다. 심사 결과는 .judge.csv에만 있다.
compare는 시트의 판정 칸이 모두 O/X로 채워졌을 때만 일치를 계산한다.
"""

from __future__ import annotations

import argparse
import csv
import html
import json
import random
import sys
from pathlib import Path

import yaml

SERVER_ROOT = Path(__file__).resolve().parents[2]
QUESTIONS = SERVER_ROOT / "eval" / "questions.yaml"
SEED = 20261020
N = 20

SHEET_COLS = ["no", "qid", "질문", "답변 문장", "인용 번호", "인용된 근거 원문", "내 판정 (O/X)", "메모"]
KEY_COLS = ["no", "qid", "답변 문장", "인용 번호", "pool_index", "judge_supported", "judge_votes"]
# 사람도 심사와 같은 기준으로 본다 (judge.SYSTEM)
RUBRIC = [
    "인용한 근거가 그 문장을 말하고 있으면 O. 바꿔 말한 것은 괜찮다.",
    "숫자는 근거와 정확히 같아야 한다.",
    "인용한 근거에 없는 사실을 더한 문장은 X.",
    "모든 근거는 정태환 본인 사이트다. 내용을 정태환에게 귀속하거나 근거 제목의 프로젝트·페이지 이름을 붙이는 것은 "
    "더한 사실이 아니다.",
]


def sheet_paths(run_path: Path) -> tuple[Path, Path, Path]:
    stem = run_path.with_suffix("")
    return (
        stem.with_name(stem.name + ".true-sample.csv"),
        stem.with_name(stem.name + ".true-sample.html"),
        stem.with_name(stem.name + ".true-sample.judge.csv"),
    )


def format_sources(cites: list[int], sources: list[str], evidence: list[str]) -> str:
    parts = []
    for n, src in zip(cites, sources, strict=True):
        chunk = evidence[n - 1] if 0 < n <= len(evidence) else "?"
        parts.append(f"[{n}] ({chunk})\n{src}")
    return "\n\n".join(parts)


def draw(run_path: Path, seed: int, n: int) -> int:
    run = json.loads(run_path.read_text(encoding="utf-8"))
    questions = {q["id"]: q["question"] for q in yaml.safe_load(QUESTIONS.read_text(encoding="utf-8"))}
    pool = []
    for r in run["rows"]:
        for pr in r.get("pairs", []):
            if pr["supported"] is True:
                pool.append((r, pr))
    if len(pool) < n:
        print(f"심사 TRUE 쌍이 {len(pool)}개라 {n}개를 뽑을 수 없다", file=sys.stderr)
        return 1
    picked = random.Random(seed).sample(range(len(pool)), n)

    sheet, key = [], []
    for no, i in enumerate(picked, 1):
        r, pr = pool[i]
        cites = ",".join(map(str, pr["cites"]))
        sheet.append(
            {
                "no": no,
                "qid": r["id"],
                "질문": questions.get(r["id"], ""),
                "답변 문장": pr["sentence"],
                "인용 번호": cites,
                "인용된 근거 원문": format_sources(pr["cites"], pr["sources"], r["evidence"]),
                "내 판정 (O/X)": "",
                "메모": "",
            }
        )
        votes = "/".join("-" if v is None else "T" if v else "F" for v in pr.get("votes", []))
        key.append(
            {
                "no": no,
                "qid": r["id"],
                "답변 문장": pr["sentence"],
                "인용 번호": cites,
                "pool_index": i,
                "judge_supported": "TRUE",
                "judge_votes": votes,
            }
        )

    csv_path, html_path, key_path = sheet_paths(run_path)
    write_csv(csv_path, SHEET_COLS, sheet)
    write_csv(key_path, KEY_COLS, key)
    meta = {"run": run_path.name, "label": run["meta"]["label"], "seed": seed, "n": n, "pool": len(pool)}
    html_path.write_text(render_html(meta, sheet, csv_path.name), encoding="utf-8")
    print(f"심사 TRUE {len(pool)}쌍 중 {n}쌍 (seed {seed})")
    for p in (csv_path, html_path, key_path):
        print(f"  {p.resolve().relative_to(SERVER_ROOT)}")
    return 0


def write_csv(path: Path, cols: list[str], rows: list[dict]) -> None:
    with path.open("w", newline="", encoding="utf-8-sig") as f:  # BOM — 엑셀에서 한글이 깨지지 않게
        w = csv.DictWriter(f, fieldnames=cols)
        w.writeheader()
        w.writerows(rows)


def render_html(meta: dict, rows: list[dict], csv_name: str) -> str:
    data = json.dumps({"meta": meta, "cols": SHEET_COLS, "rows": rows}, ensure_ascii=False).replace("</", "<\\/")
    rubric = "".join(f"<li>{html.escape(x)}</li>" for x in RUBRIC)
    return (
        HTML.replace("{{TITLE}}", html.escape(f"인용 검수 · {meta['label']} · {meta['n']}건"))
        .replace("{{META}}", html.escape(f"{meta['run']} · 시드 {meta['seed']} · 표본 {meta['n']}건"))
        .replace("{{RUBRIC}}", rubric)
        .replace("{{CSV_NAME}}", html.escape(csv_name))
        .replace("{{DATA}}", data)
    )


def normalize_verdict(v: str) -> str | None:
    v = v.strip().upper()
    if v in ("O", "○", "TRUE", "T"):
        return "O"
    if v in ("X", "×", "FALSE", "F"):
        return "X"
    return None


def compare(sheet_path: Path) -> int:
    key_path = sheet_path.with_name(sheet_path.name.removesuffix(".csv") + ".judge.csv")
    with sheet_path.open(encoding="utf-8-sig") as f:
        sheet = list(csv.DictReader(f))
    with key_path.open(encoding="utf-8-sig") as f:
        key = {row["no"]: row for row in csv.DictReader(f)}

    blank = [row["no"] for row in sheet if normalize_verdict(row["내 판정 (O/X)"]) is None]
    if blank:
        print(f"판정이 비었거나 O/X가 아닌 행: {', '.join(blank)} — 다 채운 뒤 다시 실행한다", file=sys.stderr)
        return 1
    if len(sheet) != len(key):
        print(f"시트 {len(sheet)}행 · 심사 {len(key)}행 — 행 수가 다르다", file=sys.stderr)
        return 1

    agree, disagree = 0, []
    for row in sheet:
        k = key.get(row["no"])
        if k is None or (k["qid"], k["답변 문장"], k["인용 번호"]) != (row["qid"], row["답변 문장"], row["인용 번호"]):
            print(f"no {row['no']}: 시트와 심사 파일의 쌍이 다르다", file=sys.stderr)
            return 1
        human = normalize_verdict(row["내 판정 (O/X)"]) == "O"
        judge = k["judge_supported"] == "TRUE"
        if human == judge:
            agree += 1
        else:
            disagree.append((row, k))

    print(f"일치 {agree}/{len(sheet)}  ·  불일치 {len(disagree)}건")
    for row, k in disagree:
        human = normalize_verdict(row["내 판정 (O/X)"])
        print(f"\n- no {row['no']} {row['qid']}  사람 {human} · 심사 {k['judge_votes']}")
        print(f"  질문: {row['질문']}")
        print(f"  문장: {row['답변 문장']}  (인용 {row['인용 번호']})")
        if row["메모"].strip():
            print(f"  메모: {row['메모'].strip()}")
    return 0


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(prog="python -m ask.eval.human_sample")
    sub = ap.add_subparsers(dest="cmd", required=True)
    d = sub.add_parser("draw", help="심사 TRUE 쌍에서 표본을 뽑아 블라인드 시트를 만든다")
    d.add_argument("run", type=Path, help="eval/runs/*.json")
    d.add_argument("--seed", type=int, default=SEED)
    d.add_argument("-n", type=int, default=N)
    c = sub.add_parser("compare", help="채운 시트를 심사 결과와 비교한다")
    c.add_argument("sheet", type=Path, help="*.true-sample.csv (체크 페이지에서 저장한 CSV도 같은 형식)")
    args = ap.parse_args(argv)
    if args.cmd == "draw":
        return draw(args.run, args.seed, args.n)
    return compare(args.sheet)


HTML = """<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{{TITLE}}</title>
<style>
:root { --bg:#fafaf9; --fg:#1c1917; --mute:#78716c; --line:#e7e5e4; --card:#fff; --o:#15803d; --x:#b91c1c; }
@media (prefers-color-scheme: dark) {
  :root { --bg:#1c1917; --fg:#f5f5f4; --mute:#a8a29e; --line:#44403c; --card:#292524; --o:#4ade80; --x:#f87171; }
}
* { box-sizing: border-box; }
body { margin:0; background:var(--bg); color:var(--fg); font:15px/1.6 system-ui, -apple-system, sans-serif; }
main { max-width: 860px; margin: 0 auto; padding: 24px 16px 96px; }
h1 { font-size: 20px; margin: 0 0 4px; }
.meta { color: var(--mute); font-size: 13px; }
.rubric { border:1px solid var(--line); border-radius:8px; padding:8px 16px; margin:16px 0; font-size:14px; }
.rubric ul { margin: 4px 0; padding-left: 20px; }
.card { background:var(--card); border:1px solid var(--line); border-radius:10px; padding:16px; margin:16px 0; }
.card.done-O { border-left: 4px solid var(--o); }
.card.done-X { border-left: 4px solid var(--x); }
.head { display:flex; gap:8px; color:var(--mute); font-size:13px; }
.q { margin: 4px 0 8px; color: var(--mute); }
.s { font-size: 16px; font-weight: 600; margin: 0 0 8px; }
details summary { cursor: pointer; color: var(--mute); font-size: 14px; }
pre { white-space: pre-wrap; word-break: break-word; font: 13px/1.6 ui-monospace, monospace;
      background: var(--bg); border-radius: 6px; padding: 12px; max-height: 420px; overflow: auto; }
.row { display:flex; gap:8px; align-items:flex-start; margin-top: 12px; flex-wrap: wrap; }
.row button { min-width: 56px; padding: 6px 12px; border:1px solid var(--line); border-radius:6px;
              background: transparent; color: var(--fg); font-size: 15px; cursor: pointer; }
.row button.on.O { background: var(--o); border-color: var(--o); color: #fff; }
.row button.on.X { background: var(--x); border-color: var(--x); color: #fff; }
textarea { flex: 1; min-width: 200px; min-height: 38px; padding: 6px 8px; border:1px solid var(--line);
           border-radius:6px; background: transparent; color: var(--fg); font: inherit; }
.bar { position: fixed; bottom: 0; left: 0; right: 0; background: var(--card); border-top: 1px solid var(--line);
       padding: 12px 16px; display:flex; justify-content:center; gap:16px; align-items:center; }
.bar button { padding: 8px 16px; border-radius: 6px; border: 1px solid var(--fg); background: var(--fg);
              color: var(--bg); cursor: pointer; font-size: 14px; }
</style>
</head>
<body>
<main>
<h1>인용 검수 — 근거가 이 문장을 뒷받침하나</h1>
<div class="meta">{{META}}</div>
<div class="rubric"><b>판정 기준</b> (LLM 심사와 같은 기준)<ul>{{RUBRIC}}</ul></div>
<div id="list"></div>
</main>
<div class="bar"><span id="progress"></span><button id="save">CSV 저장</button></div>
<script id="data" type="application/json">{{DATA}}</script>
<script>
const { meta, cols, rows } = JSON.parse(document.getElementById("data").textContent);
const KEY = "true-sample:" + meta.run + ":" + meta.seed;
let state = {};
try { state = JSON.parse(localStorage.getItem(KEY) || "{}"); } catch (e) {}
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} };
const list = document.getElementById("list");
const progress = document.getElementById("progress");
const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls;
  if (text != null) e.textContent = text; return e; };

function update() {
  const done = rows.filter(r => state[r.no] && state[r.no].v).length;
  progress.textContent = "채점 " + done + " / " + rows.length;
}

rows.forEach(r => {
  const st = state[r.no] || (state[r.no] = { v: "", memo: "" });
  const card = el("div", "card");
  const head = el("div", "head"); head.append(el("b", null, "#" + r.no), el("span", null, r.qid),
    el("span", null, "인용 [" + r["인용 번호"] + "]"));
  const det = el("details"); det.open = true;
  det.append(el("summary", null, "인용된 근거 원문"), el("pre", null, r["인용된 근거 원문"]));
  const row = el("div", "row");
  const memo = el("textarea"); memo.placeholder = "메모"; memo.value = st.memo;
  memo.oninput = () => { st.memo = memo.value; save(); };
  const btns = ["O", "X"].map(v => { const b = el("button", v, v); b.onclick = () => {
    st.v = st.v === v ? "" : v; paint(); save(); update(); }; return b; });
  function paint() {
    btns.forEach(b => b.classList.toggle("on", b.textContent === st.v));
    card.className = "card" + (st.v ? " done-" + st.v : "");
  }
  row.append(...btns, memo);
  card.append(head, el("div", "q", "Q. " + r["질문"]), el("p", "s", r["답변 문장"]), det, row);
  list.append(card); paint();
});
update();

const cell = v => /[",\\n\\r]/.test(v) ? '"' + v.replace(/"/g, '""') + '"' : v;
document.getElementById("save").onclick = () => {
  const out = [cols.map(cell).join(",")];
  rows.forEach(r => {
    const st = state[r.no];
    const rec = Object.assign({}, r, { "내 판정 (O/X)": st.v, "메모": st.memo });
    out.push(cols.map(c => cell(String(rec[c] ?? ""))).join(","));
  });
  const blob = new Blob(["\\ufeff" + out.join("\\r\\n") + "\\r\\n"], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "{{CSV_NAME}}"; a.click();
};
</script>
</body>
</html>
"""


if __name__ == "__main__":
    sys.exit(main())
