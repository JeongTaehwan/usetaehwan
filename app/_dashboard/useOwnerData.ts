"use client";
// 주인 전용 — 스킬 후보(요청 원문)와 저장소 밖 사용. 두 버전의 OwnerPanel 이 함께 쓴다.
// 암호문(public/dashboard-owner.enc.json)을 받아 주인 키로 이 브라우저에서 푼다. 키는 서버로 가지 않는다.
// 주인 링크(/dashboard#k=...)로 처음 열면 키를 이 브라우저에 기억하고 주소창에서 지운다. 같은 출처라 두 버전이 키를 함께 쓴다.
import { useCallback, useEffect, useRef, useState } from "react";
import type { DashboardPrivate, EncryptedFile } from "../_data/dashboard/types";

const KEY_STORE = "ut-dashboard-owner-key";
const AAD = "usetaehwan-dashboard-v1";
const KEY_RE = /^[A-Za-z0-9_-]{43}$/;

export type OwnerState =
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

export function useOwnerData() {
  const [state, setState] = useState<OwnerState>({ status: "loading" });
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

  /** 입력칸 값(키 또는 주인 링크)으로 연다 */
  const submit = useCallback(
    (text: string) => {
      const k = text.trim().replace(/^.*#k=/, "");
      if (KEY_RE.test(k)) void unlock(k);
      else setState({ status: "bad" });
    },
    [unlock],
  );

  /** 이 기기에서 잊기 */
  const forget = useCallback(() => {
    store.clear();
    setState({ status: "locked" });
  }, []);

  return { state, submit, forget };
}
