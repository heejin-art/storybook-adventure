"use client";

import { characterStore } from "@/components/character/characterStore";

/**
 * ⚙️ 임시(개발용) 엔딩 미리보기.
 * 엔딩까지 걸어가지 않아도 최종 엔딩(인사 → 손! → 스르륵 엎드려 눈감고 잠)을
 * 지금 자리에서 재생해 본다. 확정되면 이 패널은 제거한다.
 */

let timer: ReturnType<typeof setTimeout> | null = null;

function playEnding() {
  if (timer) clearTimeout(timer);
  characterStore.setSleeping(false);
  // 돌아보며 인사 → 손! → 꼬리 살랑 → 스르륵 엎드려 눈감고 잠
  characterStore.playGreeting(1500);
  timer = setTimeout(() => {
    characterStore.playTrick("shake");
    timer = setTimeout(() => {
      characterStore.playGreeting(1500);
      timer = setTimeout(() => characterStore.setSleeping(true), 1550);
    }, 1550);
  }, 1550);
}

function wake() {
  if (timer) clearTimeout(timer);
  characterStore.setSleeping(false);
  characterStore.playGreeting(900);
}

export function EndingPreview() {
  return (
    <div className="pointer-events-auto fixed left-4 top-4 z-40 flex flex-col gap-1.5 rounded-2xl border border-clay/40 bg-cream/95 p-3 shadow-lg">
      <p className="font-display text-xs text-ink-soft">엔딩 미리보기 (임시)</p>
      <button
        type="button"
        onClick={playEnding}
        className="rounded-full border border-clay/40 bg-white/80 px-3 py-1.5 text-left font-display text-sm text-ink transition-colors hover:bg-white"
      >
        ▶ 엔딩 재생 (잠들기)
      </button>
      <button
        type="button"
        onClick={wake}
        className="rounded-full border border-clay/40 bg-white/80 px-3 py-1.5 text-left font-display text-sm text-ink transition-colors hover:bg-white"
      >
        ☀ 깨우기 / 리셋
      </button>
    </div>
  );
}
