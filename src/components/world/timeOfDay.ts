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

// progress 기준 키프레임 (사이는 선형 보간) — 아침→한낮→버섯숲→노을→저녁→밤→여명
const STOPS: Stop[] = [
  {
    at: 0.0, // 작은 집 · 아침 (따뜻·평화)
    skyTop: "#bfe0f2", skyMid: "#dff0e4", skyBot: "#fbf0d8",
    fog: "#d6e8d2", fogNear: 8, fogFar: 60,
    sun: "#ffe9c4", sunI: 1.3, amb: "#fff4e2", ambI: 0.76,
  },
  {
    at: 0.35, // 숲길 · 한낮 (맑고 푸름)
    skyTop: "#a9d4ef", skyMid: "#cfeada", skyBot: "#eef3d6",
    fog: "#c4dfc3", fogNear: 9, fogFar: 64,
    sun: "#fff0d0", sunI: 1.35, amb: "#fbf6e6", ambI: 0.78,
  },
  {
    at: 0.52, // 버섯숲 · 신비 (서늘·푸른 안개)
    skyTop: "#7c9aa8", skyMid: "#93acab", skyBot: "#aebf9e",
    fog: "#86a098", fogNear: 5, fogFar: 42,
    sun: "#bcd6e0", sunI: 0.66, amb: "#aec6c6", ambI: 0.58,
  },
  {
    at: 0.65, // 풍선언덕 · 노을 (따뜻한 주황·분홍)
    skyTop: "#f4a98c", skyMid: "#f8c79a", skyBot: "#ffe3b4",
    fog: "#eab89a", fogNear: 8, fogFar: 60,
    sun: "#ff9e63", sunI: 1.0, amb: "#ffd6ad", ambI: 0.7,
  },
  {
    at: 0.77, // 강·다리 · 초저녁 (잔잔한 보랏빛)
    skyTop: "#5d6a9c", skyMid: "#8a86ad", skyBot: "#c7a9b4",
    fog: "#7c80a6", fogNear: 6, fogFar: 48,
    sun: "#b9b6e6", sunI: 0.55, amb: "#9aa0c4", ambI: 0.56,
  },
  {
    at: 0.88, // 별언덕 · 밤 (깊은 파랑)
    skyTop: "#161d38", skyMid: "#27315a", skyBot: "#3c4670",
    fog: "#27305a", fogNear: 4, fogFar: 40,
    sun: "#aebce8", sunI: 0.35, amb: "#5a6488", ambI: 0.5,
  },
  {
    at: 1.0, // 귀환 · 깊은 밤/여명 (집의 온기)
    skyTop: "#232c4c", skyMid: "#3e4468", skyBot: "#79667e",
    fog: "#363c5c", fogNear: 4, fogFar: 44,
    sun: "#c6c0e0", sunI: 0.42, amb: "#6b6c92", ambI: 0.52,
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
