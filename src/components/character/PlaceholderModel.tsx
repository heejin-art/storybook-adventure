"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MathUtils } from "three";
import { characterStore, type BehaviorBeat } from "./characterStore";
import { getToonGradient } from "./toonGradient";

/**
 * Placeholder 또또 — 비숑(Bichon) 스타일, 부드러운 toon 셰이딩.
 * --------------------------------------------------
 * ⚠️ 저작권 안전: 외부 모델/텍스처 0. three.js 기본 도형 + 코드 생성 그라데이션 toon.
 * 측면 프로필(+X 방향으로 전진)로 배치 → 사이드뷰 카메라에서 또또를 따라 여행하는 느낌.
 *
 * 외부에서는 characterStore의 상태(locomotion + behavior + gaze)만 본다.
 * 실제 또또 GLB로 교체해도 동일 계약으로 동작(characterConfig.source = "glb").
 */

const FLUFF = "#FAF7EF";
const FLUFF_SHADE = "#E7DFCE";
const NOSE = "#37322B";

export function PlaceholderModel() {
  const grad = getToonGradient();

  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const snout = useRef<Group>(null);
  const tail = useRef<Mesh>(null);
  const legFL = useRef<Mesh>(null);
  const legFR = useRef<Mesh>(null);
  const legBL = useRef<Mesh>(null);
  const legBR = useRef<Mesh>(null);

  const t = useRef(0);
  const beatT = useRef(0);
  const prevBeat = useRef<BehaviorBeat>("none");

  useFrame((_, delta) => {
    const s = characterStore.read();
    t.current += delta;
    if (s.behavior !== prevBeat.current) {
      prevBeat.current = s.behavior;
      beatT.current = 0;
    }
    beatT.current += delta;
    const time = t.current;

    const isMoving = s.locomotion === "walk" || s.locomotion === "run";
    const isSitting = s.behavior === "sit";
    const gait = s.locomotion === "run" ? 13 : 8.5;
    const speed = isMoving && !isSitting ? gait * (0.6 + s.intensity * 0.8) : 0;

    // ── 다리: 측면에서 앞뒤로 스윙(Z축 회전) ──
    const swing = Math.sin(time * speed) * (s.locomotion === "run" ? 0.7 : 0.5);
    const move = isMoving && !isSitting ? 1 : 0;
    if (legFL.current) legFL.current.rotation.z = swing * move;
    if (legBL.current) legBL.current.rotation.z = -swing * move;
    if (legFR.current) legFR.current.rotation.z = -swing * move;
    if (legBR.current) legBR.current.rotation.z = swing * move;

    // ── 몸통: 걸을 때 바운스, 멈추면 숨쉬기 ──
    if (body.current) {
      const bob = isMoving
        ? Math.abs(Math.sin(time * speed)) * 0.05
        : Math.sin(time * 1.5) * 0.018;
      body.current.position.y = bob;
    }

    // ── 머리: 시선(gaze) + idle 잔잔한 흔들림 ──
    if (head.current) {
      const idleYaw = !isMoving ? Math.sin(time * 0.8) * 0.06 : 0;
      const idlePitch = !isMoving ? Math.sin(time * 1.1) * 0.04 : 0;
      // gazeYaw>0 → 카메라(+Z) 쪽으로 고개를 돌림(사용자 바라보기)
      const targetYaw = s.gazeYaw * 0.9 + idleYaw;
      const targetPitch = -s.gazePitch * 0.7 + idlePitch;
      head.current.rotation.y = MathUtils.lerp(
        head.current.rotation.y,
        targetYaw,
        0.12,
      );
      head.current.rotation.x = MathUtils.lerp(
        head.current.rotation.x,
        targetPitch,
        0.12,
      );
    }

    // ── 킁킁(sniff): 코를 들썩 ──
    if (snout.current) {
      const sniffing = s.behavior === "sniff";
      const wob = sniffing ? Math.sin(beatT.current * 18) * 0.05 : 0;
      snout.current.position.y = MathUtils.lerp(
        snout.current.position.y,
        -0.14 + wob,
        0.3,
      );
    }

    // ── 꼬리: 기분에 따라 흔들기 ──
    if (tail.current) {
      const excited =
        s.behavior === "greet" || s.behavior === "watchButterfly" || isMoving;
      const wagSpeed = s.behavior === "greet" ? 17 : excited ? 11 : 4;
      const wagAmp = s.behavior === "greet" ? 0.7 : 0.45;
      tail.current.rotation.y = Math.sin(time * wagSpeed) * wagAmp;
    }

    if (!root.current) return;

    // ── 앉기(sit): 뒤를 낮추고 살짝 기울임 ──
    const sitDrop = isSitting ? -0.16 : 0;
    const sitTilt = isSitting ? 0.16 : 0;
    // ── 돌아보기/인사: 몸을 카메라 쪽으로 살짝 틀기 ──
    const turn =
      s.behavior === "lookBack" || s.behavior === "greet" ? 0.5 : 0;
    // ── 인사 시 작은 깡총 ──
    const hop =
      s.behavior === "greet"
        ? Math.max(0, Math.sin(beatT.current * 6)) * 0.12
        : 0;

    root.current.position.y = MathUtils.lerp(
      root.current.position.y,
      sitDrop + hop,
      0.18,
    );
    root.current.rotation.z = MathUtils.lerp(
      root.current.rotation.z,
      sitTilt,
      0.12,
    );
    root.current.rotation.y = MathUtils.lerp(
      root.current.rotation.y,
      turn,
      0.1,
    );
  });

  // toon 재질 공통 props
  const fur = { color: FLUFF, gradientMap: grad } as const;
  const furShade = { color: FLUFF_SHADE, gradientMap: grad } as const;

  return (
    <group ref={root} dispose={null}>
      <group ref={body}>
        {/* 몸통 — 길게 누운 솜뭉치(앞=+X). 캡슐 기본축(Y)을 X로 눕힘 */}
        <mesh position={[0, 0.62, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
          <capsuleGeometry args={[0.42, 0.62, 8, 16]} />
          <meshToonMaterial {...fur} />
        </mesh>
        {/* 복슬 puff들 */}
        <Puff p={[0.32, 0.66, 0]} r={0.3} m={fur} />
        <Puff p={[-0.32, 0.64, 0]} r={0.3} m={fur} />
        <Puff p={[0, 0.86, 0]} r={0.26} m={fur} />
        <Puff p={[0, 0.5, 0.24]} r={0.24} m={furShade} />
        <Puff p={[0, 0.5, -0.24]} r={0.24} m={furShade} />

        {/* 머리 — 앞쪽(+X) 위 */}
        <group ref={head} position={[0.58, 1.18, 0]}>
          <Puff p={[0, 0, 0]} r={0.42} m={fur} />
          <Puff p={[0, 0.28, 0]} r={0.24} m={fur} />
          <Puff p={[-0.18, 0.18, 0.22]} r={0.18} m={fur} />
          <Puff p={[-0.18, 0.18, -0.22]} r={0.18} m={fur} />
          {/* 귀 (양옆 복슬) */}
          <Puff p={[-0.05, 0.02, 0.36]} r={0.17} m={furShade} />
          <Puff p={[-0.05, 0.02, -0.36]} r={0.17} m={furShade} />

          {/* 주둥이 (+X) — 킁킁 시 들썩 */}
          <group ref={snout} position={[0.3, -0.14, 0]}>
            <mesh>
              <sphereGeometry args={[0.2, 16, 16]} />
              <meshToonMaterial {...fur} />
            </mesh>
            {/* 코 */}
            <mesh position={[0.2, 0.02, 0]}>
              <sphereGeometry args={[0.07, 12, 12]} />
              <meshToonMaterial color={NOSE} gradientMap={grad} />
            </mesh>
          </group>

          {/* 눈 (측면이라 카메라쪽 한 개가 주로 보임) */}
          <mesh position={[0.22, 0.06, 0.2]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial color={NOSE} />
          </mesh>
          <mesh position={[0.22, 0.06, -0.2]}>
            <sphereGeometry args={[0.055, 12, 12]} />
            <meshBasicMaterial color={NOSE} />
          </mesh>
          {/* 눈 하이라이트 */}
          <mesh position={[0.26, 0.1, 0.22]}>
            <sphereGeometry args={[0.016, 8, 8]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
        </group>

        {/* 꼬리 — 뒤쪽(-X) 복슬 */}
        <mesh ref={tail} position={[-0.6, 0.82, 0]}>
          <sphereGeometry args={[0.19, 14, 14]} />
          <meshToonMaterial {...fur} />
        </mesh>
      </group>

      {/* 다리 4개 — 앞(+X)/뒤(-X), 좌(-Z)/우(+Z) */}
      <Leg refObj={legFL} x={0.28} z={-0.22} m={furShade} />
      <Leg refObj={legFR} x={0.28} z={0.22} m={furShade} />
      <Leg refObj={legBL} x={-0.28} z={-0.22} m={furShade} />
      <Leg refObj={legBR} x={-0.28} z={0.22} m={furShade} />

      {/* 부드러운 가짜 그림자 */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.7, 28]} />
        <meshBasicMaterial color="#2b2620" transparent opacity={0.14} />
      </mesh>
    </group>
  );
}

function Puff({
  p,
  r,
  m,
}: {
  p: [number, number, number];
  r: number;
  m: { color: string; gradientMap: ReturnType<typeof getToonGradient> };
}) {
  return (
    <mesh position={p} castShadow>
      <sphereGeometry args={[r, 16, 16]} />
      <meshToonMaterial {...m} />
    </mesh>
  );
}

/** 다리 하나 — 위쪽(엉덩이/어깨) 관절에서 회전(Z축 스윙). */
function Leg({
  refObj,
  x,
  z,
  m,
}: {
  refObj: React.RefObject<Mesh>;
  x: number;
  z: number;
  m: { color: string; gradientMap: ReturnType<typeof getToonGradient> };
}) {
  return (
    <mesh ref={refObj} position={[x, 0.28, z]} castShadow>
      <capsuleGeometry args={[0.11, 0.3, 6, 10]} />
      <meshToonMaterial {...m} />
    </mesh>
  );
}
