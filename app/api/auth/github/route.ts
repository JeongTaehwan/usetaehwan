// 대시보드 주인 인증 시작 — GitHub 로그인으로 보낸다
import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { STATE_COOKIE, STATE_PATH, authConfig, cookieSecure } from "../../../_lib/dashboard-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const cfg = authConfig();
  if (!cfg) return NextResponse.redirect(new URL("/dashboard?auth=off", req.url));

  const state = randomBytes(16).toString("hex");
  const url = new URL("https://github.com/login/oauth/authorize");
  url.searchParams.set("client_id", cfg.clientId);
  url.searchParams.set("redirect_uri", new URL(`${STATE_PATH}/callback`, req.nextUrl.origin).toString());
  url.searchParams.set("state", state);
  url.searchParams.set("allow_signup", "false");

  const res = NextResponse.redirect(url);
  res.cookies.set(STATE_COOKIE, state, { httpOnly: true, secure: cookieSecure, sameSite: "lax", path: STATE_PATH, maxAge: 600 });
  return res;
}
