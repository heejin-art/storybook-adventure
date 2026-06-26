"use client";

import { useMemo } from "react";
import { getToonGradient } from "@/components/character/toonGradient";
import { Marker } from "@/components/world/Marker";
import {
  waypointX,
  WAYPOINTS,
} from "@/components/world/journeyPath";

/**
 * 숲길(Career) — 길을 따라 흩뿌려진 강아지 간식(뼈다귀)들 🦴 + 하나의 요약 마커.
 * 마커를 클릭하면 희진의 커리어 "핵심 요약"이 한 번에 열린다(경력 보기 6개 → 1개로 통합).
 * 또또 테마답게, 길은 간식으로 꾸며진다.
 */
function seeded(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function CareerPath() {
  const start = waypointX(WAYPOINTS.careerStart);
  const end = waypointX(WAYPOINTS.careerEnd);
  const mid = (start + end) / 2;

  const treats = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: start + ((end - start) * (i + 0.5)) / 9 + (seeded(i, 1) - 0.5) * 1.2,
        z: -1.6 + seeded(i, 2) * 3.2,
        rot: seeded(i, 3) * Math.PI,
        s: 0.7 + seeded(i, 4) * 0.5,
        bone: seeded(i, 5) > 0.45,
        key: i,
      })),
    [start, end],
  );

  return (
    <group>
      {treats.map((t) =>
        t.bone ? (
          <Bone key={t.key} x={t.x} z={t.z} rot={t.rot} s={t.s} />
        ) : (
          <Treat key={t.key} x={t.x} z={t.z} rot={t.rot} s={t.s} />
        ),
      )}
      {/* 핵심 요약 마커 (커리어 전체를 한 번에) */}
      <Marker id="career" position={[mid, 1.7, 0]} color="#ffcf8a" label="희진의 길" />
    </group>
  );
}

/** 뼈다귀 간식 🦴 */
function Bone({ x, z, rot, s }: { x: number; z: number; rot: number; s: number }) {
  const grad = getToonGradient();
  return (
    <group position={[x, 0.12 * s, z]} rotation={[0, rot, Math.PI / 2]} scale={s}>
      {/* 가운데 막대 */}
      <mesh castShadow>
        <capsuleGeometry args={[0.05, 0.26, 6, 10]} />
        <meshToonMaterial color="#f3ead8" gradientMap={grad} />
      </mesh>
      {/* 양끝 혹 */}
      {[0.2, -0.2].map((y, i) => (
        <group key={i} position={[0, y, 0]}>
          <mesh position={[0.06, 0, 0]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshToonMaterial color="#f3ead8" gradientMap={grad} />
          </mesh>
          <mesh position={[-0.06, 0, 0]}>
            <sphereGeometry args={[0.07, 10, 10]} />
            <meshToonMaterial color="#f3ead8" gradientMap={grad} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** 작은 간식 🍪 (둥근 갈색 알갱이) */
function Treat({ x, z, rot, s }: { x: number; z: number; rot: number; s: number }) {
  const grad = getToonGradient();
  const c = ["#caa06a", "#b5793f", "#9c6b3f"];
  return (
    <group position={[x, 0.09 * s, z]} rotation={[0, rot, 0]} scale={s}>
      <mesh castShadow>
        <dodecahedronGeometry args={[0.12, 0]} />
        <meshToonMaterial color={c[Math.floor(seeded(x, 7) * c.length)]} gradientMap={grad} />
      </mesh>
    </group>
  );
}
