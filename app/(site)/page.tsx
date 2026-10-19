import Image from "next/image";
import Link from "next/link";
import { FEATURED, PROJECTS, getProject } from "../_data/projects";
import { AWARDS, CERTIFICATIONS, COMPANY, EDUCATION, EXPERIENCE, GROWTH } from "../_data/experience";
import { PRACTICES } from "../_data/ai-practices";
import { TALKS } from "../_data/talks";
import { RECORDS, TRAITS } from "../_data/profile";
import { BLOG_URL, GITHUB_URL, GMAIL_COMPOSE } from "../_data/links";
import { Chibi } from "../_console/Chibi";
import { Arrow, ButtonLink, DefList, Pill, Pills, ProjectMark, Prose, SectionTitle, no2 } from "../_site/ui";
import { Clamp, LegacyHash, SideNav, TopNav } from "../_site/nav";
import portrait from "../_site/portrait.jpg";
import { INTRO } from "../_site/intro";
import { anchors } from "../_site/anchors";

const CONTACTS = [
  { label: "메일", href: GMAIL_COMPOSE },
  { label: "GitHub", href: GITHUB_URL },
  { label: "블로그", href: BLOG_URL },
];

/** 프로젝트 — 대표는 카드로, 나머지는 접힌 목록으로 */
const FEATURED_PROJECTS = FEATURED.flatMap((slug) => getProject(slug) ?? []);
const OTHER_PROJECTS = PROJECTS.filter((p) => !FEATURED.includes(p.slug));

