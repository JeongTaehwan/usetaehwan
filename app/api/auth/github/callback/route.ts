// GitHub 가 돌려보낸 code 로 계정을 확인하고, 주인이면 세션 쿠키를 건다
import { NextResponse, type NextRequest } from "next/server";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  STATE_COOKIE,
  STATE_PATH,
  authConfig,
  cookieSecure,
  safeEqual,
  signSession,
} from "../../../../_lib/dashboard-auth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const back = (result: string) => {
    const res = NextResponse.redirect(new URL(`/dashboard?auth=${result}`, req.url));
    res.cookies.set(STATE_COOKIE, "", { httpOnly: true, secure: cookieSecure, sameSite: "lax", path: STATE_PATH, maxAge: 0 });
    return res;
  };

  const cfg = authConfig();
  if (!cfg) return back("off");

  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const expected = req.cookies.get(STATE_COOKIE)?.value;
  if (!code || !state || !expected || !safeEqual(state, expected)) return back("state");

  try {
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: cfg.clientId,
        client_secret: cfg.clientSecret,
        code,
        redirect_uri: new URL(`${STATE_PATH}/callback`, req.nextUrl.origin).toString(),
      }),
      cache: "no-store",
    });
    const token = (await tokenRes.json()) as { access_token?: string };
    if (!token.access_token) return back("token");

    const userRes = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        Accept: "application/vnd.github+json",
        "User-Agent": "usetaehwan-dashboard",
      },
      cache: "no-store",
    });
    const user = (await userRes.json()) as { id?: number };
    if (String(user.id) !== cfg.ownerId) return back("denied");

    const res = back("ok");
    res.cookies.set(SESSION_COOKIE, signSession(cfg.ownerId, cfg.sessionSecret), {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE,
    });
    return res;
  } catch {
    return back("error");
  }
}
