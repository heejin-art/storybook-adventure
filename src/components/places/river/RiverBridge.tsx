"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group } from "three";
import { getToonGradient } from "@/components/character/toonGradient";
import { Glow } from "@/components/scenery/Glow";
import { waypointX, WAYPOINTS } from "@/components/world/journeyPath";
import { journeyStore } from "@/components/world/journeyStore";
import { discoveryStore } from "@/components/world/discoveryStore";

/**
 * 강·다리 (Business Story) — 잔잔한 강 + 나무다리 + 윤슬(물빛 반짝임).
 * 또또가 다가가면 사업 이야기가 흐르고(discovery: business),
 * 강 앞에서 잠깐 앉아 물을 바라본다(BehaviorDirector가 'sit' 처리).
 */
export function RiverBridge() {
  const cx = waypointX(WAYPOINTS.river);
  const grad = getToonGradient();

  useFrame(() => {
    const { progress } = journeyStore.read();
    const near = Math.abs(progress - WAYPOINTS.river) < 0.05;
    if (near) discoveryStore.set("business");
    else if (discoveryStore.getSnapshot() === "business")
      discoveryStore.set(null);
  });

  return (
    <group>
      {/* 강물 (앞뒤로 길게 흐르는 잔잔한 수면) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[cx, 0.04, 0]} receiveShadow>
        <planeGeometry args={[6.5, 44]} />
        <meshStandardMaterial
          color="#6fa6c8"
          emissive="#284a64"
          emissiveIntensity={0.2}
          metalness={0.5}
          roughness={0.25}
        />
      </mesh>

      {/* 윤슬 — 수면 위 반짝이는 빛 */}
      <WaterGlints cx={cx} />

      {/* 나무다리 */}
      <group position={[cx, 0, 0]}>
        {/* 상판 */}
        {Array.from({ length: 9 }).map((_, i) => (
          <mesh
            key={i}
            position={[-3.2 + i * 0.8, 0.32, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.6, 0.12, 2.4]} />
            <meshToonMaterial color="#a87c54" gradientMap={grad} />
          </mesh>
        ))}
        {/* 난간 (양쪽) */}
        {[1.15, -1.15].map((z, s) => (
          <group key={s}>
            <mesh position={[0, 0.7, z]}>
              <boxGeometry args={[6.8, 0.1, 0.1]} />
              <meshToonMaterial color="#8c6644" gradientMap={grad} />
            </mesh>
            {[-3, -1.5, 0, 1.5, 3].map((x, p) => (
              <mesh key={p} position={[x, 0.5, z]} castShadow>
                <cylinderGeometry args={[0.07, 0.07, 0.5, 6]} />
                <meshToonMaterial color="#8c6644" gradientMap={grad} />
              </mesh>
            ))}
          </group>
        ))}
      </group>
    </group>
  );
}

function WaterGlints({ cx }: { cx: number }) {
  const g = useRef<Group>(null);
  const glints = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => {
        const r = Math.sin(i * 9.1) * 0.5 + 0.5;
        return {
          x: cx + (Math.sin(i * 3.3) * 0.5 + 0.5 - 0.5) * 5,
          z: (r - 0.5) * 38,
          key: i,
        };
      }),
    [cx],
  );

  useFrame((state) => {
    if (g.current) g.current.position.z = Math.sin(state.clock.elapsedTime * 0.2) * 2;
  });

  return (
    <group ref={g}>
      {glints.map((p) => (
        <group key={p.key} position={[p.x, 0.06, p.z]}>
          <Glow color="#dff2ff" size={0.5} opacity={0.5} pulse={1.6} />
        </group>
      ))}
    </group>
  );
}