/** 홈 — 왼쪽은 이름과 목차, 오른쪽은 한 번의 스크롤로 읽히는 본문 */
export default function Home() {
  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:rounded-md focus:bg-ink focus:px-3 focus:py-2 focus:text-paper">
        본문으로 건너뛰기
      </a>
      <LegacyHash />
      <div className="mx-auto max-w-[72rem] px-5 sm:px-8 lg:flex lg:gap-20 lg:px-12">
        <header className="pt-16 pb-10 sm:pt-20 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:w-[21rem] lg:shrink-0 lg:flex-col lg:justify-between lg:gap-8 lg:overflow-y-auto lg:py-16 lg:[scrollbar-width:none]">
          <div>
            <Image
              src={portrait}
              alt="정태환 증명사진"
              sizes="88px"
              loading="eager"
              placeholder="blur"
              className="mb-7 h-[88px] w-[88px] rounded-2xl border border-line object-cover object-[50%_6%]"
            />
            <p className="font-mono text-[13px] text-mute">useTaehwan()</p>
            <h1 className="mt-3 text-[40px] leading-none font-bold tracking-[-0.03em]">정태환</h1>
            <p className="mt-3 text-[17px] font-medium text-ink-2">프론트엔드 개발자 · 서울</p>
            <p className="mt-6 max-w-[22rem] text-[16px] leading-[1.8] text-ink-2">
              잘 만든 코드는 잘 쓴 문서와 닮았다고 생각합니다. 구조를 먼저 그리고, 숫자로 확인하고, 문서로 남깁니다.
            </p>
            <SideNav />
          </div>

          <div className="mt-8 lg:mt-0">
            <ul className="flex flex-wrap gap-x-5 gap-y-2" aria-label="연락처">
              {CONTACTS.map((c) => (
                <li key={c.label}>
                  <a href={c.href} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-[14px] font-medium text-ink-2 transition-colors hover:text-ink">
                    {c.label}
                    <Arrow external className="h-3.5 w-3.5 text-mute" />
                  </a>
                </li>
              ))}
            </ul>
            <Link href="/play" className="group mt-6 flex items-center gap-3 rounded-xl border border-line p-3 pr-4 transition-colors hover:bg-hover">
              <span className="flex h-12 w-12 shrink-0 items-end justify-center overflow-hidden rounded-lg bg-hover">
                <Chibi className="h-11 w-auto" title="게임기 버전의 픽셀 캐릭터" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-medium">게임기 버전</span>
                <span className="block text-[12.5px] leading-[1.5] text-mute">같은 내용을 두 화면 휴대용 기기로</span>
              </span>
              <Arrow className="text-mute transition-colors group-hover:text-ink" />
            </Link>
          </div>
        </header>

        <TopNav />

        <main id="main" className="min-w-0 flex-1 pt-12 pb-16 lg:pt-20">
          {/* 소개 */}
          <section aria-labelledby="about">
            <SectionTitle id="about">소개</SectionTitle>
            <div className="flex flex-col gap-4">
              {INTRO.map((p) => (
                <Prose key={p.slice(0, 12)}>{p}</Prose>
              ))}
            </div>

            <dl className="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
              {RECORDS.map((r) => (
                <div key={r.k} className="flex flex-col bg-card p-4 sm:p-5">
                  <dt className="order-2 mt-1 text-[13px] font-medium text-ink-2">{r.k}</dt>
                  <dd className="order-1 font-mono text-[20px] leading-tight font-medium tracking-[-0.02em] whitespace-nowrap sm:text-[24px]">{r.v}</dd>
                  <dd className="order-3 mt-1.5 text-[12px] leading-[1.5] text-mute">{r.note}</dd>
                </div>
              ))}
            </dl>

            <DefList className="mt-8" rows={TRAITS} />
          </section>

          {/* 경력 */}
          <section aria-labelledby="experience" className="mt-24">
            <SectionTitle id="experience">경력</SectionTitle>
            <p className="-mt-3 text-[14px] text-mute">{COMPANY}</p>
            <ol aria-label="입사 후 성장 과정" className="mt-6 mb-7 flex flex-col gap-2 border-b border-line pb-7">
              {GROWTH.map((g) => (
                <li key={g.date} className="grid gap-x-8 gap-y-0.5 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
                  <p className="font-mono text-[13px] leading-[1.9] text-mute">{g.date}</p>
                  <p className="text-[15px] leading-[1.75] text-ink-2">{g.text}</p>
                </li>
              ))}
            </ol>
            <ol className="flex flex-col">
              {EXPERIENCE.map((e, i) => (
                <li key={e.start + e.title} id={anchors.home.experience(i)} className="grid gap-x-8 gap-y-2 border-t border-line py-7 first:border-t-0 first:pt-0 sm:grid-cols-[8.5rem_minmax(0,1fr)]">
                  <p className="font-mono text-[13px] leading-[1.9] text-mute">{e.period}</p>
                  <div className="min-w-0">
                    <h3 className="text-[17px] leading-[1.5] font-bold">{e.title}</h3>
                    <Clamp className="mt-2">{e.summary}</Clamp>
                    <ul className="mt-3 flex flex-wrap gap-1.5">
                      {e.dims.map((d) => (
                        <li key={d}>
                          <Pill className="font-mono text-[12px]">{d}</Pill>
                        </li>
                      ))}
                    </ul>
                  </div>
                </li>
              ))}
            </ol>

            <div id={anchors.home.education} className="mt-12 grid gap-8 rounded-xl border border-line p-5 sm:grid-cols-2 sm:p-6">
              <div>
                <h3 className="text-[14px] font-bold">학력</h3>
                <ul className="mt-3 flex flex-col gap-3">
                  {EDUCATION.map((e) => (
                    <li key={e.school}>
                      <p className="text-[15px] font-medium">{e.school}</p>
                      <p className="mt-0.5 text-[13.5px] leading-[1.6] text-mute">
                        {e.program}
                        {e.credential && ` · ${e.credential}`} · {e.period}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[14px] font-bold">자격</h3>
                <ul className="mt-3 flex flex-col gap-3">
                  {CERTIFICATIONS.map((c) => (
                    <li key={c.name}>
                      <p className="text-[15px] font-medium">{c.name}</p>
                      <p className="mt-0.5 text-[13.5px] text-mute">{c.date}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-[14px] font-bold">수상</h3>
                <ul className="mt-3 flex flex-col gap-3">
                  {AWARDS.map((a) => (
                    <li key={a.name}>
                      <p className="text-[15px] font-medium">{a.name}</p>
                      <p className="mt-0.5 text-[13.5px] text-mute">
                        {a.issuer} · {a.date}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 프로젝트 */}
          <section aria-labelledby="projects" className="mt-24">
            <SectionTitle id="projects" count={PROJECTS.length}>
              프로젝트
            </SectionTitle>
            <ul className="flex flex-col gap-3">
              {FEATURED_PROJECTS.map((p) => {
                const body = (
                  <>
                    <ProjectMark project={p} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="text-[17px] font-bold">{p.name}</h3>
                        <span className="shrink-0 font-mono text-[12.5px] text-mute">{p.year}</span>
                      </div>
                      <p className="mt-1.5 text-[15px] leading-[1.75] text-ink-2">{p.summary}</p>
                      <Pills items={p.tags} className="mt-3" />
                    </div>
                  </>
                );
                return (
                  <li key={p.slug}>
                    {p.detail ? (
                      <Link href={`/projects/${p.slug}`} className="group flex gap-4 rounded-xl border border-line bg-card p-4 transition-colors hover:border-line-2 hover:bg-hover sm:gap-5 sm:p-5">
                        {body}
                      </Link>
                    ) : (
                      <div className="flex gap-4 rounded-xl border border-line bg-card p-4 sm:gap-5 sm:p-5">{body}</div>
                    )}
                  </li>
                );
              })}
            </ul>
            {OTHER_PROJECTS.length > 0 && (
              <details className="group mt-3 overflow-hidden rounded-xl border border-line bg-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 transition-colors hover:bg-hover sm:px-5 [&::-webkit-details-marker]:hidden">
                  <span className="flex items-baseline gap-2 text-[15px] font-bold">
                    그 외 프로젝트
                    <span className="font-mono text-[12.5px] font-normal text-mute">{OTHER_PROJECTS.length}</span>
                  </span>
                  <Arrow className="text-mute group-open:rotate-90" />
                </summary>
                <ul className="divide-y divide-line border-t border-line">
                  {OTHER_PROJECTS.map((p) => {
                    const row = (
                      <>
                        <div className="flex items-baseline justify-between gap-3">
                          <h3 className="text-[15px] font-bold">{p.name}</h3>
                          <span className="shrink-0 font-mono text-[12.5px] text-mute">{p.year}</span>
                        </div>
                        <p className="mt-1 text-[14px] leading-[1.7] text-ink-2">{p.summary}</p>
                      </>
                    );
                    return (
                      <li key={p.slug}>
                        {p.detail ? (
                          <Link href={`/projects/${p.slug}`} className="block px-4 py-3.5 transition-colors hover:bg-hover sm:px-5">
                            {row}
                          </Link>
                        ) : (
                          <div className="px-4 py-3.5 sm:px-5">{row}</div>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </details>
            )}
          </section>

          {/* AI 노트 */}
          <section aria-labelledby="ai" className="mt-24">
            <SectionTitle id="ai" count={PRACTICES.length}>
              AI 노트
            </SectionTitle>
            <Prose className="-mt-1 mb-8 text-[15px]">
              AI에게 코드를 맡기되 그냥 믿지 않고, 정해진 절차 안에서 씁니다. 역할을 나누고, 환각을 코드로 막고, 테스트의 정답을 먼저 고정하고, 체감 대신 숫자로 판단하고, 에이전트 팀과 스킬 저장소를 운영한 기록입니다. 회사 코드베이스와 개인 프로젝트에서 실측한 값만 씁니다.
            </Prose>
            <ol className="flex flex-col gap-3">
              {PRACTICES.map((p, i) => (
                <li key={p.slug}>
                  <Link href={`/ai/${p.slug}`} className="group grid gap-4 rounded-xl border border-line bg-card p-4 transition-colors hover:border-line-2 hover:bg-hover sm:grid-cols-[minmax(0,1fr)_9rem] sm:gap-6 sm:p-5">
                    <div className="min-w-0">
                      <p className="font-mono text-[12.5px] text-mute">{no2(i)}</p>
                      <h3 className="mt-1 text-[17px] leading-[1.5] font-bold">{p.title}</h3>
                      <p className="mt-1.5 text-[15px] leading-[1.75] text-ink-2">{p.summary}</p>
                    </div>
                    <div className="flex items-baseline gap-3 border-t border-line pt-3 sm:flex-col sm:items-start sm:gap-1 sm:border-t-0 sm:border-l sm:pt-0 sm:pl-5">
                      <span className="font-mono text-[22px] leading-tight font-medium text-accent">{p.stat.value}</span>
                      <span className="text-[12.5px] leading-[1.5] text-mute">{p.stat.label}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ol>
            <Link href="/dashboard" className="group mt-3 flex items-center gap-4 rounded-xl border border-dashed border-line-2 p-4 transition-colors hover:bg-hover sm:p-5">
              <div className="min-w-0 flex-1">
                <p className="font-mono text-[12.5px] text-mute">DASHBOARD</p>
                <h3 className="mt-1 text-[16px] font-bold">스킬 저장소 대시보드</h3>
                <p className="mt-1 text-[14px] leading-[1.7] text-ink-2">사용 순위 · 매 턴 실리는 글자 · 레퍼런스 온톨로지를 숫자로 봅니다.</p>
              </div>
              <Arrow className="text-mute transition-colors group-hover:text-ink" />
            </Link>
          </section>

          {/* 발표 */}
          <section aria-labelledby="talks" className="mt-24">
            <SectionTitle id="talks" count={TALKS.length}>
              발표
            </SectionTitle>
            <ol className="flex flex-col gap-3">
              {TALKS.map((t) => (
                <li key={t.slug}>
                  <Link href={`/talks/${t.slug}`} className="group block rounded-xl border border-line bg-card p-4 transition-colors hover:border-line-2 hover:bg-hover sm:p-5">
                    <p className="font-mono text-[12.5px] text-mute">
                      {t.date} · <span className="font-sans">{t.venue}</span>
                    </p>
                    <h3 className="mt-1 flex items-center gap-2 text-[17px] leading-[1.5] font-bold">
                      {t.title}
                      <Arrow className="text-mute transition-colors group-hover:text-ink" />
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-[1.75] text-ink-2">{t.summary}</p>
                  </Link>
                </li>
              ))}
            </ol>
          </section>

          {/* 연락 */}
          <section aria-labelledby="contact" className="mt-24">
            <SectionTitle id="contact">연락</SectionTitle>
            <Prose>제안이나 협업 이야기를 기다립니다. 함께 만들 게 있다면 편하게 메일 주세요.</Prose>
            <div className="mt-6 flex flex-wrap gap-2.5">
              <ButtonLink href={GMAIL_COMPOSE} primary>
                메일 보내기
              </ButtonLink>
              <ButtonLink href={GITHUB_URL}>GitHub</ButtonLink>
              <ButtonLink href={BLOG_URL}>블로그</ButtonLink>
            </div>
          </section>

          <footer className="mt-24 flex flex-col gap-2 border-t border-line pt-8 text-[13px] text-mute sm:flex-row sm:items-center sm:justify-between">
            <p>© 2026 정태환 · usetaehwan.page</p>
            <p>
              Next.js · Tailwind CSS로 만들었습니다.{" "}
              <Link href="/play" className="underline decoration-line-2 underline-offset-4 transition-colors hover:text-ink">
                게임기 버전
              </Link>
              도 있어요.
            </p>
          </footer>
        </main>
      </div>
    </>
  );
}
