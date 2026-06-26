"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { ContactShadows } from "@react-three/drei";
import { characterConfig } from "./characterConfig";
import { PlaceholderModel } from "./PlaceholderModel";
import { GlbModel } from "./GlbModel";
import { characterStore } from "./characterStore";

/**
 * 캐릭터 렌더 래퍼.
 * - config.source 에 따라 Placeholder / GLB 모델을 선택 (교체는 characterConfig 한 곳에서)
 * - 화면 하단 중앙 고정. 사용자는 "항상 캐릭터를 따라가는" 느낌을 받는다.
 * - 클릭 시 인사 시퀀스(손 흔들기 → 점프 → 꼬리 흔들기) 재생.
 */
export function Character() {
  const Model = characterConfig.source === "glb" ? GlbModel : PlaceholderModel;

  return (
    <button
      type="button"
      aria-label="또또에게 인사하기"
      onClick={() => characterStore.playGreeting()}
      className="pointer-events-auto fixed bottom-0 left-1/2 z-30 h-[230px] w-[230px] -translate-x-1/2 cursor-pointer border-0 bg-transparent p-0 outline-none md:h-[300px] md:w-[300px]"
    >
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
        camera={{ position: [0, 1.4, 4.2], fov: 35 }}
      >
        {/* 외부 HDR/에셋 없이 조명만으로 따뜻한 톤 연출 (네트워크·저작권 의존 없음) */}
        <ambientLight intensity={0.85} />
        <hemisphereLight args={["#FFF6E0", "#A8D5A2", 0.6]} />
        <directionalLight
          position={[3, 6, 4]}
          intensity={1.2}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        <directionalLight position={[-4, 3, -2]} intensity={0.4} color="#BFE3F0" />
        <Suspense fallback={null}>
          <group
            scale={characterConfig.scale}
            position={[0, characterConfig.yOffset - 0.6, 0]}
          >
            <Model />
          </group>
          <ContactShadows
            position={[0, -0.6, 0]}
            opacity={0.35}
            scale={5}
            blur={2.6}
            far={2}
            color="#4A4036"
          />
        </Suspense>
      </Canvas>
    </button>
  );
}
