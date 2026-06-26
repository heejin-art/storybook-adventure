"use client";

import { useSyncExternalStore } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { journeyStore } from "@/components/world/journeyStore";

// 서버/초기 스냅샷은 안정적인 동일 참조여야 함(무한 루프 방지)
const SERVER_SNAP = { progress: 0, velocity: 0 };

/**
 * 시작 안내 — 여정 초입에만 은은히. 스크롤하면 사라진다.
 * 제목도 큰 UI가 아니라 공간에 떠 있는 작은 문구로(몰입 유지).
 */
export function StartHint() {
  const snap = useSyncExternalStore(
    journeyStore.subscribe,
    journeyStore.getSnapshot,
    () => SERVER_SNAP,
  );
  const show = snap.progress < 0.03;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="pointer-events-none fixed inset-x-0 bottom-10 z-20 flex flex-col items-center gap-3"
        >
          <p className="font-display text-2xl tracking-[0.3em] text-ink/80">
            TOTTO&apos;S STORY
          </p>
          <motion.p
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-sm text-ink-soft"
          >
            ↓ 스크롤하여 또또와 함께 걷기
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
