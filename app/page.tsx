import Link from "next/link";
import { TitleBlock } from "./_components/TitleBlock";
import { Hero } from "./_components/Hero";
import { PaletteBleed, Swatches } from "./_components/Palette";
import { Reveal, Rule } from "./_ui/Reveal";
import { Sheet, SubHead, Rows } from "./_ui/Sheet";
import { Label } from "./_ui/Label";
import { Dim } from "./_ui/Dim";
import { Marker } from "./_ui/Marker";
import { Stamp } from "./_ui/Stamp";
import { Btn } from "./_ui/Btn";
import { PROJECTS } from "./_data/projects";
import { TALKS } from "./_data/talks";
import { PRACTICES } from "./_data/ai-practices";

/* ── 콘텐츠 데이터 ── */

/* 경력 — 최신순. 도면의 개정(REV) 표처럼 번호를 내려가며 읽는다. */
const EXPERIENCE = [
  {
    period: "2026.02 – 현재",
    title: "신규 쇼핑몰 웹앱 · 앱·웹 공유 도메인 코어",
    summary:
      "Flutter 모바일 앱을 참조 구현으로 삼아 웹 버전을 Next.js로 신규 구축하고, 앱과 웹이 공유하는 프레임워크 독립 TypeScript 코어 패키지를 만들었습니다(MR 361건 — 화면 244·코어 117). 코어는 사내 패키지 레지스트리에 release/publish CI로 배포하고, 쿠폰 상호 배타 로직과 상품쿠폰 per-unit 계산 등 금액 계산을 앱과 1:1로 정합시킨 뒤 단위 테스트 759개로 커버리지를 42.0% → 69.3%까지 올렸습니다. 웹앱은 세트상품 구매 파이프라인(상품상세 → 카트 → 체크아웃 → PG 금액 정합), 비회원 구매, LINE 로그인, 독립몰 SSO를 구현했고 정적 페이지 65개·E2E 35개 페이지 커버를 확보했습니다. 실배포 후 무파라미터 카트 조회가 백엔드를 폭주시키던 문제를 페이지네이션 전환 + 중복 호출 제거로 잡았습니다.",
    dims: ["MR 361", "Tests 759", "Cov 42.0 → 69.3 %"],
  },
  {
    period: "2025.09 – 2026.08",
    title: "클린 아키텍처 리팩토링 캠페인 주도",
    summary:
      "UI·상태·로직·API 호출이 한 파일에 뒤섞인 어드민 페이지를 Entity / API Repository / UseCase / Store 4계층으로 분리하는 캠페인을 콘텐츠 도메인에서 시작해 주문·포인트·리뷰·카테고리·MID 등으로 확산했습니다(리팩토링 MR 132건). 주문 도메인 9개 페이지는 엔티티 6종·API 17개·useCase 12종을 신설하며 백엔드 페이로드를 동일하게 보존하는 원칙으로 옮겼고, 최대 파일은 1,224 → 499줄(59%↓), 다른 도메인 페이지 컨테이너는 50~90% 줄었습니다. 회귀는 원인 커밋 단위로 역추적해 유닛 테스트 82개로 봉인했고, 컴포넌트 19개 전환 중 computed 내부 ref 부수효과로 금액 표시가 흔들릴 수 있던 잠복 결함 3건을 발굴했습니다. 규칙은 팀 리팩토링 가이드로 제정해 AI 협업 규칙(CLAUDE.md)과 연동하고, 어드민 전체 Vitest 1,345개·Cypress e2e를 도입했습니다.",
    dims: ["MR 132", "1,224 → 499 lines", "Vitest 1,345"],
  },
  {
    period: "2025.03 – 2026.03",
    title: "결제 중개 서비스 — PayPal PG 엔드투엔드 연동",
    summary:
      "FastAPI + Jinja2 결제창의 프론트(바닐라 JS ES 모듈)를 맡아 PayPal을 주문 생성 → approve → confirm → capture 전 구간으로 연동했습니다(MR 178건). 동일 결제수단에 복수 PG가 물리는 구조라 merchant-id별 SDK 동적 로딩과 PG 벤더 매칭을 설계했고, 앱 웹뷰에서 SDK가 동작하지 않는 제약은 외부 브라우저 플로우로 우회했습니다. 569줄 모놀리식 스크립트를 PayPal·Apple Pay·Google Pay·카드 모듈로 분리하고, INICIS·Eximbay·LINE Pay·Toss까지 멀티 PG의 성공/취소/실패 분기와 5개 언어 실패 화면, PG별 에러 Sentry 로깅을 정리했습니다.",
    dims: ["MR 178", "PG ×6", "Locales ×5"],
  },
  {
    period: "2025",
    title: "외부 시스템 연동 — 판매채널 OAuth · 매장 주문 WebSocket",
    summary:
      "카페24 외부 판매채널 연동(MR 114건)에서 OAuth 팝업 플로우를 직접 구현했습니다 — authorize 파라미터 수신 → 팝업 → 콜백의 code/state를 postMessage로 받아 Promise resolver에 연결하고, 팝업 차단·토큰 만료를 예외 처리했습니다. 채널 상품 → 자사 상품 30여 필드 매핑과 WebSocket 진행 상태 플로팅 알림을 만들고, 이후 내보내기와 중국 Youzan 채널로 확장하면서 채널별 정책 차이를 엔티티 레이어에 격리했습니다. 오프라인 매장 주문 시스템(MR 74건·4개월)에서는 QR/바코드 스캐너 모드와 픽업 상태 머신을 구현하고, 배송처리 엑셀 업로드를 동기 대기에서 WebSocket 비동기 통지로 바꿨습니다.",
    dims: ["MR 114 + 74", "Fields ×30", "OAuth · WS"],
  },
  {
    period: "2023.08 – 2024",
    title: "프론트엔드 기반 개선 — i18n · Vite · 부트스트랩 · 배포 파이프라인",
    summary:
      "운영 중인 어드민의 국제화·빌드·환경설정·배포 기반을 기능 개발과 병행해 교체했습니다. i18n은 vue-i18n 세팅부터 87개 파일의 하드코딩 문자열 치환까지 약 1주에 단독 수행했고, 라우트 name을 번역문으로 쓰던 구조가 언어 전환 시 페이지 이동을 깨뜨리는 문제를 찾아 교정한 뒤 5개 언어 체계로 확장했습니다. Webpack → Vite, Jest → Vitest 전환(196개 파일), 화면마다 반복 호출되던 환경설정 API를 boot 체인 + Pinia 캐싱으로 1회 로드 통합(45개 파일), GitLab CI를 템플릿 잡으로 추상화해 한 코드베이스를 2개 브랜드 서비스로 빌드·배포하는 파이프라인을 구성했습니다.",
    dims: ["Files 87 · 196 · 45", "Locales ×5", "Brands ×2"],
  },
  {
    period: "2023.05 – 현재",
    title: "커머스 어드민 — 금액이 걸린 도메인 구축",
    summary:
      "PG·MID 관리, 쿠폰·할인정책·정산·마진 통계, 세트상품처럼 금액 계산이 얽힌 도메인을 신규 구축했습니다. 실제 마진 통계는 프론트가 재계산하면 서버와 어긋날 수 있어 '응답값 그대로 표시, 재계산 금지' 원칙을 세우고 0 나눗셈·음수만 가드했습니다. 세트상품은 등록·상세부터 주문 8개 페이지와 신규주문 생성(구성상품 variants의 cartesian product 조합)까지 관통 구현했고, 입점 브랜드 상품 검수 워크플로(5개월·MR 41건)와 매출·주문 통계 4종(추세선 최소제곱법 직접 계산, 월 선택기 자체 제작)도 만들었습니다.",
    dims: ["Order pages ×8", "MR 41", "Stats ×4"],
  },
  {
    period: "2022.11 – 2023.04",
    title: "POS 웹 서비스 · 사내 디자인시스템(Quasar UI킷)",
    summary:
      "AngularJS 1.x + Laravel Blade 레거시에서 회원가입 퍼널과 매장별 매출통계 차트를 만들었고, 같은 시기 사내 Quasar 기반 UI킷의 컴포넌트를 제작하면서 어드민에서 소비하는 양쪽을 담당했습니다. 이 경험이 이후 @usetaehwan/ui의 '소비처에서 먼저 검증하고 추출한다'는 순서로 이어졌습니다.",
    dims: ["AngularJS 1.x", "Quasar UI kit"],
  },
];

