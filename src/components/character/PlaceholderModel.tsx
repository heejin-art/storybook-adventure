"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, Mesh, MathUtils } from "three";
import { characterStore, type BehaviorBeat, type TrickName } from "./characterStore";
import { getToonGradient } from "./toonGradient";

/**
 * Placeholder 또또 — 비숑(Bichon) 스타일, 부드러운 toon 셰이딩.
 * --------------------------------------------------
 * ⚠️ 저작권 안전: 외부 모델/텍스처 0. three.js 기본 도형 + 코드 생성 그라데이션 toon.
 * 측면 프로필(+X 방향으로 전진)로 배치 → 사이드뷰 카메라에서 또또를 따라 여행하는 느낌.
 *
 * 외부에서는 characterStore의 상태(locomotion + behavior + gaze)만 본다.
 * 실제 또또 GLB로 교체해도 동일 계약으로 동작(characterConfig.source = "glb").
 *
 * 고도화 포인트
 *  - 보행: 다리를 엉덩이 관절에서 스윙(대각선 trot) + 몸통 좌우 롤링/상하 바운스
 *  - 관성: 멈출 때 몸이 살짝 쏠렸다 복귀(스무딩)
 *  - 물리: 귀·꼬리에 스프링(오버슈트) → 멈춰도 잠깐 출렁이는 복슬감
 *  - 표정: 신나면 반달눈(^^) + 입 벌려 헥헥 혀
 *  - 그림자: 본체 회전/점프와 분리되어 항상 바닥에 붙고, 높이에 따라 크기·농도 변화
 */

const FLUFF = "#FAF7EF";
const FLUFF_SHADE = "#E7DFCE";
const NOSE = "#37322B";
const TONGUE = "#F4889A";

/** 1차원 스프링 적분기 — target을 향해 가속/감쇠하며 따라감(오버슈트 발생). */
function springStep(
  pos: { current: number },
  vel: { current: number },
  target: number,
  stiffness: number,
  damping: number,
  dt: number,
) {
  const a = (target - pos.current) * stiffness - vel.current * damping;
  vel.current += a * dt;
  pos.current += vel.current * dt;
  return pos.current;
}

