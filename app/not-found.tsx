import { Btn } from "./_ui/Btn";
import { Label } from "./_ui/Label";
import { Stamp } from "./_ui/Stamp";
import { SubpageHeader } from "./_components/SubpageFrame";

export default function NotFound() {
  return (
    <main className="page paper-grid min-h-dvh">
      <SubpageHeader backHref="/" backLabel="Cover" sheetNo="00" />
      <div className="mx-auto w-full max-w-4xl px-5 py-16 sm:px-8 sm:py-28">
        <div className="sheet p-6 sm:p-12">
          <div className="flex items-center gap-4">
            <Label mark>Sheet ??</Label>
            <Stamp>Void</Stamp>
          </div>
          <h1 className="display mt-6 text-4xl sm:text-6xl">
            404
            <br />
            이 번호의 도면은 없습니다.
          </h1>
          <p className="prose-draft mt-6 max-w-xl">
            주소가 바뀌었거나 아직 그리지 않은 장입니다. 표지로 돌아가 프로젝트·발표·AI 노트로
            이동할 수 있습니다.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Btn href="/" variant="solid">
              Sheet 00 · Cover
            </Btn>
            <Btn href="/#projects">Sheet 04 · Projects</Btn>
            <Btn href="/#ai">Sheet 05 · AI Notes</Btn>
          </div>
        </div>
      </div>
    </main>
  );
}
