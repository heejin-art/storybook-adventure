import {
  ACTION_DURATION,
  type ActionState,
  type AnimationState,
  type LocomotionState,
} from "./animationStates";

/**
 * 캐릭터 상태 스토어 (외부 라이브러리 없는 초경량 store)
 * --------------------------------------------------
 * - DOM 쪽(스크롤/클릭 핸들러)에서 상태를 "쓰고"
 * - 3D 모델(useFrame)에서 매 프레임 상태를 "읽는다".
 * React 렌더링과 무관하게 매 프레임 읽혀야 하므로, live getter를 제공한다.
 * React UI가 필요할 때는 subscribe + getSnapshot(useSyncExternalStore)을 쓴다.
 */

type Snapshot = {
  current: AnimationState;
  /** 0~1, 이동 강도(스크롤 속도 기반) → 다리 애니메이션 속도 등에 사용 */
  intensity: number;
};

let locomotion: LocomotionState = "idle";
let intensity = 0;
let oneShot: ActionState | null = null;
let oneShotTimer: ReturnType<typeof setTimeout> | null = null;

let cachedSnapshot: Snapshot = { current: "idle", intensity: 0 };
const listeners = new Set<() => void>();

function resolveCurrent(): AnimationState {
  return oneShot ?? locomotion;
}

function emit() {
  const next: Snapshot = { current: resolveCurrent(), intensity };
  // 변화가 없으면 동일 참조 유지 (useSyncExternalStore 안정성)
  if (
    next.current !== cachedSnapshot.current ||
    next.intensity !== cachedSnapshot.intensity
  ) {
    cachedSnapshot = next;
    listeners.forEach((l) => l());
  }
}

export const characterStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getSnapshot(): Snapshot {
    return cachedSnapshot;
  },

  /** useFrame에서 매 프레임 직접 읽기 위한 live getter (렌더 유발 없음) */
  read(): Snapshot {
    return { current: resolveCurrent(), intensity };
  },

  /** 스크롤 속도(px/s 정규화 등)로 이동 상태 갱신 */
  setLocomotion(next: LocomotionState, nextIntensity: number) {
    const clamped = Math.max(0, Math.min(1, nextIntensity));
    if (locomotion === next && Math.abs(clamped - intensity) < 0.02) return;
    locomotion = next;
    intensity = clamped;
    emit();
  },

  /** 클릭 등으로 1회성 액션 재생. 끝나면 이동 상태로 복귀. */
  playAction(action: ActionState) {
    oneShot = action;
    emit();
    if (oneShotTimer) clearTimeout(oneShotTimer);
    oneShotTimer = setTimeout(() => {
      oneShot = null;
      oneShotTimer = null;
      emit();
    }, ACTION_DURATION[action]);
  },

  /** 클릭 시 재생되는 기본 인사 시퀀스: 손 흔들기 → 점프 → 꼬리 흔들기 */
  playGreeting() {
    const sequence: ActionState[] = ["wave", "jump", "tailWag"];
    let delay = 0;
    sequence.forEach((action) => {
      setTimeout(() => characterStore.playAction(action), delay);
      delay += ACTION_DURATION[action];
    });
  },
};
