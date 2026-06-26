"use client";

import { useRef, useMemo } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { BackSide, Color, Mesh, ShaderMaterial } from "three";

/**
 * 페인터리 그라데이션 하늘 — 큰 돔(BackSide)에 셰이더 그라데이션.
 * 단색 배경이 아니라 위→지평선으로 부드럽게 물드는 감성 하늘.
 * 카메라를 따라다녀 항상 배경에 머문다. 외부 텍스처 없음(셰이더 생성).
 */
export function SkyGradient({
  top = "#bfe0f2",
  middle = "#dff0e4",
  bottom = "#fbf0d8",
}: {
  top?: string;
  middle?: string;
  bottom?: string;
}) {
  const mesh = useRef<Mesh>(null);
  const { camera } = useThree();

  const material = useMemo(() => {
    return new ShaderMaterial({
      side: BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new Color(top) },
        midColor: { value: new Color(middle) },
        botColor: { value: new Color(bottom) },
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
  }, [top, middle, bottom]);

  useFrame(() => {
    if (mesh.current) mesh.current.position.copy(camera.position);
  });

  return (
    <mesh ref={mesh} material={material} frustumCulled={false}>
      <sphereGeometry args={[80, 32, 16]} />
    </mesh>
  );
}
