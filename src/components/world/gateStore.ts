/**
 * 게이트(필수 관문) 상태 스토어.
 * --------------------------------------------------
 * "꼭 보고 가야 하는" 지점(GATES)을 사용자가 봤는지 추적하고,
 * 현재 사용자가 어떤 게이트 앞에 멈춰 있는지(activeGate)와
 * 벽에 부딪혀 클릭을 유도해야 하는 순간(bumpAt)을 알린다.
 *
 *  - ScrollController: 안 본 게이트가 앞에 있으면 그 지점에서 스크롤을 막고(clamp),
 *    더 내려가려 하면 bump() 로 "클릭하라" 신호를 준다. 도달하면 setActiveGate().
 *  - GateHint(UI): activeGate 동안 안내 배너를 띄우고 bump 때 강조(흔들림).
 *  - 마커 콘텐츠를 열면(discoveryStore) 해당 게이트를 "봤음"으로 표시 → 잠금 해제.
 */

import { discoveryStore } from "./discoveryStore";
import { GATES } from "./journeyPath";

const gateIds = new Set(GATES.map((g) => g.id));
const seen = new Set<string>();
let activeGate: string | null = null; // 사용자가 멈춰선(잠긴) 게이트 id
let bumpAt = 0; // 마지막으로 벽에 부딪힌 시각(performance.now)

let cachedKey = "|0|0";
const listeners = new Set<() => void>();

function key() {
  return `${activeGate}|${seen.size}|${bumpAt}`;
}
function emit() {
  const k = key();
  if (k !== cachedKey) {
    cachedKey = k;
    listeners.forEach((l) => l());
  }
}

// 게이트의 콘텐츠를 한 번이라도 열면 "봤음"으로 표시
discoveryStore.subscribe(() => {
  const a = discoveryStore.getSnapshot();
  if (a && gateIds.has(a) && !seen.has(a)) {
    seen.add(a);
    emit();
  }
});

export const gateStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  /** useSyncExternalStore용 안정 스냅샷(상태 바뀌면 문자열이 바뀜) */
  getSnapshot() {
    return cachedKey;
  },

  isSeen(id: string) {
    return seen.has(id);
  },
  /** 아직 안 본 첫 게이트(progress 오름차순으로 GATES에 정의된 순서) */
  firstUnseen() {
    return GATES.find((g) => !seen.has(g.id)) ?? null;
  },

  get activeGate() {
    return activeGate;
  },
  get bumpAt() {
    return bumpAt;
  },

  setActiveGate(id: string | null) {
    if (activeGate !== id) {
      activeGate = id;
      emit();
    }
  },
  /** 벽에 부딪힘 → 클릭 유도 강조. 과도한 갱신 방지로 120ms 스로틀. */
  bump() {
    const now = typeof performance !== "undefined" ? performance.now() : 0;
    if (now - bumpAt < 120) return;
    bumpAt = now;
    emit();
  },
  markSeen(id: string) {
    if (!seen.has(id)) {
      seen.add(id);
      emit();
    }
  },
};
