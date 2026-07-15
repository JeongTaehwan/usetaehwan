"use client";

import { motion, type Variants } from "framer-motion";
import { Button, Container, Heading, Text } from "@/design-system";

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
};

export function Hero() {
  return (
    <section id="top" className="py-20 sm:py-28">
      <Container size="lg">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-3xl"
        >
          <motion.div variants={item}>
            <Text as="span" variant="muted" className="font-mono">
              // v1.0.0 — frontend engineer, Seoul
            </Text>
          </motion.div>

          <Heading level={1} className="mt-5 text-4xl sm:text-5xl">
            <motion.span variants={item} className="block">
              A frontend engineer,
            </motion.span>
            <motion.span variants={item} className="block italic text-brand">
              documented.
              <span aria-hidden className="caret" />
            </motion.span>
          </Heading>

          <motion.div variants={item}>
            <Text variant="lead" className="mt-6 max-w-xl">
              구조를 설계하고, 문서로 남기는 프론트엔드 개발자 정태환입니다.
              <br />
              컴포넌트 하나부터 시스템 전체까지 읽을 수 있게 만듭니다.
            </Text>
          </motion.div>

          <motion.div variants={item} className="mt-8 flex flex-wrap gap-3">
            <a href="#projects">
              <Button variant="primary" size="lg">
                View work
              </Button>
            </a>
            <a href="#contact">
              <Button variant="secondary" size="lg">
                Contact
              </Button>
            </a>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
