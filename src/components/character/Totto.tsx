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

// 간식 사료 — 그릇에 수북이 쌓이도록
const KIBBLE: [number, number, number][] = [
  [0, 0, 0],
  [0.11, 0, 0.06],
  [-0.1, 0, 0.05],
  [0.05, 0, -0.1],
  [-0.08, 0, -0.09],
  [0.14, 0.01, -0.02],
  [-0.14, 0.01, 0.01],
  [0.02, 0.09, 0.0],
  [0.07, 0.08, 0.06],
  [-0.05, 0.08, -0.04],
];

/** 급식 그릇 — 간식(수북한 사료)/물(찰랑이는 물)을 줄 때만 또또 앞에 크게 나타난다. */
function FeedBowl() {
  const grp = useRef<Group>(null);
  const water = useRef<Group>(null);
  const treat = useRef<Group>(null);
  const waterTop = useRef<Mesh>(null);

  useFrame((state) => {
    const f = characterStore.read().feeding;
    if (grp.current) {
      const s = MathUtils.lerp(grp.current.scale.x, f ? 1 : 0, 0.2);
      grp.current.scale.setScalar(s);
      grp.current.visible = s > 0.02;
    }
    if (water.current) water.current.visible = f === "water";
    if (treat.current) treat.current.visible = f === "treat";
    // 물 찰랑찰랑
    if (waterTop.current && f === "water") {
      waterTop.current.position.y = 0.24 + Math.sin(state.clock.elapsedTime * 4) * 0.005;
    }
  });

  return (
    <group ref={grp} position={[0.86, 0, 0.32]} scale={0}>
      {/* 그릇(납작한 밥그릇) — 바구니처럼 안 보이게 단순하게 */}
      <mesh position={[0, 0.11, 0]} castShadow>
        <cylinderGeometry args={[0.33, 0.22, 0.22, 24]} />
        <meshStandardMaterial color="#cf8050" roughness={0.6} />
      </mesh>
      {/* 안쪽 바닥(움푹) */}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[0.29, 0.29, 0.04, 24]} />
        <meshStandardMaterial color="#b06a40" roughness={0.7} />
      </mesh>

      {/* 물그릇 — 파란 물이 그득히 채워져 옆에서도 보이게(부피) */}
      <group ref={water}>
        {/* 물 덩어리(채워진 부피) */}
        <mesh position={[0, 0.16, 0]}>
          <cylinderGeometry args={[0.28, 0.2, 0.16, 24]} />
          <meshStandardMaterial
            color="#3f9fdc"
            emissive="#2a6fa0"
            emissiveIntensity={0.3}
            transparent
            opacity={0.92}
            metalness={0.3}
            roughness={0.12}
          />
        </mesh>
        {/* 수면(찰랑) */}
        <mesh ref={waterTop} position={[0, 0.24, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.28, 30]} />
          <meshStandardMaterial
            color="#6cc2ee"
            emissive="#3a86bd"
            emissiveIntensity={0.25}
            transparent
            opacity={0.96}
            metalness={0.4}
            roughness={0.08}
          />
        </mesh>
        {/* 물빛 반사 */}
        <mesh position={[0.08, 0.245, 0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.06, 14]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
        </mesh>
      </group>

      {/* 간식 — 사료 한가득(수북이) */}
      <group ref={treat} position={[0, 0.18, 0]}>
        {KIBBLE.map((p, i) => (
          <mesh key={i} position={p} castShadow>
            <dodecahedronGeometry args={[0.07, 0]} />
            <meshStandardMaterial
              color={["#a5703f", "#8a5a30", "#b5824a"][i % 3]}
              roughness={0.8}
            />
          </mesh>
        ))}
      </group>
    </group>
  );
}
