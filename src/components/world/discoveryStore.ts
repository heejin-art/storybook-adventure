/**
 * 발견(Discovery) 상태 스토어.
 * --------------------------------------------------
 * 또또가 어떤 장소/오브젝트에 가까워지면 해당 콘텐츠 id가 활성화되고,
 * 화면 위 미니멀 오버레이(여백 큰 텍스트)가 부드럽게 나타난다. 멀어지면 사라진다.
 * "정보를 한꺼번에 보여주지 않고, 탐험하며 발견" — 세계 자체가 UI.
 */
let active: string | null = null;
let cached: string | null = null;
const listeners = new Set<() => void>();

export const discoveryStore = {
  subscribe(l: () => void) {
    listeners.add(l);
    return () => listeners.delete(l);
  },
  getSnapshot() {
    return cached;
  },
  set(id: string | null) {
    if (active === id) return;
    active = id;
    cached = id;
    listeners.forEach((l) => l());
  },
};
