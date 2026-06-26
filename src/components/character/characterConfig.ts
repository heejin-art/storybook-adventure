import type { AnimationState } from "./animationStates";

/**
 * ⭐ 캐릭터 교체 단일 지점 (SINGLE SOURCE OF TRUTH) ⭐
 * --------------------------------------------------
 * 추후 실제 반려견 "또또"의 3D 모델이 준비되면, 아래만 수정하면 된다.
 *
 *   1) source 를 "glb" 로 변경
 *   2) modelPath 에 GLB 경로 지정 (예: "/models/totto.glb" → public/models/totto.glb)
 *   3) animationClipMap 에서 우리 상태 이름 → GLB 클립 이름 매핑
 *   4) scale / yOffset 로 크기·높이 보정
 *
 * 나머지 코드는 전혀 손대지 않아도 홈페이지 전체 캐릭터가 교체된다.
 */

export type CharacterSource = "placeholder" | "glb";

export interface CharacterConfig {
  source: CharacterSource;
  /** source === "glb" 일 때 사용. public 기준 경로. */
  modelPath?: string;
  /** 모델 전체 스케일 */
  scale: number;
  /** 바닥 정렬용 Y 오프셋 */
  yOffset: number;
  /**
   * 우리 표준 상태 이름 → 실제 GLB 애니메이션 클립 이름 매핑.
   * GLB 교체 시 클립 이름이 다르면 여기만 맞춰주면 된다.
   */
  animationClipMap: Record<AnimationState, string>;
}

export const characterConfig: CharacterConfig = {
  source: "placeholder",
  modelPath: "/models/totto.glb",
  scale: 1,
  yOffset: 0,
  // GLB 표준 클립명을 가정한 기본 매핑 (또또 모델 준비되면 실제 클립명으로 교체)
  animationClipMap: {
    idle: "Idle",
    walk: "Walk",
    run: "Run",
    sit: "Sit",
    wave: "Wave",
    jump: "Jump",
    tailWag: "TailWag",
  },
};
