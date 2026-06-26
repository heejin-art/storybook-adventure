"use client";

import { useEffect, useState } from "react";
import type { ChapterMeta } from "@/components/chapters/types";

/**
 * 최소화된 HUD — 우측에 작은 점들로 챕터 위치만 표시.
 * 몰입을 해치지 않도록 평소엔 은은하게, hover 시 라벨이 보인다.
 * IntersectionObserver로 현재 챕터를 감지해 활성화한다.
 */
export function ChapterHUD({ chapters }: { chapters: ChapterMeta[] }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const sections = chapters
      .map((c) => document.getElementById(c.id))
      .filter((el): el is HTMLElement => Boolean(el));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = chapters.findIndex((c) => c.id === entry.target.id);
            if (idx !== -1) setActive(idx);
          }
        });
      },
      { threshold: 0.5 },
    );

    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [chapters]);

  return (
    <nav
      aria-label="챕터 이동"
      className="fixed right-4 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-3 md:flex"
    >
      {chapters.map((c, i) => (
        <a
          key={c.id}
          href={`#${c.id}`}
          className="group flex items-center justify-end gap-2"
          aria-label={c.label}
        >
          <span className="pointer-events-none rounded-full bg-white/80 px-2 py-0.5 font-display text-xs text-ink opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
            {c.label}
          </span>
          <span
            className={`h-2.5 w-2.5 rounded-full border border-forest transition-all duration-300 ${
              i === active ? "scale-125 bg-forest" : "bg-transparent"
            }`}
          />
        </a>
      ))}
    </nav>
  );
}
