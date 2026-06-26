"use client";

import { motion } from "framer-motion";
import { ChapterSection } from "../ChapterSection";
import { SpeechBubble } from "@/components/ui/SpeechBubble";
import { StoryButton } from "@/components/ui/StoryButton";
import type { ChapterMeta } from "../types";
import { profile } from "@/data/profile";

/**
 * Intro — 아무도 없는 숲. 새소리, 바람, 흔들리는 나뭇잎.
 * 또또가 사용자를 바라보다 말풍선으로 인사하고 모험을 제안한다.
 */
function IntroChapter() {
  return (
    <ChapterSection id={meta.id} theme={meta.theme}>
      {/* 도입 정적 연출: 천천히 떠오르는 제목 */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="font-display text-sm tracking-[0.4em] text-forest"
      >
        TOTTO&apos;S STORY
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.4, delay: 0.4, ease: "easeOut" }}
        className="font-display text-4xl leading-tight text-ink md:text-6xl"
      >
        또또와 함께 떠나는
        <br />
        동화 속 모험
      </motion.h1>

      <div className="mt-6 flex flex-col items-center gap-5">
        <SpeechBubble delay={1.2}>
          <p>{profile.greeting}</p>
          <p className="mt-1">
            {profile.name}의 세상을 같이 구경하러 갈래?
          </p>
        </SpeechBubble>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 2 }}
        >
          <StoryButton href="#about">모험 시작하기 →</StoryButton>
        </motion.div>
      </div>

      {/* 아래로 안내하는 부드러운 힌트 */}
      <motion.div
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-44 font-display text-sm text-ink-soft"
      >
        ↓ 스크롤하면 또또가 걸어가요
      </motion.div>
    </ChapterSection>
  );
}

export const meta: ChapterMeta = {
  id: "intro",
  label: "시작",
  title: "Intro",
  subtitle: "아무도 없는 숲",
  theme: {
    gradient:
      "linear-gradient(180deg, #E8F3DC 0%, #D7EBC4 45%, #C6E0AE 100%)",
    decoration: "leaves",
    textTone: "dark",
  },
  Component: IntroChapter,
};
