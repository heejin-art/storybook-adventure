"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import {
  Points,
  BufferGeometry,
  Float32BufferAttribute,
  AdditiveBlending,
} from "three";
import { getToonGradient } from "@/components/character/toonGradient";
import { Glow } from "@/components/scenery/Glow";
import { waypointX, WAYPOINTS } from "@/components/world/journeyPath";
import { journeyStore } from "@/components/world/journeyStore";
import { discoveryStore } from "@/components/world/discoveryStore";

/**
 * 버섯숲(NOTALK) — 빛나는 버섯들과 떠다니는 포자.
 * 신비로운 무드. 큰 버섯을 클릭하면 NOTALK 프로젝트가 열린다(discovery: notalk).
 * 또또는 이 구간에서 버섯 냄새를 킁킁 맡는다(BehaviorDirector가 처리).
 */

function seeded(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const GLOW = ["#7fe0d2", "#9db8ff", "#caa4ff", "#86e0a8"];

export function MushroomGrove() {
  const cx = waypointX(WAYPOINTS.mushroom);
  const grad = getToonGradient();

  // 작은 버섯들 배치
  const minis = useMemo(
    () =>
      Array.from({ length: 11 }, (_, i) => ({
        x: cx + (seeded(i, 1) - 0.5) * 10,
        z: -2 + seeded(i, 2) * 4.2,
        s: 0.5 + seeded(i, 3) * 0.7,
        color: GLOW[Math.floor(seeded(i, 4) * GLOW.length)],
        key: i,
      })),
    [cx],
  );

  // 장소를 벗어나면 notalk 닫기
  useFrame(() => {
    const { progress } = journeyStore.read();
    const inGrove = Math.abs(progress - WAYPOINTS.mushroom) < 0.08;
    if (!inGrove && discoveryStore.getSnapshot() === "notalk")
      discoveryStore.set(null);
  });

  return (
    <group>
      {minis.map((m) => (
        <Mushroom
          key={m.key}
          position={[m.x, 0, m.z]}
          scale={m.s}
          glow={m.color}
          grad={grad}
        />
      ))}

      {/* 큰 버섯 — 클릭하면 NOTALK 열림 */}
      <group position={[cx + 1.2, 0, 0.4]}>
        <Mushroom
          position={[0, 0, 0]}
          scale={1.7}
          glow="#8ad9ff"
          grad={grad}
          clickable
        />
      </group>

      {/* 빛기둥(god ray) — 신비로운 수직 빛 */}
      {[
        { x: cx + 1.2, z: 0.4, c: "#8ad9ff", h: 5.5, r: 0.9 },
        { x: cx - 2.5, z: -0.6, c: "#7fe0d2", h: 4.5, r: 0.7 },
        { x: cx + 3.5, z: 0.2, c: "#caa4ff", h: 4.8, r: 0.7 },
      ].map((b, i) => (
        <mesh key={i} position={[b.x, b.h / 2, b.z]}>
          <coneGeometry args={[b.r, b.h, 12, 1, true]} />
          <meshBasicMaterial
            color={b.c}
            transparent
            opacity={0.1}
            blending={AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
      ))}

      {/* 바닥 안개(haze) — 푸르스름한 미스트 */}
      {[
        { x: cx, z: 0.5 },
        { x: cx - 3, z: -1 },
        { x: cx + 3.5, z: 1 },
        { x: cx + 1.5, z: -1.5 },
      ].map((h, i) => (
        <group key={`h${i}`} position={[h.x, 0.5, h.z]}>
          <Glow color="#9fd6e0" size={5} opacity={0.12} />
        </group>
      ))}

      <Spores cx={cx} />
    </group>
  );
}

function Mushroom({
  position,
  scale,
  glow,
  grad,
  clickable = false,
}: {
  position: [number, number, number];
  scale: number;
  glow: string;
  grad: ReturnType<typeof getToonGradient>;
  clickable?: boolean;
}) {
  const setCursor = (v: string) => {
    if (clickable && typeof document !== "undefined")
      document.body.style.cursor = v;
  };
  return (
    <group
      position={position}
      scale={scale}
      onClick={
        clickable
          ? (e) => {
              e.stopPropagation();
              discoveryStore.set("notalk");
            }
          : undefined
      }
      onPointerOver={() => setCursor("pointer")}
      onPointerOut={() => setCursor("auto")}
    >
      {/* 줄기 */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 0.7, 10]} />
        <meshToonMaterial color="#f3ece0" gradientMap={grad} />
      </mesh>
      {/* 갓(빛남) */}
      <mesh position={[0, 0.72, 0]} castShadow>
        <sphereGeometry args={[0.42, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial
          color={glow}
          emissive={glow}
          emissiveIntensity={clickable ? 0.9 : 0.6}
          roughness={0.6}
        />
      </mesh>
      {/* 점 무늬 */}
      <mesh position={[0.12, 0.85, 0.18]}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
      </mesh>
      {/* 빛 번짐 (모든 버섯) + 큰 버섯엔 점광원 */}
      <group position={[0, 0.72, 0]}>
        <Glow color={glow} size={clickable ? 2.4 : 1.3} opacity={clickable ? 0.7 : 0.45} pulse={clickable ? 1.0 : 0.6} />
      </group>
      {clickable && (
        <pointLight position={[0, 0.8, 0]} color={glow} intensity={6} distance={5} decay={2} />
      )}
    </group>
  );
}

/** 위로 떠오르는 포자 */
function Spores({ cx }: { cx: number }) {
  const ref = useRef<Points>(null);
  const COUNT = 80;
  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = cx + (seeded(i, 7) - 0.5) * 14;
      pos[i * 3 + 1] = seeded(i, 8) * 3.5;
      pos[i * 3 + 2] = (seeded(i, 9) - 0.5) * 6;
    }
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    return g;
  }, [cx]);

  useFrame((state, delta) => {
    if (!ref.current) return;
    const arr = ref.current.geometry.attributes.position
      .array as Float32Array;
    for (let i = 0; i < COUNT; i++) {
      arr[i * 3 + 1] += delta * 0.25;
      if (arr[i * 3 + 1] > 3.6) arr[i * 3 + 1] = 0;
    }
    ref.current.geometry.attributes.position.needsUpdate = true;
    ref.current.rotation.y = state.clock.elapsedTime * 0.03;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.07}
        color="#bff0e6"
        transparent
        opacity={0.8}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
