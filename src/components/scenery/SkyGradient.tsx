"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BackSide, Color, Mesh, ShaderMaterial } from "three";
import { journeyStore } from "@/components/world/journeyStore";
import { paletteAt } from "@/components/world/timeOfDay";

/**
 * 페인터리 그라데이션 하늘 — 큰 돔(BackSide)에 셰이더 그라데이션.
 * 단색 배경이 아니라 위→지평선으로 부드럽게 물드는 감성 하늘.
 * 진행도(시간대)에 따라 색이 연속 보간된다. 카메라를 따라다녀 항상 배경에 머문다.
 */
const tmp = new Color();

export function SkyGradient() {
  const mesh = useRef<Mesh>(null);
  const { camera } = useThree();

  const material = useMemo(() => {
    const pal = paletteAt(0);
    return new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new Color(pal.skyTop) },
        midColor: { value: new Color(pal.skyMid) },
        botColor: { value: new Color(pal.skyBot) },
      },
      vertexShader: /* glsl */ `
        varying vec3 vPos;
        void main() {
          vPos = position;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        varying vec3 vPos;
        uniform vec3 topColor;
        uniform vec3 midColor;
        uniform vec3 botColor;
        void main() {
          float h = normalize(vPos).y; // -1..1
          vec3 col = mix(botColor, midColor, smoothstep(-0.15, 0.25, h));
          col = mix(col, topColor, smoothstep(0.2, 0.8, h));
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFrame(() => {
    if (mesh.current) mesh.current.position.copy(camera.position);
    // 시간대 색 보간
    const pal = paletteAt(journeyStore.read().progress);
    const u = material.uniforms;
    (u.topColor.value as Color).lerp(tmp.set(pal.skyTop), 0.04);
    (u.midColor.value as Color).lerp(tmp.set(pal.skyMid), 0.04);
    (u.botColor.value as Color).lerp(tmp.set(pal.skyBot), 0.04);
  });

  return (
    <mesh ref={mesh} material={material} frustumCulled={false}>
      <sphereGeometry args={[80, 32, 16]} />
    </mesh>
  );
}
