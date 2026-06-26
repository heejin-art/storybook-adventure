"use client";

import { useMemo } from "react";
import { Shape, DoubleSide } from "three";
import { JOURNEY_LENGTH } from "@/components/world/journeyPath";

/**
 * 패럴럭스 언덕 실루엣 — 원경의 부드러운 능선 레이어들.
 * 로우폴리 면이 아니라 납작하고 감성적인 실루엣 + 대기 원근(뒤로 갈수록 옅음).
 * 월드에 고정되어 카메라가 지나가며 깊이별 패럴럭스를 만든다. (셰이더/코드 생성, 외부 에셋 0)
 */

function hillShape(width: number, baseY: number, amp: number, seed: number) {
  const shape = new Shape();
  const x0 = -20;
  const x1 = width + 20;
  shape.moveTo(x0, -20);
  shape.lineTo(x0, baseY);
  const steps = 40;
  for (let i = 0; i <= steps; i++) {
    const tx = x0 + ((x1 - x0) * i) / steps;
    const y =
      baseY +
      Math.sin(i * 0.5 + seed) * amp +
      Math.sin(i * 0.17 + seed * 2.3) * amp * 0.6;
    shape.lineTo(tx, y);
  }
  shape.lineTo(x1, -20);
  shape.closePath();
  return shape;
}

const LAYERS = [
  { z: -38, baseY: 6.5, amp: 2.4, color: "#cfe3d6", seed: 1.2 },
  { z: -26, baseY: 4.5, amp: 2.0, color: "#b6d6b4", seed: 3.7 },
  { z: -15, baseY: 3.0, amp: 1.7, color: "#9bc795", seed: 6.1 },
];

export function Hills() {
  const layers = useMemo(
    () =>
      LAYERS.map((l) => ({
        ...l,
        shape: hillShape(JOURNEY_LENGTH, l.baseY, l.amp, l.seed),
      })),
    [],
  );

  return (
    <group>
      {layers.map((l, i) => (
        <mesh key={i} position={[0, 0, l.z]}>
          <shapeGeometry args={[l.shape]} />
          <meshBasicMaterial color={l.color} side={DoubleSide} fog />
        </mesh>
      ))}
    </group>
  );
}
