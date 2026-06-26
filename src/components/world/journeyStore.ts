/**
 * 여정(Journey) 상태 스토어 — 월드 전체를 구동하는 단일 진실원.
 * --------------------------------------------------
 * progress(0~1): 스크롤로 결정되는 여정 진행도. 카메라·또또·환경·시간대가 모두 이걸 읽는다.
 * velocity: 스크롤 속도(정규화). 또또의 걸음(idle/walk/run) 결정.
 * React 렌더와 무관하게 매 프레임 읽혀야 하므로 live getter(read)를 제공한다.
 */

type JourneySnapshot = {
  progress: number;
  velocity: number;
};

let progress = 0;
let velocity = 0;

let cached: JourneySnapshot = { progress: 0, velocity: 0 };
const listeners = new Set<() => void>();

function emit() {
  if (progress !== cached.progress || velocity !== cached.velocity) {
    cached = { progress, velocity };
    listeners.forEach((l) => l());
  }
}

export const journeyStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): JourneySnapshot {
    return cached;
  },
  /** useFrame에서 매 프레임 직접 읽기 (렌더 유발 없음) */
  read(): JourneySnapshot {
    return { progress, velocity };
  },
  setProgress(next: number, nextVelocity: number) {
    progress = Math.max(0, Math.min(1, next));
    velocity = nextVelocity;
    emit();
  },
};
