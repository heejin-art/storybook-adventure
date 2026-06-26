"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { characterStore } from "@/components/character/characterStore";

/**
 * 부드러운 스크롤(Lenis) + 스크롤 속도 → 캐릭터 이동 상태 변환.
 * --------------------------------------------------
 * "스크롤하면 캐릭터가 걸어가고, 멈추면 Idle" 이라는 핵심 인터랙션을 담당한다.
 * 또한 전체 진행도(0~1)를 context로 제공해 챕터/연출이 구독할 수 있다.
 */

const ScrollProgressContext = createContext(0);
export const useScrollProgress = () => useContext(ScrollProgressContext);

export function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [progress, setProgress] = useState(0);
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      // 동화 무드: 약간 느긋하고 부드러운 감속
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });
    lenisRef.current = lenis;

    lenis.on("scroll", (inst: Lenis) => {
      setProgress(inst.progress);

      // 스크롤 속도 → 이동 상태 매핑
      const v = Math.abs(inst.velocity);
      const intensity = Math.min(v / 22, 1);
      if (v < 0.6) {
        characterStore.setLocomotion("idle", 0);
      } else if (v < 14) {
        characterStore.setLocomotion("walk", intensity);
      } else {
        characterStore.setLocomotion("run", intensity);
      }
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  return (
    <ScrollProgressContext.Provider value={progress}>
      {children}
    </ScrollProgressContext.Provider>
  );
}
