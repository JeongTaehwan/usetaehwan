// claude-skills 대시보드 — 공개 숫자는 정적으로, 요청 원문은 주인 키로 브라우저에서만 푼다 (scripts/dashboard-sync.mjs)
import type { Metadata } from "next";
import data from "../../_data/dashboard/public.json";
import type { DashboardPublic } from "../../_data/dashboard/types";
import { Console } from "../../_console/Console";
import { BackRow, Dialog, DocHero, PBox, Rows, SegBar, Sub, TypeChip } from "../../_console/ui";
import { OwnerPanel } from "./OwnerPanel";

export const metadata: Metadata = {
  title: "스킬 대시보드",
  description: "claude-skills 저장소의 사용 순위·매 턴 실리는 글자·레퍼런스 온톨로지·모델 프로필을 숫자로 봅니다.",
};

const D = data as unknown as DashboardPublic;
const n = (x: number) => x.toLocaleString("ko-KR");
const REL: Record<string, string> = {
  about: "다룬다",
  see_instead: "대신 본다",
  opposes: "반대한다",
  supersedes: "대체한다",
  broader: "상위 개념",
};
const SOURCE: Record<DashboardPublic["usage"]["source"], string> = {
  hook: "훅 기록 기준",
  transcripts: "세션 기록 기준",
  none: "기록 없음",
  demo: "예시 데이터",
};

function BarList({ rows, max, color, unit = "" }: { rows: { label: string; value: number; note?: string }[]; max: number; color: string; unit?: string }) {
  return (
    <ul className="flex flex-col gap-2.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1">
          <span className="min-w-0 truncate text-[13px] font-bold">{r.label}</span>
          <span className="text-[13px] tabular-nums text-ink-2">
            {n(r.value)}
            {unit}
            {r.note && <span className="ml-1.5 text-mute">{r.note}</span>}
          </span>
          <div className="col-span-2">
            <SegBar value={r.value} max={max} color={color} label={`${r.label} ${n(r.value)}${unit}`} />
          </div>
        </li>
      ))}
    </ul>
  );
}

