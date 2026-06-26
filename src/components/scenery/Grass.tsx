"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  InstancedMesh,
  Object3D,
  Color,
  PlaneGeometry,
  MeshToonMaterial,
  DoubleSide,
  Float32BufferAttribute,
} from "three";
import { getToonGradient } from "@/components/character/toonGradient";
import { JOURNEY_LENGTH } from "@/components/world/journeyPath";

/**
 * 바람에 흔들리는 풀 — 곡선 블레이드 + 높이/굵기/색 편차 + 군집 + 결 있는 바람.
 * 끝이 뾰족하게 휘어 자연스럽고, 밑동은 짙고 끝은 밝은 톤(버텍스 컬러).
 * 인스턴싱 + vertex 바람 셰이더. 외부 에셋 0, 월드 고정(카메라가 지나가며 패럴럭스).
 */

function seeded(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const COUNT = 4200;
const BLADE_H = 0.5;
const BASE = new Color("#5f9450");
const TIP = new Color("#b6d886");

export function Grass() {
  const ref = useRef<InstancedMesh>(null);
  const grad = getToonGradient();
  const timeUniform = useRef({ value: 0 });

  // 곡선 + 테이퍼 + 버텍스 그라데이션 블레이드
  const geometry = useMemo(() => {
    const g = new PlaneGeometry(0.085, BLADE_H, 1, 5);
    const pos = g.attributes.position;
    const colors: number[] = [];
    const c = new Color();
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i);
      const tNorm = (y + BLADE_H / 2) / BLADE_H; // 0(밑)~1(끝)
      pos.setX(i, pos.getX(i) * (1 - tNorm * 0.95)); // 끝으로 갈수록 뾰족
      pos.setZ(i, Math.pow(tNorm, 2) * 0.18); // 앞으로 살짝 휨
      c.copy(BASE).lerp(TIP, tNorm); // 밑동 짙음 → 끝 밝음
      colors.push(c.r, c.g, c.b);
    }
    pos.needsUpdate = true;
    g.setAttribute("color", new Float32BufferAttribute(colors, 3));
    g.translate(0, BLADE_H / 2, 0);
    g.computeVertexNormals();
    return g;
  }, []);

  const material = useMemo(() => {
    const m = new MeshToonMaterial({
      gradientMap: grad,
      side: DoubleSide,
      vertexColors: true,
    });
    m.onBeforeCompile = (shader: {
      uniforms: Record<string, { value: unknown }>;
      vertexShader: string;
    }) => {
      shader.uniforms.uTime = timeUniform.current;
      shader.vertexShader = "uniform float uTime;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         float phase = instanceMatrix[3].x * 0.35 + instanceMatrix[3].z * 0.35;
         // 결 있는 바람: 큰 너울(gust) + 잔결
         float gust = sin(uTime * 0.6 + instanceMatrix[3].x * 0.08) * 0.5 + 0.5;
         float sway = sin(uTime * 1.6 + phase) * (0.06 + gust * 0.09)
                    + sin(uTime * 3.1 + phase * 1.7) * 0.025;
         float bend = smoothstep(0.0, ${BLADE_H.toFixed(2)}, transformed.y);
         transformed.x += sway * bend;
         transformed.z += sway * 0.4 * bend;`,
      );
    };
    return m;
  }, [grad]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const dummy = new Object3D();
    const tint = new Color();
    for (let i = 0; i < COUNT; i++) {
      // 8~12개씩 한 무더기(tuft)
      const clump = Math.floor(i / 10);
      const cx = seeded(clump, 1) * (JOURNEY_LENGTH + 14) - 7;
      const cz = -2.8 + seeded(clump, 2) * 6.2;
      const x = cx + (seeded(i, 11) - 0.5) * 0.65;
      const z = cz + (seeded(i, 12) - 0.5) * 0.65;
      const h = 0.6 + seeded(i, 3) * 0.9; // 높이 편차 큼
      const w = 0.8 + seeded(i, 13) * 0.6; // 굵기 편차
      dummy.position.set(x, 0, z);
      dummy.rotation.y = seeded(i, 4) * Math.PI;
      dummy.rotation.z = (seeded(i, 14) - 0.5) * 0.25; // 살짝 기욺
      dummy.scale.set(w, h, w);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      // 무더기별 미세 색 편차(누런/푸른 기운)
      const v = 0.86 + seeded(i, 15) * 0.28;
      tint.setRGB(v, v * (0.95 + seeded(i, 16) * 0.1), v * 0.92);
      ref.current.setColorAt(i, tint);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, []);

  useFrame((state) => {
    timeUniform.current.value = state.clock.elapsedTime;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, COUNT]}
      frustumCulled={false}
      receiveShadow
    />
  );
}
