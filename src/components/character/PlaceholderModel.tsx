"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MathUtils } from "three";
import { characterStore } from "./characterStore";
import type { AnimationState } from "./animationStates";

/**
 * Placeholder 캐릭터 — 비숑(Bichon Frise) 스타일의 아기자기한 강아지("또또" 대역).
 * --------------------------------------------------
 * ⚠️ 저작권 안전: 외부 모델/텍스처를 일절 사용하지 않고, three.js 기본 도형(구/캡슐)을
 *    코드로 절차적 생성한다. 비숑의 "둥글둥글 솜뭉치" 느낌을 여러 개의 둥근 puff로 표현.
 *
 * 실제 또또 GLB가 준비되면 characterConfig.source = "glb" 로 바꾸면 이 컴포넌트는 자동으로 미사용.
 * 외부에서는 표준 애니메이션 상태(idle/walk/run/...)만으로 구동된다.
 */

const FLUFF = "#FAF7EF"; // 비숑의 하얀 털
const FLUFF_SHADE = "#ECE6D7"; // 음영용 살짝 어두운 톤
const NOSE = "#2E2A26"; // 코/눈 (검정)
const PAW = "#F1EADB"; // 발

/** 둥근 솜뭉치(puff) 하나 — 비숑의 복슬복슬함 표현용 */
function Puff({
  position,
  r,
  color = FLUFF,
}: {
  position: [number, number, number];
  r: number;
  color?: string;
}) {
  return (
    <mesh position={position} castShadow>
      <sphereGeometry args={[r, 16, 16]} />
      <meshStandardMaterial color={color} roughness={0.95} />
    </mesh>
  );
}

