"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame } from "@react-three/fiber";
import {
  InstancedMesh,
  Object3D,
  PlaneGeometry,
  MeshToonMaterial,
  DoubleSide,
} from "three";
import { getToonGradient } from "@/components/character/toonGradient";
import { JOURNEY_LENGTH } from "@/components/world/journeyPath";

/**
 * 바람에 흔들리는 풀 — 인스턴싱 + 바람 셰이더(vertex sway).
 * 월드의 "살아있음"을 만드는 핵심. 끝이 바람결에 부드럽게 흔들린다.
 * 외부 에셋 없이 코드 생성. 월드 고정 → 카메라가 지나가며 패럴럭스.
 */

function seeded(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const COUNT = 3200;
const BLADE_H = 0.42;

export function Grass() {
  const ref = useRef<InstancedMesh>(null);
  const grad = getToonGradient();
  const timeUniform = useRef({ value: 0 });

  const geometry = useMemo(() => {
    // 가늘고 끝이 뾰족한 풀잎 (윗쪽 정점을 중앙으로 모아 테이퍼)
    const g = new PlaneGeometry(0.07, BLADE_H, 1, 4);
    const pos = g.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const y = pos.getY(i); // -H/2 ~ H/2
      const tNorm = (y + BLADE_H / 2) / BLADE_H; // 0(밑) ~ 1(끝)
      pos.setX(i, pos.getX(i) * (1 - tNorm * 0.92)); // 끝으로 갈수록 좁아짐
    }
    pos.needsUpdate = true;
    g.translate(0, BLADE_H / 2, 0); // 밑동을 바닥(y=0)에 맞춤
    g.computeVertexNormals();
    return g;
  }, []);

  const material = useMemo(() => {
    const m = new MeshToonMaterial({
      color: "#8ec06b",
      gradientMap: grad,
      side: DoubleSide,
    });
    m.onBeforeCompile = (shader: { uniforms: Record<string, { value: unknown }>; vertexShader: string }) => {
      shader.uniforms.uTime = timeUniform.current;
      // uTime을 셰이더 맨 앞에 선언(청크 의존 없이 안전)
      shader.vertexShader = "uniform float uTime;\n" + shader.vertexShader;
      shader.vertexShader = shader.vertexShader.replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
         float windPhase = position.x + position.z;
         #ifdef USE_INSTANCING
           windPhase += instanceMatrix[3].x + instanceMatrix[3].z;
         #endif
         float sway = sin(uTime * 1.5 + windPhase) * 0.07
                    + sin(uTime * 2.7 + windPhase * 1.7) * 0.03;
         transformed.x += sway * smoothstep(0.0, 0.42, transformed.y);`,
      );
    };
    return m;
  }, [grad]);

  useLayoutEffect(() => {
    if (!ref.current) return;
    const dummy = new Object3D();
    for (let i = 0; i < COUNT; i++) {
      // 8개씩 한 무더기(tuft)로 모아 자연스러운 풀숲
      const clump = Math.floor(i / 8);
      const cx = seeded(clump, 1) * (JOURNEY_LENGTH + 12) - 6;
      const cz = -2.6 + seeded(clump, 2) * 5.6; // 길 주변 띠
      const x = cx + (seeded(i, 11) - 0.5) * 0.5;
      const z = cz + (seeded(i, 12) - 0.5) * 0.5;
      const s = 0.7 + seeded(i, 3) * 0.7;
      dummy.position.set(x, 0, z);
      dummy.rotation.y = seeded(i, 4) * Math.PI;
      dummy.scale.set(s, s * (0.8 + seeded(i, 5) * 0.6), s);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  }, []);

  useFrame((state) => {
    timeUniform.current.value = state.clock.elapsedTime;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, COUNT]}
      frustumCulled={false}
    />
  );
}
