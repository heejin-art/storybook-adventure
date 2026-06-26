"use client";

import { useMemo } from "react";
import { getToonGradient } from "@/components/character/toonGradient";
import { JOURNEY_LENGTH, waypointX, WAYPOINTS } from "@/components/world/journeyPath";

/**
 * 작은 들꽃 — 줄기 + 동그란 꽃잎. 파스텔 톤.
 * 길을 따라 흩뿌려지고, 🌼 꽃밭 지점(또또가 멈춰 바라보는 곳)에 모여 핀다.
 */

function seeded(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const PETAL = ["#f6b9c8", "#f7d488", "#c9b6f0", "#f4a6a0", "#fff2c2"];

function buildFlowers() {
  const flowers: { x: number; z: number; s: number; color: string; key: string }[] = [];
  // 길 전체에 드문드문
  for (let i = 0; i < 40; i++) {
    flowers.push({
      x: seeded(i, 1) * JOURNEY_LENGTH,
      z: -1.6 + seeded(i, 2) * 3.4,
      s: 0.7 + seeded(i, 3) * 0.5,
      color: PETAL[Math.floor(seeded(i, 4) * PETAL.length)],
      key: `s${i}`,
    });
  }
  // 🌼 꽃밭: flower 지점에 모여 핀다
  const cx = waypointX(WAYPOINTS.flower);
  for (let i = 0; i < 14; i++) {
    flowers.push({
      x: cx + (seeded(i, 5) - 0.5) * 3,
      z: -0.5 + (seeded(i, 6) - 0.5) * 2.4,
      s: 0.9 + seeded(i, 7) * 0.5,
      color: PETAL[Math.floor(seeded(i, 8) * PETAL.length)],
      key: `c${i}`,
    });
  }
  return flowers;
}

export function Flowers() {
  const grad = getToonGradient();
  const flowers = useMemo(buildFlowers, []);

  return (
    <group>
      {flowers.map((f) => (
        <group key={f.key} position={[f.x, 0, f.z]} scale={f.s}>
          {/* 줄기 */}
          <mesh position={[0, 0.18, 0]}>
            <cylinderGeometry args={[0.012, 0.012, 0.36, 5]} />
            <meshToonMaterial color="#6fa86a" gradientMap={grad} />
          </mesh>
          {/* 꽃잎 (가운데 + 4장) */}
          <mesh position={[0, 0.4, 0]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshToonMaterial color="#fbe38e" gradientMap={grad} />
          </mesh>
          {[0, 1, 2, 3, 4].map((p) => {
            const a = (p / 5) * Math.PI * 2;
            return (
              <mesh
                key={p}
                position={[Math.cos(a) * 0.1, 0.4, Math.sin(a) * 0.1]}
              >
                <sphereGeometry args={[0.05, 8, 8]} />
                <meshToonMaterial color={f.color} gradientMap={grad} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}
