"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Points, BufferGeometry, Float32BufferAttribute } from "three";

/**
 * 떠다니는 빛가루(꽃가루/홀씨) — 햇살 속을 부유하는 작은 입자들.
 * 카메라를 따라다녀 항상 공기 중에 떠 있는 느낌. 은은한 반짝임으로 공간을 살아있게.
 */
const COUNT = 130;

export function Pollen() {
  const ref = useRef<Points>(null);
  const { camera } = useThree();

  const geometry = useMemo(() => {
    const g = new BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.sin(i * 1.3) * 0.5 + 0.5) * 16 - 8;
      pos[i * 3 + 1] = (Math.sin(i * 2.1) * 0.5 + 0.5) * 4 + 0.4;
      pos[i * 3 + 2] = (Math.sin(i * 3.7) * 0.5 + 0.5) * 8 - 3;
    }
    g.setAttribute("position", new Float32BufferAttribute(pos, 3));
    return g;
  }, []);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime;
    ref.current.position.x = camera.position.x;
    // 전체가 천천히 부유
    ref.current.position.y = Math.sin(t * 0.3) * 0.2;
    ref.current.rotation.y = t * 0.02;
  });

  return (
    <points ref={ref} geometry={geometry} frustumCulled={false}>
      <pointsMaterial
        size={0.06}
        color="#fff6d8"
        transparent
        opacity={0.8}
        depthWrite={false}
        sizeAttenuation
      />
    </points>
  );
}
