"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Group, MathUtils } from "three";
import { House } from "@/components/places/home/House";
import { Glow } from "@/components/scenery/Glow";
import { Marker } from "@/components/world/Marker";
import { waypointX, WAYPOINTS } from "@/components/world/journeyPath";
import { characterStore } from "@/components/character/characterStore";

/**
 * 귀환 (Ending) — 처음의 그 작은 집, 깊은 밤.
 * 따뜻한 창문 불빛이 더 강하게 빛나고, 마커를 클릭하면 마지막 인사가 열린다.
 * 또또가 집 안으로 숑 사라지면(엔딩), 창문으로 우릴 빼꼼 내다본다.
 */
export function EndingHome() {
  const x = waypointX(WAYPOINTS.ending);

  return (
    <group position={[x, 0, -3.2]}>
      <House position={[0, 0, 0]} />
      {/* 밤이라 창문 불빛이 더 강하게 */}
      <group position={[-0.75, 1.2, 1.3]}>
        <Glow color="#ffce82" size={2.2} opacity={0.7} pulse={0.5} />
      </group>
      <group position={[0.75, 1.2, 1.3]}>
        <Glow color="#ffce82" size={2.2} opacity={0.7} pulse={0.5} />
      </group>
      <pointLight position={[0, 1.2, 2]} color="#ffcf80" intensity={5} distance={8} decay={2} />
      <Marker id="ending" position={[0, 3.2, 1.2]} color="#ffe0a8" label="마지막 인사" />

      {/* 창문 너머 빼꼼 내다보는 또또 (엔딩에 등장) */}
      <WindowTotto />
    </group>
  );
}

const FLUFF = "#FAF7EF";

/** 창문으로 우릴 바라보는 또또 얼굴 — vanished 일 때 부드럽게 떠오른다. */
function WindowTotto() {
  const grp = useRef<Group>(null);
  const earL = useRef<Group>(null);
  const earR = useRef<Group>(null);

  useFrame((state) => {
    const v = characterStore.read().vanished;
    if (grp.current) {
      const s = MathUtils.lerp(grp.current.scale.x, v ? 1 : 0, 0.07);
      grp.current.scale.setScalar(s);
      grp.current.visible = s > 0.02;
      // 살짝 떠오르며 갸웃갸웃(애교)
      const t = state.clock.elapsedTime;
      grp.current.position.y = 1.15 + Math.sin(t * 1.6) * 0.03;
      grp.current.rotation.z = Math.sin(t * 0.9) * 0.06;
    }
    const t = state.clock.elapsedTime;
    if (earL.current) earL.current.rotation.z = 0.2 + Math.sin(t * 2.2) * 0.12;
    if (earR.current) earR.current.rotation.z = -0.2 - Math.sin(t * 2.2 + 0.4) * 0.12;
  });

  return (
    // 오른쪽 창문 안에서 빼꼼 (집은 z=+ 쪽이 정면 → 카메라를 향함)
    <group ref={grp} position={[0.75, 1.15, 1.18]} scale={0}>
      {/* 머리 솜뭉치 */}
      <mesh>
        <sphereGeometry args={[0.28, 18, 18]} />
        <meshStandardMaterial color={FLUFF} roughness={0.9} />
      </mesh>
      <mesh position={[0, 0.18, -0.02]}>
        <sphereGeometry args={[0.16, 14, 14]} />
        <meshStandardMaterial color={FLUFF} roughness={0.9} />
      </mesh>
      {/* 귀 */}
      <group ref={earL} position={[-0.24, 0.06, 0]}>
        <mesh position={[0, -0.12, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#E7DFCE" roughness={0.9} />
        </mesh>
      </group>
      <group ref={earR} position={[0.24, 0.06, 0]}>
        <mesh position={[0, -0.12, 0]}>
          <sphereGeometry args={[0.12, 12, 12]} />
          <meshStandardMaterial color="#E7DFCE" roughness={0.9} />
        </mesh>
      </group>
      {/* 눈 (우릴 향함, +z) */}
      <mesh position={[-0.1, 0.02, 0.25]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#2c2722" roughness={0.25} />
      </mesh>
      <mesh position={[0.1, 0.02, 0.25]}>
        <sphereGeometry args={[0.045, 12, 12]} />
        <meshStandardMaterial color="#2c2722" roughness={0.25} />
      </mesh>
      {/* 코 */}
      <mesh position={[0, -0.08, 0.28]}>
        <sphereGeometry args={[0.05, 12, 12]} />
        <meshStandardMaterial color="#37322B" roughness={0.4} />
      </mesh>
      {/* 볼터치 */}
      <mesh position={[-0.16, -0.06, 0.22]} scale={[1, 0.7, 0.5]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshBasicMaterial color="#f4a6b6" transparent opacity={0.55} />
      </mesh>
      <mesh position={[0.16, -0.06, 0.22]} scale={[1, 0.7, 0.5]}>
        <sphereGeometry args={[0.06, 10, 10]} />
        <meshBasicMaterial color="#f4a6b6" transparent opacity={0.55} />
      </mesh>
    </group>
  );
}
