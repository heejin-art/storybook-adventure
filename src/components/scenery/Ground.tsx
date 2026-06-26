"use client";

import { useThree, useFrame } from "@react-three/fiber";
import { useRef } from "react";
import { Mesh } from "three";
import { getToonGradient } from "@/components/character/toonGradient";

/**
 * 바닥 — 또또가 걷는 부드러운 풀밭 평면.
 * 카메라를 따라다녀 무한히 이어지는 듯 보인다. toon 셰이딩으로 페인터리하게.
 */
export function Ground({ color = "#9fc789" }: { color?: string }) {
  const mesh = useRef<Mesh>(null);
  const { camera } = useThree();
  const grad = getToonGradient();

  useFrame(() => {
    if (mesh.current) mesh.current.position.x = camera.position.x;
  });

  return (
    <mesh
      ref={mesh}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0, 0]}
      receiveShadow
    >
      <planeGeometry args={[200, 80, 1, 1]} />
      <meshToonMaterial color={color} gradientMap={grad} />
    </mesh>
  );
}
