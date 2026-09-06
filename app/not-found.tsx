import Link from "next/link";
import { LoftHeader, LoftPaper } from "./_loft/LoftPage";

export default function NotFound() {
  return (
    <main className="relative">
      <LoftHeader backHref="/" backLabel="Lobby" />
      <LoftPaper crumb="404 · 이 방은 없습니다" title="문을 잘못 여셨네요." lead="주소가 바뀌었거나 아직 만들지 않은 방입니다. 로비로 돌아가 프로젝트·발표·AI 노트로 이동할 수 있습니다.">
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-solid">Lobby</Link>
          <Link href="/#projects" className="btn btn-outline !text-[#2b2622]">Projects</Link>
          <Link href="/#ai" className="btn btn-outline !text-[#2b2622]">Notebook</Link>
        </div>
      </LoftPaper>
    </main>
  );
}
