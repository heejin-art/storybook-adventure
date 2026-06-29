"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { characterStore } from "@/components/character/characterStore";
import { discoveryStore } from "@/components/world/discoveryStore";
import { gateStore } from "@/components/world/gateStore";

/**
 * 엔딩 연출 — 마지막 콘텐츠(마지막 인사)를 보고 닫으면,
 * 또또가 사용자에게 애교를 부리다가(인사·손·뱅글·데굴·점프) 꼬리를 흔들며 마무리한다.
 * 그 위로 부드러운 "다시 산책하기" 안내가 떠오른다.
 * → "그냥 스크롤하다 끝나는" 느낌 대신, 또또가 배웅하는 다정한 엔딩.
 */

// 애교 시퀀스 — greet(돌아보며 꼬리 흔들기) + 귀여운 트릭들을 차례로
const AEGYO: ({ kind: "greet"; ms: number } | { kind: "trick"; name: Parameters<typeof characterStore.playTrick>[0] })[] = [
  { kind: "greet", ms: 1600 },
  { kind: "trick", name: "shake" }, // 손!
  { kind: "greet", ms: 1400 },
  { kind: "trick", name: "spin" }, // 뱅글
  { kind: "trick", name: "roll" }, // 데굴
  { kind: "greet", ms: 1400 },
  { kind: "trick", name: "jump" }, // 폴짝
  { kind: "trick", name: "shake" }, // 손!
];

export function EndingScene() {
  // 게이트/발견 상태 구독 (마지막 인사를 봤고, 지금은 패널이 닫힌 상태인지)
  useSyncExternalStore(gateStore.subscribe, gateStore.getSnapshot, () => "|0|0");
  const active = useSyncExternalStore(
    discoveryStore.subscribe,
    discoveryStore.getSnapshot,
    () => null,
  );
  const show = gateStore.isSeen("ending") && active === null;

  const started = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [card, setCard] = useState(false);

  useEffect(() => {
    if (!show || started.current) return;
    started.current = true;

    let i = 0;
    const step = () => {
      if (i >= AEGYO.length) {
        // 마무리: 사용자를 향해 오래 꼬리 흔들며 배웅(애교 유지)
        characterStore.playGreeting(600000);
        setCard(true);
        return;
      }
      const a = AEGYO[i++];
      if (a.kind === "greet") characterStore.playGreeting(a.ms);
      else characterStore.playTrick(a.name);
      timer.current = setTimeout(step, 1650);
    };
    // 살짝 뜸 들였다가 시작
    timer.current = setTimeout(step, 700);

    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [show]);

  return (
    <AnimatePresence>
      {show && card && (
        <motion.div
          key="ending-card"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="pointer-events-none fixed inset-x-0 bottom-16 z-30 flex flex-col items-center gap-3 px-6"
        >
          <motion.p
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="font-display text-lg text-ink md:text-xl"
            style={{ textShadow: "0 1px 16px rgba(255,250,238,0.7)" }}
          >
            🐾 끝까지 함께 걸어줘서 고마워요
          </motion.p>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== "undefined") {
                window.scrollTo(0, 0);
                window.location.reload(); // 게이트까지 초기화해 처음부터 다시 산책
              }
            }}
            className="pointer-events-auto rounded-full border border-clay/40 bg-cream/95 px-6 py-2.5 font-display text-sm text-ink shadow-md transition-transform hover:-translate-y-0.5 hover:bg-white"
          >
            처음부터 다시 산책하기 ↺
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
