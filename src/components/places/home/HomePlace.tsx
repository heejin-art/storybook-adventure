"use client";

import { useFrame } from "@react-three/fiber";
import { House } from "./House";
import { waypointX, WAYPOINTS } from "@/components/world/journeyPath";
import { journeyStore } from "@/components/world/journeyStore";
import { discoveryStore } from "@/components/world/discoveryStore";

/**
 * 작은 집 장소(Place) — 집 배치 + About 근접 발견 트리거.
 * 또또가 집에 가까워지면 discovery "about" 활성화 → 화면에 About 텍스트가 떠오른다.
 * (장소는 이런 식으로 독립 컴포넌트화 → registry로 추가/삭제 용이.)
 */
export function HomePlace() {
  const x = waypointX(WAYPOINTS.home);

  useFrame(() => {
    const { progress } = journeyStore.read();
    const near = Math.abs(progress - WAYPOINTS.home) < 0.05;
    if (near) discoveryStore.set("about");
    else if (discoveryStore.getSnapshot() === "about") discoveryStore.set(null);
  });

  // 길 옆(약간 뒤쪽)에 집을 둠
  return <House position={[x, 0, -3.2]} />;
}
