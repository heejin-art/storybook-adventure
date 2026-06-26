"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Group, AnimationAction } from "three";
import { characterStore } from "./characterStore";
import { characterConfig } from "./characterConfig";
import type { AnimationState } from "./animationStates";

/**
 * 실제 또또 GLB 모델용 로더 (현재 미사용; characterConfig.source = "glb" 일 때 활성).
 * --------------------------------------------------
 * Placeholder와 동일한 상태 계약으로 동작. 이동/행동을 GLB 클립으로 매핑한다.
 * 클립 이름은 characterConfig.animationClipMap 에서 조정.
 *
 * ⚠️ 저작권: 본인 소유/직접 제작 모델(또또)만 넣을 것.
 */

/** 스토어 상태 → 표준 클립 키 */
function resolveClip(): AnimationState {
  const s = characterStore.read();
  if (s.behavior === "greet") return "wave";
  if (s.behavior === "sit") return "sit";
  return s.locomotion; // idle / walk / run
}

export function GlbModel() {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(characterConfig.modelPath!);
  const { actions } = useAnimations(animations, group);
  const activeAction = useRef<AnimationAction | null>(null);
  const prevClip = useRef<AnimationState | null>(null);

  useFrame(() => {
    const clip = resolveClip();
    if (clip === prevClip.current) return;
    prevClip.current = clip;

    const clipName = characterConfig.animationClipMap[clip];
    const next = actions?.[clipName] ?? null;
    if (next === activeAction.current) return;

    activeAction.current?.fadeOut(0.25);
    if (next) next.reset().fadeIn(0.25).play();
    activeAction.current = next;
  });

  useEffect(() => {
    const idleName = characterConfig.animationClipMap.idle;
    actions?.[idleName]?.reset().play();
  }, [actions]);

  return (
    <group ref={group} dispose={null}>
      <primitive object={scene} />
    </group>
  );
}
