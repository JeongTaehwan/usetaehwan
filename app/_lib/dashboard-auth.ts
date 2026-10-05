/**
 * 대시보드 주인 인증 — GitHub 로그인으로 계정 id 를 확인하고, 서명한 쿠키로 7일 유지한다.
 * 서버(라우트 핸들러)에서만 import 한다. 환경 변수가 하나라도 없으면 인증은 꺼진 상태로 닫힌다.
 *
 *   GITHUB_CLIENT_ID · GITHUB_CLIENT_SECRET   GitHub OAuth App
 *   DASHBOARD_SESSION_SECRET                  쿠키 서명 키 (32자 이상)
 *   DASHBOARD_DATA_KEY                        주인 전용 데이터 복호화 키 (scripts/dashboard-sync.mjs --gen-key)
 *   DASHBOARD_OWNER_ID                        주인 GitHub 계정 숫자 id (기본: JeongTaehwan)
 */
import { createDecipheriv, createHmac, timingSafeEqual } from "node:crypto";
import type { DashboardPrivate, EncryptedFile } from "../_data/dashboard/types";

export const SESSION_COOKIE = "ut_dash";
export const STATE_COOKIE = "ut_dash_state";
export const STATE_PATH = "/api/auth/github";
export const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

const DEFAULT_OWNER_ID = "68889258"; // github.com/JeongTaehwan — 로그인 이름은 바뀔 수 있어 숫자 id 로 본다
const AAD = Buffer.from("usetaehwan-dashboard-v1");

export type AuthConfig = { clientId: string; clientSecret: string; sessionSecret: string; ownerId: string };

export function authConfig(): AuthConfig | null {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const sessionSecret = process.env.DASHBOARD_SESSION_SECRET;
  if (!clientId || !clientSecret || !sessionSecret || sessionSecret.length < 32) return null;
  return { clientId, clientSecret, sessionSecret, ownerId: process.env.DASHBOARD_OWNER_ID ?? DEFAULT_OWNER_ID };
}

export const cookieSecure = process.env.NODE_ENV === "production";

const b64u = (b: Buffer) => b.toString("base64url");
const hmac = (secret: string, data: string) => createHmac("sha256", secret).update(data).digest();

export function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

export function signSession(sub: string, secret: string, now = Date.now()): string {
  const payload = b64u(Buffer.from(JSON.stringify({ sub, exp: now + SESSION_MAX_AGE * 1000 })));
  return `${payload}.${b64u(hmac(secret, payload))}`;
}

export function verifySession(token: string | undefined, cfg: AuthConfig, now = Date.now()): boolean {
  if (!token) return false;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return false;
  const expected = hmac(cfg.sessionSecret, payload);
  const given = Buffer.from(sig, "base64url");
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) return false;
  try {
    const { sub, exp } = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return sub === cfg.ownerId && typeof exp === "number" && exp > now;
  } catch {
    return false;
  }
}

export function decryptPrivate(file: EncryptedFile, keyB64: string): DashboardPrivate {
  if (!("data" in file)) throw new Error("empty");
  const key = Buffer.from(keyB64, "base64");
  if (key.length !== 32) throw new Error("key");
  const d = createDecipheriv("aes-256-gcm", key, Buffer.from(file.iv, "base64"));
  d.setAAD(AAD);
  d.setAuthTag(Buffer.from(file.tag, "base64"));
  const text = Buffer.concat([d.update(Buffer.from(file.data, "base64")), d.final()]).toString("utf8");
  return JSON.parse(text) as DashboardPrivate;
}
