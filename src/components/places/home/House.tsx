"use client";

import { getToonGradient } from "@/components/character/toonGradient";

/**
 * 작은 집 — 여정의 출발점이자 About의 장소.
 * 따뜻한 창문 불빛(emissive)으로 "누군가 사는 집"의 온기를 준다. 토ون 셰이딩.
 */
export function House({ position = [0, 0, 0] as [number, number, number] }) {
  const grad = getToonGradient();
  return (
    <group position={position}>
      {/* 몸체 */}
      <mesh position={[0, 1, 0]} castShadow receiveShadow>
        <boxGeometry args={[2.4, 2, 2]} />
        <meshToonMaterial color="#f3e3c6" gradientMap={grad} />
      </mesh>
      {/* 지붕 (사각뿔) */}
      <mesh position={[0, 2.5, 0]} rotation={[0, Math.PI / 4, 0]} castShadow>
        <coneGeometry args={[2.05, 1.2, 4]} />
        <meshToonMaterial color="#c98a6a" gradientMap={grad} />
      </mesh>
      {/* 문 */}
      <mesh position={[0, 0.6, 1.01]}>
        <boxGeometry args={[0.7, 1.2, 0.06]} />
        <meshToonMaterial color="#8c6a4a" gradientMap={grad} />
      </mesh>
      {/* 창문 (따뜻한 불빛) */}
      <mesh position={[-0.75, 1.2, 1.02]}>
        <boxGeometry args={[0.55, 0.55, 0.06]} />
        <meshStandardMaterial
          color="#ffe6a8"
          emissive="#ffcf73"
          emissiveIntensity={0.9}
        />
      </mesh>
      <mesh position={[0.75, 1.2, 1.02]}>
        <boxGeometry args={[0.55, 0.55, 0.06]} />
        <meshStandardMaterial
          color="#ffe6a8"
          emissive="#ffcf73"
          emissiveIntensity={0.9}
        />
      </mesh>
      {/* 작은 굴뚝 */}
      <mesh position={[0.7, 2.7, 0]} castShadow>
        <boxGeometry args={[0.3, 0.7, 0.3]} />
        <meshToonMaterial color="#b07a5c" gradientMap={grad} />
      </mesh>
    </group>
  );
}
