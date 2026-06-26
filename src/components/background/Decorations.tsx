"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";
import type { ChapterTheme } from "@/components/chapters/types";

/**
 * 배경 분위기 장식 — 잎새/구름/나비/반딧불이/별/꽃잎.
 * 부드럽게 떠다니며 동화 무드를 만든다. (과하지 않게, 은은하게)
 *
 * 위치/타이밍은 index 기반 결정적 값으로 생성 → SSR/CSR 하이드레이션 불일치 방지,
 * 외부 이미지 에셋 없이 순수 도형/이모지로 표현 → 저작권/네트워크 의존 없음.
 */

// 간단한 결정적 의사난수 (seed 기반)
function seeded(i: number, salt: number) {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface Particle {
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  drift: number;
}

function buildParticles(count: number, salt: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    left: seeded(i, salt + 1) * 100,
    top: seeded(i, salt + 2) * 100,
    size: 0.6 + seeded(i, salt + 3) * 1.1,
    delay: seeded(i, salt + 4) * 6,
    duration: 6 + seeded(i, salt + 5) * 8,
    drift: (seeded(i, salt + 6) - 0.5) * 60,
  }));
}

const GLYPH: Record<ChapterTheme["decoration"], string[]> = {
  leaves: ["🍃", "🍂"],
  clouds: ["☁️", "⛅"],
  butterflies: ["🦋", "🌼"],
  fireflies: ["✨", "🟡"],
  stars: ["⭐", "✦", "✧"],
  petals: ["🌸", "🌷"],
};

export function Decorations({ theme }: { theme: ChapterTheme }) {
  const variant = theme.decoration;
  const particles = useMemo(
    () => buildParticles(variant === "stars" ? 26 : 14, variant.length),
    [variant],
  );
  const glyphs = GLYPH[variant];

  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {particles.map((p, i) => (
        <motion.span
          key={i}
          className="absolute select-none"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            fontSize: `${p.size}rem`,
            opacity: variant === "stars" ? 0.9 : 0.7,
          }}
          animate={
            variant === "stars" || variant === "fireflies"
              ? { opacity: [0.2, 1, 0.2], scale: [0.85, 1.15, 0.85] }
              : { y: [0, -22, 0], x: [0, p.drift * 0.4, 0], rotate: [-6, 6, -6] }
          }
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {glyphs[i % glyphs.length]}
        </motion.span>
      ))}
    </div>
  );
}
