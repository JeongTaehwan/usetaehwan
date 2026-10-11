/** fetch 응답 본문의 SSE를 이벤트 단위로 읽는다 (EventSource는 GET만 되어서 POST에 못 쓴다). */
export type AskEvent =
  | { event: "stage"; data: { stage: string } }
  | { event: "answer"; data: AskAnswer }
  | { event: "error"; data: { code: string } };

export type Citation = { n: number; title: string; section: string; href: string };
export type AskAnswer = { answer: string; citations: Citation[]; outcome: "answered" | "fallback" | "no_evidence" | "refused" };

export async function* readSSE(body: ReadableStream<Uint8Array>): AsyncGenerator<AskEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let i: number;
    while ((i = buf.indexOf("\n\n")) >= 0) {
      const block = buf.slice(0, i);
      buf = buf.slice(i + 2);
      let event = "";
      let data = "";
      for (const line of block.split("\n")) {
        if (line.startsWith("event: ")) event = line.slice(7);
        else if (line.startsWith("data: ")) data += line.slice(6);
      }
      if (event && data) yield { event, data: JSON.parse(data) } as AskEvent;
    }
  }
}
