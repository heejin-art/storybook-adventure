"use client";

import { House } from "@/components/places/home/House";
import { Glow } from "@/components/scenery/Glow";
import { Marker } from "@/components/world/Marker";
import { waypointX, WAYPOINTS } from "@/components/world/journeyPath";

/**
 * 귀환 (Ending) — 처음의 그 작은 집, 깊은 밤.
 * 따뜻한 창문 불빛이 더 강하게 빛나고, 마커를 클릭하면 마지막 인사가 열린다.
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
    </group>
  );
}
