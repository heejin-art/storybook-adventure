"use client";

import { useMemo } from "react";
import { getToonGradient } from "@/components/character/toonGradient";
import { JOURNEY_LENGTH, waypointX, WAYPOINTS } from "@/components/world/journeyPath";

/**
 * 작은 들꽃 — 꽃잎 수·크기·높이·색을 랜덤화해 다양하게.
 * 길을 따라 흩뿌려지고 🌼 꽃밭 지점에 모여 핀다. 일부는 키 큰 들꽃.
 */

function seeded(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const PETAL = ["#f6b9c8", "#f7d488", "#c9b6f0", "#f4a6a0", "#fff2c2", "#b8e0f0", "#f3a0c0"];
const CENTER = ["#fbe38e", "#f6c873", "#fff0c0"];

interface FlowerData {
  x: number; z: number; s: number;
  petals: number; petalR: number; stemH: number;
  color: string; center: string; key: string;
}

function build(i: number, x: number, z: number, scale: number): FlowerData {
  return {
    x, z, s: scale,
    petals: 4 + Math.floor(seeded(i, 30) * 3),
    petalR: 0.045 + seeded(i, 31) * 0.03,
    stemH: 0.3 + seeded(i, 32) * 0.45,
    color: PETAL[Math.floor(seeded(i, 33) * PETAL.length)],
    center: CENTER[Math.floor(seeded(i, 34) * CENTER.length)],
    key: `f${i}`,
  };
}

function buildFlowers(): FlowerData[] {
  const out: FlowerData[] = [];
  let id = 0;
  for (let i = 0; i < 85; i++, id++) {
    out.push(build(id, seeded(id, 1) * JOURNEY_LENGTH, -2 + seeded(id, 2) * 4, 0.7 + seeded(id, 3) * 0.7));
  }
  const cx = waypointX(WAYPOINTS.flower);
  for (let i = 0; i < 18; i++, id++) {
    out.push(build(id, cx + (seeded(id, 5) - 0.5) * 3.5, -0.5 + (seeded(id, 6) - 0.5) * 2.6, 0.9 + seeded(id, 7) * 0.6));
  }
  return out;
}

export function Flowers() {
  const grad = getToonGradient();
  const flowers = useMemo(buildFlowers, []);

  return (
    <group>
      {flowers.map((f) => (
        <group key={f.key} position={[f.x, 0, f.z]} scale={f.s}>
          {/* 줄기 */}
          <mesh position={[0, f.stemH / 2, 0]}>
            <cylinderGeometry args={[0.012, 0.014, f.stemH, 5]} />
            <meshToonMaterial color="#6fa86a" gradientMap={grad} />
          </mesh>
          {/* 가운데 */}
          <mesh position={[0, f.stemH + 0.02, 0]}>
            <sphereGeometry args={[0.05, 10, 10]} />
            <meshToonMaterial color={f.center} gradientMap={grad} />
          </mesh>
          {/* 꽃잎 */}
          {Array.from({ length: f.petals }).map((_, p) => {
            const a = (p / f.petals) * Math.PI * 2;
            return (
              <mesh key={p} position={[Math.cos(a) * 0.09, f.stemH + 0.02, Math.sin(a) * 0.09]}>
                <sphereGeometry args={[f.petalR, 8, 8]} />
                <meshToonMaterial color={f.color} gradientMap={grad} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}
