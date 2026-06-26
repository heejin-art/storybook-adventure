"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { discoveryStore } from "@/components/world/discoveryStore";
import { profile } from "@/data/profile";

/**
 * 발견 콘텐츠 오버레이 — 카드가 아니라 "여백 위에 떠오르는 텍스트".
 * 또또가 어떤 장소에 가까워졌을 때만 부드럽게 나타난다. 정보보다 장면이 먼저.
 * (1단계: About. 이후 장소별 콘텐츠를 동일 패턴으로 추가.)
 */
export function DiscoveryOverlay() {
  const active = useSyncExternalStore(
    discoveryStore.subscribe,
    discoveryStore.getSnapshot,
    () => null,
  );

  return (
    <div className="pointer-events-none fixed inset-0 z-20 flex items-center justify-end">
      <AnimatePresence mode="wait">
        {active === "about" && (
          <motion.div
            key="about"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.9, ease: "easeOut" }}
            className="max-w-md px-10 text-left md:pr-24"
          >
            <p className="font-display text-sm tracking-[0.35em] text-forest/80">
              {profile.name.toUpperCase()} · ABOUT
            </p>
            <p className="mt-4 font-display text-3xl leading-snug text-ink md:text-4xl">
              {profile.tagline}
            </p>
            <p className="mt-5 max-w-sm leading-relaxed text-ink-soft">
              {profile.intro}
            </p>
            <p className="mt-6 font-display italic text-forest">
              “{profile.philosophy}”
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
