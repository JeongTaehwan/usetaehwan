import Link from "next/link";
import { Button, Container, Heading, Text } from "@usetaehwan/ui";
import { SubpageHeader } from "./_components/SubpageHeader";

export default function NotFound() {
  return (
    <main className="min-h-dvh">
      <SubpageHeader backHref="/" backLabel="Home" />
      <section className="py-24 sm:py-32">
        <Container size="md">
          <Text as="div" variant="muted" className="font-mono text-brand">
            // 404
          </Text>
          <Heading level={1} className="mt-3 text-4xl sm:text-5xl">
            이 주소에는 문서가 없습니다.
          </Heading>
          <Text variant="lead" className="mt-4">
            주소가 바뀌었거나 아직 쓰지 않은 페이지입니다. 홈에서 프로젝트·발표·AI 활용 문서로
            이동할 수 있습니다.
          </Text>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/">
              <Button variant="primary">홈으로</Button>
            </Link>
            <Link href="/#projects">
              <Button variant="ghost">Projects</Button>
            </Link>
            <Link href="/#ai">
              <Button variant="ghost">AI 활용</Button>
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
