"use client";

import { House } from "./House";
import { Marker } from "@/components/world/Marker";
import { waypointX, WAYPOINTS } from "@/components/world/journeyPath";

/**
 * 작은 집 장소 — 집 + About 마커.
 * 마커를 클릭하면 About이 열리고(스크롤 멈춤) 차분히 읽을 수 있다.
 */
export function HomePlace() {
  const x = waypointX(WAYPOINTS.home);
  return (
    <group>
      <House position={[x, 0, -3.2]} />
      <Marker id="about" position={[x, 2.4, -2]} color="#ffe0a8" label="희진 소개" />
    </group>
  );
}
