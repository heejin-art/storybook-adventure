"use client";

import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import { Group, Mesh, MathUtils } from "three";
import { characterStore, type TrickName } from "./characterStore";

/**
 * 또또 트릭 연출 — 성공 시 머리 위로 반짝이/하트가 톡 튀고, 작은 말풍선이 뜬다.
 * Totto 그룹 안에 배치되어 또또를 따라다닌다. (본체 회전과 무관하게 화면 기준 표시)
 */

const COUNT = 14;
const HEAD = { x: 0.42, y: 1.95, z: 0 }; // 머리 위 살짝

// 트릭별 작은 말풍선 문구(동화책 톤)
const WORD: Record<TrickName, string> = {
  jump: "점프!",
  shake: "악수!",
  lieDown: "스르륵…",
  roll: "데구르르~",
  sit: "앉았다!",
  bang: "빵야! 💥",
  spin: "뱅글뱅글~",
};

const COLORS = ["#FFD56B", "#FFB3C7", "#FFE9A8", "#B7E4C7", "#FFC8A2"];

type Particle = {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  life: number; // 남은 수명(초)
  max: number; // 최대 수명
  scale: number;
};

export function TottoFX() {
  const meshes = useRef<(Mesh | null)[]>([]);
  const bubble = useRef<Group>(null);
  const prevTrick = useRef<TrickName | null>(null);
  const bubbleT = useRef(0);
  const [word, setWord] = useState<string | null>(null);
  const prevSleeping = useRef(false);
  const [zzz, setZzz] = useState(false);

  const particles = useMemo<Particle[]>(
    () =>
      Array.from({ length: COUNT }, () => ({
        x: 0,
        y: 0,
        z: 0,
        vx: 0,
        vy: 0,
        vz: 0,
        life: 0,
        max: 1,
        scale: 0,
      })),
    [],
  );

  const burst = () => {
    for (const p of particles) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.2 + Math.random() * 0.5;
      p.x = HEAD.x + Math.cos(a) * 0.1;
      p.y = HEAD.y;
      p.z = HEAD.z + Math.sin(a) * 0.1;
      p.vx = Math.cos(a) * r;
      p.vy = 0.9 + Math.random() * 1.1;
      p.vz = Math.sin(a) * r * 0.6;
      p.max = 0.6 + Math.random() * 0.5;
      p.life = p.max;
      p.scale = 0.06 + Math.random() * 0.06;
    }
  };

  useFrame((_, delta) => {
    const dt = Math.min(delta, 1 / 30);
    const s = characterStore.read();

    // 새 트릭 발동 감지 → 버스트 + 말풍선
    if (s.trick !== prevTrick.current) {
      if (s.trick) {
        burst();
        setWord(WORD[s.trick]);
        bubbleT.current = 1.0; // 표시 시간(초)
      }
      prevTrick.current = s.trick;
    }

    // 파티클 적분(중력 + 페이드)
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      const m = meshes.current[i];
      if (!m) continue;
      if (p.life > 0) {
        p.life -= dt;
        p.vy -= 2.2 * dt; // 중력
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.z += p.vz * dt;
        const k = Math.max(0, p.life / p.max); // 1→0
        const pop = Math.sin((1 - k) * Math.PI * 0.5); // 처음에 톡
        m.visible = true;
        m.position.set(p.x, p.y, p.z);
        m.scale.setScalar(p.scale * (0.4 + pop) * k);
        m.rotation.z += dt * 6;
      } else if (m.visible) {
        m.visible = false;
      }
    }

    // 말풍선 페이드아웃
    if (bubbleT.current > 0) {
      bubbleT.current -= dt;
      if (bubble.current) {
        const a = MathUtils.clamp(bubbleT.current * 2, 0, 1);
        bubble.current.scale.setScalar(MathUtils.lerp(bubble.current.scale.x, 1, 0.3));
        bubble.current.visible = a > 0.01;
      }
      if (bubbleT.current <= 0) setWord(null);
    }

    // 잠들면 💤 표시
    if (s.sleeping !== prevSleeping.current) {
      prevSleeping.current = s.sleeping;
      setZzz(s.sleeping);
    }
  });

  return (
    <group>
      {/* 반짝이 파티클 */}
      {particles.map((_, i) => (
        <mesh
          key={i}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          visible={false}
        >
          <octahedronGeometry args={[1, 0]} />
          <meshBasicMaterial color={COLORS[i % COLORS.length]} />
        </mesh>
      ))}

      {/* 말풍선 — 화면 기준(billboard), 본체 회전과 무관 */}
      {word && (
        <group ref={bubble} position={[HEAD.x, HEAD.y + 0.5, 0]} scale={0.2}>
          <Html center distanceFactor={8} pointerEvents="none" zIndexRange={[20, 0]}>
            <div
              style={{
                whiteSpace: "nowrap",
                fontFamily: "var(--font-display, sans-serif)",
                fontSize: "15px",
                fontWeight: 700,
                color: "#5b4636",
                background: "rgba(255,251,242,0.96)",
                border: "1.5px solid rgba(150,120,90,0.35)",
                borderRadius: "9999px",
                padding: "5px 13px",
                boxShadow: "0 4px 12px rgba(80,60,40,0.18)",
                userSelect: "none",
              }}
            >
              {word}
            </div>
          </Html>
        </group>
      )}

      {/* 잠들면 머리 위로 💤 — 둥실둥실 떠오름 */}
      {zzz && (
        <group position={[HEAD.x + 0.35, HEAD.y + 0.25, 0]}>
          <Html center distanceFactor={9} pointerEvents="none" zIndexRange={[20, 0]}>
            <div
              style={{
                fontSize: "22px",
                userSelect: "none",
                animation: "totto-zzz 2.6s ease-in-out infinite",
              }}
            >
              💤
            </div>
          </Html>
        </group>
      )}
    </group>
  );
}
