"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { journeyStore } from "./journeyStore";
import { discoveryStore } from "./discoveryStore";

/**
 * 스크롤 → 여정 진행도 변환기.
 * --------------------------------------------------
 * 화면에는 보이지 않는 "긴 스크롤 높이"를 만들어, 그 스크롤 위치를 progress(0~1)로 매핑한다.
 * Lenis로 부드럽게 감속하고, 속도(velocity)는 또또의 걸음(idle/walk/run)에 쓰인다.
 *
 * WorldCanvas는 화면에 고정(fixed)되어 있고, 이 컴포넌트가 만드는 스크롤만 움직인다.
 * → "스크롤하면 또또가 걷고, 멈추면 선다"는 핵심 인터랙션.
 */
export function ScrollController({ heightVh = 700 }: { heightVh?: number }) {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      smoothWheel: true,
      easing: (t) => 1 - Math.pow(1 - t, 3),
    });

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? window.scrollY / max : 0;
      const v = Math.min(Math.abs(lenis.velocity) / 24, 1);
      journeyStore.setProgress(p, v);
    };

    lenis.on("scroll", update);

    // 콘텐츠가 열려 있는 동안엔 스크롤을 멈춰 차분히 읽게 한다
    const unsub = discoveryStore.subscribe(() => {
      if (discoveryStore.active) lenis.stop();
      else lenis.start();
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    update();

    return () => {
      cancelAnimationFrame(rafId);
      unsub();
      lenis.destroy();
    };
  }, []);

  // 스크롤 가능 높이 확보용 투명 스페이서 (클릭은 캔버스로 통과)
  return (
    <div
      style={{ height: `${heightVh}vh`, pointerEvents: "none" }}
      aria-hidden
    />
  );
}
