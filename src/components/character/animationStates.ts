/**
 * 캐릭터 애니메이션 "계약(contract)"
 * --------------------------------------------------
 * 이 문자열들이 Placeholder 모델과 실제 또또 GLB 모델이 공유하는 공통 언어다.
 * GLB로 교체할 때는 이 이름들을 GLB의 애니메이션 클립 이름과 매핑(animationClipMap)만 하면 된다.
 * 절대 특정 모델 구현에 종속되지 않도록, 외부에서는 오직 이 상태 이름만 사용한다.
 */
export const ANIMATION_STATES = [
  "idle",
  "walk",
  "run",
  "sit",
  "wave",
  "jump",
  "tailWag",
] as const;

export type AnimationState = (typeof ANIMATION_STATES)[number];

/** 스크롤 속도에 따라 결정되는 "이동" 상태 (지속 상태) */
export type LocomotionState = Extract<AnimationState, "idle" | "walk" | "run">;

/** 클릭 등으로 1회 재생되는 "액션" 상태 (one-shot) */
export type ActionState = Extract<
  AnimationState,
  "wave" | "jump" | "sit" | "tailWag"
>;

/** one-shot 액션의 기본 재생 시간(ms). GLB 클립 길이에 맞춰 조정 가능. */
export const ACTION_DURATION: Record<ActionState, number> = {
  wave: 1100,
  jump: 700,
  sit: 1400,
  tailWag: 1200,
};
