import {
  Badge,
  Button,
  Card,
  Container,
  Heading,
  Input,
  Text,
} from "@/design-system";
import { ThemeToggle } from "./ThemeToggle";

/* 쇼케이스용 로컬 헬퍼 — 디자인 시스템에 속하지 않는 페이지 전용 레이아웃 조각 */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-border py-12">
      <Heading level={3} className="mb-6">
        {title}
      </Heading>
      {children}
    </section>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-wrap items-center gap-3">{children}</div>;
}

const swatches = [
  { name: "bg", cls: "bg-bg" },
  { name: "surface", cls: "bg-surface" },
  { name: "border", cls: "bg-border" },
  { name: "fg", cls: "bg-fg" },
  { name: "fg-body", cls: "bg-fg-body" },
  { name: "fg-muted", cls: "bg-fg-muted" },
  { name: "brand", cls: "bg-brand" },
  { name: "brand-hover", cls: "bg-brand-hover" },
  { name: "brand-subtle", cls: "bg-brand-subtle" },
  { name: "success", cls: "bg-success" },
  { name: "warning", cls: "bg-warning" },
  { name: "danger", cls: "bg-danger" },
];

export default function Home() {
  return (
    <main className="min-h-screen py-16">
      <Container size="lg">
        {/* ── Header ── */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <Heading level={1} className="mb-2">
              useTaehwan()
            </Heading>
            <Text variant="lead">디자인 시스템 컴포넌트 쇼케이스 · 검증 페이지</Text>
          </div>
          <ThemeToggle />
        </header>

        {/* ── Colors ── */}
        <Section title="Colors">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {swatches.map((s) => (
              <div key={s.name} className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 shrink-0 rounded-md border border-border ${s.cls}`}
                />
                <Text variant="muted" className="font-mono">
                  {s.name}
                </Text>
              </div>
            ))}
          </div>
        </Section>

        {/* ── Typography ── */}
        <Section title="Typography">
          <div className="space-y-3">
            <Heading level={1}>Heading level 1 — 세리프 헤딩</Heading>
            <Heading level={2}>Heading level 2 — 에디토리얼 인상</Heading>
            <Heading level={3}>Heading level 3</Heading>
            <Heading level={4}>Heading level 4</Heading>
            <Text variant="lead">
              Lead — 저채도 웜 뉴트럴. 가을 느낌의 흐릿하고 차분한 색감으로 편안한
              프로덕트 톤을 낸다.
            </Text>
            <Text variant="body">
              Body — 본문 텍스트입니다. 한글은 Pretendard, 라틴은 Hanken Grotesk로
              렌더링됩니다. The quick brown fox jumps over the lazy dog.
            </Text>
            <Text variant="muted">Muted — 캡션·힌트 전용 (본문 대비 낮음)</Text>
            <Text variant="small">Small — 가장 작은 보조 텍스트</Text>
          </div>
        </Section>

        {/* ── Buttons ── */}
        <Section title="Buttons">
          <div className="space-y-4">
            <Row>
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="primary" disabled>
                Disabled
              </Button>
            </Row>
            <Row>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </Row>
          </div>
        </Section>

        {/* ── Badges ── */}
        <Section title="Badges">
          <Row>
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="brand">Brand</Badge>
          </Row>
        </Section>

        {/* ── Inputs ── */}
        <Section title="Inputs">
          <div className="grid max-w-md gap-4">
            <label className="grid gap-1.5">
              <Text as="span" variant="muted">
                이메일
              </Text>
              <Input type="email" placeholder="you@example.com" />
            </label>

            <label className="grid gap-1.5">
              <Text as="span" variant="muted">
                유효하지 않은 값 (aria-invalid)
              </Text>
              <Input
                defaultValue="not-an-email"
                aria-invalid
                aria-describedby="email-error"
              />
              <Text as="span" variant="small" id="email-error" className="text-danger">
                올바른 이메일 형식이 아닙니다.
              </Text>
            </label>

            <label className="grid gap-1.5">
              <Text as="span" variant="muted">
                비활성
              </Text>
              <Input placeholder="disabled" disabled />
            </label>
          </div>
        </Section>

        {/* ── Cards ── */}
        <Section title="Cards">
          <div className="grid gap-4 sm:grid-cols-2">
            <Card>
              <div className="mb-2 flex items-center gap-2">
                <Heading level={4}>디자인 시스템 MVP</Heading>
                <Badge variant="brand">진행 중</Badge>
              </div>
              <Text className="mb-4">
                사이트를 만들면서 실사용으로 API를 검증하고, 그다음에 별도 패키지로
                추출한다.
              </Text>
              <Row>
                <Button size="sm">자세히</Button>
                <Button size="sm" variant="ghost">
                  나중에
                </Button>
              </Row>
            </Card>

            <Card>
              <div className="mb-2 flex items-center gap-2">
                <Heading level={4}>다크모드</Heading>
                <Badge variant="neutral">검증됨</Badge>
              </div>
              <Text className="mb-4">
                Tailwind v4 <code className="font-mono text-sm">@custom-variant</code>{" "}
                기반. 우측 상단 토글로 확인하세요.
              </Text>
              <Input placeholder="카드 안의 입력 필드" />
            </Card>
          </div>
        </Section>

        <footer className="border-t border-border py-8">
          <Text variant="small">
            design-system/ · 순수 React · 토큰 기반 · 추출 가능한 구조
          </Text>
        </footer>
      </Container>
    </main>
  );
}
