/**
 * 시간대/장소 팔레트 — 진행도에 따라 하늘·안개·빛이 연속 보간된다.
 * "배경색만 바뀜"이 아니라 장소마다 분위기가 뚜렷해지도록 무드를 설계.
 *  아침 숲(평화) → 숲길 → 버섯숲(신비·그늘).
 */

export interface Palette {
  skyTop: string;
  skyMid: string;
  skyBot: string;
  fog: string;
  fogNear: number;
  fogFar: number;
  sun: string;
  sunI: number;
  amb: string;
  ambI: number;
}

interface Stop extends Palette {
  at: number;
}

// progress 기준 키프레임 (사이는 선형 보간)
const STOPS: Stop[] = [
  {
    at: 0.0, // 작은 집 · 아침 (따뜻·평화)
    skyTop: "#bfe0f2", skyMid: "#dff0e4", skyBot: "#fbf0d8",
    fog: "#d3e6cf", fogNear: 10, fogFar: 70,
    sun: "#ffe9c4", sunI: 1.25, amb: "#fff4e2", ambI: 0.78,
  },
  {
    at: 0.45, // 숲길 · 한낮 (맑고 푸름)
    skyTop: "#a9d4ef", skyMid: "#cfeada", skyBot: "#eef3d6",
    fog: "#c2ddc1", fogNear: 10, fogFar: 72,
    sun: "#fff0d0", sunI: 1.3, amb: "#fbf6e6", ambI: 0.8,
  },
  {
    at: 0.7, // 버섯숲 입구 · 그늘 (서늘해짐)
    skyTop: "#8fb6c4", skyMid: "#a8c6bd", skyBot: "#c3d2b6",
    fog: "#9fbcb0", fogNear: 7, fogFar: 50,
    sun: "#d6e6ec", sunI: 0.8, amb: "#d3e2e0", ambI: 0.62,
  },
  {
    at: 0.92, // 버섯숲 깊은 곳 · 신비 (푸른 안개)
    skyTop: "#6f93a6", skyMid: "#86a3a6", skyBot: "#9fb29a",
    fog: "#7f9c97", fogNear: 5, fogFar: 40,
    sun: "#bcd6e0", sunI: 0.62, amb: "#aec6c6", ambI: 0.58,
  },
  {
    at: 1.0,
    skyTop: "#6f93a6", skyMid: "#86a3a6", skyBot: "#9fb29a",
    fog: "#7f9c97", fogNear: 5, fogFar: 40,
    sun: "#bcd6e0", sunI: 0.62, amb: "#aec6c6", ambI: 0.58,
  },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// 재사용 버퍼(할당 최소화)
const out: Palette = { ...STOPS[0] };

/** progress(0~1)에서의 팔레트. 같은 객체를 갱신해 반환(매 프레임 호출용). */
export function paletteAt(p: number): Palette {
  let i = 0;
  while (i < STOPS.length - 1 && p > STOPS[i + 1].at) i++;
  const a = STOPS[i];
  const b = STOPS[Math.min(i + 1, STOPS.length - 1)];
  const span = b.at - a.at || 1;
  const t = Math.max(0, Math.min(1, (p - a.at) / span));

  out.skyTop = mix(a.skyTop, b.skyTop, t);
  out.skyMid = mix(a.skyMid, b.skyMid, t);
  out.skyBot = mix(a.skyBot, b.skyBot, t);
  out.fog = mix(a.fog, b.fog, t);
  out.sun = mix(a.sun, b.sun, t);
  out.amb = mix(a.amb, b.amb, t);
  out.fogNear = lerp(a.fogNear, b.fogNear, t);
  out.fogFar = lerp(a.fogFar, b.fogFar, t);
  out.sunI = lerp(a.sunI, b.sunI, t);
  out.ambI = lerp(a.ambI, b.ambI, t);
  return out;
}

// hex 색 선형 보간 → hex 문자열
function mix(h1: string, h2: string, t: number): string {
  const c1 = parseInt(h1.slice(1), 16);
  const c2 = parseInt(h2.slice(1), 16);
  const r = Math.round(lerp((c1 >> 16) & 255, (c2 >> 16) & 255, t));
  const g = Math.round(lerp((c1 >> 8) & 255, (c2 >> 8) & 255, t));
  const b = Math.round(lerp(c1 & 255, c2 & 255, t));
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}
