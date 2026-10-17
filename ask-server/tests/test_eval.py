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


def test_no_answer_counts_as_abstained_when_a_sentence_says_not_in_materials():
    """v2 q19 — 첫 문장이 '자료에 없다'인데 답 전체에 정규식을 대서 놓쳤다 (D-29 변경)."""
    q = {"id": "q19", "type": "no_answer", "expect": "no_evidence", "question": "Redis 캐시를 설계해 본 경험은?"}
    ev = [_hit(1, "같은 좌표 격자와 반경을 일주일 동안 캐시해, 첫 조사 13~20초가 캐시 적중 시 4~5초로 줄었습니다.")]
    st = {
        "outcome": "answered",
        "answer": "제공된 자료에는 Redis 캐시 설계 경험에 대한 내용이 없습니다. "
        "자료에 따르면 같은 좌표 격자와 반경을 일주일 동안 캐시했습니다[1].",
        "evidence": ev,
        "citations": [],
        "attempts": 1,
        "usage": [],
        "timings": {"retrieve": 412.3},
    }
    row = evaluate(q, st, ev, 100.0, None)
    assert row["behavior_ok"] is True
    assert row["timings"] == {"retrieve": 412}


# ───────── 답의 항목 재현율 (D-34) ─────────


def test_mentions_count_items_left_out_even_when_their_evidence_was_there():
    """holdout h08 — 쪽쪽 근거가 판정을 통과했는데 답은 오늘어디만 말했다. 인용·행동 지표는 모두 OK였다."""
    q = {
        "id": "h08",
        "type": "multi",
        "expect": "answer",
        "question": "로직을 순수 함수로 떼어 내서 테스트한 개인 프로젝트를 알려줘",
        "sources": ["project:zzokzzok", "project:oneureodi"],
        "mentions": [
            {"item": "쪽쪽", "match": ["쪽쪽", "Zzokzzok"], "sources": "project:zzokzzok#case-2"},
            {"item": "오늘어디", "match": ["오늘어디"], "sources": "project:oneureodi#feature-4"},
            {"item": "끼니", "match": ["끼니"], "sources": "project:kkini"},
        ],
    }
    ev = [
        Hit("project:oneureodi#feature-4", "project:oneureodi", "오늘어디", "f4", "/p", "a", "순수 함수 56개", 0.7),
        Hit("project:zzokzzok#case-2", "project:zzokzzok", "쪽쪽", "c2", "/p", "b", "순수 함수로", 0.7),
    ]
    st = {
        "outcome": "answered",
        "answer": "순수 함수로 떼어 테스트한 개인 프로젝트는 '오늘어디'입니다[1].",
        "evidence": ev,
        "citations": [],
        "attempts": 1,
        "usage": [],
    }
    row = evaluate(q, st, ev, 100.0, None)
    assert row["behavior_ok"] is True
    assert row["mentions"] == [
        {"item": "쪽쪽", "mentioned": False, "in_evidence": True},
        {"item": "오늘어디", "mentioned": True, "in_evidence": True},
        {"item": "끼니", "mentioned": False, "in_evidence": False},
    ]
    summary = summarize([row])
    assert summary["답의 항목 재현율"] == "33.3% (1/3)"
    assert summary["근거에 든 항목 → 답에 언급"] == "50.0% (1/2)"


def test_mentions_are_missed_when_not_answered_and_absent_from_summary_without_items():
    from ask.eval.__main__ import mention_scores

    items = [{"item": "Orbit", "match": ["Orbit"], "sources": "project:orbit"}]
    assert mention_scores(items, "Orbit에서 Neon을 썼습니다.", False, ["project:orbit#case-3"]) == [
        {"item": "Orbit", "mentioned": False, "in_evidence": True}
    ]
    q = {"id": "q01", "type": "single", "expect": "answer", "question": "?"}
    st = {"outcome": "answered", "answer": "네[1].", "evidence": [], "citations": [], "attempts": 1, "usage": []}
    row = evaluate(q, st, [], 1.0, None)
    assert "mentions" not in row
    assert "답의 항목 재현율" not in summarize([row])


