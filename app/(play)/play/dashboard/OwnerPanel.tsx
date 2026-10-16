"use client";
// 주인 전용 — 게임기 버전 마크업. 복호화·키 보관은 app/_dashboard/useOwnerData 가 한다.
import { useState } from "react";
import { ownerSummary } from "../../../_dashboard/model";
import { useOwnerData } from "../../../_dashboard/useOwnerData";
import { PBox, TypeChip } from "../../../_console/ui";

export function OwnerPanel({ groups, requests }: { groups: number; requests: number }) {
  const { state, submit, forget } = useOwnerData();
  const [draft, setDraft] = useState("");

  const summary = ownerSummary(groups, requests);

  const keyForm = (
    <form
      className="mt-3 flex flex-wrap gap-2"
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
        className="min-w-0 flex-1 rounded-md border border-line bg-lcd-hi px-3 py-2 text-[14px]"
      />
      <button type="submit" data-nav className="pbtn pbtn-sm">
        열기
      </button>
    </form>
  );

  return (
    <div aria-live="polite">
      <PBox className="p-4 @min-[440px]/screen:p-5">
        {state.status === "loading" && <p className="body-kr">확인하는 중입니다.</p>}
        {state.status === "neterr" && <p className="body-kr">불러오지 못했습니다. 새로고침해 주세요.</p>}
        {state.status === "nodata" && <p className="body-kr">{summary} 아직 주인 데이터가 올라오지 않았습니다.</p>}
        {state.status === "locked" && (
          <>
            <p className="body-kr !text-ink">{summary}</p>
            {keyForm}
          </>
        )}
        {state.status === "bad" && (
          <>
            <p className="body-kr !text-ink">이 키로는 열리지 않습니다. 주인 링크를 다시 열거나 키를 확인해 주세요.</p>
            {keyForm}
          </>
        )}
        {state.status === "ok" && (
          <>
            <p className="body-kr text-[13px]">
              {state.generated} 동기화 · {state.days ? `최근 ${state.days}일` : "전체 기간"}
            </p>
            <h4 className="mt-3 text-[14px] font-bold">스킬 후보 · {state.candidates.length}묶음</h4>
            {state.candidates.length === 0 ? (
              <p className="body-kr mt-1">스킬로 만들 만큼 반복된 요청이 아직 없습니다. 기준은 세션 2개 이상, 3회 이상입니다.</p>
            ) : (
              <ol className="mt-2 flex flex-col gap-3">
                {state.candidates.map((c, i) => (
                  <li key={i} className="border-t border-line pt-3 first:border-t-0 first:pt-0">
                    <div className="text-[13px] font-bold tabular-nums">
                      {c.count}회 · 세션 {c.sessions}개
                    </div>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {c.keywords.map((k) => (
                        <TypeChip key={k}>{k}</TypeChip>
                      ))}
                    </div>
                    <ul className="mt-2 flex flex-col gap-1">
                      {c.examples.map(([d, t], j) => (
                        <li key={j} className="body-kr text-[13px] !text-ink [overflow-wrap:anywhere]">
                          <span className="tabular-nums text-mute">{d}</span> {t}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ol>
            )}
            {(state.otherUsage.skills.length > 0 || state.otherUsage.agents.length > 0) && (
              <>
                <h4 className="mt-4 text-[14px] font-bold">저장소 밖 스킬·에이전트</h4>
                <ul className="mt-2 flex flex-col gap-1">
                  {[...state.otherUsage.skills, ...state.otherUsage.agents].map((r) => (
                    <li key={r.name} className="body-kr text-[13px] !text-ink tabular-nums">
                      {r.name} · {r.count}회 <span className="text-mute">{r.last}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <button
              type="button"
              data-nav
              className="pbtn pbtn-sm mt-3"
              onClick={forget}
            >
              이 기기에서 잊기
            </button>
          </>
        )}
      </PBox>
    </div>
  );
}
