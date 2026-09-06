import { ArchWindow, ContactShadow, FloorLamp, Plant, RoomLabel, SceneFinish } from "../scene/primitives";

const LEGEND = [
  ["Domain", "커머스 · 결제 · 정산 · 쿠폰"],
  ["Boundary", "OAuth · WebSocket · 앱 웹뷰 · PG"],
  ["Stack", "Vue 3 (3y+) · React / Next.js · TypeScript"],
  ["Method", "역할 분리 · 코드로 검증 · 측정 후 규칙"],
];

const SPINES = ["#8C6240", "#5C534A", "#B08D57", "#7E8C6A", "#A55E45", "#3C4864", "#C9B79B"];

/** 서재 — About. 왼쪽 책장, 가운데 글, 오른쪽 아치창과 책상 위 카드. */
export function Study() {
  return (
    <section id="about" className="relative isolate min-h-[100svh] overflow-hidden bg-wall">
      <div className="plaster absolute inset-0" />
      {/* 책장 */}
      <div className="absolute left-0 top-0 hidden h-[73%] w-[17%] max-w-[250px] bg-wall-2 lg:block" aria-hidden>
        {[0, 1, 2, 3].map((r) => (
          <div key={r} className="absolute left-0 w-full border-b-[10px] border-wood-3 opacity-90 dark:opacity-55" style={{ top: `${12 + r * 21}%`, height: "18%" }}>
            <div className="flex h-full items-end gap-[3px] px-2">
              {SPINES.concat(SPINES).slice(0, 12).map((c, i) => (
                <div key={i} className="rounded-t-[2px]" style={{ background: c, width: `${6 + ((i * 7) % 9)}%`, height: `${70 + ((i * 13) % 30)}%`, opacity: 0.9 }} />
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* 창 · 책상 · 화분 · 램프 */}
      <ArchWindow className="absolute right-[6%] top-[10%] hidden h-[62%] w-[min(340px,24vw)] lg:block" />
      <div className="floor absolute inset-x-0 bottom-0 h-[22%]" />
      <div className="wood absolute inset-x-0 bottom-[22%] hidden h-[7%] shadow-[0_20px_30px_-16px_var(--shadow)] lg:block" />
      <Plant className="absolute bottom-[24%] right-[7%] hidden h-[150px] w-[120px] lg:block" />
      <FloorLamp className="absolute left-[64%] top-[32%] hidden h-[40%] lg:block" />
      <div className="lampglow" style={{ ["--lamp-x" as string]: "44%", ["--lamp-y" as string]: "72%" }} />
      <div className="sunbeam left-[48%] top-[-10%] h-[120%] w-[60%]" />

      <div className="relative z-10 mx-auto max-w-[1440px] px-5 pb-[26%] pt-24 sm:px-8 sm:pt-28 lg:px-14 lg:pb-[24%] lg:pl-[24%] lg:pt-32">
        <div className="max-w-[560px]">
          <RoomLabel>About · The study</RoomLabel>
          <h2 className="myeongjo mt-5 text-[30px] leading-[1.25] text-ink sm:text-[44px]">잘 만든 코드는<br />잘 쓴 문서와 닮았습니다.</h2>
          <p className="prose-kr mt-6 text-ink-2">
            4년차 프론트엔드 개발자입니다. 커머스 플랫폼의 어드민·쇼핑몰·결제 프론트를 3년 10개월간 맡으며, 결제·정산·쿠폰처럼 틀리면 조용히 손해가 나는 금액 도메인과 OAuth·WebSocket·앱 웹뷰 같은 외부 시스템과의 경계를 주로 다뤘습니다. 기능을 내면서 i18n 도입·Vite 전환·클린 아키텍처 캠페인 같은 기반 작업을 병행했고, 그 규칙을 팀 가이드와 AI 협업 규칙으로 남겨 이후 작업의 준거로 운영했습니다.
          </p>
          <p className="prose-kr mt-4 text-ink-2">
            AI는 코드 생성기가 아니라 통제 대상으로 다룹니다. 구현과 검증을 다른 벤더의 AI로 나누고, 환각은 코드로 막고, 측정한 뒤에만 규칙을 만듭니다. 혼자 잘하는 것보다 함께 잘하는 걸 중요하게 생각합니다.
          </p>
        </div>
        {/* 책상 위 카드 */}
        <div className="paper relative mt-10 grid max-w-[560px] grid-cols-1 gap-x-8 px-5 sm:grid-cols-2">
          <ContactShadow className="-bottom-4 left-4 right-4 h-6" />
          {LEGEND.map(([k, v]) => (
            <div key={k} className="border-t border-[rgba(43,38,34,0.14)] py-3 first:border-t-0 sm:[&:nth-child(2)]:border-t-0">
              <div className="caps text-accent">{k}</div>
              <div className="mt-1.5 text-[14px] text-[#2b2622]">{v}</div>
            </div>
          ))}
        </div>
      </div>
      <SceneFinish />
    </section>
  );
}
