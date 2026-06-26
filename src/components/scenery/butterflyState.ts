/**
 * 나비의 현재 월드 위치를 공유하는 초경량 ref.
 * Butterfly가 매 프레임 갱신하고, BehaviorDirector가 읽어 또또의 시선(gaze)을 맞춘다.
 */
export const butterflyState = {
  x: 0,
  y: 1.6,
  z: 0,
  visible: false,
};
