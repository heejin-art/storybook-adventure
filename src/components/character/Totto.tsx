"use client";

import { useRef } from "react";
import { ThreeEvent, useFrame } from "@react-three/fiber";
import { Group, Mesh, MathUtils } from "three";
import { characterConfig } from "./characterConfig";
import { PlaceholderModel } from "./PlaceholderModel";
import { GlbModel } from "./GlbModel";
import { TottoFX } from "./TottoFX";
import { characterStore } from "./characterStore";
import { playYip, resumeAudio } from "@/components/audio/sfx";

/**
 * 또또 — 월드 캔버스 안에 배치되는 주인공(캔버스 없음).
 * config.source 에 따라 Placeholder / GLB 모델 선택 (교체는 characterConfig 한 곳).
 * 클릭하면 인사(돌아보며 꼬리 흔들기), 드래그하면 쓰다듬어 더 신나함.
 * 간식/물을 주면 앞에 그릇이 나타나고 또또가 고개를 숙여 먹는다.
 */
export function Totto() {
  const Model = characterConfig.source === "glb" ? GlbModel : PlaceholderModel;
  const petting = useRef(false);
  const lastPet = useRef(0);

  const setCursor = (v: string) => {
    if (typeof document !== "undefined") document.body.style.cursor = v;
  };

  const greet = () => {
    resumeAudio();
    characterStore.playGreeting();
    playYip();
  };

  return (
    <group
      scale={characterConfig.scale}
      position={[0, characterConfig.yOffset, 0]}
      onPointerDown={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        petting.current = true;
        greet();
      }}
      onPointerUp={() => {
        petting.current = false;
      }}
      onPointerMove={(e: ThreeEvent<PointerEvent>) => {
        if (!petting.current) return;
        e.stopPropagation();
        // 쓰다듬는 동안 일정 간격으로 인사 비트 갱신 → 계속 신나함
        const now = typeof performance !== "undefined" ? performance.now() : 0;
        if (now - lastPet.current > 500) {
          lastPet.current = now;
          characterStore.playGreeting(900);
        }
      }}
      onPointerOver={() => setCursor("pointer")}
      onPointerOut={() => {
        setCursor("auto");
        petting.current = false;
      }}
    >
      <Model />
      <TottoFX />
      <FeedBowl />
    </group>
  );
}

/** 급식 그릇 — 간식/물을 줄 때만 또또 앞(바닥)에 나타난다. */
function FeedBowl() {
  const grp = useRef<Group>(null);
  const water = useRef<Mesh>(null);
  const treat = useRef<Group>(null);

  useFrame(() => {
    const f = characterStore.read().feeding;
    if (grp.current) {
      const s = MathUtils.lerp(grp.current.scale.x, f ? 1 : 0, 0.2);
      grp.current.scale.setScalar(s);
      grp.current.visible = s > 0.02;
    }
    if (water.current) water.current.visible = f === "water";
    if (treat.current) treat.current.visible = f === "treat";
  });

  return (
    <group ref={grp} position={[0.82, 0, 0.05]} scale={0}>
      {/* 그릇 몸통 */}
      <mesh position={[0, 0.09, 0]} castShadow>
        <cylinderGeometry args={[0.24, 0.17, 0.18, 20]} />
        <meshStandardMaterial color="#d98a5a" roughness={0.6} />
      </mesh>
      {/* 그릇 테두리 */}
      <mesh position={[0, 0.18, 0]}>
        <torusGeometry args={[0.22, 0.03, 8, 24]} />
        <meshStandardMaterial color="#c2724a" roughness={0.6} />
      </mesh>
      {/* 물 */}
      <mesh ref={water} position={[0, 0.16, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 24]} />
        <meshStandardMaterial
          color="#7fc3e0"
          transparent
          opacity={0.85}
          metalness={0.3}
          roughness={0.15}
        />
      </mesh>
      {/* 간식(사료알) */}
      <group ref={treat} position={[0, 0.14, 0]}>
        {(
          [
            [0, 0, 0.06],
            [0.08, 0, -0.05],
            [-0.07, 0.01, -0.03],
            [0.02, 0.05, 0],
          ] as [number, number, number][]
        ).map((p, i) => (
          <mesh key={i} position={p}>
            <dodecahedronGeometry args={[0.052, 0]} />
            <meshStandardMaterial
              color={["#a5703f", "#8a5a30", "#b5824a"][i % 3]}
              roughness={0.75}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
