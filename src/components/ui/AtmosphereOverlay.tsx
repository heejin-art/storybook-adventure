"use client";

/**
 * 감성 톤 오버레이 (CSS) — 비네팅 + 미세 필름 그레인.
 * EffectComposer(후처리) 대신 가볍고 안정적으로 "감성적" 분위기를 입힌다.
 * pointer-events 없음 → 인터랙션 방해하지 않음.
 */

// 작은 SVG 노이즈(코드 생성, 외부 에셋 없음)
const GRAIN =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>
       <filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter>
       <rect width='100%' height='100%' filter='url(#n)' opacity='0.5'/>
     </svg>`,
  );

export function AtmosphereOverlay() {
  return (
    <div className="pointer-events-none fixed inset-0 z-10">
      {/* 비네팅 */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 52%, rgba(44,38,28,0.34) 100%)",
        }}
      />
      {/* 필름 그레인 */}
      <div
        className="absolute inset-0 mix-blend-overlay"
        style={{
          backgroundImage: `url("${GRAIN}")`,
          backgroundRepeat: "repeat",
          opacity: 0.06,
        }}
      />
    </div>
  );
}
