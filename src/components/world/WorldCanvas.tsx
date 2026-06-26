"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { Atmosphere } from "./Atmosphere";
import { JourneyRig } from "./JourneyRig";
import { SkyGradient } from "@/components/scenery/SkyGradient";
import { Ground } from "@/components/scenery/Ground";
import { Hills } from "@/components/scenery/Hills";
import { Trees } from "@/components/scenery/Trees";
import { Grass } from "@/components/scenery/Grass";
import { Flowers } from "@/components/scenery/Flowers";
import { Pollen } from "@/components/scenery/Pollen";
import { Leaves } from "@/components/scenery/Leaves";
import { SunGlow } from "@/components/scenery/SunGlow";
import { Butterfly } from "@/components/scenery/Butterfly";
import { HomePlace } from "@/components/places/home/HomePlace";
import { CareerPath } from "@/components/places/forest/CareerPath";
import { MushroomGrove } from "@/components/places/mushroom/MushroomGrove";
import { Totto } from "@/components/character/Totto";
import { BehaviorDirector } from "@/components/character/BehaviorDirector";

/**
 * 월드 캔버스 — 배경·또또·오브젝트·파티클을 하나의 영속 R3F 씬에 담는다.
 * 화면 고정. 스크롤(ScrollController)이 만든 진행도로 카메라가 또또를 따라간다.
 * 후처리(소프트 블룸·비네팅·필름 그레인)로 "감성적" 톤을 입힌다.
 */
export function WorldCanvas() {
  return (
    <div className="fixed inset-0 z-0">
      <Canvas
        shadows="soft"
        dpr={[1, 1.8]}
        gl={{ antialias: true }}
        camera={{ position: [0, 1.75, 7.2], fov: 38, near: 0.1, far: 200 }}
      >
        <Atmosphere />
        <SkyGradient />
        <SunGlow />

        <Suspense fallback={null}>
          {/* 원경 → 근경 풍경 (월드 고정, 카메라가 지나가며 패럴럭스) */}
          <Hills />
          <Ground />
          <Trees />
          <Grass />
          <Flowers />
          <HomePlace />
          <CareerPath />
          <MushroomGrove />
          <Butterfly />

          {/* 또또 + 가이드 행동 (카메라가 따라가는 중심) */}
          <JourneyRig>
            <Totto />
          </JourneyRig>
          <BehaviorDirector />

          {/* 공기 중 빛가루 + 흩날리는 나뭇잎 */}
          <Pollen />
          <Leaves />
        </Suspense>
      </Canvas>
    </div>
  );
}