const EDUCATION = [
  {
    school: "배화여자대학교",
    period: "2024.02 – 2026.02",
    program: "고숙련 일학습병행 P-TECH · 모바일소프트웨어과",
    credential: "전문학사 취득",
  },
  {
    school: "광주소프트웨어마이스터고등학교",
    period: "2020.03 – 2023.01",
    program: "졸업",
    credential: null,
  },
];

const CERTIFICATIONS = [
  { name: "일학습병행자격 SW개발 L5", code: "SW개발_L5_20V1", date: "2025.12" },
  { name: "프로그래밍기능사", code: null, date: "2021.10" },
];

const REPO_URL = "https://github.com/JeongTaehwan/usetaehwan";
const EMAIL = "kt26625417@gmail.com";
const MAIL_SUBJECT = "usetaehwan.page 문의";
const GMAIL_COMPOSE = `https://mail.google.com/mail/?view=cm&fs=1&to=${EMAIL}&su=${encodeURIComponent(
  MAIL_SUBJECT
)}`;

const DETAIL_LETTERS = ["A", "B", "C", "D", "E", "F"];

/* 이 사이트 자체의 개정 이력 — 도면의 REV 표 */
const SITE_REVISIONS = [
  { rev: "2.0", date: "2026.09", desc: "도면(drafting sheet) 컨셉으로 재작도. 디자인 시스템 의존 제거, 프로젝트별 팔레트·표제란 내비·십자선 커서 추가." },
  { rev: "1.0", date: "2026.07", desc: "초판. 자체 디자인 시스템 @usetaehwan/ui의 첫 소비처로 구축 — 웜 뉴트럴·문서형 레이아웃." },
];

