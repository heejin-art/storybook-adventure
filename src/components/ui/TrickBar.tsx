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
  // 모바일: 작은 버튼. 데스크톱(sm+): 기존 크기 그대로.
  const btn =
    "flex shrink-0 items-center gap-1 rounded-full border border-clay/40 bg-cream/95 px-2.5 py-1 font-display text-xs text-ink shadow-md transition-transform hover:-translate-y-0.5 hover:bg-white sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-sm";

  return (
    // 모바일: 화면 하단 가로 전체에 줄바꿈으로 펼침(겹침 방지).
    // 데스크톱(sm+): 기존처럼 우하단 2열 그리드.
    <div className="pointer-events-auto fixed inset-x-0 bottom-1.5 z-40 flex flex-wrap justify-center gap-1.5 px-2 sm:inset-x-auto sm:left-auto sm:right-6 sm:bottom-6 sm:grid sm:grid-cols-2 sm:justify-items-stretch sm:gap-2 sm:px-0">
      {/* 간식 · 물 주기 — 묘기 버튼과 같은 그리드(동일 박스 크기) */}
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

      {/* 묘기 (항상 펼침) */}
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
  );
}
