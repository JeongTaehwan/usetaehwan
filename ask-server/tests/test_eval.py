"""평가 러너 — 심사 다수결 (D-25). 실제 모델 없이 가짜 심사로."""

import csv

import pytest

from ask.eval.__main__ import evaluate, summarize, write_pairs_csv
from ask.eval.judge import MajorityJudge, majority
from ask.llm import Usage
from ask.models import Hit


@pytest.mark.parametrize(
    ("votes", "expected"),
    [
        ([True, True, False], True),
        ([False, True, False], False),
        ([True, True, True], True),
        ([True, False, None], None),  # 동수 — 집계에서 뺀다
        ([None, None, None], None),  # 심사가 전부 거절
        ([], None),  # 심사 안 함
    ],
)
def test_majority(votes, expected):
    assert majority(votes) is expected


class ScriptedJudge:
    """실행마다 정해 둔 판정을 돌려주는 가짜 심사."""

    name = "scripted"

    def __init__(self, runs: list[list[bool | None]]):
        self.runs, self.calls = runs, 0

    def judge(self, pairs, evidence):
        verdicts = self.runs[self.calls]
        self.calls += 1
        return verdicts, Usage("judge", "claude-sonnet-5-5", 1000, 100)


def test_majority_judge_collects_votes_per_pair_and_sums_cost():
    inner = ScriptedJudge([[True, False], [True, True], [False, True]])
    votes, cost = MajorityJudge(inner, runs=3).vote(["p1", "p2"], [])
    assert inner.calls == 3
    assert votes == [[True, True, False], [False, True, True]]
    assert cost == pytest.approx(3 * Usage("judge", "claude-sonnet-5-5", 1000, 100).cost_usd)


def _hit(i: int, body: str) -> Hit:
    return Hit(f"d#{i}", "d", "문서", "섹션", "/d", str(i), body, 0.7)


def test_evaluate_marks_split_pairs_and_report_counts_them(tmp_path):
    q = {"id": "q1", "type": "single", "expect": "answer", "question": "결제 연동 경험?"}
    evidence = [_hit(1, "PayPal 결제를 연동했습니다."), _hit(2, "MR 178건입니다.")]
    st = {
        "outcome": "answered",
        "answer": "PayPal 결제를 연동했습니다[1]. 머지된 MR은 178건입니다[2].",
        "evidence": evidence,
        "citations": [],
        "attempts": 1,
        "usage": [],
    }
    # 첫 쌍은 만장일치 True, 둘째 쌍은 2:1로 갈려 True
    judge = MajorityJudge(ScriptedJudge([[True, True], [True, False], [True, True]]), runs=3)
    row = evaluate(q, st, evidence, 100.0, judge)

    assert [(p["supported"], p["votes"], p["split"]) for p in row["pairs"]] == [
        (True, [True, True, True], False),
        (True, [True, False, True], True),
    ]
    summary = summarize([row])
    assert summary["인용 정확도 (심사)"] == "100.0% (2/2)"
    assert summary["심사 판정이 갈린 쌍"] == "50.0% (1/2)"

    path = write_pairs_csv([row], tmp_path / "pairs.csv")
    with path.open(encoding="utf-8-sig") as f:
        rows = list(csv.DictReader(f))
    assert [(r["judge_votes"], r["split"], r["judge_supported"]) for r in rows] == [
        ("T/T/T", "", "TRUE"),
        ("T/F/T", "갈림", "TRUE"),
    ]


def test_runs_one_keeps_single_judge_behaviour():
    inner = ScriptedJudge([[False]])
    j = MajorityJudge(inner, runs=1)
    assert j.name == "scripted"
    assert j.vote(["p"], []) == ([[False]], Usage("judge", "claude-sonnet-5-5", 1000, 100).cost_usd)


# ───────── 언어 판정 (D-30) ─────────


@pytest.mark.parametrize(
    ("text", "lang"),
    [
        # v1에서 ko로 잘못 판정된 영어 답 (q11·q16)
        ("The best email address to contact 정태환 (Taehwan) is kt26625417@gmail.com[1].", "en"),
        (
            "Three of 정태환's projects are built with Expo: 오늘어디 (a date-course recommendation app)[3], "
            "쪽쪽 (a feeding-record app)[6], and 끼니 (a dinner-menu app)[7].",
            "en",
        ),
        ("In 오늘어디, how did he stop the AI from inventing source links?", "en"),
        # 기술 용어가 많은 한국어
        ("PayPal 주문 생성부터 approve, confirm, capture까지 전 구간을 연동했습니다[1].", "ko"),
        ("Gak에서 LLM 응답을 어떻게 검증했어?", "ko"),
        ("Next.js rewrites로 /api 프록시를 두어 same-origin 요청이 되게 했습니다.", "ko"),
        ("이 사람 결제 연동 경험 있어?", "ko"),
        ("What is the best email address to contact him?", "en"),
        ("", "en"),
    ],
)
def test_detect_lang_uses_hangul_word_ratio(text, lang):
    from ask.llm import detect_lang

    assert detect_lang(text) == lang


# ───────── 심사 입력 (D-28) ─────────


def test_judge_sees_title_and_site_context_like_the_generator():
    """v1 심사는 본문만 받아 '정태환은…', 'Orbit에서…' 같은 귀속을 오판했다."""
    from types import SimpleNamespace

    from ask.eval.judge import AnthropicJudge
    from ask.graph import prompts

    sent = {}

    class FakeMessages:
        def create(self, **kw):
            sent.update(kw)
            text = '{"verdicts":[{"i":0,"supported":true}]}'
            return SimpleNamespace(
                content=[SimpleNamespace(type="text", text=text)],
                usage=SimpleNamespace(input_tokens=1, output_tokens=1),
                stop_reason="end_turn",
            )

    j = AnthropicJudge.__new__(AnthropicJudge)
    j.client = SimpleNamespace(beta=SimpleNamespace(messages=FakeMessages()))
    ev = [
        Hit(
            "project:orbit#feature-4", "project:orbit", "프로젝트 Orbit", "인증 · 배포", "/p", "a", "Neon으로 이전", 0.7
        )
    ]
    from ask.eval.judge import Pair

    verdicts, _ = j.judge([Pair("q14", "Orbit에서 Neon으로 이전했습니다[1].", (1,), ("x",))], ev)

    user = sent["messages"][0]["content"]
    assert prompts.sources_block(ev) in user
    assert 'title="프로젝트 Orbit › 인증 · 배포"' in user
    assert "정태환" in sent["system"] and "title" in sent["system"]
    assert verdicts == [True]
