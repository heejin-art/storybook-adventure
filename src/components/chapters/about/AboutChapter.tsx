"use client";

import { motion } from "framer-motion";
import { ChapterSection } from "../ChapterSection";
import { SpeechBubble } from "@/components/ui/SpeechBubble";
import type { ChapterMeta } from "../types";
import { profile } from "@/data/profile";

/**
 * Chapter 1 — 작은 집 (About Me).
 * 또또가 집 앞에서 기다리고, 집 안으로 들어가면 희진의 소개가 펼쳐진다.
 */
function AboutChapter() {
  return (
    <ChapterSection id={meta.id} theme={meta.theme}>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.7 }}
        className="text-6xl"
      >
        🏡
      </motion.div>

      <p className="font-display text-sm tracking-[0.3em] text-forest">
        CHAPTER 1 · 작은 집
      </p>
      <h2 className="font-display text-3xl text-ink md:text-5xl">About Me</h2>

      <SpeechBubble delay={0.2}>
        여기는 {profile.name}이 사는 작은 집이야. 들어가 볼래?
      </SpeechBubble>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="story-card mt-4 w-full max-w-2xl px-8 py-8 text-left"
      >
        <p className="font-display text-2xl text-ink">{profile.tagline}</p>
        <p className="mt-4 leading-relaxed text-ink-soft">{profile.intro}</p>

        {/* 성격 / 강점 */}
        <div className="mt-7 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {profile.personality.map((p) => (
            <div
              key={p.label}
              className="rounded-2xl bg-cream/70 px-4 py-4 text-center"
            >
              <div className="text-3xl">{p.emoji}</div>
              <div className="mt-2 font-display text-lg text-ink">
                {p.label}
              </div>
              <div className="mt-1 text-sm text-ink-soft">{p.desc}</div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-2">
          {profile.strengths.map((s) => (
            <span
              key={s}
              className="rounded-full bg-leaf/50 px-3 py-1 text-sm text-ink"
            >
              {s}
            </span>
          ))}
        </div>

        <p className="mt-6 border-t border-clay/30 pt-4 font-display text-lg italic text-forest">
          “{profile.philosophy}”
        </p>
      </motion.div>
    </ChapterSection>
  );
}

export const meta: ChapterMeta = {
  id: "about",
  label: "소개",
  title: "About Me",
  subtitle: "작은 집",
  theme: {
    gradient:
      "linear-gradient(180deg, #FBF1DD 0%, #F6E6C8 55%, #EFD9B4 100%)",
    decoration: "petals",
    textTone: "dark",
  },
  Component: AboutChapter,
};
