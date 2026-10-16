// claude-skills 대시보드 · 기본 버전 — 주인 링크(/dashboard#k=...)가 여는 주소. 게임기 버전은 /play/dashboard
import type { Metadata } from "next";
import { D, META, REL, SOURCE, n, summarize } from "../../_dashboard/model";
import { DefList, DocBar, DocHeader, DocHeading, DocShell, Pill } from "../../_site/ui";
import { cn } from "../../_ui/cn";
import { OwnerPanel } from "./OwnerPanel";

export const metadata: Metadata = META;

/** 비율 막대 — 바탕은 선 색, 채움은 포인트색 하나 */
function Bar({ value, max, label, className }: { value: number; max: number; label: string; className?: string }) {
  const pct = Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100));
  return (
    <div role="img" aria-label={label} className={cn("h-1.5 overflow-hidden rounded-full bg-line", className)}>
      <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
    </div>
  );
}

function BarList({ rows, max, unit = "" }: { rows: { label: string; value: number; note?: string }[]; max: number; unit?: string }) {
  return (
    <ul className="flex flex-col gap-3.5">
      {rows.map((r) => (
        <li key={r.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-3 gap-y-1.5">
          <span className="min-w-0 truncate text-[14px] font-medium text-ink">{r.label}</span>
          <span className="font-mono text-[12.5px] whitespace-nowrap text-ink-2 tabular-nums">
            {n(r.value)}
            {unit}
            {r.note && <span className="ml-1.5 text-mute">{r.note}</span>}
          </span>
          <Bar value={r.value} max={max} label={`${r.label} ${n(r.value)}${unit}`} className="col-span-2" />
        </li>
      ))}
    </ul>
  );
}

/** 카드 — 작은 제목 · 설명(선택) · 내용 */
function Card({ title, note, children, className }: { title?: string; note?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-line bg-card p-5 sm:p-6", className)}>
      {title && <h3 className="text-[15px] font-bold">{title}</h3>}
      {note && <p className="mt-1 text-[13.5px] leading-[1.7] text-mute">{note}</p>}
      <div className={cn(title || note ? "mt-4" : undefined)}>{children}</div>
    </div>
  );
}

function Daily({ days }: { days: [string, number][] }) {
  const recent = days.slice(-30);
  const max = Math.max(1, ...recent.map(([, c]) => c));
  return (
    <div role="img" aria-label={`최근 ${recent.length}일 일별 사용`} className="flex h-16 items-end gap-[2px]">
      {recent.map(([d, c]) => (
        <span key={d} title={`${d} · ${c}회`} className="min-w-0 flex-1 rounded-t-sm bg-accent/80" style={{ height: `${Math.max(4, (c / max) * 100)}%` }} />
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { usage, budget, ontology, profiles } = D;
  const { descTotal, agentTotal, perTurn, relTotal, hasUsage, usageMax, agentModel } = summarize(D);
  const stats = [
    { v: n(budget.skills.length), k: "스킬" },
    { v: `${n(perTurn)}자`, k: "매 턴 실리는 글자" },
    { v: n(relTotal), k: "레퍼런스 관계" },
  ];

  return (
    <DocShell bar={<DocBar back="/#ai" backLabel="AI 노트" play="/play/dashboard" />}>
      <DocHeader
        kicker={`DASHBOARD · ${D.repo}`}
        title="스킬 저장소 대시보드"
        lead="claude-skills 저장소의 숫자를 화면으로 옮겼습니다. 공개 화면은 숫자만 담고, 요청 원문이 들어간 스킬 후보는 주인 키로만 열립니다."
      >
        <p className="mt-5 font-mono text-[12.5px] text-mute">
          {D.generated} 동기화 · {D.days ? `최근 ${D.days}일` : "전체 기간"} · 사용 {SOURCE[usage.source]}
        </p>
      </DocHeader>

      <dl className="mt-10 grid grid-cols-3 divide-x divide-line rounded-xl border border-line bg-card">
        {stats.map((s) => (
          <div key={s.k} className="flex min-w-0 flex-col gap-1 p-4 sm:p-5">
            <dt className="order-last text-[12.5px] leading-[1.5] text-mute sm:text-[13.5px]">{s.k}</dt>
            <dd className="font-mono text-[20px] leading-tight font-medium whitespace-nowrap text-accent tabular-nums sm:text-[26px]">{s.v}</dd>
          </div>
        ))}
      </dl>

      <DocHeading id="usage">사용 순위</DocHeading>
      {hasUsage ? (
        <div className="flex flex-col gap-4">
          {usage.skills.length > 0 && (
            <Card title="스킬">
              <BarList rows={usage.skills.map((r) => ({ label: r.name, value: r.count, note: r.last }))} max={usageMax} unit="회" />
            </Card>
          )}
          {usage.agents.length > 0 && (
            <Card title="역할 에이전트">
              <BarList rows={usage.agents.map((r) => ({ label: `${r.name} · ${agentModel.get(r.name) ?? "?"}`, value: r.count, note: r.last }))} max={usageMax} unit="회" />
            </Card>
          )}
          {usage.daily.length > 0 && (
            <Card title="일별">
              <Daily days={usage.daily} />
            </Card>
          )}
          <p className="text-[14px] leading-[1.75] text-ink-2">
            {usage.unused.length > 0 ? `한 번도 안 쓴 스킬: ${usage.unused.join(", ")}. ` : "모든 스킬이 한 번 이상 쓰였습니다. "}
            {usage.otherCount > 0 && `저장소 밖 스킬·에이전트 ${n(usage.otherCount)}회는 이름을 숨겼습니다.`}
          </p>
        </div>
      ) : (
        <Card>
          <p className="text-[15px] leading-[1.8] text-ink-2">
            {usage.source === "none"
              ? "아직 사용 기록을 올리지 않았습니다. 기록은 개인 PC의 Claude Code 기록에서 모으고, 동기화한 날의 숫자만 이 화면에 올라옵니다."
              : "이 기간에는 저장소 스킬·에이전트의 사용 기록이 없습니다."}
          </p>
        </Card>
      )}

      <DocHeading id="budget">매 턴 실리는 글자</DocHeading>
      <Card>
        <DefList
          rows={[
            {
              k: "스킬 설명",
              v: (
                <div className="grid gap-2 pt-1">
                  <span className="font-mono text-[13.5px] tabular-nums">
                    {n(descTotal)} / {n(budget.limits.desc_total)}자 · 스킬 {budget.skills.length}개
                  </span>
                  <Bar value={descTotal} max={budget.limits.desc_total} label={`스킬 설명 합 ${descTotal}자, 상한 ${budget.limits.desc_total}자`} />
                </div>
              ),
            },
            {
              k: "에이전트",
              v: (
                <span className="font-mono text-[13.5px] tabular-nums">
                  {n(agentTotal)}자 · {budget.agents.length}개 · 하나당 상한 {n(budget.limits.agent_desc)}자
                </span>
              ),
            },
            {
              k: "메모리",
              v: (
                <div className="grid gap-2 pt-1">
                  <span className="font-mono text-[13.5px] tabular-nums">
                    {n(budget.memory)} / {n(budget.limits.memory)}자
                  </span>
                  <Bar value={budget.memory} max={budget.limits.memory} label={`메모리 ${budget.memory}자, 상한 ${budget.limits.memory}자`} />
                </div>
              ),
            },
            { k: "합계", v: <span className="font-mono text-[13.5px] font-medium text-ink tabular-nums">{n(perTurn)}자</span> },
          ]}
        />
      </Card>
      <Card className="mt-4" title="스킬별 설명 길이" note={`하나당 상한 ${n(budget.limits.desc)}자. 본문은 발동할 때만 읽혀 매 턴 무게에 들어가지 않습니다.`}>
        <BarList
          rows={[...budget.skills].sort((a, b) => b.desc - a.desc).map((s) => ({ label: s.name, value: s.desc, note: `본문 ${n(s.body)}자` }))}
          max={budget.limits.desc}
          unit="자"
        />
      </Card>

      {ontology && (
        <>
          <DocHeading id="ontology">레퍼런스 온톨로지</DocHeading>
          <Card>
            <DefList
              rows={[
                { k: "항목", v: <span className="font-mono text-[13.5px] tabular-nums">{n(ontology.references)}개 · 개념 {n(ontology.concepts)}개</span> },
                {
                  k: "관계",
                  v: (
                    <span className="font-mono text-[13.5px] tabular-nums">
                      {Object.entries(ontology.relations)
                        .map(([k, v]) => `${REL[k] ?? k} ${n(v)}`)
                        .join(" · ")}
                    </span>
                  ),
                },
              ]}
            />
          </Card>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Card title="도메인별 항목">
              <BarList rows={ontology.domains.map((d) => ({ label: d.label, value: d.count }))} max={ontology.domains[0]?.count ?? 1} unit="개" />
            </Card>
            <Card title="도메인을 넘는 ‘대신 본다’" note="한 도메인의 자료가 다른 도메인의 자료를 가리키는 횟수입니다.">
              <BarList rows={ontology.crossDomain.map((c) => ({ label: c.pair.join(" ↔ "), value: c.count }))} max={ontology.crossDomain[0]?.count ?? 1} unit="회" />
            </Card>
          </div>
          <Card className="mt-4" title="많이 붙은 개념">
            <BarList
              rows={ontology.topConcepts.map((c) => ({ label: c.label, value: c.count, note: c.domain }))}
              max={ontology.topConcepts[0]?.count ?? 1}
              unit="개"
            />
          </Card>
        </>
      )}

      <DocHeading id="profiles">모델과 프로필</DocHeading>
      <Card>
        <ul className="flex flex-col divide-y divide-line">
          {Object.entries(profiles.models).map(([id, m]) => (
            <li key={id} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0">
              <span className="font-mono text-[13.5px] font-medium text-ink">{id}</span>
              {m.profile && <Pill>{m.profile}</Pill>}
              {m.note && <span className="w-full text-[13.5px] leading-[1.6] text-mute sm:w-auto">{m.note}</span>}
            </li>
          ))}
        </ul>
      </Card>
      <Card className="mt-4">
        <ul className="flex flex-col gap-4">
          {profiles.profiles.map((p) => (
            <li key={p.name}>
              <div className="flex flex-wrap items-center gap-2.5">
                <Pill className="font-medium text-ink">{p.name}</Pill>
                <span className="font-mono text-[12.5px] text-mute tabular-nums">
                  스킬 {p.skills === "all" ? "전부" : `${p.skills}개`} · 에이전트 {p.agents === "all" ? "전부" : `${p.agents}개`}
                </span>
              </div>
              <p className="mt-1.5 text-[14.5px] leading-[1.75] text-ink-2">{p.description}</p>
            </li>
          ))}
        </ul>
        <p className="mt-5 border-t border-line pt-4 text-[13.5px] leading-[1.7] text-mute">
          {profiles.evals.length > 0 ? `평가 리포트 ${profiles.evals.length}건: ${profiles.evals.join(", ")}` : "평가 리포트는 아직 없습니다. 호출마다 비용이 들어 새 모델이 나왔을 때 사람이 돌립니다."}
        </p>
      </Card>

      <DocHeading id="owner">주인 전용</DocHeading>
      <OwnerPanel groups={D.candidates.groups} requests={D.candidates.requests} />
    </DocShell>
  );
}
