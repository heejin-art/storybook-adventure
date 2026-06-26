"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { AdditiveBlending, Sprite } from "three";
import { getGlowTexture } from "./glowTexture";

/**
 * 빛 번짐 헤일로 — 카메라를 향하는 가산 스프라이트.
 * 창문·등불·버섯 등 발광체 주위에 부드러운 글로우를 더해 "컨셉아트" 느낌을 낸다.
 * (EffectComposer 블룸 대신 가볍고 안정적인 방식)
 */
export function Glow({
  color = "#ffd98a",
  size = 1.4,
  opacity = 0.6,
  pulse = 0,
}: {
  color?: string;
  size?: number;
  opacity?: number;
  /** >0이면 은은하게 맥동 */
  pulse?: number;
}) {
  const ref = useRef<Sprite>(null);
  const tex = getGlowTexture();

  useFrame((state) => {
    if (pulse > 0 && ref.current) {
      const s = size * (1 + Math.sin(state.clock.elapsedTime * pulse) * 0.08);
      ref.current.scale.set(s, s, s);
    }
  });

  return (
    <sprite ref={ref} scale={[size, size, size]}>
      <spriteMaterial
        map={tex}
        color={color}
        transparent
        opacity={opacity}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}
