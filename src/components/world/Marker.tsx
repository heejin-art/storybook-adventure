"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh } from "three";
import { Glow } from "@/components/scenery/Glow";
import { ClickHint } from "./ClickHint";
import { discoveryStore } from "./discoveryStore";

/**
 * 발견 마커 — 장소 위에 둥둥 뜬, 클릭 가능한 작은 빛.
 * 펄스 링으로 "눌러볼 수 있다"는 신호를 준다. 클릭하면 해당 콘텐츠가 열림.
 */
export function Marker({
  id,
  position,
  color = "#ffe6a8",
  label = "눌러보기",
}: {
  id: string;
  position: [number, number, number];
  color?: string;
  label?: string;
}) {
  const float = useRef<Group>(null);
  const ring = useRef<Mesh>(null);

  const setCursor = (v: string) => {
    if (typeof document !== "undefined") document.body.style.cursor = v;
  };

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (float.current) float.current.position.y = Math.sin(t * 1.6) * 0.12;
    if (ring.current) {
      const p = 1 + (Math.sin(t * 2.2) * 0.5 + 0.5) * 0.5;
      ring.current.scale.setScalar(p);
      const mat = ring.current.material as { opacity: number };
      mat.opacity = 0.6 - (p - 1) * 0.9;
    }
  });

  return (
    <group
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        discoveryStore.toggle(id);
      }}
      onPointerOver={() => setCursor("pointer")}
      onPointerOut={() => setCursor("auto")}
    >
      <group ref={float}>
        {/* 중심 빛 */}
        <mesh>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} />
        </mesh>
        {/* 펄스 링 */}
        <mesh ref={ring}>
          <torusGeometry args={[0.3, 0.022, 8, 28]} />
          <meshBasicMaterial color={color} transparent opacity={0.6} />
        </mesh>
        <Glow color={color} size={1.4} opacity={0.6} pulse={1.4} />
        <ClickHint label={label} />
      </group>
    </group>
  );
}
