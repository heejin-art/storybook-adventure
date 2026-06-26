"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { characterStore, type TrickName } from "@/components/character/characterStore";

/**
 * 트릭 바 — 또또에게 묘기를 시키는 작은 컨트롤.
 * 우하단 발바닥 버튼을 누르면 트릭 목록이 펼쳐지고, 누르면 또또가 그 동작을 한다.
 * 게임 UI처럼 무겁지 않게, 동화책 톤의 작은 버튼으로.
 */
const TRICKS: { name: TrickName; label: string; emoji: string }[] = [
  { name: "jump", label: "점프", emoji: "🦘" },
  { name: "sit", label: "앉아", emoji: "🪑" },
  { name: "shake", label: "손", emoji: "🤝" },
  { name: "bang", label: "빵야", emoji: "💥" },
  { name: "lieDown", label: "엎드려", emoji: "🛏️" },
  { name: "spin", label: "뱅글", emoji: "🌀" },
  { name: "roll", label: "데굴", emoji: "🤸" },
];

export function TrickBar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="pointer-events-auto fixed bottom-6 right-6 z-40 flex flex-col items-end gap-3">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.95 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-2 gap-2"
          >
            {TRICKS.map((t) => (
              <button
                key={t.name}
                type="button"
                onClick={() => characterStore.playTrick(t.name)}
                className="flex items-center gap-2 rounded-full border border-clay/40 bg-cream/95 px-4 py-2 font-display text-sm text-ink shadow-md transition-transform hover:-translate-y-0.5 hover:bg-white"
              >
                <span className="text-base">{t.emoji}</span>
                {t.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="또또에게 묘기 시키기"
        className="flex h-14 w-14 items-center justify-center rounded-full bg-forest text-2xl text-cream shadow-lg transition-transform hover:scale-105"
      >
        🐾
      </button>
    </div>
  );
}
