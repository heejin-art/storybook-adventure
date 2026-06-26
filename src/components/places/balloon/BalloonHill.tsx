"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import { Glow } from "@/components/scenery/Glow";
import { waypointX, WAYPOINTS } from "@/components/world/journeyPath";
import { journeyStore } from "@/components/world/journeyStore";
import { discoveryStore } from "@/components/world/discoveryStore";

/**
 * 풍선언덕 (오늘뽁) — 노을 하늘에 둥둥 뜬 풍선들.
 * 풍선을 클릭하면 POP(터짐) 하며 오늘뽁 프로젝트가 열린다(discovery: todaypop).
 */
function seeded(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const COLORS = ["#f6859b", "#ffd06b", "#9ad0f0", "#c4a6f0", "#ff9e7a", "#8fe0b0"];

export function BalloonHill() {
  const cx = waypointX(WAYPOINTS.balloon);

  const balloons = useMemo(
    () =>
      Array.from({ length: 9 }, (_, i) => ({
        x: cx + (seeded(i, 1) - 0.5) * 14,
        y: 2.2 + seeded(i, 2) * 2.6,
        z: -2 + seeded(i, 3) * 4,
        color: COLORS[i % COLORS.length],
        scale: 0.7 + seeded(i, 4) * 0.5,
        phase: seeded(i, 5) * 10,
        key: i,
      })),
    [cx],
  );

  // 장소를 벗어나면 todaypop 닫기
  useFrame(() => {
    const { progress } = journeyStore.read();
    if (
      Math.abs(progress - WAYPOINTS.balloon) > 0.08 &&
      discoveryStore.getSnapshot() === "todaypop"
    )
      discoveryStore.set(null);
  });

  return (
    <group>
      {balloons.map(({ key, ...b }) => (
        <Balloon key={key} {...b} />
      ))}
    </group>
  );
}

function Balloon({
  x,
  y,
  z,
  color,
  scale,
  phase,
}: {
  x: number;
  y: number;
  z: number;
  color: string;
  scale: number;
  phase: number;
}) {
  const g = useRef<Group>(null);
  const popped = useRef(0); // 0 정상 ~ 1 터짐
  const popTimer = useRef(0);

  const setCursor = (v: string) => {
    if (typeof document !== "undefined") document.body.style.cursor = v;
  };

  useFrame((state, delta) => {
    if (!g.current) return;
    const t = state.clock.elapsedTime;
    g.current.position.x = x + Math.sin(t * 0.4 + phase) * 0.3;
    g.current.position.y = y + Math.sin(t * 0.7 + phase) * 0.35;
    g.current.position.z = z;
    g.current.rotation.z = Math.sin(t * 0.6 + phase) * 0.1;

    // 터짐 애니메이션 → 잠시 후 복귀
    if (popped.current > 0) {
      popTimer.current += delta;
      if (popTimer.current > 2.5) {
        popped.current = 0;
        popTimer.current = 0;
      }
    }
    const target = popped.current > 0 ? 0.001 : scale;
    const s = MathUtils.lerp(g.current.scale.x, target, 0.4);
    g.current.scale.setScalar(s);
  });

  return (
    <group
      ref={g}
      onClick={(e) => {
        e.stopPropagation();
        discoveryStore.set("todaypop");
        popped.current = 1;
        popTimer.current = 0;
      }}
      onPointerOver={() => setCursor("pointer")}
      onPointerOut={() => setCursor("auto")}
    >
      {/* 풍선(살짝 세로로 긴 타원) */}
      <mesh scale={[1, 1.2, 1]} castShadow>
        <sphereGeometry args={[0.45, 20, 20]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.25}
          roughness={0.35}
        />
      </mesh>
      {/* 매듭 */}
      <mesh position={[0, -0.56, 0]}>
        <coneGeometry args={[0.08, 0.14, 8]} />
        <meshStandardMaterial color={color} />
      </mesh>
      {/* 줄 */}
      <mesh position={[0, -1.35, 0]}>
        <cylinderGeometry args={[0.006, 0.006, 1.5, 4]} />
        <meshBasicMaterial color="#7a6a5a" />
      </mesh>
      {/* 빛 번짐 */}
      <Glow color={color} size={1.5} opacity={0.4} pulse={0.7} />
    </group>
  );
}
