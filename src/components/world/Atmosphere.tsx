"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { DirectionalLight, AmbientLight, Color, Fog } from "three";
import { journeyStore } from "./journeyStore";
import { paletteAt } from "./timeOfDay";

/**
 * 분위기 리그 — 조명 + 안개(시간대).
 * --------------------------------------------------
 * 진행도에 따라 아침 숲(따뜻·평화) → 버섯숲(서늘·신비)으로 색·빛·안개가 연속 보간된다.
 * 안개로 깊이감과 장소 전환을 부드럽게 감춘다.
 */
const tmp = new Color();

export function Atmosphere() {
  const sun = useRef<DirectionalLight>(null);
  const amb = useRef<AmbientLight>(null);
  const { scene, camera } = useThree();

  if (!scene.fog) {
    const pal = paletteAt(0);
    scene.fog = new Fog(new Color(pal.fog).getHex(), pal.fogNear, pal.fogFar);
    scene.background = new Color(pal.skyBot);
  }

  useFrame(() => {
    const { progress } = journeyStore.read();
    const pal = paletteAt(progress);

    // 안개 색/거리 보간
    const fog = scene.fog as Fog;
    fog.color.lerp(tmp.set(pal.fog), 0.04);
    fog.near += (pal.fogNear - fog.near) * 0.04;
    fog.far += (pal.fogFar - fog.far) * 0.04;
    (scene.background as Color)?.lerp?.(tmp.set(pal.skyBot), 0.04);

    // 해: 위치는 카메라를 따라가고, 색·강도는 시간대 보간
    if (sun.current) {
      sun.current.position.set(camera.position.x + 8, 12 + progress * 3, 6);
      sun.current.target.position.set(camera.position.x, 0, 0);
      sun.current.target.updateMatrixWorld();
      sun.current.color.lerp(tmp.set(pal.sun), 0.04);
      sun.current.intensity += (pal.sunI - sun.current.intensity) * 0.04;
    }
    if (amb.current) {
      amb.current.color.lerp(tmp.set(pal.amb), 0.04);
      amb.current.intensity += (pal.ambI - amb.current.intensity) * 0.04;
    }
  });

  return (
    <>
      <ambientLight ref={amb} intensity={0.78} color="#fff4e2" />
      <hemisphereLight args={["#fdf6e3", "#a9cf9f", 0.7]} />
      <directionalLight
        ref={sun}
        position={[8, 13, 6]}
        intensity={1.25}
        color="#ffe9c4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={1}
        shadow-camera-far={50}
        shadow-camera-left={-20}
        shadow-camera-right={20}
        shadow-camera-top={20}
        shadow-camera-bottom={-20}
        shadow-bias={-0.0005}
      />
      {/* 역광 림라이트 — 또또를 배경에서 떼어줌 */}
      <directionalLight position={[-6, 5, -8]} intensity={0.4} color="#bfe3f0" />
    </>
  );
}
