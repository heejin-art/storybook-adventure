"use client";

import { useSyncExternalStore } from "react";
import { Html } from "@react-three/drei";
import { discoveryStore } from "./discoveryStore";

/**
 * 클릭 힌트 — 마커/오브젝트 위에 "🐾 눌러보기" 라벨을 띄워 클릭 위치를 분명히 보여준다.
 * 콘텐츠가 열려 있는 동안엔 숨는다. 거리(distanceFactor)에 따라 멀면 작아져 덜 거슬린다.
 */
export function ClickHint({ label = "눌러보기" }: { label?: string }) {
  const active = useSyncExternalStore(
    discoveryStore.subscribe,
    discoveryStore.getSnapshot,
    () => null,
  );
  if (active) return null;

  return (
    <Html center distanceFactor={10} position={[0, 0.5, 0]} zIndexRange={[15, 0]}>
      <div
        style={{ pointerEvents: "none" }}
        className="totto-clickhint whitespace-nowrap rounded-full border border-clay/40 bg-cream/95 px-3 py-1 font-display text-sm text-ink shadow-[0_6px_18px_-8px_rgba(40,34,26,0.7)]"
      >
        🐾 {label}
      </div>
    </Html>
  );
}
