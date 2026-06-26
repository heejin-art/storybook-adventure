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
 * 밤하늘 별 — 밤 구간(별언덕·귀환)에서 서서히 떠오른다.
 * 카메라를 따라다니는 큰 돔 위의 부드러운 점들 + 은은한 반짝임.
 */
const COUNT = 320;

export function Stars() {
  const ref = useRef<Points>(null);
  const matRef = useRef<PointsMaterial>(null);
  const { camera } = useThree();

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      // 위쪽 반구에 분포
      const a = Math.sin(i * 1.7) * Math.PI; // -π..π
      const r = 60;
      const el = 0.05 + (Math.sin(i * 2.3) * 0.5 + 0.5) * 0.9; // 고도
      pos[i * 3] = Math.cos(a) * r * Math.cos(el * 1.2);
      pos[i * 3 + 1] = 6 + Math.abs(Math.sin(el * 1.6)) * 48;
      pos[i * 3 + 2] = Math.sin(a) * r * 0.6 - 10;
    }
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((state) => {
    if (ref.current) ref.current.position.x = camera.position.x;
    if (matRef.current) {
      const { progress } = journeyStore.read();
      const night = Math.max(0, Math.min(1, (progress - 0.78) / 0.08));
      const twinkle = 0.85 + Math.sin(state.clock.elapsedTime * 1.5) * 0.15;
      matRef.current.opacity = night * twinkle;
    }
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        ref={matRef}
        map={getGlowTexture()}
        size={0.7}
        color="#fdfbe8"
        transparent
        opacity={0}
        depthWrite={false}
        blending={AdditiveBlending}
        sizeAttenuation
      />
    </points>
  );
}
