/**
 * 여정 경로(Journey Path) 정의.
 * --------------------------------------------------
 * 여정은 월드의 +X 축을 따라 진행한다. progress(0~1) → 월드 X좌표로 매핑.
 * 사이드뷰: 또또는 항상 화면 중앙(= 카메라가 또또의 X를 따라감), 배경은 깊이(Z)로 패럴럭스.
 *
 * 장소(Place)는 progress 구간으로 배치한다. 각 장소의 "중심 progress"에 오브젝트를 둔다.
 * 1단계(수직 슬라이스)에서는 작은 집 + 숲 입구 구간만 사용한다.
 */

/** 전체 여정의 월드 길이(X). progress=1 일 때 이 거리만큼 이동. */
export const JOURNEY_LENGTH = 120;

/** progress(0~1) → 월드 X 좌표 */
export function worldXAt(progress: number): number {
  return progress * JOURNEY_LENGTH;
}

/** 1단계에서 사용할 주요 지점들(progress 기준) */
export const WAYPOINTS = {
  home: 0.1, // 작은 집 (출발점보다 살짝 앞 → 다가가며 About 발견)
  flower: 0.24, // 🌼 꽃밭 (또또가 멈춰 바라봄)
  butterfly: 0.36, // 🦋 나비 출몰 구간
  forestRest: 0.5, // 숲 입구 휴식 지점 (1단계 끝)
} as const;

/** 어떤 지점의 월드 X */
export function waypointX(p: number): number {
  return worldXAt(p);
}