function Daily({ days }: { days: [string, number][] }) {
  const recent = days.slice(-30);
  const max = Math.max(1, ...recent.map(([, c]) => c));
  return (
    <div role="img" aria-label={`최근 ${recent.length}일 일별 사용`} className="flex h-16 items-end gap-[2px]">
      {recent.map(([d, c]) => (
        <span key={d} title={`${d} · ${c}회`} className="min-w-0 flex-1" style={{ height: `${Math.max(4, (c / max) * 100)}%`, background: "var(--color-teal-dark)" }} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { usage, budget, ontology, profiles } = D;
  const descTotal = budget.skills.reduce((s, x) => s + x.desc, 0);
  const agentTotal = budget.agents.reduce((s, x) => s + x.desc, 0);
  const perTurn = descTotal + agentTotal + budget.memory;
  const relTotal = ontology ? Object.entries(ontology.relations).filter(([k]) => k !== "broader").reduce((s, [, v]) => s + v, 0) : 0;
  const hasUsage = usage.source !== "none" && (usage.skills.length > 0 || usage.agents.length > 0);
  const usageMax = Math.max(1, ...usage.skills.map((r) => r.count), ...usage.agents.map((r) => r.count));
  const agentModel = new Map(budget.agents.map((a) => [a.name, a.model]));

  return (
    <Console
      label="기술머신 · 대시보드"
      backHref="/play#notes"
      top={
        <div className="detail-top">
          <DocHero sprite="gear" no={`DASHBOARD · ${D.repo}`} title="스킬 저장소 대시보드" bg="var(--color-menu)" fg="var(--color-lcd)" accent="var(--color-teal)">
            <dl className="mt-3 flex flex-col gap-1">
              {[
                { v: n(budget.skills.length), k: "스킬" },
                { v: `${n(perTurn)}자`, k: "매 턴 실리는 글자" },
                { v: n(relTotal), k: "레퍼런스 관계" },
              ].map((s) => (
                <div key={s.k} className="flex items-baseline gap-2.5">
                  <dd className="whitespace-nowrap text-[20px] font-bold tabular-nums text-teal @min-[440px]/screen:text-[24px]">{s.v}</dd>
                  <dt className="text-[12px] leading-[1.4] opacity-85 [word-break:keep-all]">{s.k}</dt>
                </div>
              ))}
            </dl>
          </DocHero>
        </div>
      }
    >
      <article className="document">
        <Dialog className="mb-1 text-[15px] leading-[1.75] @min-[440px]/screen:text-[16px]">
          <p className="[word-break:keep-all]">
            claude-skills 저장소의 숫자를 화면으로 옮겼습니다. 공개 화면은 숫자만 담고, 요청 원문이 들어간 스킬 후보는 주인 키로만 열립니다.
          </p>
        </Dialog>
        <p className="body-kr mt-4 text-[13px]">
          {D.generated} 동기화 · {D.days ? `최근 ${D.days}일` : "전체 기간"} · 사용 {SOURCE[usage.source]}
        </p>

        <Sub no="01">사용 순위</Sub>
        {hasUsage ? (
          <div className="flex flex-col gap-3">
            {usage.skills.length > 0 && (
              <PBox className="p-4 @min-[440px]/screen:p-5">
                <h4 className="mb-3 text-[14px] font-bold">스킬</h4>
                <BarList rows={usage.skills.map((r) => ({ label: r.name, value: r.count, note: r.last }))} max={usageMax} color="var(--color-green)" unit="회" />
              </PBox>
            )}
            {usage.agents.length > 0 && (
              <PBox className="p-4 @min-[440px]/screen:p-5">
                <h4 className="mb-3 text-[14px] font-bold">역할 에이전트</h4>
                <BarList
                  rows={usage.agents.map((r) => ({ label: `${r.name} · ${agentModel.get(r.name) ?? "?"}`, value: r.count, note: r.last }))}
                  max={usageMax}
                  color="var(--color-blue)"
                  unit="회"
                />
              </PBox>
            )}
            {usage.daily.length > 0 && (
              <PBox className="p-4 @min-[440px]/screen:p-5">
                <h4 className="mb-3 text-[14px] font-bold">일별</h4>
                <Daily days={usage.daily} />
              </PBox>
            )}
            <p className="body-kr text-[13px]">
              {usage.unused.length > 0 ? `한 번도 안 쓴 스킬: ${usage.unused.join(", ")}. ` : "모든 스킬이 한 번 이상 쓰였습니다. "}
              {usage.otherCount > 0 && `저장소 밖 스킬·에이전트 ${n(usage.otherCount)}회는 이름을 숨겼습니다.`}
            </p>
          </div>
        ) : (
          <PBox className="p-4 @min-[440px]/screen:p-5">
            <p className="body-kr !text-ink">
              {usage.source === "none"
                ? "아직 사용 기록을 올리지 않았습니다. 기록은 개인 PC의 Claude Code 기록에서 모으고, 동기화한 날의 숫자만 이 화면에 올라옵니다."
                : "이 기간에는 저장소 스킬·에이전트의 사용 기록이 없습니다."}
            </p>
          </PBox>
        )}

        <Sub no="02">매 턴 실리는 글자</Sub>
        <PBox className="p-4 @min-[440px]/screen:p-5">
          <Rows
            rows={[
              {
                k: "스킬 설명",
                v: (
                  <div className="grid gap-1.5">
                    <span className="tabular-nums">
                      {n(descTotal)} / {n(budget.limits.desc_total)}자 · 스킬 {budget.skills.length}개
                    </span>
                    <SegBar value={descTotal} max={budget.limits.desc_total} color="var(--color-green)" label={`스킬 설명 합 ${descTotal}자, 상한 ${budget.limits.desc_total}자`} />
                  </div>
                ),
              },
              {
                k: "에이전트",
                v: (
                  <span className="tabular-nums">
                    {n(agentTotal)}자 · {budget.agents.length}개 · 하나당 상한 {n(budget.limits.agent_desc)}자
                  </span>
                ),
              },
              {
                k: "메모리",
                v: (
                  <div className="grid gap-1.5">
                    <span className="tabular-nums">
                      {n(budget.memory)} / {n(budget.limits.memory)}자
                    </span>
                    <SegBar value={budget.memory} max={budget.limits.memory} color="var(--color-gold-2)" label={`메모리 ${budget.memory}자, 상한 ${budget.limits.memory}자`} />
                  </div>
                ),
              },
              { k: "합계", v: <span className="font-bold tabular-nums">{n(perTurn)}자</span> },
            ]}
          />
        </PBox>
        <PBox className="mt-3 p-4 @min-[440px]/screen:p-5">
          <h4 className="mb-1 text-[14px] font-bold">스킬별 설명 길이</h4>
          <p className="body-kr mb-3 text-[13px]">하나당 상한 {n(budget.limits.desc)}자. 본문은 발동할 때만 읽혀 매 턴 무게에 들어가지 않습니다.</p>
          <BarList
            rows={[...budget.skills].sort((a, b) => b.desc - a.desc).map((s) => ({ label: s.name, value: s.desc, note: `본문 ${n(s.body)}자` }))}
            max={budget.limits.desc}
            color="var(--color-green)"
            unit="자"
          />
        </PBox>

        {ontology && (
          <>
            <Sub no="03">레퍼런스 온톨로지</Sub>
            <PBox className="p-4 @min-[440px]/screen:p-5">
              <Rows
                rows={[
                  { k: "항목", v: <span className="tabular-nums">{n(ontology.references)}개 · 개념 {n(ontology.concepts)}개</span> },
                  {
                    k: "관계",
                    v: (
                      <span className="tabular-nums">
                        {Object.entries(ontology.relations)
                          .map(([k, v]) => `${REL[k] ?? k} ${n(v)}`)
                          .join(" · ")}
                      </span>
                    ),
                  },
                ]}
              />
            </PBox>
            <PBox className="mt-3 p-4 @min-[440px]/screen:p-5">
              <h4 className="mb-3 text-[14px] font-bold">도메인별 항목</h4>
              <BarList rows={ontology.domains.map((d) => ({ label: d.label, value: d.count }))} max={ontology.domains[0]?.count ?? 1} color="var(--color-purple)" unit="개" />
            </PBox>
            <PBox className="mt-3 p-4 @min-[440px]/screen:p-5">
              <h4 className="mb-3 text-[14px] font-bold">많이 붙은 개념</h4>
              <BarList
                rows={ontology.topConcepts.map((c) => ({ label: c.label, value: c.count, note: c.domain }))}
                max={ontology.topConcepts[0]?.count ?? 1}
                color="var(--color-teal-dark)"
                unit="개"
              />
            </PBox>
            <PBox className="mt-3 p-4 @min-[440px]/screen:p-5">
              <h4 className="mb-1 text-[14px] font-bold">도메인을 넘는 &lsquo;대신 본다&rsquo;</h4>
              <p className="body-kr mb-3 text-[13px]">한 도메인의 자료가 다른 도메인의 자료를 가리키는 횟수입니다.</p>
              <BarList
                rows={ontology.crossDomain.map((c) => ({ label: c.pair.join(" ↔ "), value: c.count }))}
                max={ontology.crossDomain[0]?.count ?? 1}
                color="var(--color-red)"
                unit="회"
              />
            </PBox>
          </>
        )}

        <Sub no={ontology ? "04" : "03"}>모델과 프로필</Sub>
        <PBox className="p-4 @min-[440px]/screen:p-5">
          <Rows
            rows={Object.entries(profiles.models).map(([id, m]) => ({
              k: m.profile ?? "-",
              v: (
                <span>
                  <span className="font-bold">{id}</span>
                  {m.note && <span className="text-mute"> · {m.note}</span>}
                </span>
              ),
            }))}
          />
        </PBox>
        <PBox className="mt-3 p-4 @min-[440px]/screen:p-5">
          <ul className="flex flex-col gap-3">
            {profiles.profiles.map((p) => (
              <li key={p.name}>
                <div className="flex flex-wrap items-center gap-2">
                  <TypeChip>{p.name}</TypeChip>
                  <span className="text-[13px] tabular-nums text-ink-2">
                    스킬 {p.skills === "all" ? "전부" : `${p.skills}개`} · 에이전트 {p.agents === "all" ? "전부" : `${p.agents}개`}
                  </span>
                </div>
                <p className="body-kr mt-1 text-[13px]">{p.description}</p>
              </li>
            ))}
          </ul>
          <p className="body-kr mt-3 text-[13px]">
            {profiles.evals.length > 0 ? `평가 리포트 ${profiles.evals.length}건: ${profiles.evals.join(", ")}` : "평가 리포트는 아직 없습니다. 호출마다 비용이 들어 새 모델이 나왔을 때 사람이 돌립니다."}
          </p>
        </PBox>

        <Sub no={ontology ? "05" : "04"}>주인 전용</Sub>
        <OwnerPanel groups={D.candidates.groups} requests={D.candidates.requests} />

        <BackRow href="/play#notes" label="기술머신으로" />
      </article>
    </Console>
  );
}
