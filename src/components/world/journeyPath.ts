/**
 * 여정 경로(Journey Path) 정의.
 * --------------------------------------------------
 * 여정은 월드의 +X 축을 따라 진행한다. progress(0~1) → 월드 X좌표로 매핑.
 * 사이드뷰: 또또는 항상 화면 중앙(= 카메라가 또또의 X를 따라감), 배경은 깊이(Z)로 패럴럭스.
 *
 * 7개 장소: 작은집(About) → 숲길(Career) → 버섯숲(NOTALK) → 풍선언덕(오늘뽁)
 *           → 강·다리(Business) → 별언덕(Future) → 작은집 귀환(Ending).
 */

/** 전체 여정의 월드 길이(X). progress=1 일 때 이 거리만큼 이동. */
export const JOURNEY_LENGTH = 200;

/** progress(0~1) → 월드 X 좌표 */
export function worldXAt(progress: number): number {
  return progress * JOURNEY_LENGTH;
}

/** 주요 지점들(progress 기준) */
export const WAYPOINTS = {
  home: 0.05, // 작은 집 (출발 · About)
  flower: 0.12, // 🌼 꽃밭
  butterfly: 0.18, // 🦋 나비
  careerStart: 0.26, // 숲길 시작 (Career)
  careerEnd: 0.4, // 숲길 끝
  mushroom: 0.52, // 🍄 버섯숲 (NOTALK)
  balloon: 0.65, // 🎈 풍선언덕 (오늘뽁)
  river: 0.77, // 🌊 강·다리 (Business)
  star: 0.88, // ⭐ 별언덕 (Future)
  ending: 0.97, // 🏡 작은 집 귀환 (Ending)
} as const;

/** 어떤 지점의 월드 X */
export function waypointX(p: number): number {
  return worldXAt(p);
}

/** Career 노드 progress (start~end 사이 균등 배치) */
export function careerNodeProgress(index: number, total: number): number {
  const { careerStart, careerEnd } = WAYPOINTS;
  if (total <= 1) return (careerStart + careerEnd) / 2;
  return careerStart + ((careerEnd - careerStart) * index) / (total - 1);
}
