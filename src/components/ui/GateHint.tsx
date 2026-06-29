"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { AnimatePresence, motion, useAnimationControls } from "framer-motion";
import { gateStore } from "@/components/world/gateStore";
import { discoveryStore } from "@/components/world/discoveryStore";
import { GATES } from "@/components/world/journeyPath";

/**
 * 게이트 안내 배너 — "여기서 또또(마커)를 눌러 보고 가요".
 * --------------------------------------------------
 * 아직 안 본 필수 관문(GATES)에 도달하면 화면 하단에 떠서 클릭을 유도하고,
 * 사용자가 클릭 없이 더 내려가려 벽에 부딪히면(bump) 흔들려 강조한다.
 * 마커를 눌러 콘텐츠를 열면(=봤음) 잠금이 풀리고 배너도 사라진다.
 */
export function GateHint() {
  const gateKey = useSyncExternalStore(
    gateStore.subscribe,
    gateStore.getSnapshot,
    () => "|0|0",
  );
  const activeDiscovery = useSyncExternalStore(
    discoveryStore.subscribe,
    discoveryStore.getSnapshot,
    () => null,
  );

  const controls = useAnimationControls();
  const lastBump = useRef(0);

  const gateId = gateStore.activeGate;
  const gate = GATES.find((g) => g.id === gateId);
  const show = !!gate && !activeDiscovery;

  // 벽에 부딪힐 때마다(bumpAt 변화) 배너를 흔들어 "눌러야 함"을 강조.
  // gateKey가 bumpAt을 포함하므로 bump 시 리렌더 → 이 effect가 다시 평가된다.
  useEffect(() => {
    if (gateStore.bumpAt !== lastBump.current) {
      lastBump.current = gateStore.bumpAt;
      if (show) {
        controls.start({
          x: [0, -9, 9, -7, 7, -4, 4, 0],
          transition: { duration: 0.5, ease: "easeInOut" },
        });
      }
    }
  }, [gateKey, show, controls]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="gate-hint"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 18 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="pointer-events-none fixed inset-x-0 bottom-24 z-30 flex flex-col items-center px-6"
        >
          {/* 위를 가리키는 통통 튀는 발자국 — 마커를 누르라는 신호 */}
          <motion.span
            animate={{ y: [0, -9, 0] }}
            transition={{ duration: 1.3, repeat: Infinity, ease: "easeInOut" }}
            className="mb-2 text-2xl"
            style={{ filter: "drop-shadow(0 3px 8px rgba(80,60,40,0.25))" }}
          >
            👆
          </motion.span>

          <motion.div
            animate={controls}
            className="max-w-md rounded-full border border-clay/40 bg-cream/95 px-6 py-3 text-center shadow-[0_12px_30px_-12px_rgba(40,34,26,0.6)] backdrop-blur-sm"
          >
            {/* 은은한 펄스로 시선을 끈다 */}
            <motion.div
              animate={{ scale: [1, 1.035, 1] }}
              transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
            >
              <p className="font-display text-base text-ink md:text-lg">
                🐾 {gate?.hint}
              </p>
              <p className="mt-0.5 text-xs text-ink-soft">
                보고 나면 계속 산책할 수 있어요
              </p>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