export function PlaceholderModel() {
  const grad = getToonGradient();

  const root = useRef<Group>(null);
  const body = useRef<Group>(null);
  const head = useRef<Group>(null);
  const snout = useRef<Group>(null);
  const tongue = useRef<Group>(null);
  const tail = useRef<Mesh>(null);
  const shadow = useRef<Mesh>(null);
  // 다리는 엉덩이/어깨 관절(그룹)에서 스윙 → 자연스러운 보행
  const legFL = useRef<Group>(null);
  const legFR = useRef<Group>(null);
  const legBL = useRef<Group>(null);
  const legBR = useRef<Group>(null);
  const eyeL = useRef<Group>(null);
  const eyeR = useRef<Group>(null);
  const earL = useRef<Group>(null);
  const earR = useRef<Group>(null);
  const stillTime = useRef(0); // 멈춰 있던 시간 → 멈추면 자연스레 플레이어를 봄
  const earTwitchT = useRef(0);
  const nextTwitch = useRef(2);

  const t = useRef(0);
  const beatT = useRef(0);
  const prevBeat = useRef<BehaviorBeat>("none");
  const moveSmooth = useRef(0); // 0~1, 이동 정도(정지 시 부드럽게 0으로)
  const blinkT = useRef(0);
  const nextBlink = useRef(2.5);
  // 가끔 두리번거림(idle glance)
  const glanceT = useRef(0);
  const nextGlance = useRef(3);
  const glanceYaw = useRef(0);
  const prevTrick = useRef<TrickName | null>(null);
  const trickT = useRef(0);
  // 표정/관성 스무딩
  const happy = useRef(0); // 0~1 신난 정도(반달눈·혀)
  const lean = useRef(0); // 가속/감속 관성으로 앞뒤로 쏠림
  const prevMove = useRef(0);
  // 스프링 물리 상태(귀 L/R, 꼬리) — pos=각도, vel=각속도
  const earLpos = useRef(0.18);
  const earLvel = useRef(0);
  const earRpos = useRef(0.18);
  const earRvel = useRef(0);
  const tailPos = useRef(0);
  const tailVel = useRef(0);

  useFrame((state, delta) => {
    const dt = Math.min(delta, 1 / 30); // 스프링 안정화용 클램프
    const s = characterStore.read();
    t.current += delta;
    if (s.behavior !== prevBeat.current) {
      prevBeat.current = s.behavior;
      beatT.current = 0;
    }
    beatT.current += delta;
    // 트릭 타이머
    if (s.trick !== prevTrick.current) {
      prevTrick.current = s.trick;
      trickT.current = 0;
    }
    trickT.current += delta;
    const time = t.current;

    const isMoving = s.locomotion === "walk" || s.locomotion === "run";
    const isSitting = s.behavior === "sit";
    const gait = s.locomotion === "run" ? 13 : 8.5;
    const speed = isMoving && !isSitting ? gait * (0.6 + s.intensity * 0.8) : 0;

    // 이동 정도를 부드럽게(정지 시 다리가 스르르 멈춤)
    const moveTarget = isMoving && !isSitting ? 1 : 0;
    moveSmooth.current += (moveTarget - moveSmooth.current) * Math.min(1, delta * 8);
    const move = moveSmooth.current;

    // 가속/감속 관성 → 앞뒤로 살짝 쏠림(출발 시 뒤로, 멈출 때 앞으로)
    const accel = (move - prevMove.current) / Math.max(dt, 1e-4);
    prevMove.current = move;
    lean.current = MathUtils.lerp(lean.current, MathUtils.clamp(accel * 0.04, -0.12, 0.12), 0.12);

    // ── 다리: 엉덩이 관절에서 앞뒤로 스윙(대각선 trot) + 들어올림 ──
    const phase = time * speed;
    const sw = s.locomotion === "run" ? 0.7 : 0.52;
    // 대각선 쌍(FL+BR / FR+BL)이 함께 → 실제 강아지 종종걸음
    const swingA = Math.sin(phase) * sw * move; // FL, BR
    const swingB = Math.sin(phase + Math.PI) * sw * move; // FR, BL
    // 앞으로 내딛는 순간 발을 살짝 들어 올림(접지감)
    const liftA = Math.max(0, Math.sin(phase)) * 0.12 * move;
    const liftB = Math.max(0, Math.sin(phase + Math.PI)) * 0.12 * move;
    if (legFL.current) {
      legFL.current.rotation.z = swingA;
      legFL.current.position.y = 0.46 + liftA;
    }
    if (legBR.current) {
      legBR.current.rotation.z = swingA;
      legBR.current.position.y = 0.46 + liftA;
    }
    if (legFR.current) {
      legFR.current.rotation.z = swingB;
      legFR.current.position.y = 0.46 + liftB;
    }
    if (legBL.current) {
      legBL.current.rotation.z = swingB;
      legBL.current.position.y = 0.46 + liftB;
    }

    // ── 몸통: 걸을 때 바운스+스쿼시+좌우 롤링, 멈추면 숨쉬기 ──
    if (body.current) {
      const stepBounce = Math.abs(Math.sin(phase)) * 0.05 * move;
      const breathe = Math.sin(time * 1.5) * 0.018 * (1 - move);
      body.current.position.y = stepBounce + breathe;
      // 발 닿을 때 살짝 눌리는 스쿼시(생동감)
      const squash = 1 - Math.abs(Math.cos(phase)) * 0.05 * move;
      body.current.scale.y = squash;
      body.current.scale.x = 1 + (1 - squash) * 0.6;
      // 좌우 롤링(보행 리듬의 절반 주기) + 가속 관성으로 앞뒤 끄덕
      body.current.rotation.x = Math.sin(phase * 0.5) * 0.06 * move;
      body.current.rotation.z = MathUtils.lerp(body.current.rotation.z, lean.current, 0.2);
    }

    // ── 표정: 신난 정도(happy) — 인사/나비/이동/일부 트릭에서 반달눈+혀 ──
    const excitedNow =
      s.behavior === "greet" ||
      s.behavior === "watchButterfly" ||
      s.locomotion === "run" ||
      s.trick === "jump" ||
      s.trick === "spin" ||
      s.trick === "shake";
    // delta*6 를 1로 클램프하지 않으면 프레임이 끊길 때(탭 전환 등) 보간이 발산 →
    // hap 폭주 → 혀/눈 스케일 폭발(거대 혀·검은 스파이크). 반드시 클램프 + [0,1] 제한.
    happy.current = MathUtils.clamp(
      MathUtils.lerp(happy.current, excitedNow ? 1 : 0, Math.min(1, delta * 6)),
      0,
      1,
    );
    const hap = happy.current;

    // ── 눈 깜빡임 + 반달눈(신나면 ^^) ──
    blinkT.current += delta;
    let eyeScaleY = 1;
    if (blinkT.current > nextBlink.current) {
      const into = blinkT.current - nextBlink.current;
      if (into < 0.12) {
        eyeScaleY = 1 - Math.sin((into / 0.12) * Math.PI) * 0.9; // 감았다 뜨기
      } else {
        blinkT.current = 0;
        nextBlink.current = 2 + Math.abs(Math.sin(time * 9.3)) * 4; // 다음 깜빡임까지
      }
    }
    // 신나면 눈을 가늘게(반달 ^^). scale.y만 조절(최소값 보장 → 노멀 행렬 안정).
    const squint = 1 - hap * 0.55;
    const eyeY = Math.max(0.12, eyeScaleY * squint);
    if (eyeL.current) eyeL.current.scale.y = eyeY;
    if (eyeR.current) eyeR.current.scale.y = eyeY;

    // ── 혀: 신나거나 달릴 때 입에서 살짝 나와 헥헥 ──
    if (tongue.current) {
      const pant = hap;
      const out = pant * (0.7 + Math.abs(Math.sin(time * 9)) * 0.3);
      tongue.current.scale.setScalar(MathUtils.lerp(tongue.current.scale.x, out, 0.2));
      tongue.current.position.y = -0.2 - pant * 0.04;
    }

    // 멈춰 있던 시간 → 멈추면 자연스럽게 플레이어(카메라)를 바라봄
    if (!isMoving && s.behavior === "none") stillTime.current += delta;
    else stillTime.current = 0;
    const idleLook = Math.min(stillTime.current / 1.2, 1); // 멈추고 ~1.2초 뒤 정면

    // 가끔 두리번거림(idle glance) — 멈춰 있을 때 고개를 천천히 돌렸다 돌아옴
    glanceT.current += delta;
    if (s.behavior === "none" && !isMoving) {
      if (glanceT.current > nextGlance.current) {
        glanceYaw.current = Math.sin(time * 11.3) * 0.4;
        if (glanceT.current > nextGlance.current + 1.6) {
          glanceT.current = 0;
          nextGlance.current = 3 + Math.abs(Math.sin(time * 7.7)) * 4.5;
          glanceYaw.current = 0;
        }
      }
    } else {
      glanceYaw.current = 0;
    }

    // 멈춰 있을 때 마우스 커서를 눈으로 슬쩍 따라봄(시선 추적)
    const pointerInfluence = idleLook * (s.behavior === "none" ? 1 : 0);
    const pointerYaw = state.pointer.x * 0.28 * pointerInfluence;
    const pointerPitch = state.pointer.y * 0.18 * pointerInfluence;

    // ── 머리: 시선(gaze) + idle 흔들림 + 두리번 + 멈추면 플레이어/커서 보기 ──
    if (head.current) {
      const idleYaw = !isMoving ? Math.sin(time * 0.8) * 0.05 : 0;
      const idlePitch = !isMoving ? Math.sin(time * 1.1) * 0.04 : 0;
      // 걸을 때 보행 리듬에 맞춰 머리 끄덕(상하) — 살아있는 느낌
      const walkNod = Math.sin(phase + 0.5) * 0.05 * move;
      // gazeYaw>0 = 카메라(+Z, 사용자) 쪽을 바라봄. 멈추면 idleLook만큼 정면을 봄
      const targetYaw =
        -s.gazeYaw * 0.9 - idleLook * 0.34 + idleYaw + glanceYaw.current + pointerYaw;
      const targetPitch = -s.gazePitch * 0.7 + idlePitch + walkNod + pointerPitch;
      head.current.rotation.y = MathUtils.lerp(head.current.rotation.y, targetYaw, 0.1);
      head.current.rotation.x = MathUtils.lerp(head.current.rotation.x, targetPitch, 0.1);
    }

    // ── 귀: 스프링 물리 — 걸을 때 펄럭, 멈추면 살랑 + 가끔 쫑긋, 멈춰도 잠깐 출렁 ──
    earTwitchT.current += delta;
    let twitch = 0;
    if (earTwitchT.current > nextTwitch.current) {
      const into = earTwitchT.current - nextTwitch.current;
      if (into < 0.18) twitch = Math.sin((into / 0.18) * Math.PI) * 0.35;
      else {
        earTwitchT.current = 0;
        nextTwitch.current = 1.5 + Math.abs(Math.sin(time * 5.1)) * 4;
      }
    }
    if (earL.current && earR.current) {
      const flap = Math.sin(phase) * 0.34 * move;
      const idleEar = Math.sin(time * 1.5) * 0.07 * (1 - move);
      const flopBack = -move * 0.2;
      // 목표 각도를 스프링으로 따라가 관성/오버슈트 발생
      const earTargetL = 0.18 + flap + idleEar - twitch;
      const earTargetR = 0.18 - flap + idleEar - twitch; // 반대 위상으로 좌우 다르게
      springStep(earLpos, earLvel, earTargetL, 220, 16, dt);
      springStep(earRpos, earRvel, earTargetR, 220, 16, dt);
      earL.current.rotation.z = earLpos.current;
      earR.current.rotation.z = earRpos.current;
      earL.current.rotation.x = MathUtils.lerp(earL.current.rotation.x, flopBack, 0.1);
      earR.current.rotation.x = MathUtils.lerp(earR.current.rotation.x, flopBack, 0.1);
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

    // ── 꼬리: 스프링으로 따라가 탄력 있게 흔들림 ──
    if (tail.current) {
      const excited =
        s.behavior === "greet" || s.behavior === "watchButterfly" || isMoving;
      const wagSpeed = s.behavior === "greet" ? 18 : excited ? 12 : 5.5;
      const wagAmp = s.behavior === "greet" ? 0.8 : excited ? 0.55 : 0.42;
      const wagTarget = Math.sin(time * wagSpeed) * wagAmp;
      springStep(tailPos, tailVel, wagTarget, 320, 12, dt);
      tail.current.rotation.y = tailPos.current;
      // 걸을 때 위아래로 따라 출렁 + 멈춰도 살짝 살랑(2차 모션)
      tail.current.rotation.x =
        Math.sin(phase + 0.6) * 0.22 * move +
        Math.sin(time * 2.0) * 0.06 * (1 - move);
    }

    if (!root.current) return;

    // ── 기본 포즈(앉기/인사/멈춤) ──
    const sitDrop = isSitting ? -0.16 : 0;
    const sitTilt = isSitting ? 0.16 : 0;
    const turn =
      s.behavior === "lookBack" || s.behavior === "greet"
        ? -0.6
        : -idleLook * 0.22;
    const hop =
      s.behavior === "greet"
        ? Math.max(0, Math.sin(beatT.current * 6)) * 0.12
        : 0;
    const idleSway = isSitting ? 0 : Math.sin(time * 0.7) * 0.025 * (1 - move);

    let targetY = sitDrop + hop;
    let targetZ = sitTilt + idleSway;
    let targetYrot = turn;
    let targetXrot = 0;
    let targetZpos = 0;
    let lerpY = 0.18;
    let lerpZ = 0.12;
    let lerpYrot = 0.1;
    let lerpXrot = 0.2;

    // ── 트릭(버튼) 오버라이드 ──
    // 회전형 트릭(데굴·빵야)은 "바닥(원점)"이 아니라 "몸 중심(PIVOT 높이)"을 축으로
    // 굴려야 한다. 원점 기준으로 돌리면 위에 있던 머리가 지면 아래로 내려가 사라지기 때문.
    // 중심을 제자리에 고정하도록 position.y / position.z 를 보정 → 항상 땅 위에서 동작.
    const PIVOT = 0.6;
    const tt = trickT.current;
    const legSet = (z: number) => {
      if (legFL.current) legFL.current.rotation.z = z;
      if (legBL.current) legBL.current.rotation.z = z;
      if (legFR.current) legFR.current.rotation.z = -z;
      if (legBR.current) legBR.current.rotation.z = -z;
    };
    switch (s.trick) {
      case "jump": {
        const p = Math.min(tt / 0.8, 1);
        targetY = Math.sin(p * Math.PI) * 0.7;
        targetZ = 0;
        lerpY = 0.4;
        break;
      }
      case "sit": {
        targetY = -0.12; // 다리가 땅에 닿는 범위 안에서만 내려앉음
        targetZ = 0.22;
        targetYrot = -0.5; // 앉아서 사용자를 봄
        break;
      }
      case "lieDown": {
        targetY = -0.16; // 배가 땅에 닿을 만큼만 (더 내리면 다리가 지면을 뚫음)
        targetZ = 0;
        targetYrot = -0.3;
        legSet(1.35); // 앞다리 앞으로 길게 뻗어 바닥에 엎드림
        break;
      }
      case "bang": {
        // 옆으로 픽 쓰러져 "죽은 척" — 척추(X축) 기준으로 넘어가 땅 위에 눕는다.
        const p = Math.min(tt / 0.5, 1);
        const ang = -1.5 * p;
        targetXrot = ang;
        targetY = PIVOT * (1 - Math.cos(ang)); // 중심 높이 유지 → 가라앉지 않음
        targetZpos = -PIVOT * Math.sin(ang); // 옆으로 밀리지 않게 보정
        lerpXrot = 0.25;
        lerpY = 0.25;
        legSet(0.5); // 다리 쭉 뻗기
        break;
      }
      case "spin": {
        targetYrot = (tt / 1.1) * Math.PI * 2; // 한 바퀴
        lerpYrot = 1;
        targetY = Math.sin((tt / 1.1) * Math.PI) * 0.12;
        break;
      }
      case "roll": {
        // 척추(X축)를 축으로 한 바퀴 굴러 "데굴" — 중심 고정으로 땅 위에서 구른다.
        const ang = (tt / 1.4) * Math.PI * 2;
        targetXrot = ang;
        targetY = PIVOT * (1 - Math.cos(ang));
        targetZpos = -PIVOT * Math.sin(ang);
        lerpXrot = 1;
        lerpY = 1;
        break;
      }
      case "shake": {
        if (legFR.current)
          legFR.current.rotation.z = -1.1 + Math.sin(tt * 11) * 0.32; // 손!
        targetZ = 0.1;
        targetYrot = -0.5;
        break;
      }
      default:
        break;
    }

    root.current.position.y = MathUtils.lerp(root.current.position.y, targetY, lerpY);
    root.current.position.z = MathUtils.lerp(root.current.position.z, targetZpos, lerpY);
    root.current.rotation.z = MathUtils.lerp(root.current.rotation.z, targetZ, lerpZ);
    root.current.rotation.x = MathUtils.lerp(root.current.rotation.x, targetXrot, lerpXrot);
    root.current.rotation.y = MathUtils.lerp(root.current.rotation.y, targetYrot, lerpYrot);

    // ── 그림자: 본체 회전/점프와 분리(루트 밖) → 항상 바닥. 높이에 따라 작고 옅게 ──
    if (shadow.current) {
      const h = Math.max(0, root.current.position.y);
      const sc = MathUtils.clamp(1 - h * 0.55, 0.45, 1.1);
      shadow.current.scale.setScalar(sc);
      const mat = shadow.current.material as { opacity: number };
      mat.opacity = MathUtils.clamp(0.16 - h * 0.07, 0.04, 0.16);
    }
  });

  // toon 재질 공통 props
  const fur = { color: FLUFF, gradientMap: grad } as const;
  const furShade = { color: FLUFF_SHADE, gradientMap: grad } as const;

  return (
    <group dispose={null}>
      {/* 본체 — 트릭으로 회전/점프하는 그룹 */}
      <group ref={root}>
        <group ref={body}>
          {/* 몸통 — 길게 누운 솜뭉치(앞=+X). 캡슐 기본축(Y)을 X로 눕힘 */}
          <mesh position={[0, 0.62, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
            <capsuleGeometry args={[0.42, 0.62, 8, 16]} />
            <meshToonMaterial {...fur} />
          </mesh>
          {/* 복슬 puff들 — 둥글둥글한 비숑 실루엣 */}
          <Puff p={[0.32, 0.66, 0]} r={0.3} m={fur} />
          <Puff p={[-0.32, 0.64, 0]} r={0.3} m={fur} />
          <Puff p={[0, 0.86, 0]} r={0.26} m={fur} />
          <Puff p={[0, 0.5, 0.24]} r={0.24} m={furShade} />
          <Puff p={[0, 0.5, -0.24]} r={0.24} m={furShade} />
          <Puff p={[0.46, 0.52, 0]} r={0.24} m={fur} />
          <Puff p={[-0.46, 0.58, 0]} r={0.27} m={fur} />
          <Puff p={[0.16, 0.36, 0.22]} r={0.19} m={furShade} />
          <Puff p={[0.16, 0.36, -0.22]} r={0.19} m={furShade} />
          <Puff p={[-0.18, 0.92, 0.16]} r={0.18} m={fur} />
          <Puff p={[-0.18, 0.92, -0.16]} r={0.18} m={fur} />

          {/* 머리 — 앞쪽(+X) 위 */}
          <group ref={head} position={[0.58, 1.18, 0]}>
            <Puff p={[0, 0, 0]} r={0.42} m={fur} />
            <Puff p={[0, 0.28, 0]} r={0.24} m={fur} />
            <Puff p={[-0.18, 0.18, 0.22]} r={0.18} m={fur} />
            <Puff p={[-0.18, 0.18, -0.22]} r={0.18} m={fur} />
            {/* 귀 (양옆 복슬) — 위쪽 관절에서 흔들림 */}
            <group ref={earL} position={[-0.05, 0.14, 0.36]}>
              <mesh position={[0, -0.14, 0]} castShadow>
                <sphereGeometry args={[0.17, 14, 14]} />
                <meshToonMaterial color={FLUFF_SHADE} gradientMap={grad} />
              </mesh>
            </group>
            <group ref={earR} position={[-0.05, 0.14, -0.36]}>
              <mesh position={[0, -0.14, 0]} castShadow>
                <sphereGeometry args={[0.17, 14, 14]} />
                <meshToonMaterial color={FLUFF_SHADE} gradientMap={grad} />
              </mesh>
            </group>

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
              {/* 입 (작은 점) */}
              <mesh position={[0.17, -0.11, 0]} scale={[0.7, 0.45, 0.6]}>
                <sphereGeometry args={[0.03, 8, 8]} />
                <meshStandardMaterial color="#6b5648" roughness={0.5} />
              </mesh>
              {/* 혀 — 평소엔 scale 0, 신나면 입 밑으로 나와 헥헥 */}
              <group ref={tongue} position={[0.17, -0.2, 0]} scale={0}>
                <mesh position={[0.04, -0.05, 0]} rotation={[0, 0, -0.3]}>
                  <capsuleGeometry args={[0.045, 0.09, 4, 8]} />
                  <meshStandardMaterial color={TONGUE} roughness={0.4} />
                </mesh>
              </group>
            </group>

            {/* 눈 — 얼굴 정면(+X), 코 기준 좌우 대칭, 중앙보다 아래.
                작게(자연스러운 비숑 비율) + 반짝임 + 깜빡임(그룹 scale.y).
                코[~0.5,-0.12,0]와 두 눈이 삼각형을 이룸. */}
            {/* 표면에 납작하게 걸치도록(scale.x로 눌러 공처럼 돌출 X), 작게 */}
            <group ref={eyeL} position={[0.375, 0.02, 0.15]} scale={[0.6, 1, 1]}>
              <mesh>
                <sphereGeometry args={[0.038, 16, 16]} />
                <meshStandardMaterial color="#2c2722" roughness={0.25} />
              </mesh>
              <mesh position={[0.05, 0.016, 0.012]}>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
            <group ref={eyeR} position={[0.375, 0.02, -0.15]} scale={[0.6, 1, 1]}>
              <mesh>
                <sphereGeometry args={[0.038, 16, 16]} />
                <meshStandardMaterial color="#2c2722" roughness={0.25} />
              </mesh>
              <mesh position={[0.05, 0.016, -0.012]}>
                <sphereGeometry args={[0.012, 8, 8]} />
                <meshBasicMaterial color="#ffffff" />
              </mesh>
            </group>
            {/* 볼터치(발그레) — 눈 아래, 코 양옆 대칭 */}
            <mesh position={[0.32, -0.1, 0.22]} scale={[0.34, 0.3, 0.42]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshBasicMaterial color="#f4a6b6" transparent opacity={0.5} />
            </mesh>
            <mesh position={[0.32, -0.1, -0.22]} scale={[0.34, 0.3, 0.42]}>
              <sphereGeometry args={[0.1, 10, 10]} />
              <meshBasicMaterial color="#f4a6b6" transparent opacity={0.5} />
            </mesh>
          </group>

          {/* 꼬리 — 뒤쪽(-X) 복슬 */}
          <mesh ref={tail} position={[-0.6, 0.82, 0]}>
            <sphereGeometry args={[0.19, 14, 14]} />
            <meshToonMaterial {...fur} />
          </mesh>
        </group>

        {/* 다리 4개 — 앞(+X)/뒤(-X), 좌(-Z)/우(+Z). 엉덩이 관절에서 스윙 */}
        <Leg refObj={legFL} x={0.28} z={-0.22} m={furShade} />
        <Leg refObj={legFR} x={0.28} z={0.22} m={furShade} />
        <Leg refObj={legBL} x={-0.28} z={-0.22} m={furShade} />
        <Leg refObj={legBR} x={-0.28} z={0.22} m={furShade} />
      </group>

      {/* 부드러운 가짜 그림자 — 본체와 분리: 회전/점프해도 항상 바닥에 평평하게 */}
      <mesh
        ref={shadow}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0.02, 0]}
      >
        <circleGeometry args={[0.7, 28]} />
        <meshBasicMaterial color="#2b2620" transparent opacity={0.16} />
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

/** 다리 하나 — 엉덩이/어깨 관절(그룹) 기준으로 회전(Z축 스윙). */
function Leg({
  refObj,
  x,
  z,
  m,
}: {
  refObj: React.RefObject<Group>;
  x: number;
  z: number;
  m: { color: string; gradientMap: ReturnType<typeof getToonGradient> };
}) {
  return (
    <group ref={refObj} position={[x, 0.46, z]}>
      {/* 관절(원점)에서 아래로 늘어진 다리 → 스윙이 자연스러운 보행으로 */}
      <mesh position={[0, -0.18, 0]} castShadow>
        <capsuleGeometry args={[0.11, 0.3, 6, 10]} />
        <meshToonMaterial {...m} />
      </mesh>
    </group>
  );
}
