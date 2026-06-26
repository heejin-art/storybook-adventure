"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group } from "three";
import { journeyStore } from "@/components/world/journeyStore";

/**
 * 천천히 흐르는 구름 — 부드러운 흰 솜뭉치들이 하늘을 가로지른다.
 * 카메라를 따라다니며 느리게 드리프트. 밤이 되면 옅어진다.
 */
function seeded(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const SPAN = 70;

export function Clouds() {
  const group = useRef<Group>(null);
  const { camera } = useThree();

  const clouds = useMemo(
    () =>
      Array.from({ length: 8 }, (_, i) => ({
        baseX: seeded(i, 1) * SPAN - SPAN / 2,
        y: 9 + seeded(i, 2) * 6,
        z: -22 - seeded(i, 3) * 16,
        scale: 1.6 + seeded(i, 4) * 1.8,
        speed: 0.15 + seeded(i, 5) * 0.2,
        puffs: 3 + Math.floor(seeded(i, 6) * 3),
        key: i,
      })),
    [],
  );

  useFrame((state) => {
    if (!group.current) return;
    group.current.position.x = camera.position.x;
    // 밤엔 구름이 옅어짐
    const { progress } = journeyStore.read();
    const day = 1 - Math.max(0, Math.min(1, (progress - 0.72) / 0.12));
    group.current.children.forEach((c, i) => {
      // 느린 드리프트(좌우 순환)
      const t = state.clock.elapsedTime;
      const drift = ((t * clouds[i].speed) % SPAN) - SPAN / 2;
      c.position.x = ((clouds[i].baseX + drift + SPAN * 1.5) % SPAN) - SPAN / 2;
      c.visible = day > 0.05;
      c.scale.setScalar(clouds[i].scale * (0.6 + day * 0.4));
    });
  });

  return (
    <group ref={group}>
      {clouds.map((cl) => (
        <group key={cl.key} position={[cl.baseX, cl.y, cl.z]}>
          {Array.from({ length: cl.puffs }).map((_, k) => {
            const a = (k / cl.puffs) * Math.PI - Math.PI / 2;
            return (
              <mesh key={k} position={[Math.cos(a) * 1.6, Math.sin(a) * 0.4, 0]} scale={[1, 0.7, 1]}>
                <sphereGeometry args={[1, 14, 12]} />
                <meshStandardMaterial color="#fdfdfb" transparent opacity={0.85} roughness={1} />
              </mesh>
            );
          })}
        </group>
      ))}
    </group>
  );
}
