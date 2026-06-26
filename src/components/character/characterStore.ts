import type { LocomotionState } from "./animationStates";

/**
 * 또또 상태 스토어 (외부 라이브러리 없는 초경량 store)
 * --------------------------------------------------
 * 두 층의 상태를 담는다.
 *  1) 이동(locomotion): 스크롤 속도로 결정 — idle/walk/run + intensity.
 *  2) 가이드 행동(behavior): 장소/오브젝트 트리거로 연출되는 비트 — 시선·앉기·킁킁 등.
 *
 * 모델(useFrame)은 매 프레임 read()로 직접 읽어 애니메이션에 반영한다.
 * Placeholder든 GLB든 동일한 이 "계약"만 본다 → 모델 교체 시 코드 변경 불필요.
 */

/** 장소/오브젝트 트리거로 재생되는 가이드 행동 비트 */
export type BehaviorBeat =
  | "none"
  | "lookFlower" // 🌼 꽃을 바라봄 (고개 숙임)
  | "watchButterfly" // 🦋 나비를 시선으로 추적
  | "sniff" // 🍄 킁킁 냄새 맡기
  | "sit" // 🌊 앉아서 바라봄
  | "lookBack" // ⭐ 사용자를 돌아봄
  | "greet"; // 클릭 시 인사

type Snapshot = {
  locomotion: LocomotionState;
  intensity: number;
  behavior: BehaviorBeat;
  /** 머리 시선 오프셋(-1~1): yaw=좌우, pitch=상하(+위) */
  gazeYaw: number;
  gazePitch: number;
};

let locomotion: LocomotionState = "idle";
let intensity = 0;
let behavior: BehaviorBeat = "none";
let gazeYaw = 0;
let gazePitch = 0;

let greetUntil = 0; // greet 비트 종료 시각(performance.now 기준)

let cached: Snapshot = {
  locomotion: "idle",
  intensity: 0,
  behavior: "none",
  gazeYaw: 0,
  gazePitch: 0,
};
const listeners = new Set<() => void>();

function snapshot(): Snapshot {
  return { locomotion, intensity, behavior, gazeYaw, gazePitch };
}

function emit() {
  const next = snapshot();
  if (
    next.locomotion !== cached.locomotion ||
    next.behavior !== cached.behavior ||
    Math.abs(next.intensity - cached.intensity) > 0.02
  ) {
    cached = next;
    listeners.forEach((l) => l());
  }
}

export const characterStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): Snapshot {
    return cached;
  },
  /** 매 프레임 직접 읽기 (gaze 등 연속값 포함) */
  read(): Snapshot {
    return snapshot();
  },

  /** 스크롤 속도 → 이동 상태 */
  setLocomotion(next: LocomotionState, nextIntensity: number) {
    locomotion = next;
    intensity = Math.max(0, Math.min(1, nextIntensity));
    emit();
  },

  /** 가이드 행동 비트 설정 (director가 호출). greet 중에는 덮어쓰지 않음. */
  setBehavior(beat: BehaviorBeat, yaw = 0, pitch = 0) {
    const now =
      typeof performance !== "undefined" ? performance.now() : greetUntil;
    if (now < greetUntil) return; // 인사 중엔 유지
    behavior = beat;
    gazeYaw = yaw;
    gazePitch = pitch;
    emit();
  },

  /** 또또 클릭 → 잠깐 인사(돌아보며 꼬리 흔들기). director보다 우선. */
  playGreeting(durationMs = 1600) {
    const now = typeof performance !== "undefined" ? performance.now() : 0;
    greetUntil = now + durationMs;
    behavior = "greet";
    gazeYaw = 0.6; // 사용자(카메라) 쪽으로 고개 (양수 = 카메라 방향)
    gazePitch = 0.12;
    emit();
  },
};
