"use client";

import { useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { journeyStore } from "@/components/world/journeyStore";

/**
 * Hero 오프닝 — "또또가 사용자를 산책시키며 희진을 소개하는" 세계관을 첫 화면에 각인.
 * 또또(3D)가 화면에 주인공처럼 있고, 그 위로 또또의 인사가 부드럽게 떠오른다.
 * 스크롤을 시작하면(progress↑) 서서히 사라지며 산책이 시작된다.
 */
const SERVER_SNAP = { progress: 0, velocity: 0 };

const lines = [
  { t: "안녕하세요.", strong: false },
  { t: "저는 희진의 반려견 ", strong: false, accent: "또또", tail: "입니다." },
  { t: "오늘은 제가 희진을 소개해드릴게요.", strong: false },
];

export function Hero() {
  const snap = useSyncExternalStore(
    journeyStore.subscribe,
    journeyStore.getSnapshot,
    () => SERVER_SNAP,
  );
  // 스크롤을 시작하면 서서히 사라짐
  const opacity = Math.max(0, 1 - snap.progress / 0.04);
  if (opacity <= 0.01) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-20 flex flex-col items-center"
      style={{ opacity }}
    >
      {/* 위쪽 부드러운 스크림(가독성) */}
      <div
        className="absolute inset-x-0 top-0 h-[55%]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,251,240,0.55) 0%, rgba(255,251,240,0) 100%)",
        }}
      />

      <div className="relative mt-[12vh] flex flex-col items-center gap-4 px-6 text-center">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.2 }}
          className="font-display text-sm tracking-[0.4em] text-forest/80"
        >
          TOTTO&apos;S STORY
        </motion.p>

        {lines.map((l, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.6 + i * 0.7, ease: "easeOut" }}
            className="font-display text-2xl leading-snug text-ink md:text-3xl"
            style={{ textShadow: "0 1px 18px rgba(255,250,238,0.7)" }}
          >
            {l.t}
            {l.accent && (
              <span className="text-forest">{l.accent}</span>
            )}
            {l.tail}
          </motion.p>
        ))}
      </div>

      {/* 스크롤 유도 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 2.8 }}
        className="absolute inset-x-0 bottom-10 flex flex-col items-center gap-2"
      >
        <p
          className="font-display text-base text-ink/80"
          style={{ textShadow: "0 1px 14px rgba(255,250,238,0.7)" }}
        >
          스크롤하며 함께 산책해보세요
        </p>
        <motion.span
          animate={{ y: [0, 9, 0] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="text-2xl text-forest"
        >
          ↓
        </motion.span>
      </motion.div>
    </div>
  );
}
