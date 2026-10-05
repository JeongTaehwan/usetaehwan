// 주인 세션 종료
import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, cookieSecure } from "../../../_lib/dashboard-auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const res = NextResponse.redirect(new URL("/dashboard?auth=out", req.url), 303);
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: cookieSecure, sameSite: "lax", path: "/", maxAge: 0 });
  return res;
}
