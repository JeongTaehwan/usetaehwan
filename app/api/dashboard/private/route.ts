// 주인 전용 데이터 — 세션이 맞을 때만 서버에서 복호화해 돌려준다. 캐시하지 않는다
import type { NextRequest } from "next/server";
import raw from "../../../_data/dashboard/private.enc.json";
import type { EncryptedFile, PrivateResponse } from "../../../_data/dashboard/types";
import { SESSION_COOKIE, authConfig, decryptPrivate, verifySession } from "../../../_lib/dashboard-auth";

export const dynamic = "force-dynamic";

const file = raw as unknown as EncryptedFile;
const NO_STORE = { "Cache-Control": "private, no-store", Vary: "Cookie" };
const reply = (body: PrivateResponse, status = 200) => Response.json(body, { status, headers: NO_STORE });

export async function GET(req: NextRequest) {
  const cfg = authConfig();
  // 잠김·꺼짐은 오류가 아니라 정상 상태다 — 200 으로 돌려 방문자 콘솔에 빨간 줄이 남지 않게 한다
  if (!cfg) return reply({ status: "off" });
  if (!verifySession(req.cookies.get(SESSION_COOKIE)?.value, cfg)) return reply({ status: "locked" });
  if (!("data" in file)) return reply({ status: "empty" });

  const key = process.env.DASHBOARD_DATA_KEY;
  if (!key) return reply({ status: "nokey" }, 503);
  try {
    return reply({ status: "ok", ...decryptPrivate(file, key) });
  } catch {
    return reply({ status: "badkey" }, 500);
  }
}
