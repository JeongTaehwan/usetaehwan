"use client";
// 주인 전용 — 스킬 후보(요청 원문)와 저장소 밖 사용. 서버가 세션을 확인한 뒤에만 복호화해 준다
import { useEffect, useState } from "react";
import type { PrivateResponse } from "../_data/dashboard/types";
import { PBox, TypeChip } from "../_console/ui";

const AUTH_MSG: Record<string, string> = {
  ok: "주인 인증을 마쳤습니다.",
  out: "로그아웃했습니다.",
  denied: "주인 계정이 아니라 열 수 없습니다.",
  state: "인증 요청이 만료됐거나 맞지 않습니다. 다시 시도해 주세요.",
  token: "GitHub에서 인증을 받지 못했습니다. 다시 시도해 주세요.",
  error: "인증 중 오류가 났습니다. 다시 시도해 주세요.",
};

type State = PrivateResponse | { status: "loading" | "neterr" };

function Logout() {
  return (
    <form method="post" action="/api/auth/logout" className="mt-3">
      <button type="submit" data-nav className="pbtn pbtn-sm">
        로그아웃
      </button>
    </form>
  );
}

export function OwnerPanel({ groups, requests }: { groups: number; requests: number }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    const auth = new URLSearchParams(window.location.search).get("auth");
    fetch("/api/dashboard/private", { cache: "no-store", credentials: "same-origin" })
      .then((r) => r.json() as Promise<PrivateResponse>)
      .then((body) => {
        setState(body);
        if (auth && AUTH_MSG[auth]) setNotice(AUTH_MSG[auth]);
      })
      .catch(() => setState({ status: "neterr" }));
  }, []);

  const summary =
    groups > 0
      ? `스킬이 안 뜬 반복 요청 ${groups}묶음(${requests}회)의 원문은 주인 계정으로 로그인해야 열립니다.`
      : "스킬이 안 뜬 반복 요청의 원문은 주인 계정으로 로그인해야 열립니다.";

  return (
    <div aria-live="polite">
      {notice && <p className="body-kr mb-3 text-[13px] !text-ink">{notice}</p>}
      <PBox className="p-4 @min-[440px]/screen:p-5">
        {state.status === "loading" && <p className="body-kr">확인하는 중입니다.</p>}
        {state.status === "neterr" && <p className="body-kr">불러오지 못했습니다. 새로고침해 주세요.</p>}
        {state.status === "off" && (
          <p className="body-kr">주인 인증이 아직 설정되지 않았습니다. 서버에 GitHub 로그인과 서명 키를 넣으면 열립니다.</p>
        )}
        {state.status === "locked" && (
          <>
            <p className="body-kr !text-ink">{summary}</p>
            <a href="/api/auth/github" data-nav className="pbtn pbtn-sm mt-3 inline-block">
              GitHub로 주인 인증 ›
            </a>
          </>
        )}
        {state.status === "empty" && (
          <>
            <p className="body-kr !text-ink">인증됐습니다. 주인 전용 데이터는 아직 동기화되지 않았습니다.</p>
            <Logout />
          </>
        )}
        {(state.status === "nokey" || state.status === "badkey") && (
          <>
            <p className="body-kr !text-ink">
              {state.status === "nokey" ? "서버에 복호화 키가 없습니다." : "서버의 복호화 키가 동기화할 때 쓴 키와 다릅니다."} 같은 DASHBOARD_DATA_KEY를 넣어 주세요.
            </p>
            <Logout />
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
            <Logout />
          </>
        )}
      </PBox>
    </div>
  );
}
