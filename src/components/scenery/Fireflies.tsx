"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  Points,
  BufferGeometry,
  Float32BufferAttribute,
  AdditiveBlending,
  PointsMaterial,
} from "three";
import { getGlowTexture } from "./glowTexture";
import { journeyStore } from "@/components/world/journeyStore";

/**
 * 반딧불이 — 초저녁~밤(강·별언덕·귀환)에 떠오르는 따뜻한 빛.
 * 부드럽게 부유하며 깜빡인다. 카메라를 따라다녀 항상 공기 중에.
 */
const COUNT = 70;

export function Fireflies() {
  const ref = useRef<Points>(null);
  const matRef = useRef<PointsMaterial>(null);
  const { camera } = useThree();

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.sin(i * 1.3) * 0.5 + 0.5) * 20 - 10;
      pos[i * 3 + 1] = (Math.sin(i * 2.1) * 0.5 + 0.5) * 3 + 0.5;
      pos[i * 3 + 2] = (Math.sin(i * 3.7) * 0.5 + 0.5) * 9 - 3.5;
    }
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.x = camera.position.x;
    ref.current.position.y = Math.sin(t * 0.4) * 0.4;
    if (matRef.current) {
      const { progress } = journeyStore.read();
      const dusk = Math.max(0, Math.min(1, (progress - 0.62) / 0.08));
      const blink = 0.6 + Math.sin(t * 3.0) * 0.4;
      matRef.current.opacity = dusk * blink;
    }
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={matRef}
        map={getGlowTexture()}
        size={0.22}
        color="#dff2a0"
        transparent
        opacity={0}
        depthWrite={false}
        blending={AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
