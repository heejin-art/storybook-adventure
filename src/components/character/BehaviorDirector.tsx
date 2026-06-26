"use client";

import { useFrame } from "@react-three/fiber";
import { journeyStore } from "@/components/world/journeyStore";
import { worldXAt, WAYPOINTS } from "@/components/world/journeyPath";
import { butterflyState } from "@/components/scenery/butterflyState";
import { characterStore } from "./characterStore";

/**
 * 또또 가이드 행동 디렉터 (살아있는 가이드).
 * --------------------------------------------------
 * 매 프레임 여정 진행도를 보고, 장소/오브젝트 근접에 따라 또또의 행동 비트를 정한다.
 *  - 🌼 꽃밭 근처 + 천천히 → 꽃을 내려다봄(lookFlower)
 *  - 🦋 나비 구간 + 천천히 → 나비를 시선으로 추적(watchButterfly)
 *  - 그 외 → none (이동 상태가 주도)
 * (1단계 비트 2종. 이후 sniff/sit/lookBack을 장소별로 확장.)
 *
 * 또한 스크롤 속도 → 이동 상태(idle/walk/run)도 여기서 갱신.
 */

// 또또 머리 대략 위치(로컬): 몸 앞쪽 위
const HEAD = { x: 0.58, y: 1.18 };

export function BehaviorDirector() {
  useFrame(() => {
    const { progress, velocity } = journeyStore.read();

    // 이동 상태: 속도 기반
    if (velocity < 0.04) characterStore.setLocomotion("idle", 0);
    else if (velocity < 0.55) characterStore.setLocomotion("walk", velocity);
    else characterStore.setLocomotion("run", velocity);

    const slow = velocity < 0.5;
    const nearFlower = Math.abs(progress - WAYPOINTS.flower) < 0.035;
    const nearButterfly =
      Math.abs(progress - WAYPOINTS.butterfly) < 0.06 && butterflyState.visible;
    const nearMushroom = Math.abs(progress - WAYPOINTS.mushroom) < 0.07;

    if (nearMushroom && slow) {
      // 🍄 버섯 냄새 킁킁 (고개 숙이고 코 들썩)
      characterStore.setBehavior("sniff", 0.1, -0.5);
    } else if (nearButterfly && slow) {
      // 나비를 향한 시선 계산 (또또 머리 기준)
      const tottoX = worldXAt(progress);
      const dx = butterflyState.x - (tottoX + HEAD.x);
      const dy = butterflyState.y - HEAD.y;
      const dz = butterflyState.z;
      const yaw = clamp(Math.atan2(dz, Math.max(0.2, dx)), -1, 1);
      const pitch = clamp(Math.atan2(dy, Math.hypot(dx, dz)), -0.6, 1);
      characterStore.setBehavior("watchButterfly", yaw, pitch);
    } else if (nearFlower && slow) {
      // 꽃을 내려다봄
      characterStore.setBehavior("lookFlower", 0.15, -0.7);
    } else {
      characterStore.setBehavior("none", 0, 0);
    }
  });

  return null;
}

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}
