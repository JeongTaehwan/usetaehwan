"use client";
// 주인 전용 — 스킬 후보(요청 원문)와 저장소 밖 사용.
// 암호문(public/dashboard-owner.enc.json)을 받아 주인 키로 이 브라우저에서 푼다. 키는 서버로 가지 않는다.
// 주인 링크(/dashboard#k=...)로 처음 열면 키를 이 브라우저에 기억하고 주소창에서 지운다.
import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardPrivate, EncryptedFile } from "../_data/dashboard/types";
import { PBox, TypeChip } from "../_console/ui";

const KEY_STORE = "ut-dashboard-owner-key";
const AAD = "usetaehwan-dashboard-v1";
const KEY_RE = /^[A-Za-z0-9_-]{43}$/;

type State =
  | { status: "loading" | "nodata" | "locked" | "bad" | "neterr" }
  | ({ status: "ok" } & DashboardPrivate);

const b64 = (s: string) => Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(s.length / 4) * 4, "=")), (c) => c.charCodeAt(0));

async function open(file: Extract<EncryptedFile, { data: string }>, keyText: string): Promise<DashboardPrivate> {
  const key = await crypto.subtle.importKey("raw", b64(keyText), "AES-GCM", false, ["decrypt"]);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64(file.iv), additionalData: new TextEncoder().encode(AAD) },
    key,
    b64(file.data),
  );
  return JSON.parse(new TextDecoder().decode(plain)) as DashboardPrivate;
}

const store = {
  get: () => {
    try {
      return localStorage.getItem(KEY_STORE);
    } catch {
      return null;
    }
  },
  set: (k: string) => {
    try {
      localStorage.setItem(KEY_STORE, k);
    } catch {}
  },
  clear: () => {
    try {
      localStorage.removeItem(KEY_STORE);
    } catch {}
  },
};

export function OwnerPanel({ groups, requests }: { groups: number; requests: number }) {
  const [state, setState] = useState<State>({ status: "loading" });
  const [draft, setDraft] = useState("");
  const file = useRef<EncryptedFile | null>(null);

  const unlock = useCallback(async (keyText: string | null) => {
    const f = file.current;
    if (!f || !("data" in f)) return setState({ status: "nodata" });
    if (!keyText) return setState({ status: "locked" });
    try {
      const data = await open(f, keyText);
      store.set(keyText);
      setState({ status: "ok", ...data });
    } catch {
      setState({ status: "bad" });
    }
  }, []);

  useEffect(() => {
    /** 주소의 #k=... 를 꺼내고 주소창에서 지운다 */
    const take = () => {
      const m = window.location.hash.match(/(?:^#|&)k=([A-Za-z0-9_-]{43})/);
      if (!m) return null;
      history.replaceState(null, "", window.location.pathname + window.location.search);
      return m[1];
    };
    const key = take() ?? store.get();
    fetch("/dashboard-owner.enc.json", { cache: "no-store" })
      .then((r) => (r.ok ? (r.json() as Promise<EncryptedFile>) : null))
      .then((f) => {
        file.current = f;
        return unlock(key);
      })
      .catch(() => setState({ status: "neterr" }));
    // 이미 이 화면에 있을 때 주인 링크를 붙여 넣으면 새로 불러오지 않고 해시만 바뀐다
    const onHash = () => {
      const k = take();
      if (k) void unlock(k);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [unlock]);

  const summary =
    groups > 0
      ? `스킬이 안 뜬 반복 요청 ${groups}묶음(${requests}회)의 원문은 주인 키로만 열립니다.`
      : "스킬이 안 뜬 반복 요청의 원문은 주인 키로만 열립니다.";

  const keyForm = (
    <form
      className="mt-3 flex flex-wrap gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const k = draft.trim().replace(/^.*#k=/, "");
        setDraft("");
        if (KEY_RE.test(k)) void unlock(k);
        else setState({ status: "bad" });
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
              onClick={() => {
                store.clear();
                setState({ status: "locked" });
              }}
            >
              이 기기에서 잊기
            </button>
          </>
        )}
      </PBox>
    </div>
  );
}
