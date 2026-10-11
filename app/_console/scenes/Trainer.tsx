import { Me } from "../Me";
import { Dialog, PBox, Rows } from "../ui";
import { CERTIFICATIONS, EDUCATION } from "../../_data/experience";
import { RECORDS, TRAITS } from "../../_data/profile";
import { BackToMenu } from "./common";

const CARD = [
  { k: "이름", v: "정태환" },
  { k: "직업", v: "프론트엔드 개발자" },
  { k: "경력", v: "커머스 3년 10개월 · (주)셀메이트" },
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
          4년차 프론트엔드 개발자입니다. 커머스 플랫폼의 어드민·쇼핑몰·결제 프론트를 3년 10개월간 맡으며, 결제·정산·쿠폰처럼 틀리면 조용히 손해가 나는 금액 도메인과 OAuth·WebSocket·앱 웹뷰 같은 외부 시스템과의 경계를 주로 다뤘습니다. 기능을 내면서 i18n 도입·Vite 전환·클린 아키텍처 캠페인 같은 기반 작업을 병행했고, 그 규칙을 팀 가이드와 AI 협업 규칙으로 남겨 이후 작업의 준거로 운영했습니다.
        </p>
      </Dialog>
      <Dialog className="mt-3">
        <p className="body-kr !text-ink">
          AI는 코드 생성기가 아니라 통제 대상으로 다룹니다. 구현과 검증을 다른 벤더의 AI로 나누고, 환각은 스키마가 아니라 코드로 막고, 훅으로 토큰을 아끼려던 가설을 실측(0.003%)으로 기각하는 식으로 — 측정한 뒤에만 규칙을 만듭니다. 그 기록이 기술머신과 도감에 있습니다.
        </p>
      </Dialog>
      <Dialog className="mt-3">
        <p className="body-kr !text-ink">
          혼자 잘하는 것보다 함께 잘하는 걸 중요하게 생각합니다. 팀의 경계에서 오가는 소통이 결국 결과물의 품질을 만든다고 믿습니다.
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
