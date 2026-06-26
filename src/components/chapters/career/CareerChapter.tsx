"use client";

import { motion } from "framer-motion";
import { ChapterSection } from "../ChapterSection";
import { SpeechBubble } from "@/components/ui/SpeechBubble";
import type { ChapterMeta } from "../types";
import { careerJourney } from "@/data/career";

/**
 * Chapter 2 — 숲길 (Career Journey).
 * 타임라인이 아니라, 길을 걸으며 자연스럽게 만나는 경력 노드들.
 * 데이터(careerJourney) 배열만 바꾸면 길 위 노드가 자동으로 늘고 줄어든다.
 */
function CareerChapter() {
  return (
    <ChapterSection id={meta.id} theme={meta.theme}>
      <p className="font-display text-sm tracking-[0.3em] text-forest">
        CHAPTER 2 · 숲길
      </p>
      <h2 className="font-display text-3xl text-ink md:text-5xl">
        Career Journey
      </h2>
      <SpeechBubble delay={0.2}>
        나를 따라와! 희진이 걸어온 길을 같이 걸어보자.
      </SpeechBubble>

      {/* 굽이진 길 + 노드들 */}
      <div className="relative mt-8 w-full max-w-xl">
        {/* 가운데 점선 길 */}
        <div className="absolute left-1/2 top-0 h-full w-1 -translate-x-1/2 rounded-full border-l-2 border-dashed border-forest/40" />

        <div className="flex flex-col gap-12">
          {careerJourney.map((node, i) => {
            const side = i % 2 === 0 ? "left" : "right";
            return (
              <motion.div
                key={node.company}
                initial={{ opacity: 0, x: side === "left" ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.6 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className={`relative flex w-full ${
                  side === "left" ? "justify-start" : "justify-end"
                }`}
              >
                {/* 길 위의 발자국(노드 점) */}
                <span className="absolute left-1/2 top-6 z-10 h-4 w-4 -translate-x-1/2 rounded-full bg-forest ring-4 ring-cream" />

                <div
                  className={`story-card w-[46%] px-5 py-4 text-left ${
                    side === "left" ? "text-left" : "text-right"
                  }`}
                >
                  <div className="text-3xl">{node.emoji}</div>
                  <div className="mt-1 font-display text-xl text-ink">
                    {node.company}
                  </div>
                  <div className="text-sm font-semibold text-forest">
                    {node.role}
                    {node.period ? ` · ${node.period}` : ""}
                  </div>
                  {node.desc && (
                    <p className="mt-1 text-sm leading-relaxed text-ink-soft">
                      {node.desc}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </ChapterSection>
  );
}

export const meta: ChapterMeta = {
  id: "career",
  label: "여정",
  title: "Career Journey",
  subtitle: "숲길",
  theme: {
    gradient:
      "linear-gradient(180deg, #D7EBC4 0%, #BFE0CF 50%, #AED5D8 100%)",
    decoration: "butterflies",
    textTone: "dark",
  },
  Component: CareerChapter,
};
