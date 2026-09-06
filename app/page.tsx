import { LoftNav } from "./_loft/Nav";
import { Reception } from "./_loft/Reception";
import { Study } from "./_loft/rooms/Study";
import { Corridor } from "./_loft/rooms/Corridor";
import { Skyline } from "./_loft/rooms/Skyline";
import { MeetingRoom } from "./_loft/rooms/MeetingRoom";
import { Notebook } from "./_loft/rooms/Notebook";
import { WindowRoom } from "./_loft/rooms/WindowRoom";

const EMAIL = "kt26625417@gmail.com";

/** 홈 — 로프트의 방 일곱 개를 순서대로. 내비는 방 이름이 곧 앵커. */
export default function Home() {
  return (
    <main className="relative">
      <LoftNav />
      <Reception />
      <Study />
      <Corridor />
      <Skyline />
      <MeetingRoom />
      <Notebook />
      <WindowRoom />
      <footer className="relative border-t border-line bg-wall-2">
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-6 sm:px-8 lg:px-14">
          <span className="caps text-muted">© 2026 Taehwan Jeong</span>
          <span className="caps text-muted">Brooklyn loft · Morning / Evening</span>
          <a href={`mailto:${EMAIL}`} className="caps text-muted hover:text-ink">{EMAIL}</a>
        </div>
      </footer>
    </main>
  );
}
