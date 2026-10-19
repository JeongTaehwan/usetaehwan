import { Me } from "../Me";
import { Dialog, PBox, Rows } from "../ui";
import { CERTIFICATIONS, EDUCATION } from "../../_data/experience";
import { RECORDS, TRAITS } from "../../_data/profile";
import { CAREER_LENGTH } from "../../_data/career";
import { BackToMenu } from "./common";

const CARD = [
  { k: "이름", v: "정태환" },
  { k: "직업", v: "프론트엔드 개발자" },
  { k: "경력", v: `커머스 ${CAREER_LENGTH} · (주)셀메이트` },
  { k: "지역", v: "서울" },
  { k: "주력", v: "Vue 3 (3년+) · React / Next.js · TypeScript" },
];

const BADGE_COLORS = ["var(--color-red)", "var(--color-blue)", "var(--color-gold)", "var(--color-green)"];

/** 트레이너 카드 — 소개. 배지 칸에는 자격과 학력이 들어간다. */
export function Trainer() {
  const badges = [
    ...CERTIFICATIONS.map((c) => ({ name: c.name, when: c.date })),
    ...EDUCATION.map((e) => ({ name: e.credential ? `${e.school} · ${e.credential}` : `${e.school} · ${e.program}`, when: e.period.split("–").pop()?.trim() ?? e.period })),
  ];
  return (
    <section data-scene="trainer" className="scene" aria-label="소개와 배지">
        <div className="tcard-badges">
          <div className="text-[12px] font-bold">배지 · 자격과 학력</div>
          <ul className="badge-list">
            {badges.map((b, i) => (
              <li key={b.name} className="flex items-center gap-2.5">
                <span className="badge-gem" style={{ background: BADGE_COLORS[i % BADGE_COLORS.length] }} aria-hidden />
                <span className="min-w-0 text-[12.5px] leading-[1.5] [word-break:keep-all]">
                  {b.name} <span className="text-mute">{b.when}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>

      <h2 className="about-title">잘 만든 코드는<br />잘 쓴 문서와 닮았습니다.</h2>
      <Dialog className="mt-3">
        <p className="body-kr !text-ink">
          4년차 프론트엔드 개발자입니다. 2022년 11월에 입사해, 2023년 5월 기존 담당 프론트엔드 개발자의 출산휴가로 공석이 된 커머스 플랫폼 프론트엔드에 자원해 합류했습니다. 두 달간 인수인계를 받으며 혼자 운영했고, 2023년 7월부터 프론트엔드 리드를 맡아 이후 합류한 프론트엔드·백엔드 개발자들을 이끌며 신규 쇼핑몰 웹앱과 결제창까지 범위를 넓혔습니다. 결제·정산·쿠폰처럼 틀리면 조용히 손해가 나는 금액 도메인과 OAuth·WebSocket·앱 웹뷰 같은 외부 연동을 주로 다뤘습니다. 기능을 만들면서 i18n 도입·Vite 전환·클린 아키텍처 캠페인 같은 기반 작업도 함께 했고, 그 규칙은 팀 가이드와 AI 협업 규칙으로 남겨 이후 작업의 기준으로 썼습니다.
        </p>
      </Dialog>
      <Dialog className="mt-3">
        <p className="body-kr !text-ink">
          AI한테 코드를 맡길 때도 그냥 믿지 않습니다. 짜는 AI와 검사하는 AI를 따로 두고, 틀리기 쉬운 숫자는 코드로 한 번 더 확인합니다. 좋아 보이던 아이디어도 실제로 재보고 효과가 없으면 접습니다. 그 기록이 기술머신과 도감에 있습니다.
        </p>
      </Dialog>
      <Dialog className="mt-3">
        <p className="body-kr !text-ink">
          혼자 잘하는 것보다 함께 잘하는 걸 중요하게 생각합니다. 팀과 팀 사이에서 오가는 대화가 결국 결과물의 품질을 만든다고 믿습니다.
        </p>
      </Dialog>

      <PBox className="mt-4 p-4 @min-[440px]/screen:p-5">
        <div className="mb-3 text-[13px] font-bold">대표 기록</div>
        <dl className="records">
          {RECORDS.map((r) => (
            <div key={r.k}>
              <dt>{r.k}</dt>
              <dd><strong>{r.v}</strong><small>{r.note}</small></dd>
            </div>
          ))}
        </dl>
      </PBox>

      <PBox className="mt-4 p-4 @min-[440px]/screen:p-5">
        <div className="mb-3 text-[13px] font-bold">특성</div>
        <Rows rows={TRAITS} />
      </PBox>
      <BackToMenu />
    </section>
  );
}

export function TrainerTop(){return <section data-scene="trainer" className="scene trainer-preview" aria-labelledby="trainer-top-title">      <div className="tcard">
        <div className="tcard-head">
          <h2 id="trainer-top-title" className="text-[13px] font-bold tracking-[0.18em]">TRAINER CARD</h2>
          <span className="text-[12px]">트레이너 카드</span>
        </div>
        <div className="tcard-body">
          <dl className="trainer-fields">
            {CARD.map((r) => (
              <div key={r.k} className="contents">
                <dt className="font-bold text-blue">{r.k}</dt>
                <dd className="[word-break:keep-all]">{r.v}</dd>
              </div>
            ))}
          </dl>
          <div className="tcard-photo">
            <Me className="trainer-photo" />
          </div>
        </div>
      </div></section>;}
