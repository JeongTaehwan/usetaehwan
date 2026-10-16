from ask.graph.citations import cited_numbers, salvage, split_sentences, verify

EVIDENCE = [
    "PayPal을 주문 생성 → approve → confirm → capture 전 구간으로 연동했습니다(MR 178건). 5개 언어 실패 화면.",
    "단위 테스트 759개로 커버리지를 42.0% → 69.3%까지 올렸습니다. 어드민 Vitest 1,345개.",
    "응답을 20초+ → 3~5초로 줄였습니다.",
]


def rules(answer):
    return [v.rule for v in verify(answer, EVIDENCE)]


def test_clean_answer_passes():
    answer = "PayPal을 capture까지 연동했습니다[1]. 단위 테스트는 759개입니다[2]."
    assert rules(answer) == []


def test_citation_after_period_belongs_to_previous_sentence():
    answer = "PayPal 결제를 연동했습니다. [1] 커버리지는 69.3%까지 올랐습니다.[2]"
    sents = split_sentences(answer)
    assert [s.cites for s in sents] == [(1,), (2,)]
    assert rules(answer) == []


def test_multiple_citation_formats():
    assert rules("결제와 테스트를 모두 다뤘습니다[1][2].") == []
    assert rules("결제와 테스트를 모두 다뤘습니다[1, 2].") == []


def test_r1_out_of_range():
    assert rules("PayPal을 연동했습니다[4].") == ["out_of_range"]


def test_r2_uncited_fact_sentence():
    assert rules("PayPal을 연동했습니다[1]. 결제 경험이 매우 풍부한 개발자입니다.") == ["uncited"]


def test_r2_allows_closing_and_no_info_sentences():
    assert rules("PayPal을 연동했습니다[1]. 더 궁금한 점이 있으면 물어보세요.") == []
    assert rules("PayPal을 연동했습니다[1]. 환불 처리 방식은 자료에 나와 있지 않습니다.") == []


def test_r3_number_must_appear_in_cited_chunk():
    assert rules("단위 테스트는 800개입니다[2].") == ["number_unsupported"]
    # 숫자 자체는 맞지만 다른 청크를 인용한 경우도 잡는다
    assert rules("단위 테스트는 759개입니다[1].") == ["number_unsupported"]


def test_r3_number_normalization():
    assert rules("어드민 Vitest는 1345개입니다[2].") == []  # 1,345 == 1345
    assert rules("커버리지는 42%에서 출발했습니다[2].") == []  # 42.0 == 42
    assert rules("응답은 3~5초입니다[3].") == []
    assert rules("Next.js와 Map.copyOf를 썼습니다[1].") == []  # 점 섞인 이름은 숫자가 아니다


def test_r4_empty_or_no_citations():
    assert rules("") == ["empty"]
    assert rules("결제 연동 경험이 있습니다.") == ["empty"]


def test_list_items_are_sentences():
    answer = "결제 경험은 다음과 같습니다[1].\n- PayPal capture까지 연동[1]\n- 5개 언어 실패 화면[1]"
    assert rules(answer) == []
    assert len(split_sentences(answer)) == 3


def test_salvage_keeps_only_valid_sentences():
    answer = "PayPal을 연동했습니다[1]. 테스트는 800개입니다[2]. 결제 전문가입니다."
    assert salvage(answer, EVIDENCE) == "PayPal을 연동했습니다[1]."


def test_salvage_returns_none_when_nothing_survives():
    assert salvage("결제 전문가입니다. 테스트 900개[2].", EVIDENCE) is None


def test_cited_numbers_in_order():
    assert cited_numbers("a[2] b[1][2] c[3, 1]") == [2, 1, 3]
