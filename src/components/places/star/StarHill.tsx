"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, Group } from "three";
import { Glow } from "@/components/scenery/Glow";
import { Marker } from "@/components/world/Marker";
import { waypointX, WAYPOINTS } from "@/components/world/journeyPath";
import { journeyStore } from "@/components/world/journeyStore";

/**
 * 별언덕 (Future) — 밤하늘에 빛나는 별들이 별자리로 이어진다.
 * 다가가면 미래 이야기가 열리고(discovery: future), 또또는 사용자를 돌아본다(director).
 */

// 별자리 별 위치(그룹 로컬). 순서대로 선으로 잇는다.
const STARS: [number, number, number][] = [
  [-4, 2.5, 0],
  [-2.4, 3.6, -0.5],
  [-0.6, 3.1, 0.3],
  [0.8, 4.0, -0.2],
  [2.6, 3.2, 0.4],
  [3.8, 4.2, 0],
];

export function StarHill() {
  const cx = waypointX(WAYPOINTS.star);
  const groupOpacity = useRef(0);
  const root = useRef<Group>(null);

  const lineGeo = useMemo(() => {
    const pts: number[] = [];
    STARS.forEach((p) => pts.push(p[0], p[1], p[2]));
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(pts, 3));
    return g;
  }, []);

  useFrame(() => {
    const { progress } = journeyStore.read();
    // 밤이 되면 별자리가 떠오름
    const vis = Math.max(0, Math.min(1, (progress - 0.8) / 0.06));
    groupOpacity.current += (vis - groupOpacity.current) * 0.05;
    if (root.current) root.current.visible = groupOpacity.current > 0.02;
  });

  return (
    <group>
    <Marker id="future" position={[cx, 2.4, -1]} color="#cfe0ff" label="앞으로의 꿈" />
    <group ref={root} position={[cx, 4.5, -3]}>
      {/* 별자리 선 */}
      <line>
        <primitive object={lineGeo} attach="geometry" />
        <lineBasicMaterial color="#bcd2ff" transparent opacity={0.45} />
      </line>

      {/* 별들 */}
      {STARS.map((p, i) => (
        <group key={i} position={p}>
          <mesh>
            <sphereGeometry args={[0.12, 12, 12]} />
            <meshStandardMaterial
              color="#fff6d8"
              emissive="#fff0b0"
              emissiveIntensity={1.6}
            />
          </mesh>
          <Glow color="#fff2c4" size={1.3} opacity={0.7} pulse={1.0 + i * 0.2} />
        </group>
      ))}
    </group>
    </group>
  );
}
