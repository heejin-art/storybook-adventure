"use client";

import { useRef, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, MathUtils, Vector3 } from "three";
import { journeyStore } from "./journeyStore";
import { worldXAt } from "./journeyPath";

/**
 * 여정 카메라 리그 — 또또를 항상 화면 중심에 두고 따라가는 사이드뷰.
 * --------------------------------------------------
 * 진행도 → 월드 X. 또또(children)를 그 X에 두고, 카메라도 같은 X를 따라간다.
 * → 또또는 화면 중앙에 머물고, 배경(월드에 고정된 풍경)은 깊이별 패럴럭스로 흐른다.
 * 부드러운 lerp로 "카메라가 미끄러지듯 이동"하는 느낌.
 */

const CAM_HEIGHT = 1.75;
const CAM_DIST = 7.2;
const LOOK_Y = 1.05;
// 카메라를 또또보다 앞(+X)에 두어, 또또가 화면 왼쪽-중앙에 오고 진행방향(오른쪽)에 여백이 생김
const AHEAD = 1.1;

export function JourneyRig({ children }: { children: ReactNode }) {
  const follow = useRef<Group>(null);
  const { camera } = useThree();
  const lookAt = useRef(new Vector3());
  const smoothX = useRef(0); // 또또·카메라가 공유하는 부드러운 위치

  useFrame(() => {
    const { progress } = journeyStore.read();
    const targetX = worldXAt(progress);

    // 진행도를 부드럽게 추적(하나의 값) → 또또와 카메라가 절대 어긋나지 않음
    smoothX.current = MathUtils.lerp(smoothX.current, targetX, 0.12);
    const x = smoothX.current;

    // 또또는 항상 이 위치(= 화면 중앙-왼쪽 고정)
    if (follow.current) follow.current.position.x = x;

    // 카메라는 또또보다 AHEAD만큼 앞 → 진행방향(오른쪽)에 여백
    camera.position.x = x + AHEAD;
    camera.position.y = MathUtils.lerp(camera.position.y, CAM_HEIGHT, 0.06);
    camera.position.z = MathUtils.lerp(camera.position.z, CAM_DIST, 0.06);

    lookAt.current.set(camera.position.x, LOOK_Y, 0);
    camera.lookAt(lookAt.current);
  });

  return <group ref={follow}>{children}</group>;
}
