"use client";

import { useMemo } from "react";
import { getToonGradient } from "@/components/character/toonGradient";
import { JOURNEY_LENGTH } from "@/components/world/journeyPath";

/**
 * 부드러운 토ون 나무 — 줄기 + 둥근 잎 덩어리(puff).
 * 면이 도드라지는 로우폴리가 아니라 동글동글한 실루엣. 월드 고정 → 카메라가 지나가며 패럴럭스.
 */

function seeded(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const CANOPY = ["#8fbf86", "#7fb27a", "#a6cf98"];

function buildTrees() {
  const trees = [];
  // 길 뒤쪽으로 늘어선 나무들
  for (let i = 0; i < 26; i++) {
    const x = seeded(i, 1) * (JOURNEY_LENGTH + 10) - 4;
    const z = -3 - seeded(i, 2) * 7; // -3 ~ -10
    const scale = 0.8 + seeded(i, 3) * 0.9;
    const color = CANOPY[Math.floor(seeded(i, 4) * CANOPY.length)];
    trees.push({ x, z, scale, color, key: `b${i}` });
  }
  // 앞쪽(전경) 큰 나무 몇 그루로 깊이 프레이밍
  for (let i = 0; i < 5; i++) {
    const x = 8 + seeded(i, 7) * (JOURNEY_LENGTH - 16);
    const z = 3.5 + seeded(i, 8) * 2;
    const scale = 1.4 + seeded(i, 9) * 0.8;
    trees.push({ x, z, scale, color: "#6fa86a", key: `f${i}` });
  }
  return trees;
}

export function Trees() {
  const grad = getToonGradient();
  const trees = useMemo(buildTrees, []);

  return (
    <group>
      {trees.map((t) => (
        <group key={t.key} position={[t.x, 0, t.z]} scale={t.scale}>
          {/* 줄기 */}
          <mesh position={[0, 0.7, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.16, 1.4, 8]} />
            <meshToonMaterial color="#9c7b59" gradientMap={grad} />
          </mesh>
          {/* 잎 덩어리 */}
          <mesh position={[0, 1.7, 0]} castShadow>
            <sphereGeometry args={[0.7, 16, 16]} />
            <meshToonMaterial color={t.color} gradientMap={grad} />
          </mesh>
          <mesh position={[0.4, 1.4, 0.1]} castShadow>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshToonMaterial color={t.color} gradientMap={grad} />
          </mesh>
          <mesh position={[-0.4, 1.45, -0.1]} castShadow>
            <sphereGeometry args={[0.5, 16, 16]} />
            <meshToonMaterial color={t.color} gradientMap={grad} />
          </mesh>
          <mesh position={[0, 2.2, 0]} castShadow>
            <sphereGeometry args={[0.45, 16, 16]} />
            <meshToonMaterial color={t.color} gradientMap={grad} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
