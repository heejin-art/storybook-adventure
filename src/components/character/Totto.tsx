"use client";

import { useRef } from "react";
import { ThreeEvent } from "@react-three/fiber";
import { characterConfig } from "./characterConfig";
import { PlaceholderModel } from "./PlaceholderModel";
import { GlbModel } from "./GlbModel";
import { TottoFX } from "./TottoFX";
import { characterStore } from "./characterStore";
import { playYip, resumeAudio } from "@/components/audio/sfx";

/**
 * 또또 — 월드 캔버스 안에 배치되는 주인공(캔버스 없음).
 * config.source 에 따라 Placeholder / GLB 모델 선택 (교체는 characterConfig 한 곳).
 * 클릭하면 인사(돌아보며 꼬리 흔들기), 드래그하면 쓰다듬어 더 신나함.
 */
export function Totto() {
  const Model = characterConfig.source === "glb" ? GlbModel : PlaceholderModel;
  const petting = useRef(false);
  const lastPet = useRef(0);

  const setCursor = (v: string) => {
    if (typeof document !== "undefined") document.body.style.cursor = v;
  };

  const greet = () => {
    resumeAudio();
    characterStore.playGreeting();
    playYip();
  };

  return (
    <group
      scale={characterConfig.scale}
      position={[0, characterConfig.yOffset, 0]}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        petting.current = true;
        greet();
      }}
      onPointerUp={() => {
        petting.current = false;
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        if (!petting.current) return;
        e.stopPropagation();
        // 쓰다듬는 동안 일정 간격으로 인사 비트 갱신 → 계속 신나함
        const now = typeof performance !== "undefined" ? performance.now() : 0;
        if (now - lastPet.current > 500) {
          lastPet.current = now;
          characterStore.playGreeting(900);
        }
      }}
      onPointerOver={() => setCursor("pointer")}
      onPointerOut={() => {
        setCursor("auto");
        petting.current = false;
      }}
    >
      <Model />
      <TottoFX />
    </group>
  );
}
