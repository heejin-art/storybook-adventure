"use client";

import { useMemo, useRef, useLayoutEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import {
  InstancedMesh,
  Object3D,
  PlaneGeometry,
  MeshBasicMaterial,
  DoubleSide,
  Color,
} from "three";

/**
 * 떨어지는 나뭇잎 — 천천히 흩날리며 내려오는 작은 잎들.
 * 카메라 주변을 따라다녀 항상 공기 중에 흩날린다. 공간에 생동감과 깊이를 더한다.
 */
const COUNT = 36;
const COLORS = ["#a7cf86", "#c9d98a", "#e7c47a", "#d8a060"];

function seeded(i: number, s: number) {
  const x = Math.sin(i * 12.9898 + s * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

export function Leaves() {
  const ref = useRef<InstancedMesh>(null);
  const { camera } = useThree();

  const geometry = useMemo(() => {
    const g = new PlaneGeometry(0.16, 0.1);
    return g;
  }, []);
  const material = useMemo(
    () =>
      new MeshBasicMaterial({
        vertexColors: false,
        side: DoubleSide,
        transparent: true,
        opacity: 0.92,
      }),
    [],
  );

  // 잎별 상태(낙하 위상)
  const state = useMemo(
    () =>
      Array.from({ length: COUNT }, (_, i) => ({
        x: (seeded(i, 1) - 0.5) * 22,
        y: seeded(i, 2) * 8,
        z: (seeded(i, 3) - 0.5) * 10,
        speed: 0.3 + seeded(i, 4) * 0.5,
        swayAmp: 0.4 + seeded(i, 5) * 0.8,
        swayFreq: 0.6 + seeded(i, 6) * 0.9,
        spin: (seeded(i, 7) - 0.5) * 2,
        phase: seeded(i, 8) * 10,
      })),
    [],
  );

  useLayoutEffect(() => {
    if (!ref.current) return;
    const c = new Color();
    for (let i = 0; i < COUNT; i++) {
      c.set(COLORS[i % COLORS.length]);
      ref.current.setColorAt(i, c);
    }
    if (ref.current.instanceColor) ref.current.instanceColor.needsUpdate = true;
  }, []);

  const dummy = useMemo(() => new Object3D(), []);

  useFrame((s, delta) => {
    if (!ref.current) return;
    const t = s.clock.elapsedTime;
    const camX = camera.position.x;
    for (let i = 0; i < COUNT; i++) {
      const st = state[i];
      st.y -= delta * st.speed;
      if (st.y < -0.5) st.y = 8; // 위로 리셋(순환)
      const sway = Math.sin(t * st.swayFreq + st.phase) * st.swayAmp;
      dummy.position.set(camX + st.x + sway, st.y, st.z);
      dummy.rotation.set(t * st.spin, t * st.spin * 0.7, sway);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
    }
    ref.current.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, COUNT]}
      frustumCulled={false}
    />
  );
}
