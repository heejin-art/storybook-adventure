"use client";

import { useFrame } from "@react-three/fiber";
import { getToonGradient } from "@/components/character/toonGradient";
import {
  waypointX,
  careerNodeProgress,
} from "@/components/world/journeyPath";
import { journeyStore } from "@/components/world/journeyStore";
import { discoveryStore } from "@/components/world/discoveryStore";
import { careerJourney } from "@/data/career";

/**
 * 숲길(Career Journey) — 길을 따라 선 작은 등불 이정표들.
 * 타임라인이 아니라, 걸으며 자연스럽게 하나씩 만나는 경력.
 * 또또가 이정표에 다가가면 그 경력 한 줄이 발견된다(discovery: career-<i>).
 */
const TOTAL = careerJourney.length;

export function CareerPath() {
  useFrame(() => {
    const { progress } = journeyStore.read();
    let nearest = -1;
    let best = 0.028;
    for (let i = 0; i < TOTAL; i++) {
      const d = Math.abs(progress - careerNodeProgress(i, TOTAL));
      if (d < best) {
        best = d;
        nearest = i;
      }
    }
    if (nearest >= 0) discoveryStore.set(`career-${nearest}`);
    else if ((discoveryStore.getSnapshot() ?? "").startsWith("career-"))
      discoveryStore.set(null);
  });

  return (
    <group>
      {careerJourney.map((_, i) => (
        <Lantern
          key={i}
          x={waypointX(careerNodeProgress(i, TOTAL))}
          z={i % 2 === 0 ? -1.4 : 1.6}
        />
      ))}
    </group>
  );
}

function Lantern({ x, z }: { x: number; z: number }) {
  const grad = getToonGradient();
  return (
    <group position={[x, 0, z]}>
      {/* 기둥 */}
      <mesh position={[0, 0.6, 0]} castShadow>
        <cylinderGeometry args={[0.05, 0.06, 1.2, 6]} />
        <meshToonMaterial color="#7c5c40" gradientMap={grad} />
      </mesh>
      {/* 가로대 */}
      <mesh position={[0.12, 1.15, 0]}>
        <boxGeometry args={[0.3, 0.05, 0.05]} />
        <meshToonMaterial color="#7c5c40" gradientMap={grad} />
      </mesh>
      {/* 등불(따뜻한 빛) */}
      <mesh position={[0.24, 1.0, 0]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial
          color="#ffdf9e"
          emissive="#ffbf57"
          emissiveIntensity={1.4}
        />
      </mesh>
      <pointLight
        position={[0.24, 1.0, 0]}
        color="#ffcf80"
        intensity={6}
        distance={3.5}
        decay={2}
      />
    </group>
  );
}
