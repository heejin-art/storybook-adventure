"use client";

import { useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { discoveryStore } from "@/components/world/discoveryStore";
import { profile } from "@/data/profile";
import { careerJourney } from "@/data/career";
import { notalk } from "@/data/projects";

/**
 * 발견 콘텐츠 오버레이 — 카드가 아니라 "여백 위에 떠오르는 텍스트".
 * 또또가 장소/오브젝트에 다가가거나 클릭했을 때만 부드럽게 나타난다.
 * 정보보다 장면이 먼저. (about / career-<i> / notalk)
 */
const fade = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -16 },
  transition: { duration: 0.8, ease: "easeOut" as const },
};

export function DiscoveryOverlay() {
  const active = useSyncExternalStore(
    discoveryStore.subscribe,
    discoveryStore.getSnapshot,
    () => null,
  );

  const side =
    active && active.startsWith("career-") ? "justify-start" : "justify-end";

  return (
    <div
      className={`pointer-events-none fixed inset-0 z-20 flex items-center ${side}`}
    >
      <AnimatePresence mode="wait">
        {active === "about" && (
          <motion.div key="about" {...fade} className="max-w-md px-10 text-left md:pr-24">
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

        {active && active.startsWith("career-") && (
          <CareerCard key={active} index={Number(active.split("-")[1])} />
        )}

        {active === "notalk" && (
          <motion.div key="notalk" {...fade} className="max-w-lg px-10 text-left md:pr-24">
            <p className="font-display text-sm tracking-[0.35em] text-[#7fe0d2]">
              PROJECT · {notalk.title}
            </p>
            <p className="mt-4 font-display text-3xl leading-snug text-ink md:text-4xl">
              {notalk.tagline}
            </p>
            <div className="mt-5 space-y-2 text-sm leading-relaxed text-ink-soft">
              <p><span className="font-display text-ink">문제 </span>{notalk.problem}</p>
              <p><span className="font-display text-ink">해결 </span>{notalk.solution}</p>
              <p><span className="font-display text-ink">성과 </span>{notalk.result}</p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {notalk.stack.map((s) => (
                <span key={s} className="rounded-full bg-[#7fe0d2]/25 px-3 py-1 text-xs text-ink">
                  {s}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function CareerCard({ index }: { index: number }) {
  const node = careerJourney[index];
  if (!node) return null;
  return (
    <motion.div {...fade} className="max-w-sm px-10 text-left md:pl-24">
      <p className="font-display text-sm tracking-[0.3em] text-forest/80">
        CAREER · {index + 1}/{careerJourney.length}
      </p>
      <p className="mt-3 text-5xl">{node.emoji}</p>
      <p className="mt-2 font-display text-3xl text-ink">{node.company}</p>
      <p className="font-display text-lg text-forest">{node.role}</p>
      {node.desc && (
        <p className="mt-3 max-w-xs leading-relaxed text-ink-soft">{node.desc}</p>
      )}
    </motion.div>
  );
}
