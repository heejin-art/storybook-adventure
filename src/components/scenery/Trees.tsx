"use client";

import { useMemo } from "react";
import { Color } from "three";
import { getToonGradient } from "@/components/character/toonGradient";
import { JOURNEY_LENGTH } from "@/components/world/journeyPath";

/**
 * 부드러운 토ون 나무 — 모양·색·기울기·크기를 랜덤화해 같은 나무가 없게.
 * 동글동글한 실루엣(로우폴리 아님). 월드 고정 → 카메라가 지나가며 패럴럭스.
 */

function seeded(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const G1 = new Color("#7fb27a");
const G2 = new Color("#a6cf98");

interface Puff {
  p: [number, number, number];
  r: number;
}
interface TreeData {
  x: number;
  z: number;
  scale: number;
  lean: number;
  color: string;
  trunkH: number;
  puffs: Puff[];
  key: string;
}

function buildTree(i: number, x: number, z: number, scale: number): TreeData {
  // 잎 덩어리 3~5개를 랜덤 배치
  const n = 3 + Math.floor(seeded(i, 20) * 3);
  const puffs: Puff[] = [];
  const trunkH = 1.1 + seeded(i, 21) * 0.8;
  const baseY = trunkH + 0.5;
  puffs.push({ p: [0, baseY + 0.3, 0], r: 0.6 + seeded(i, 22) * 0.25 });
  for (let k = 0; k < n; k++) {
    const a = (k / n) * Math.PI * 2 + seeded(i, 30 + k);
    const rad = 0.35 + seeded(i, 40 + k) * 0.3;
    puffs.push({
      p: [Math.cos(a) * rad, baseY + (seeded(i, 50 + k) - 0.3) * 0.5, Math.sin(a) * rad * 0.6],
      r: 0.4 + seeded(i, 60 + k) * 0.3,
    });
  }
  const c = G1.clone().lerp(G2, seeded(i, 23));
  return {
    x,
    z,
    scale,
    lean: (seeded(i, 24) - 0.5) * 0.18,
    color: `#${c.getHexString()}`,
    trunkH,
    puffs,
    key: `t${i}`,
  };
}

function buildTrees(): TreeData[] {
  const trees: TreeData[] = [];
  let id = 0;
  // 길 뒤쪽 숲
  for (let i = 0; i < 50; i++, id++) {
    const x = seeded(id, 1) * (JOURNEY_LENGTH + 12) - 5;
    const z = -3 - seeded(id, 2) * 8;
    const scale = 0.75 + seeded(id, 3) * 1.0;
    trees.push(buildTree(id, x, z, scale));
  }
  // 앞쪽(전경) 큰 나무 — 깊이 프레이밍
  for (let i = 0; i < 10; i++, id++) {
    const x = 8 + seeded(id, 7) * (JOURNEY_LENGTH - 16);
    const z = 3.2 + seeded(id, 8) * 2.4;
    const scale = 1.3 + seeded(id, 9) * 0.9;
    trees.push(buildTree(id, x, z, scale));
  }
  return trees;
}

export function Trees() {
  const grad = getToonGradient();
  const trees = useMemo(buildTrees, []);

  return (
    <group>
      {trees.map((t) => (
        <group
          key={t.key}
          position={[t.x, 0, t.z]}
          scale={t.scale}
          rotation={[0, seeded(parseInt(t.key.slice(1)), 99) * Math.PI, t.lean]}
        >
          {/* 줄기 */}
          <mesh position={[0, t.trunkH / 2, 0]} castShadow>
            <cylinderGeometry args={[0.11, 0.16, t.trunkH, 8]} />
            <meshToonMaterial color="#9c7b59" gradientMap={grad} />
          </mesh>
          {/* 잎 덩어리들 */}
          {t.puffs.map((p, k) => (
            <mesh key={k} position={p.p} castShadow>
              <sphereGeometry args={[p.r, 16, 16]} />
              <meshToonMaterial color={t.color} gradientMap={grad} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}
