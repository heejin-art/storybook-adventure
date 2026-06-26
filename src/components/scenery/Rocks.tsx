"use client";

import { useMemo } from "react";
import { getToonGradient } from "@/components/character/toonGradient";
import { JOURNEY_LENGTH } from "@/components/world/journeyPath";

/**
 * 작은 바위들 — 길가에 드문드문. 둥글둥글한 토ون 돌로 바닥에 변화를 준다.
 */
function seeded(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const ROCK = ["#9fa693", "#b3b2a2", "#8f9a8c"];

export function Rocks() {
  const grad = getToonGradient();
  const rocks = useMemo(
    () =>
      Array.from({ length: 28 }, (_, i) => ({
        x: seeded(i, 1) * JOURNEY_LENGTH,
        z: -2.5 + seeded(i, 2) * 5,
        s: 0.2 + seeded(i, 3) * 0.4,
        color: ROCK[Math.floor(seeded(i, 4) * ROCK.length)],
        rot: seeded(i, 5) * Math.PI,
        key: i,
      })),
    [],
  );

  return (
    <group>
      {rocks.map((r) => (
        <mesh
          key={r.key}
          position={[r.x, r.s * 0.4, r.z]}
          scale={[r.s, r.s * 0.7, r.s]}
          rotation={[seeded(r.key, 9) * 0.4, r.rot, seeded(r.key, 8) * 0.4]}
          castShadow
          receiveShadow
        >
          <dodecahedronGeometry args={[1, 0]} />
          <meshToonMaterial color={r.color} gradientMap={grad} />
        </mesh>
      ))}
    </group>
  );
}
