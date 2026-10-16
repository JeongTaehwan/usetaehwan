"use client";
// 주인 전용 — 기본 버전 마크업. 복호화·키 보관은 app/_dashboard/useOwnerData 가 한다.
import { useState } from "react";
import { ownerSummary } from "../../_dashboard/model";
import { useOwnerData } from "../../_dashboard/useOwnerData";
import { Pill } from "../../_site/ui";

const btn = "inline-flex h-10 shrink-0 items-center rounded-lg border border-line-2 px-4 text-[14px] font-medium text-ink transition-colors hover:bg-hover";

export function OwnerPanel({ groups, requests }: { groups: number; requests: number }) {
  const { state, submit, forget } = useOwnerData();
  const [draft, setDraft] = useState("");

  const summary = ownerSummary(groups, requests);
  const text = "text-[15px] leading-[1.8] text-ink-2";

  const keyForm = (
    <form
      className="mt-4 flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        submit(draft);
        setDraft("");
      }}
    >
      <label htmlFor="owner-key" className="sr-only">
        주인 키 또는 주인 링크
      </label>
      <input
        id="owner-key"
        type="password"
        autoComplete="off"
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="주인 키 또는 주인 링크"
        className="h-10 min-w-0 flex-1 rounded-lg border border-line-2 bg-paper px-3 text-[14px] text-ink placeholder:text-mute"
      />
      <button type="submit" className={btn}>
        열기
      </button>
    </form>
  );

  return (
    <div aria-live="polite" className="rounded-xl border border-line bg-card p-5 sm:p-6">
      {state.status === "loading" && <p className={text}>확인하는 중입니다.</p>}
      {state.status === "neterr" && <p className={text}>불러오지 못했습니다. 새로고침해 주세요.</p>}
      {state.status === "nodata" && (
        <p className={text}>
          {summary} 아직 주인 데이터가 올라오지 않았습니다.
        </p>
      )}
      {state.status === "locked" && (
        <>
          <p className={text}>{summary}</p>
          {keyForm}
        </>
      )}
      {state.status === "bad" && (
        <>
          <p className={text}>이 키로는 열리지 않습니다. 주인 링크를 다시 열거나 키를 확인해 주세요.</p>
          {keyForm}
        </>
      )}
      {state.status === "ok" && (
        <>
          <p className="font-mono text-[12.5px] text-mute">
            {state.generated} 동기화 · {state.days ? `최근 ${state.days}일` : "전체 기간"}
          </p>
          <h3 className="mt-4 text-[15px] font-bold">
            스킬 후보 <span className="font-mono text-[13px] font-normal text-mute">{state.candidates.length}묶음</span>
          </h3>
          {state.candidates.length === 0 ? (
            <p className={`mt-1.5 ${text}`}>스킬로 만들 만큼 반복된 요청이 아직 없습니다. 기준은 세션 2개 이상, 3회 이상입니다.</p>
          ) : (
            <ol className="mt-3 flex flex-col divide-y divide-line">
              {state.candidates.map((c, i) => (
                <li key={i} className="py-4 first:pt-0 last:pb-0">
                  <p className="font-mono text-[12.5px] text-ink-2 tabular-nums">
                    {c.count}회 · 세션 {c.sessions}개
                  </p>
                  <ul className="mt-2 flex flex-wrap gap-1.5">
                    {c.keywords.map((k) => (
                      <li key={k}>
                        <Pill>{k}</Pill>
                      </li>
                    ))}
                  </ul>
                  <ul className="mt-2.5 flex flex-col gap-1.5">
                    {c.examples.map(([d, t], j) => (
                      <li key={j} className="text-[14px] leading-[1.7] text-ink">
                        <span className="mr-1.5 font-mono text-[12.5px] text-mute tabular-nums">{d}</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          )}
          {(state.otherUsage.skills.length > 0 || state.otherUsage.agents.length > 0) && (
            <>
              <h3 className="mt-6 text-[15px] font-bold">저장소 밖 스킬·에이전트</h3>
              <ul className="mt-2 flex flex-col gap-1">
                {[...state.otherUsage.skills, ...state.otherUsage.agents].map((r) => (
                  <li key={r.name} className="text-[14px] leading-[1.7] text-ink">
                    {r.name} <span className="font-mono text-[12.5px] text-ink-2 tabular-nums">· {r.count}회</span> <span className="font-mono text-[12.5px] text-mute">{r.last}</span>
                  </li>
                ))}
              </ul>
            </>
          )}
          <button type="button" className={`mt-6 ${btn}`} onClick={forget}>
            이 기기에서 잊기
          </button>
        </>
      )}
    </div>
  );
}
