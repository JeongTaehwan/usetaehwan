"use client";

import { motion, type Variants } from "framer-motion";
import { Button, Container, Heading, Text } from "@usetaehwan/ui";

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
    <section id="top" className="py-28 sm:py-40 lg:py-48">
      <Container size="lg">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="max-w-4xl"
        >
          <motion.div variants={item}>
            <Text as="span" variant="muted" className="font-mono">
              // v1.0.0 — frontend engineer, Seoul
            </Text>
          </motion.div>

          <Heading level={1} className="mt-6 text-5xl sm:text-6xl md:text-7xl">
            <motion.span variants={item} className="block">
              A frontend engineer,
            </motion.span>
            <motion.span variants={item} className="block italic text-brand">
              documented.
              <span aria-hidden className="caret" />
            </motion.span>
          </Heading>

          <motion.div variants={item}>
            <Text variant="lead" className="mt-7 max-w-2xl">
              구조를 설계하고, 문서로 남기는 프론트엔드 개발자 정태환입니다.
              <br />
              AI는 절차 안에 두고 씁니다 — 역할을 나누고, 결과를 코드로 검증하고, 체감 대신
              숫자로 판단합니다.
            </Text>
          </motion.div>

          <motion.div variants={item} className="mt-10 flex flex-wrap gap-3">
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
