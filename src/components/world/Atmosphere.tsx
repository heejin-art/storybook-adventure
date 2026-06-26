"use client";

import { useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { DirectionalLight, Color, Fog } from "three";
import { journeyStore } from "./journeyStore";

/**
 * 분위기 리그 — 조명 + 안개(시간대).
 * --------------------------------------------------
 * 1단계는 "아침 숲"의 따뜻하고 평화로운 톤. 진행도에 따라 살짝 더 환해지는 정도로 보간.
 * (이후 단계에서 아침→오후→노을→밤→여명 전체 아크로 확장.)
 * 안개로 깊이감과 장소 전환을 부드럽게 감춘다.
 */

// 아침 팔레트
const FOG_NEAR = new Color("#dcebd6");
const FOG_FAR = new Color("#c6dcc4");

export function Atmosphere() {
  const sun = useRef<DirectionalLight>(null);
  const { scene, camera } = useThree();

  // 안개를 카메라가 보는 깊이에 맞춰 한 번 세팅
  if (!scene.fog) {
    scene.fog = new Fog(FOG_FAR.getHex(), 10, 70);
    scene.background = new Color("#e7f1de");
  }

  useFrame(() => {
    const { progress } = journeyStore.read();
    // 진행에 따라 해가 살짝 높아지고 밝아지는 정도(아침 한정)
    if (sun.current) {
      sun.current.position.set(camera.position.x + 8, 12 + progress * 3, 6);
      sun.current.target.position.set(camera.position.x, 0, 0);
      sun.current.target.updateMatrixWorld();
    }
  });

  return (
    <>
      <ambientLight intensity={0.75} color="#fff4e2" />
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
      {/* 역광 림라이트(차가운 하늘색) — 또또를 배경에서 떼어줌 */}
      <directionalLight position={[-6, 5, -8]} intensity={0.4} color="#bfe3f0" />
    </>
  );
}