export function PlaceholderModel() {
  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const tail = useRef<Mesh>(null);
  const legFL = useRef<Mesh>(null);
  const legFR = useRef<Mesh>(null);
  const legBL = useRef<Mesh>(null);
  const legBR = useRef<Mesh>(null);

  // 상태 전환 시각 추적 (one-shot 액션 진행도 계산용)
  const elapsed = useRef(0);
  const prevState = useRef<AnimationState>("idle");

  useFrame((_, delta) => {
    const { current, intensity } = characterStore.read();
    if (current !== prevState.current) {
      prevState.current = current;
      elapsed.current = 0;
    }
    elapsed.current += delta;
    const t = elapsed.current;

    const isMoving = current === "walk" || current === "run";
    const gait = current === "run" ? 14 : 9;
    const stride = current === "run" ? 0.7 : 0.45;
    const speed = isMoving ? gait * (0.6 + intensity * 0.8) : 0;

    // 다리 스윙 (대각선 위상)
    const swing = Math.sin(t * speed) * stride * (isMoving ? 1 : 0);
    if (legFL.current && legBR.current) {
      legFL.current.rotation.x = swing;
      legBR.current.rotation.x = swing;
    }
    if (legFR.current && legBL.current) {
      legFR.current.rotation.x = -swing;
      legBL.current.rotation.x = -swing;
    }

    // 몸통 상하 바운스 + idle 숨쉬기
    if (body.current) {
      const bob = isMoving
        ? Math.abs(Math.sin(t * speed)) * 0.06
        : Math.sin(t * 1.6) * 0.02;
      body.current.position.y = bob;
      body.current.rotation.z = isMoving ? Math.sin(t * speed) * 0.03 : 0;
    }

    // 머리: idle 시 살짝 갸웃, wave 시 끄덕끄덕
    if (head.current) {
      let tilt = Math.sin(t * 1.2) * 0.05;
      if (current === "wave") tilt = Math.sin(t * 8) * 0.12;
      head.current.rotation.z = tilt;
    }

    // 꼬리 흔들기
    if (tail.current) {
      const wagSpeed =
        current === "tailWag" || current === "wave"
          ? 16
          : isMoving
            ? 10
            : 3.5;
      const wagAmp = current === "tailWag" ? 0.7 : 0.4;
      tail.current.rotation.y = Math.sin(t * wagSpeed) * wagAmp;
    }

    // 앞발 손 흔들기 (wave)
    if (legFR.current && current === "wave") {
      legFR.current.rotation.x = -1.1 + Math.sin(t * 10) * 0.35;
    }

    if (!root.current) return;

    // 점프: one-shot 동안 포물선
    let jumpY = 0;
    if (current === "jump") {
      const p = Math.min(t / 0.7, 1);
      jumpY = Math.sin(p * Math.PI) * 0.55;
    }

    // 앉기: 뒤를 살짝 낮춤
    const sitTilt = current === "sit" ? -0.25 : 0;
    root.current.position.y = MathUtils.lerp(root.current.position.y, jumpY, 0.25);
    root.current.rotation.x = MathUtils.lerp(
      root.current.rotation.x,
      sitTilt,
      0.15,
    );
  });

  return (
    <group ref={root} dispose={null}>
      <group ref={body}>
        {/* 몸통 — 큰 솜뭉치 + 주변 작은 puff로 복슬복슬하게 */}
        <Puff position={[0, 0.66, 0]} r={0.46} />
        <Puff position={[0, 0.66, -0.26]} r={0.4} />
        <Puff position={[0, 0.5, 0.22]} r={0.36} color={FLUFF} />
        <Puff position={[-0.3, 0.62, 0]} r={0.26} color={FLUFF_SHADE} />
        <Puff position={[0.3, 0.62, 0]} r={0.26} color={FLUFF_SHADE} />
        <Puff position={[0, 0.92, -0.05]} r={0.28} />

        {/* 머리 — 비숑 특유의 동그란 솜털 머리 */}
        <group ref={head} position={[0, 1.28, 0.4]}>
          {/* 중심 머리 + 주변 puff (복슬복슬한 윤곽) */}
          <Puff position={[0, 0, 0]} r={0.44} />
          <Puff position={[-0.3, 0.12, 0]} r={0.24} />
          <Puff position={[0.3, 0.12, 0]} r={0.24} />
          <Puff position={[0, 0.32, 0]} r={0.26} />
          <Puff position={[-0.22, -0.18, 0.06]} r={0.2} />
          <Puff position={[0.22, -0.18, 0.06]} r={0.2} />

          {/* 주둥이 (살짝 돌출) */}
          <mesh position={[0, -0.14, 0.34]}>
            <sphereGeometry args={[0.2, 16, 16]} />
            <meshStandardMaterial color={FLUFF} roughness={0.9} />
          </mesh>
          {/* 코 */}
          <mesh position={[0, -0.08, 0.52]}>
            <sphereGeometry args={[0.072, 14, 14]} />
            <meshStandardMaterial color={NOSE} roughness={0.5} />
          </mesh>
          {/* 눈 (까만 단추눈) */}
          <mesh position={[-0.16, 0.04, 0.38]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color={NOSE} />
          </mesh>
          <mesh position={[0.16, 0.04, 0.38]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshStandardMaterial color={NOSE} />
          </mesh>
          {/* 눈 하이라이트 (생기) */}
          <mesh position={[-0.14, 0.07, 0.43]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.18, 0.07, 0.43]}>
            <sphereGeometry args={[0.018, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>

          {/* 귀 — 비숑은 복슬한 늘어진 귀 (작은 puff 덩어리) */}
          <Puff position={[-0.42, -0.08, 0]} r={0.18} color={FLUFF_SHADE} />
          <Puff position={[0.42, -0.08, 0]} r={0.18} color={FLUFF_SHADE} />
        </group>

        {/* 꼬리 — 복슬한 솜뭉치 꼬리 */}
        <mesh ref={tail} position={[0, 0.86, -0.5]}>
          <sphereGeometry args={[0.2, 14, 14]} />
          <meshStandardMaterial color={FLUFF} roughness={0.95} />
        </mesh>
      </group>

      {/* 다리 4개 — 짧고 통통하게 */}
      <Leg refObj={legFL} x={-0.24} z={0.26} />
      <Leg refObj={legFR} x={0.24} z={0.26} />
      <Leg refObj={legBL} x={-0.24} z={-0.26} />
      <Leg refObj={legBR} x={0.24} z={-0.26} />

      {/* 부드러운 가짜 그림자 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <circleGeometry args={[0.62, 24]} />
        <meshBasicMaterial color="#4A4036" transparent opacity={0.12} />
      </mesh>
    </group>
  );
}

/** 다리 하나 — 짧고 둥근 비숑 다리. 회전축이 위쪽 관절에 오도록 position 보정. */
function Leg({
  refObj,
  x,
  z,
}: {
  refObj: React.RefObject<Mesh>;
  x: number;
  z: number;
}) {
  return (
    <mesh ref={refObj} position={[x, 0.26, z]} castShadow>
      <capsuleGeometry args={[0.11, 0.24, 6, 10]} />
      <meshStandardMaterial color={PAW} roughness={0.92} />
    </mesh>
  );
}
