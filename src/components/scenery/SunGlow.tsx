"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { Sprite, AdditiveBlending, Color } from "three";
import { getGlowTexture } from "./glowTexture";
import { journeyStore } from "@/components/world/journeyStore";
import { paletteAt } from "@/components/world/timeOfDay";

/**
 * 햇살 글로우 — 하늘 한쪽에 떠 있는 큰 부드러운 빛.
 * 카메라를 따라다니며, 시간대에 따라 색·세기가 바뀐다(아침 따뜻 → 버섯숲 서늘·약함).
 * "움직이는 컨셉아트"의 공기감을 만든다.
 */
const tmp = new Color();

export function SunGlow() {
  const ref = useRef<Sprite>(null);
  const { camera } = useThree();
  const tex = getGlowTexture();

  useFrame(() => {
    if (!ref.current) return;
    const { progress } = journeyStore.read();
    const pal = paletteAt(progress);
    // 하늘 우상단에 배치(카메라 추적)
    ref.current.position.set(
      camera.position.x + 11,
      9.5,
      -22,
    );
    const mat = ref.current.material;
    mat.color.lerp(tmp.set(pal.sun), 0.04);
    // 버섯숲(어두운 구간)에선 더 옅게
    const targetOpacity = 0.14 + pal.sunI * 0.22;
    mat.opacity += (targetOpacity - mat.opacity) * 0.04;
  });

  return (
    <sprite ref={ref} scale={[19, 19, 19]}>
      <spriteMaterial
        map={tex}
        color="#ffe7bd"
        transparent
        opacity={0.5}
        blending={AdditiveBlending}
        depthWrite={false}
      />
    </sprite>
  );
}
