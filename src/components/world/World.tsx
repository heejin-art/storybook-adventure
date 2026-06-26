"use client";

import { SmoothScrollProvider } from "@/components/providers/SmoothScrollProvider";
import { Character } from "@/components/character/Character";
import { ChapterHUD } from "@/components/ui/ChapterHUD";
import { chapters } from "@/components/chapters/registry";

/**
 * TOTTO'S WORLD — 하나의 거대한 월드.
 * 챕터들이 끊김 없이 이어지고, 캐릭터(또또)는 화면 하단에 고정되어
 * 사용자가 스크롤할 때마다 함께 걸어가는 느낌을 준다.
 *
 * 페이지가 나뉘는 느낌이 아니라 "하나의 동화를 플레이"하는 경험이 목표.
 */
export function World() {
  return (
    <SmoothScrollProvider>
      <main className="relative w-full">
        {/* 챕터들 — 레지스트리 순서대로 자연스럽게 이어짐 */}
        {chapters.map(({ id, Component }) => (
          <Component key={id} />
        ))}
      </main>

      {/* 항상 사용자를 따라다니는 또또 (클릭하면 인사) */}
      <Character />

      {/* 최소화된 챕터 내비게이터 */}
      <ChapterHUD chapters={chapters} />
    </SmoothScrollProvider>
  );
}
