"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Group, Mesh, DoubleSide } from "three";
import { waypointX, WAYPOINTS } from "@/components/world/journeyPath";
import { butterflyState } from "./butterflyState";

/**
 * 나비 — 🦋 나비 구간에서 팔랑팔랑 날아다닌다.
 * 매 프레임 월드 위치를 butterflyState에 기록 → 또또가 시선으로 추적(watchButterfly).
 * 부드러운 리사주 경로 + 날갯짓.
 */
export function Butterfly() {
  const root = useRef<Group>(null);
  const lwing = useRef<Mesh>(null);
  const rwing = useRef<Mesh>(null);
  const { camera } = useThree();
  const anchorX = waypointX(WAYPOINTS.butterfly);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // 앵커 주변을 팔랑팔랑
    const x = anchorX + Math.sin(t * 0.7) * 2.2 + Math.sin(t * 0.31) * 0.8;
    const y = 1.7 + Math.sin(t * 1.3) * 0.5;
    const z = 0.4 + Math.sin(t * 0.9) * 1.2;
    if (root.current) {
      root.current.position.set(x, y, z);
      root.current.rotation.y = Math.sin(t * 0.7) * 0.6 + Math.PI / 2;
    }
    // 날갯짓
    const flap = Math.sin(t * 18) * 0.9;
    if (lwing.current) lwing.current.rotation.y = flap;
    if (rwing.current) rwing.current.rotation.y = -flap;

    // 공유 상태 기록
    butterflyState.x = x;
    butterflyState.y = y;
    butterflyState.z = z;
    butterflyState.visible = Math.abs(camera.position.x - anchorX) < 7;
  });

  return (
    <group ref={root}>
      {/* 몸통 */}
      <mesh>
        <capsuleGeometry args={[0.03, 0.18, 4, 8]} />
        <meshStandardMaterial color="#4a4036" />
      </mesh>
      {/* 날개 */}
      <mesh ref={lwing} position={[0, 0, 0]}>
        <circleGeometry args={[0.16, 12]} />
        <meshStandardMaterial color="#f4a7c0" side={DoubleSide} emissive="#f4a7c0" emissiveIntensity={0.15} />
      </mesh>
      <mesh ref={rwing} position={[0, 0, 0]} rotation={[0, Math.PI, 0]}>
        <circleGeometry args={[0.16, 12]} />
        <meshStandardMaterial color="#f4a7c0" side={DoubleSide} emissive="#f4a7c0" emissiveIntensity={0.15} />
      </mesh>
    </group>
  );
}