export default function Home() {
  const projects = PROJECTS.filter((p) => !p.placeholder);

  return (
    <main className="page paper-grid min-h-dvh pb-28 md:pb-16">
      {/* 데스크톱 좌측 세로 눈금자 — 장식 */}
      <div aria-hidden className="ruler fixed inset-y-0 left-0 hidden w-6 lg:block" />

      <Hero />

      {/* ── 01 About ── */}
      <Sheet id="about" no={1} title="About" meta="General description">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div>
            <p className="display text-2xl leading-tight sm:text-4xl">
              잘 만든 코드는
              <br />
              잘 그린 도면과 닮았습니다.
            </p>
            <div className="prose-draft mt-8 flex flex-col gap-4">
              <p>
                4년차 프론트엔드 개발자입니다. 커머스 플랫폼의 어드민·쇼핑몰·결제 프론트를 3년
                10개월간 맡으며, 결제·정산·쿠폰처럼 틀리면 조용히 손해가 나는 금액 도메인과
                OAuth·WebSocket·앱 웹뷰 같은 외부 시스템과의 경계를 주로 다뤘습니다. 기능을 내면서
                i18n 도입·Vite 전환·클린 아키텍처 캠페인 같은 기반 작업을 병행했고, 그 규칙을 팀
                가이드와 AI 협업 규칙으로 남겨 이후 작업의 준거로 운영했습니다.
              </p>
              <p>
                AI는 코드 생성기가 아니라 통제 대상으로 다룹니다. 구현과 검증을 다른 벤더의 AI로
                나누고, 환각은 스키마가 아니라 코드로 막고, 훅으로 토큰을 아끼려던 가설을
                실측(0.003%)으로 기각하는 식으로 — 측정한 뒤에만 규칙을 만듭니다. 그 기록이 아래 AI
                노트와 프로젝트 도면에 있습니다.
              </p>
              <p>
                혼자 잘하는 것보다 함께 잘하는 걸 중요하게 생각합니다. 팀의 경계에서 오가는 소통이
                결국 결과물의 품질을 만든다고 믿습니다.
              </p>
            </div>
          </div>

          {/* 우측 범례 */}
          <aside className="self-start border border-line">
            <div className="border-b border-line px-4 py-2">
              <Label>Legend</Label>
            </div>
            <dl className="divide-y divide-line-soft">
              {[
                ["Domain", "커머스 · 결제 · 정산 · 쿠폰"],
                ["Boundary", "OAuth · WebSocket · 앱 웹뷰 · PG"],
                ["Stack", "Vue 3 (3y+) · React / Next.js · TypeScript"],
                ["Method", "역할 분리 · 코드로 검증 · 측정 후 규칙"],
                ["Company", "(주)셀메이트 · 2022.11 – 재직 중"],
              ].map(([k, v]) => (
                <div key={k} className="px-4 py-3">
                  <Label as="dt">{k}</Label>
                  <dd className="mt-1 text-sm text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </aside>
        </div>
      </Sheet>

      {/* ── 02 Experience ── */}
      <Sheet id="experience" no={2} title="Experience" meta="Revision history · (주)셀메이트 · 2022.11 –">
        {/* 개정표 헤더 */}
        <div className="hidden grid-cols-[4rem_9rem_minmax(0,1fr)] gap-6 border-b border-line pb-2 md:grid">
          <Label>Rev</Label>
          <Label>Period</Label>
          <Label>Description</Label>
        </div>
        <ol>
          {EXPERIENCE.map((e, i) => {
            const rev = String(EXPERIENCE.length - i).padStart(2, "0");
            return (
              <Reveal key={e.title} as="li" className="border-b border-line-soft py-8 md:py-10">
                <div className="grid gap-4 md:grid-cols-[4rem_9rem_minmax(0,1fr)] md:gap-6">
                  <div className="flex items-baseline gap-4 md:block">
                    <span className="figure-no text-3xl md:text-4xl">{rev}</span>
                    <span className="font-mono text-xs text-ink-3 md:hidden">{e.period}</span>
                  </div>
                  <div className="hidden font-mono text-xs text-ink-3 md:block md:pt-2">{e.period}</div>
                  <div className="min-w-0">
                    <h3 className="display text-xl sm:text-2xl">{e.title}</h3>
                    <p className="prose-draft mt-4">{e.summary}</p>
                    <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2">
                      {e.dims.map((d) => (
                        <Dim key={d} className="min-w-40">
                          {d}
                        </Dim>
                      ))}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </ol>

        {/* 발표 — 참고 문헌(REFERENCES) 블록 */}
        <div className="mt-16">
          <SubHead no="REF.">Talks</SubHead>
          <ol className="mt-6 grid gap-5 md:grid-cols-2">
            {TALKS.map((t, i) => (
              <Reveal key={t.slug} as="li" delay={i * 0.06}>
                <Link
                  href={`/talks/${t.slug}`}
                  className="group flex h-full flex-col border border-line p-5 transition-colors hover:border-mark sm:p-6"
                >
                  <div className="flex items-baseline justify-between gap-4">
                    <Label>[{i + 1}]</Label>
                    <span className="font-mono text-xs text-ink-3">{t.date}</span>
                  </div>
                  <h4 className="display mt-3 text-lg transition-colors group-hover:text-mark sm:text-xl">
                    {t.title}
                  </h4>
                  <p className="mt-1 text-xs text-ink-3">{t.venue}</p>
                  <p className="prose-draft mt-3 text-sm">{t.summary}</p>
                  <span className="mt-auto pt-5 font-mono text-[11px] uppercase tracking-[0.14em] text-mark">
                    발표 문서 →
                  </span>
                </Link>
              </Reveal>
            ))}
          </ol>
        </div>
      </Sheet>

      {/* ── 03 Background ── */}
      <Sheet id="background" no={3} title="Background" meta="Education · Certifications">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <SubHead no="3.1">Education</SubHead>
            <ol className="mt-6 divide-y divide-line-soft border-y border-line">
              {EDUCATION.map((e) => (
                <li key={e.school} className="py-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h4 className="display text-lg">{e.school}</h4>
                    <span className="font-mono text-xs text-ink-3">{e.period}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink-2">{e.program}</p>
                  {e.credential && (
                    <div className="mt-3">
                      <Stamp>{e.credential}</Stamp>
                    </div>
                  )}
                </li>
              ))}
            </ol>
          </div>
          <div>
            <SubHead no="3.2">Certifications</SubHead>
            <ol className="mt-6 divide-y divide-line-soft border-y border-line">
              {CERTIFICATIONS.map((c) => (
                <li key={c.name} className="py-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                    <h4 className="display text-lg">{c.name}</h4>
                    <span className="font-mono text-xs text-ink-3">{c.date}</span>
                  </div>
                  {c.code && <p className="mt-2 font-mono text-xs text-ink-3">{c.code}</p>}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </Sheet>

      {/* ── 04 Projects ── */}
      <Sheet id="projects" no={4} title="Projects" meta="Detail views A – C · each in its own palette">
        <div className="flex flex-col gap-12">
          {projects.map((p, i) => {
            const letter = DETAIL_LETTERS[i];
            return (
              <Reveal key={p.slug} as="article">
                {/* 이 프로젝트의 실제 팔레트로 그려진 시트 — 다른 화면을 잘라 붙인 것처럼 */}
                <div className={`sheet paper-grid theme-${p.slug}`}>
                  {/* 상세도 헤더 */}
                  <div className="flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-line px-5 py-4 sm:px-8">
                    <Marker size="lg">{letter}</Marker>
                    <div className="min-w-0 flex-1">
                      <Label mark>Detail {letter}</Label>
                      <Link
                        href={`/projects/${p.slug}`}
                        className="display mt-1 block text-2xl transition-colors hover:text-mark sm:text-3xl"
                      >
                        {p.name}
                      </Link>
                    </div>
                    <div className="flex flex-col items-start gap-2 sm:items-end">
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-xs text-ink-3">
                        <span>{p.year}</span>
                        {p.tags.map((t) => (
                          <span key={t}>{t}</span>
                        ))}
                      </div>
                      <div className="flex items-center gap-3">
                        <Label>{p.palette.label}</Label>
                        <Swatches palette={p.palette} />
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-8 px-5 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)] lg:gap-12">
                    {/* 좌: 요약 + 링크 */}
                    <div>
                      <p className="prose-draft text-ink">{p.summary}</p>
                      <div className="mt-6 flex flex-wrap gap-2">
                        {p.detail?.links?.map((l) => (
                          <Btn key={l.href} href={l.href} className="h-8 px-3 text-[10px]">
                            {l.label} ↗
                          </Btn>
                        ))}
                        <Btn href={`/projects/${p.slug}`} variant="solid" className="h-8 px-3 text-[10px]">
                          Full drawing →
                        </Btn>
                      </div>
                      <div className="mt-4">
                        <PaletteBleed slug={p.slug} palette={p.palette} />
                      </div>
                    </div>

                    {/* 우: 작업 사례 — 제목만 보이고 펼치면 문제·파악·해결 */}
                    {p.cases && (
                      <div>
                        <Label>Section views · {p.cases.length}</Label>
                        <ol className="mt-2 border-t border-line">
                          {p.cases.map((c, j) => (
                            <li key={c.title} className="border-b border-line-soft">
                              <details className="group/case">
                                <summary className="flex cursor-pointer list-none items-baseline gap-3 py-3 text-sm text-ink transition-colors hover:text-mark [&::-webkit-details-marker]:hidden">
                                  <span className="figure-no shrink-0 text-xs text-mark">
                                    {letter}-{j + 1}
                                  </span>
                                  <span className="font-medium">{c.title}</span>
                                  <span
                                    aria-hidden
                                    className="ml-auto font-mono text-xs text-ink-3 transition-transform group-open/case:rotate-45"
                                  >
                                    +
                                  </span>
                                </summary>
                                <Rows
                                  className="pb-5 text-sm"
                                  rows={[
                                    { k: "문제", v: c.problem },
                                    { k: "파악", v: c.diagnosis },
                                    { k: "해결", v: c.solution },
                                  ]}
                                />
                              </details>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>

        <div className="cut mt-10 flex items-center gap-4 pt-6">
          <Stamp>Pending</Stamp>
          <span className="text-sm text-ink-3">다음 상세도를 준비하고 있습니다.</span>
        </div>
      </Sheet>

      {/* ── 05 AI Notes ── */}
      <Sheet id="ai" no={5} title="AI Notes" meta="General notes · measured only">
        <p className="prose-draft max-w-3xl text-ink">
          AI를 통제 대상으로 다룹니다. 코드 생성기가 아니라 절차 안에 두는 것 — 역할을 나누고,
          환각을 코드로 막고, 테스트의 정답을 먼저 고정하고, 체감 대신 숫자로 판단한 기록을 네 편의
          주기(註記)로 정리했습니다. 회사 코드베이스와 개인 프로젝트 양쪽에서 실측한 값만 씁니다.
        </p>

        <ol className="mt-10 border-t border-line">
          {PRACTICES.map((d, i) => (
            <Reveal key={d.slug} as="li" className="border-b border-line">
              <Link
                href={`/ai/${d.slug}`}
                className="group grid gap-5 py-8 transition-colors hover:bg-mark-soft sm:grid-cols-[4rem_minmax(0,1fr)_12rem] sm:gap-8 sm:px-3"
              >
                <span className="figure-no text-4xl leading-none text-ink-3 transition-colors group-hover:text-mark sm:text-5xl">
                  {i + 1}.
                </span>
                <div className="min-w-0">
                  <h3 className="display text-xl transition-colors group-hover:text-mark sm:text-2xl">
                    {d.title}
                  </h3>
                  <p className="prose-draft mt-3">{d.summary}</p>
                  <blockquote className="mt-4 border-l-2 border-mark pl-4 text-sm text-ink">
                    “{d.keyRule}”
                  </blockquote>
                  <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1">
                    {d.tags.map((tag) => (
                      <Label key={tag}>#{tag}</Label>
                    ))}
                    <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.14em] text-mark transition-transform group-hover:translate-x-1">
                      읽기 →
                    </span>
                  </div>
                </div>
                <div className="sm:border-l sm:border-line sm:pl-6">
                  <Label mark>Measured</Label>
                  <div className="figure-no mt-2 text-3xl leading-none sm:text-4xl">{d.stat.value}</div>
                  <p className="mt-2 text-xs text-ink-3">{d.stat.label}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </ol>
      </Sheet>

      {/* ── 06 Contact ── */}
      <Sheet id="contact" no={6} title="Contact" meta="Approval block">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
          <div>
            <p className="display text-2xl leading-tight sm:text-4xl">함께 그릴 도면이 있다면.</p>
            <p className="prose-draft mt-6 max-w-xl">
              제안, 협업, 혹은 그냥 인사도 좋아요. 편하게 메일 주시면 빠르게 회신드리겠습니다.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Btn href={GMAIL_COMPOSE} variant="solid">
                메일 보내기
              </Btn>
              <Btn href={REPO_URL}>GitHub ↗</Btn>
            </div>
          </div>

          {/* 서명란 */}
          <div className="grid grid-cols-2 border border-line">
            {[
              ["Drawn by", "Taehwan Jeong", "2026.09"],
              ["Checked by", "—", "대기 중"],
              ["Approved by", "—", "귀하의 서명"],
              ["Drawing no.", "UT-2026-01", "Rev 2.0"],
            ].map(([k, v, s], i) => (
              <div
                key={k}
                className={`p-4 ${i % 2 === 0 ? "border-r border-line" : ""} ${i < 2 ? "border-b border-line" : ""}`}
              >
                <Label>{k}</Label>
                <div className="mt-2 font-mono text-sm text-ink">{v}</div>
                <div className="mt-1 text-xs text-ink-3">{s}</div>
              </div>
            ))}
          </div>
        </div>
      </Sheet>

      {/* ── Footer — 사이트 개정 이력 + 표제 띠 ── */}
      <footer className="mx-auto w-full max-w-6xl px-5 pt-4 sm:px-8 lg:px-12">
        <Rule />
        <div className="grid gap-8 py-8 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div>
            <Label>Revision history — this drawing</Label>
            <table className="mt-3 w-full border-collapse font-mono text-xs">
              <thead>
                <tr className="border-b border-line text-left">
                  <th className="label whitespace-nowrap py-1.5 pr-4 font-normal">Rev</th>
                  <th className="label py-1.5 pr-4 font-normal">Date</th>
                  <th className="label py-1.5 font-normal">Description</th>
                </tr>
              </thead>
              <tbody className="text-ink-2">
                {SITE_REVISIONS.map((r) => (
                  <tr key={r.rev} className="border-b border-line-soft align-top">
                    <td className="py-2 pr-4 text-ink">{r.rev}</td>
                    <td className="py-2 pr-4 whitespace-nowrap">{r.date}</td>
                    <td className="py-2">{r.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex flex-col justify-end gap-2 md:items-end">
            <Label>© 2026 Taehwan Jeong</Label>
            <Label>Drawing UT-2026-01 · Rev 2.0 · Paper / Blueprint</Label>
            <Label>
              <a href={`mailto:${EMAIL}`} className="hover:text-mark">
                {EMAIL}
              </a>
            </Label>
          </div>
        </div>
      </footer>

      <TitleBlock />
    </main>
  );
}
