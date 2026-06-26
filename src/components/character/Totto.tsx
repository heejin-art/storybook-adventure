"use client";

import { ThreeEvent } from "@react-three/fiber";
import { characterConfig } from "./characterConfig";
import { PlaceholderModel } from "./PlaceholderModel";
import { GlbModel } from "./GlbModel";
import { characterStore } from "./characterStore";

/**
 * 또또 — 월드 캔버스 안에 배치되는 주인공(캔버스 없음).
 * config.source 에 따라 Placeholder / GLB 모델 선택 (교체는 characterConfig 한 곳).
 * 클릭하면 인사(돌아보며 꼬리 흔들기).
 */
export function Totto() {
  const Model = characterConfig.source === "glb" ? GlbModel : PlaceholderModel;

  const setCursor = (v: string) => {
    if (typeof document !== "undefined") document.body.style.cursor = v;
  };

  return (
    <group
      scale={characterConfig.scale}
      position={[0, characterConfig.yOffset, 0]}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        characterStore.playGreeting();
      }}
      onPointerOver={() => setCursor("pointer")}
      onPointerOut={() => setCursor("auto")}
    >
      <Model />
    </group>
  );
}