@pytest.mark.parametrize(
    ("text", "found"),
    [
        ("Neon을 쓴 프로젝트는 Orbit과 각(Gak)입니다.", True),
        ("각에서는 빈 응답을 거부했습니다.", True),
        ("각과 오늘어디 두 프로젝트입니다.", True),
        ("The Gak project uses Neon.", True),
        ("회사와 개인 프로젝트에서 각각 썼습니다.", False),
        ("이렇게 생각했습니다.", False),
        ("각 페이지마다 시나리오를 썼습니다.", False),
    ],
)
def test_gak_pattern_does_not_match_common_words(text, found):
    import yaml

    from ask.eval.__main__ import QUESTIONS, mention_scores

    gak = next(m for q in yaml.safe_load(QUESTIONS.read_text()) if q["id"] == "q14" for m in q["mentions"])
    assert mention_scores([gak], text, True, [])[0]["mentioned"] is found


def test_every_multi_question_lists_items_with_valid_patterns():
    import re

    import yaml

    from ask.eval.__main__ import QUESTIONS

    for path in [QUESTIONS, QUESTIONS.with_name("holdout.yaml"), QUESTIONS.with_name("holdout-2.yaml")]:
        for q in yaml.safe_load(path.read_text()):
            if q["type"] != "multi":
                continue
            assert len(q.get("mentions", [])) >= 2, q["id"]
            for m in q["mentions"]:
                assert m["item"] and m["sources"], q["id"]
                for pat in m["match"]:
                    re.compile(pat)


def test_rescore_reads_saved_answers(tmp_path, capsys):
    import json

    from ask.eval.__main__ import main

    run = tmp_path / "run.json"
    run.write_text(
        json.dumps(
            {
                "rows": [
                    {
                        "id": "q16",
                        "outcome": "answered",
                        "answer": "Built with Expo: 끼니[1], 쪽쪽[2].",
                        "evidence": ["project:kkini#overview", "project:zzokzzok#overview"],
                    }
                ]
            }
        )
    )
    assert main(["--rescore", str(run)]) == 0
    out = capsys.readouterr().out
    assert "q16 빠진 항목: 오늘어디(근거 없음)" in out
    assert "답의 항목 재현율: 66.7% (2/3)" in out
    assert "근거에 든 항목 → 답에 언급: 100.0% (2/2)" in out


# ───────── 1차 초안 기록 (D-36) ─────────


def test_first_draft_violations_are_kept_even_when_the_retry_passes():
    """상태에는 마지막 초안만 남는다. 1차 실패 원인(인용 없는 머리·꼬리 문장)을 세려고 초안을 따로 남긴다."""
    from ask.eval.__main__ import DraftRecorder
    from ask.llm import FakeLLM

    ev = [_hit(1, "PayPal 결제를 연동했습니다.")]
    rec = DraftRecorder(FakeLLM())
    rec.drafts = [
        ("결제 연동 경험을 정리하면 다음과 같습니다. PayPal 결제를 연동했습니다[1].", [h.body for h in ev]),
        ("PayPal 결제를 연동했습니다[1].", [h.body for h in ev]),
    ]
    q = {"id": "q01", "type": "single", "expect": "answer", "question": "결제 연동 경험?"}
    st = {
        "outcome": "answered",
        "answer": "PayPal 결제를 연동했습니다[1].",
        "evidence": ev,
        "citations": [],
        "attempts": 2,
        "usage": [],
    }
    row = evaluate(q, st, ev, 1.0, None, rec.drafts)
    assert row["drafts"] == [[["uncited", "결제 연동 경험을 정리하면 다음과 같습니다."]], []]
    assert summarize([row])["1차 초안 위반 (규칙별 문장 수)"] == "uncited 1"


def test_draft_recorder_passes_calls_through_and_records_generate():
    from ask.eval.__main__ import DraftRecorder
    from ask.llm import FakeLLM

    rec = DraftRecorder(FakeLLM())
    ev = [_hit(1, "PayPal 결제를 연동했습니다.")]
    draft, _ = rec.generate("결제 연동 경험?", ev, "ko")
    assert rec.name == FakeLLM().name
    assert rec.drafts == [(draft, ["PayPal 결제를 연동했습니다."])]


@pytest.mark.parametrize("language", ["Korean", "English"])
def test_generate_prompt_formats_without_stray_braces(language):
    from ask.graph import prompts

    text = prompts.GENERATE_SYSTEM.format(language=language)
    assert f"Answer in {language}" in text and "{" not in text
