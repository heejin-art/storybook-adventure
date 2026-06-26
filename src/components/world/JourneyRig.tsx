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
  const introT = useRef(0); // 시네마틱 인트로 타이머
  const roll = useRef(0);

  useFrame((state, delta) => {
    const { progress, velocity } = journeyStore.read();
    const t = state.clock.elapsedTime;
    const targetX = worldXAt(progress);

    // 시네마틱 인트로: 처음 ~3.5초 동안 멀리·위에서 천천히 밀려들어옴
    introT.current = Math.min(introT.current + delta, 4);
    const introRaw = 1 - Math.min(introT.current / 3.5, 1);
    const intro = introRaw * introRaw * (3 - 2 * introRaw); // smoothstep

    // 진행도를 부드럽게 추적(하나의 값) → 또또와 카메라가 절대 어긋나지 않음
    smoothX.current = MathUtils.lerp(smoothX.current, targetX, 0.12);
    const x = smoothX.current;

    // 또또는 항상 이 위치(= 화면 중앙-왼쪽 고정)
    if (follow.current) follow.current.position.x = x;

    // 멈춤 호흡(아주 느린 부유) — 정적이지 않게
    const breathY = Math.sin(t * 0.45) * 0.04;
    const breathX = Math.sin(t * 0.27) * 0.05;

    // 속도에 따라 더 앞을 보고(여행감) 카메라가 살짝 뒤로 빠짐(역동감)
    const aheadDyn = AHEAD + velocity * 1.4;
    const distDyn = CAM_DIST + velocity * 0.9;

    camera.position.x = MathUtils.lerp(
      camera.position.x,
      x + aheadDyn + breathX,
      0.1,
    );
    camera.position.y = MathUtils.lerp(
      camera.position.y,
      CAM_HEIGHT + breathY + intro * 1.4,
      0.05,
    );
    camera.position.z = MathUtils.lerp(
      camera.position.z,
      distDyn + intro * 3.2,
      0.04,
    );

    // 시선도 진행방향으로 살짝 끌리고, 미세하게 흔들려 살아있는 느낌
    lookAt.current.set(
      camera.position.x + velocity * 0.4,
      LOOK_Y + Math.sin(t * 0.6) * 0.02,
      0,
    );
    camera.lookAt(lookAt.current);

    // 미세한 카메라 롤(속도 + 느린 호흡) — 시네마틱
    const rollTarget = velocity * 0.03 + Math.sin(t * 0.23) * 0.006;
    roll.current = MathUtils.lerp(roll.current, rollTarget, 0.05);
    camera.rotation.z += roll.current;
  });

  return <group ref={follow}>{children}</group>;
}
