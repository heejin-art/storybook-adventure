/**
 * 발견(Discovery) 상태 스토어 — "클릭하면 열리고, 닫으면 계속" 모델.
 * --------------------------------------------------
 * 장소의 마커/오브젝트를 클릭하면 해당 콘텐츠가 열리고(active = id),
 * 그 동안 스크롤이 잠시 멈춰(ScrollController가 구독) 차분히 읽을 수 있다.
 * "계속 둘러보기"로 닫으면(active = null) 다시 여정이 이어진다.
 * → 그냥 스크롤만 해도 콘텐츠를 놓치지 않게.
 */
let active: string | null = null;
let cached: string | null = null;
const listeners = new Set<() => void>();

function emit() {
  if (active !== cached) {
    cached = active;
    listeners.forEach((l) => l());
  }
}

export const discoveryStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot() {
    return cached;
  },
  /** 현재 열린 콘텐츠 id (없으면 null) */
  get active() {
    return active;
  },
  open(id: string) {
    if (active === id) return;
    active = id;
    emit();
  },
  toggle(id: string) {
    active = active === id ? null : id;
    emit();
  },
  close() {
    if (active === null) return;
    active = null;
    emit();
  },
};
