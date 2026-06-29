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

/**
 * 게이트(필수 관문) — 이 지점들은 "마커를 눌러 보고 나야" 더 진행할 수 있다.
 * 아직 안 본 게이트가 앞에 있으면 스크롤이 그 지점에서 막히고(또또가 마커 앞에 멈춤),
 * 마커를 클릭해 콘텐츠를 열면(=봤음) 잠금이 풀려 계속 스크롤된다.
 *
 * id 는 discoveryStore / Marker 의 id 와 일치해야 한다. (마커 위치 = progress)
 * 새 관문을 추가하려면 이 배열에 항목만 넣으면 된다.
 */
export const GATES: {
  id: string;
  progress: number;
  title: string;
  hint: string;
}[] = [
  {
    id: "about",
    progress: WAYPOINTS.home,
    title: "희진 소개",
    hint: "또또 옆 반짝이는 마커를 눌러 ‘희진 소개’를 보고 가요.",
  },
  {
    id: "career",
    progress: (WAYPOINTS.careerStart + WAYPOINTS.careerEnd) / 2, // 커리어 마커 위치(0.33)
    title: "희진의 길",
    hint: "또또 옆 반짝이는 마커를 눌러 ‘희진의 길’을 보고 가요.",
  },
  {
    id: "notalk",
    progress: WAYPOINTS.mushroom,
    title: "노톡",
    hint: "또또 옆 반짝이는 버섯을 눌러 ‘노톡’ 이야기를 보고 가요.",
  },
  {
    id: "todaypop",
    progress: WAYPOINTS.balloon,
    title: "오늘뽁",
    hint: "또또 옆 풍선을 눌러(톡!) ‘오늘뽁’ 이야기를 보고 가요.",
  },
  {
    id: "business",
    progress: WAYPOINTS.river,
    title: "사업 이야기",
    hint: "또또 옆 반짝이는 마커를 눌러 ‘사업 이야기’를 보고 가요.",
  },
  {
    id: "future",
    progress: WAYPOINTS.star,
    title: "앞으로의 꿈",
    hint: "또또 옆 반짝이는 마커를 눌러 ‘앞으로의 꿈’을 보고 가요.",
  },
  {
    id: "ending",
    progress: WAYPOINTS.ending,
    title: "마지막 인사",
    hint: "또또 옆 반짝이는 마커를 눌러 ‘마지막 인사’를 보고 가요.",
  },
];
