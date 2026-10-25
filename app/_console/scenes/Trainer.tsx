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
          안녕하세요. 개발자 정태환입니다.
        </p>
      </Dialog>
      <Dialog className="mt-3">
        <p className="body-kr !text-ink">
          프론트엔드를 메인으로 하고 있지만, 화면 뒤에서 일어나는 일까지 직접 만들어 보며 이해하는 걸 좋아합니다. 잘 돌아가는 것보다 왜 그렇게 돌아가는지를 알고 넘어가려고 합니다.
        </p>
      </Dialog>
      <Dialog className="mt-3">
        <p className="body-kr !text-ink">
          일찍 일을 시작한 덕분에 배우는 방법도 일하면서 익혔습니다. 모르는 건 직접 만들어 보면서 배우고, 배운 건 다시 같이 일하는 사람들에게 나누는 편입니다.
        </p>
      </Dialog>
      <Dialog className="mt-3">
        <p className="body-kr !text-ink">
          요즘은 직접 코드를 짜는 것보다, 무엇을 만들지 정하고 그 결과를 확인하는 데 더 많은 시간을 씁니다. 빨리 만드는 것만큼, 맞게 만들었는지 아는 게 중요하다고 생각합니다.
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
