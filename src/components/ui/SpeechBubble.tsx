"use client";

import { motion } from "framer-motion";

/**
 * 또또의 말풍선. 부드럽게 떠오르며 등장한다.
 * 동화 무드의 따뜻한 카드 스타일.
 */
export function SpeechBubble({
  children,
  delay = 0,
  align = "center",
}: {
  children: React.ReactNode;
  delay?: number;
  align?: "left" | "center" | "right";
}) {
  const alignClass =
    align === "left"
      ? "self-start"
      : align === "right"
        ? "self-end"
        : "self-center";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, amount: 0.6 }}
      transition={{ duration: 0.6, delay, ease: "easeOut" }}
      className={`story-card relative max-w-md px-6 py-4 text-lg leading-relaxed text-ink ${alignClass}`}
    >
      {children}
      {/* 말풍선 꼬리 */}
      <span className="absolute -bottom-2 left-10 h-4 w-4 rotate-45 rounded-sm border-b border-r border-clay/40 bg-white/80" />
    </motion.div>
  );
}
