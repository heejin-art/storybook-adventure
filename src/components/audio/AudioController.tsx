"use client";

import { useEffect, useRef, useState } from "react";
import { characterStore } from "@/components/character/characterStore";
import {
  playTrickSound,
  resumeAudio,
  setSfxMuted,
} from "./sfx";

/**
 * 오디오 컨트롤러 — 효과음(절차적) + 배경음악(CC0) + 음소거 토글.
 * --------------------------------------------------
 *  - 트릭이 발동되면 절차적 효과음을 재생(characterStore 구독).
 *  - BGM: /audio/bgm.mp3 를 루프 재생(파일이 없으면 조용히 무시).
 *    → 저작권 안전한 CC0 트랙(예: Pixabay Music)을 public/audio/bgm.mp3 로 넣으면 된다.
 *  - 브라우저 자동재생 정책: 첫 사용자 제스처 이후에만 소리가 나므로,
 *    최초 클릭/터치에서 컨텍스트를 깨우고 BGM을 시작한다.
 *  - 우상단 작은 음소거 버튼(동화책 톤)으로 전체 음소거 토글, 선택은 localStorage 유지.
 */

const STORAGE_KEY = "totto-muted";
const BGM_VOLUME = 0.25;

export function AudioController() {
  const [muted, setMuted] = useState(false);
  const bgm = useRef<HTMLAudioElement | null>(null);
  const started = useRef(false);
  const prevTrick = useRef<ReturnType<typeof characterStore.getSnapshot>["trick"]>(null);

  // 저장된 음소거 상태 복원
  useEffect(() => {
    const saved =
      typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY) === "1";
    setMuted(saved);
    setSfxMuted(saved);
  }, []);

  // 트릭 → 효과음
  useEffect(() => {
    const unsub = characterStore.subscribe(() => {
      const { trick } = characterStore.getSnapshot();
      if (trick && trick !== prevTrick.current) playTrickSound(trick);
      prevTrick.current = trick;
    });
    return () => {
      unsub();
    };
  }, []);

  // 첫 사용자 제스처에서 오디오 시작(자동재생 정책)
  useEffect(() => {
    const start = () => {
      if (started.current) return;
      started.current = true;
      resumeAudio();
      const el = bgm.current;
      if (el && !muted) {
        el.volume = BGM_VOLUME;
        el.play().catch(() => {});
      }
    };
    window.addEventListener("pointerdown", start, { once: true });
    window.addEventListener("keydown", start, { once: true });
    return () => {
      window.removeEventListener("pointerdown", start);
      window.removeEventListener("keydown", start);
    };
  }, [muted]);

  const toggle = () => {
    const next = !muted;
    setMuted(next);
    setSfxMuted(next);
    if (typeof window !== "undefined")
      localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
    const el = bgm.current;
    if (el) {
      if (next) {
        el.pause();
      } else {
        resumeAudio();
        el.volume = BGM_VOLUME;
        el.play().catch(() => {});
      }
    }
  };

  return (
    <>
      {/* CC0 BGM — public/audio/bgm.mp3 로 교체. 없으면 조용히 무시됨. */}
      <audio ref={bgm} loop preload="auto" src="/audio/bgm.mp3" />

      <button
        type="button"
        onClick={toggle}
        aria-label={muted ? "소리 켜기" : "소리 끄기"}
        className="pointer-events-auto fixed right-6 top-6 z-40 flex h-11 w-11 items-center justify-center rounded-full border border-clay/40 bg-cream/90 text-lg shadow-md transition-transform hover:scale-105"
      >
        {muted ? "🔇" : "🔊"}
      </button>
    </>
  );
}
