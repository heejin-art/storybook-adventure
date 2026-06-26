"use client";

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF, useAnimations } from "@react-three/drei";
import { Group, AnimationAction } from "three";
import { characterStore } from "./characterStore";
import { characterConfig } from "./characterConfig";
import type { AnimationState } from "./animationStates";

/**
 * 실제 또또 GLB 모델용 로더 (현재는 미사용; characterConfig.source = "glb" 일 때 활성).
 * --------------------------------------------------
 * Placeholder와 "완전히 동일한 상태 계약"으로 동작한다.
 * characterConfig.animationClipMap 으로 우리 상태 → GLB 클립 이름을 매핑하므로,
 * 클립 이름이 무엇이든 상위 코드 수정 없이 교체된다.
 *
 * ⚠️ 저작권: 여기에 넣는 GLB는 반드시 본인 소유/직접 제작 모델(또또)이어야 한다.
 *    외부 마켓 모델 사용 시 라이선스를 반드시 확인할 것.
 */
export function GlbModel() {
  const group = useRef<Group>(null);
  const { scene, animations } = useGLTF(characterConfig.modelPath!);
  const { actions } = useAnimations(animations, group);
  const activeAction = useRef<AnimationAction | null>(null);
  const prevState = useRef<AnimationState | null>(null);

  // 상태 → 클립 액션을 부드럽게 크로스페이드
  useFrame(() => {
    const { current } = characterStore.read();
    if (current === prevState.current) return;
    prevState.current = current;

    const clipName = characterConfig.animationClipMap[current];
    const next = actions?.[clipName] ?? null;
    if (next === activeAction.current) return;

    activeAction.current?.fadeOut(0.25);
    if (next) {
      next.reset().fadeIn(0.25).play();
    }
    activeAction.current = next;
  });

  // idle 기본 재생
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
