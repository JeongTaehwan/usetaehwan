import { Console } from "./_console/Console";
import { BackRow, Dialog, DocHero } from "./_console/ui";

export default function NotFound() {
  return (
    <Console label="404" backHref="/#menu" top={<div className="detail-top">        <DocHero sprite="letter" no="404" title="없는 페이지예요." bg="var(--color-ink)" fg="var(--color-lcd)" accent="var(--color-red)" /></div>}>
      <article>

        <Dialog className="mt-4 text-[15px] leading-[1.75] sm:text-[16px]">
          <p className="[word-break:keep-all]">주소가 바뀌었거나 아직 만들지 않은 페이지입니다. 메뉴로 돌아가면 프로젝트·경력·발표를 볼 수 있어요.</p>
        </Dialog>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {/* 전체 이동이어야 홈의 :target 장면 선택이 맞는다 — next/link 의 pushState 는 :target 을 갱신하지 않는다 */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/#menu" data-nav className="pbtn pbtn-solid">
            메뉴로
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/#dex" data-nav className="pbtn">
            도감 보기
          </a>
        </div>
        <BackRow href="/#menu" label="메뉴로" />
      </article>
    </Console>
  );
}
