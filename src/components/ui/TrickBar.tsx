"use client";

import {
  characterStore,
  type TrickName,
  type FeedKind,
} from "@/components/character/characterStore";
import { resumeAudio } from "@/components/audio/sfx";

/**
 * 또또 컨트롤 — 묘기 + 간식/물 주기.
 * 항상 펼쳐져 있어 버튼 한 번이면 바로 실행된다(따로 메뉴를 열 필요 없음).
 * 우하단에 동화책 톤의 작은 버튼들로.
 */
const TRICKS: { name: TrickName; label: string; emoji: string }[] = [
  { name: "sit", label: "앉아", emoji: "🪑" },
  { name: "lieDown", label: "엎드려", emoji: "🛏️" },
  { name: "shake", label: "손", emoji: "🤝" },
  { name: "jump", label: "점프", emoji: "🦘" },
  { name: "spin", label: "뱅글", emoji: "🌀" },
  { name: "roll", label: "데굴", emoji: "🤸" },
  { name: "bang", label: "빵야", emoji: "💥" },
];

const FEEDS: { name: FeedKind; label: string; emoji: string }[] = [
  { name: "treat", label: "간식", emoji: "🦴" },
  { name: "water", label: "물", emoji: "💧" },
];

export function TrickBar() {
  const btn =
    "flex items-center gap-1.5 rounded-full border border-clay/40 bg-cream/95 px-3 py-1.5 font-display text-sm text-ink shadow-md transition-transform hover:-translate-y-0.5 hover:bg-white";

  return (
    <div className="pointer-events-auto fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
      {/* 간식 · 물 주기 */}
      <div className="flex gap-2">
        {FEEDS.map((f) => (
          <button
            key={f.name}
            type="button"
            onClick={() => {
              resumeAudio();
              characterStore.feed(f.name);
            }}
            className={btn}
          >
            <span className="text-base">{f.emoji}</span>
            {f.label}
          </button>
        ))}
      </div>

      {/* 묘기 (항상 펼침) */}
      <div className="grid grid-cols-2 gap-2">
        {TRICKS.map((t) => (
          <button
            key={t.name}
            type="button"
            onClick={() => {
              resumeAudio();
              characterStore.playTrick(t.name);
            }}
            className={btn}
          >
            <span className="text-base">{t.emoji}</span>
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}
