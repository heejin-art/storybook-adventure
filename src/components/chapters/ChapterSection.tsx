"use client";

import { Decorations } from "@/components/background/Decorations";
import type { ChapterTheme } from "./types";

/**
 * 모든 챕터가 공유하는 공통 레이아웃 래퍼.
 * - 풀스크린 섹션 + 테마 그라데이션 배경 + 분위기 장식
 * - 하단(pb)에 고정 캐릭터가 들어올 공간을 비워둔다.
 * 챕터 컴포넌트는 콘텐츠만 children으로 넘기면 된다 → 추가/삭제가 매우 쉬움.
 */
export function ChapterSection({
  id,
  theme,
  children,
}: {
  id: string;
  theme: ChapterTheme;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      className={`relative flex min-h-screen w-full items-center justify-center overflow-hidden ${
        theme.textTone === "light" ? "text-cream" : "text-ink"
      }`}
      style={{ background: theme.gradient }}
    >
      <Decorations theme={theme} />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col items-center justify-center gap-6 px-6 pb-52 pt-24 text-center">
        {children}
      </div>
    </section>
  );
}
