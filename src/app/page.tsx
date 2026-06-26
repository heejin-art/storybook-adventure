"use client";

import dynamic from "next/dynamic";
import { ScrollController } from "@/components/world/ScrollController";
import { Hero } from "@/components/ui/Hero";
import { DiscoveryOverlay } from "@/components/ui/DiscoveryOverlay";
import { AtmosphereOverlay } from "@/components/ui/AtmosphereOverlay";
import { TrickBar } from "@/components/ui/TrickBar";

// 3D 캔버스는 SSR 비활성(브라우저 전용 API 사용)
const WorldCanvas = dynamic(
  () => import("@/components/world/WorldCanvas").then((m) => m.WorldCanvas),
  { ssr: false },
);

/**
 * 진입점.
 * - WorldCanvas: 화면 고정 3D 월드
 * - ScrollController: 보이지 않는 긴 스크롤 → 여정 진행도
 * - 오버레이: 시작 힌트 / 발견 콘텐츠(About) — 세계 자체가 UI, 텍스트는 최소·여백 중심
 * (구조 확정 단계: 작은 집 ~ 숲 입구 수직 슬라이스)
 */
export default function Home() {
  return (
    <>
      <WorldCanvas />
      <AtmosphereOverlay />
      <Hero />
      <DiscoveryOverlay />
      <TrickBar />
      <ScrollController heightVh={1800} />
    </>
  );
}
