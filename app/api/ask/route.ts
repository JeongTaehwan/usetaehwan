/**
 * 챗봇 BFF 프록시 — 브라우저 → (여기) → ask-server(Railway).
 * rewrites가 아니라 Route Handler인 이유(decisions D-14): 공유 비밀 헤더를 붙여 백엔드 직접 호출을 막고,
 * Vercel이 확인한 클라이언트 IP를 넘긴다. 비밀은 서버 환경변수에만 있다.
 */
const API = process.env.ASK_API_URL ?? "http://localhost:8787";
const SECRET = process.env.ASK_PROXY_SECRET ?? "";
const MAX_CHARS = 300;

function upstreamHeaders(request: Request): HeadersInit {
  // Vercel은 x-forwarded-for를 자기 값으로 덮어써서 위조를 막는다. 첫 값이 클라이언트.
  const ip = request.headers.get("x-real-ip") ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "";
  return { "content-type": "application/json", "x-ask-proxy-secret": SECRET, "x-client-ip": ip };
}

const json = (body: unknown, status: number) => Response.json(body, { status });

export async function GET(request: Request) {
  try {
    const r = await fetch(`${API}/status`, { headers: upstreamHeaders(request), cache: "no-store" });
    return json(await r.json(), r.status);
  } catch {
    return json({ code: "unavailable" }, 503);
  }
}

export async function POST(request: Request) {
  let question = "";
  try {
    const body = (await request.json()) as { question?: unknown };
    question = typeof body.question === "string" ? body.question.trim() : "";
  } catch {
    return json({ code: "bad_request" }, 400);
  }
  if (!question) return json({ code: "empty" }, 422);
  if (question.length > MAX_CHARS) return json({ code: "too_long", max_chars: MAX_CHARS }, 422);

  let upstream: Response;
  try {
    upstream = await fetch(`${API}/ask`, {
      method: "POST",
      headers: upstreamHeaders(request),
      body: JSON.stringify({ question }),
      cache: "no-store",
    });
  } catch {
    return json({ code: "unavailable" }, 503);
  }
  if (!upstream.ok || !upstream.body) {
    const body = await upstream.json().catch(() => ({ code: "upstream" }));
    return json(body, upstream.status);
  }
  // SSE를 그대로 흘려보낸다 — 단계 이벤트와 검증을 마친 답 하나
  return new Response(upstream.body, {
    headers: { "content-type": "text/event-stream", "cache-control": "no-store", "x-accel-buffering": "no" },
  });
}
