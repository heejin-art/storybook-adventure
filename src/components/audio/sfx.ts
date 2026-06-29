/**
 * 절차적 효과음 엔진 (Web Audio API)
 * --------------------------------------------------
 * ⚠️ 저작권 안전: 외부 음원 파일 0. 오실레이터/노이즈로 코드에서 직접 합성한다.
 * 또또 톤에 맞춘 말랑한 만화풍 효과음 — 트릭마다 하나씩.
 *
 * 브라우저 자동재생 정책상 AudioContext는 첫 사용자 제스처 이후에만 소리가 난다.
 * → resumeAudio()를 첫 클릭/터치에서 호출.
 */

import type { TrickName } from "@/components/character/characterStore";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;
const SFX_VOLUME = 0.32;

function ac(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctx = new Ctor();
      master = ctx.createGain();
      master.gain.value = muted ? 0 : SFX_VOLUME;
      master.connect(ctx.destination);
    } catch {
      return null;
    }
  }
  return ctx;
}

/** 첫 사용자 제스처에서 호출 — 정지된 컨텍스트를 깨운다. */
export function resumeAudio() {
  const c = ac();
  if (c && c.state === "suspended") c.resume().catch(() => {});
}

/** 효과음 음소거(BGM과 별개). */
export function setSfxMuted(m: boolean) {
  muted = m;
  if (master) master.gain.value = m ? 0 : SFX_VOLUME;
}

type Blip = {
  f0: number; // 시작 주파수
  f1?: number; // 끝 주파수(슬라이드)
  type?: OscillatorType;
  dur: number;
  gain?: number;
  delay?: number; // 시작 지연(초)
};

/** 단음 — 주파수 슬라이드 + 부드러운 게인 엔벨로프. */
function blip(b: Blip) {
  const c = ac();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + (b.delay ?? 0);
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = b.type ?? "sine";
  osc.frequency.setValueAtTime(b.f0, t0);
  if (b.f1 != null) {
    osc.frequency.exponentialRampToValueAtTime(Math.max(1, b.f1), t0 + b.dur);
  }
  const peak = b.gain ?? 0.3;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(peak, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + b.dur);
  osc.connect(g).connect(master);
  osc.start(t0);
  osc.stop(t0 + b.dur + 0.03);
}

/** 짧은 노이즈 버스트 — "퍽/뿅" 같은 충돌음용. */
function noise(dur: number, gain = 0.18, delay = 0) {
  const c = ac();
  if (!c || !master || muted) return;
  const t0 = c.currentTime + delay;
  const frames = Math.floor(c.sampleRate * dur);
  const buf = c.createBuffer(1, frames, c.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < frames; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / frames); // 감쇠 노이즈
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1400;
  src.connect(lp).connect(g).connect(master);
  src.start(t0);
  src.stop(t0 + dur + 0.02);
}

/** 트릭별 효과음 — 또또 톤(말랑·통통). */
const SOUNDS: Record<TrickName, () => void> = {
  // 점프: 통통 튀어오르는 "보잉~" 상승 슬라이드
  jump: () => {
    blip({ f0: 320, f1: 760, type: "sine", dur: 0.22, gain: 0.34 });
    blip({ f0: 480, f1: 1040, type: "triangle", dur: 0.18, gain: 0.12, delay: 0.02 });
  },
  // 손: 짧고 또렷한 "톡" + 방울
  shake: () => {
    blip({ f0: 880, type: "triangle", dur: 0.08, gain: 0.28 });
    blip({ f0: 1180, type: "sine", dur: 0.12, gain: 0.2, delay: 0.09 });
  },
  // 엎드려: 부드럽게 내려앉는 "포스~"
  lieDown: () => {
    blip({ f0: 420, f1: 170, type: "sine", dur: 0.42, gain: 0.3 });
  },
  // 데굴: 굴러가는 "도로로" 빠른 아르페지오
  roll: () => {
    [523, 622, 740, 880].forEach((f, i) =>
      blip({ f0: f, type: "triangle", dur: 0.1, gain: 0.22, delay: i * 0.08 }),
    );
  },
  // 앉아: 통통 내려앉는 "폼"
  sit: () => {
    blip({ f0: 560, f1: 380, type: "sine", dur: 0.16, gain: 0.3 });
  },
  // 빵야: 코믹한 "뿅!" + 쓰러지는 "뎅~"
  bang: () => {
    noise(0.08, 0.22);
    blip({ f0: 900, f1: 1500, type: "square", dur: 0.08, gain: 0.16 });
    blip({ f0: 300, f1: 90, type: "sine", dur: 0.5, gain: 0.26, delay: 0.1 });
  },
  // 뱅글: 핑그르르 도는 상승 글리산도
  spin: () => {
    blip({ f0: 300, f1: 920, type: "triangle", dur: 0.5, gain: 0.28 });
    blip({ f0: 600, f1: 1840, type: "sine", dur: 0.5, gain: 0.1 });
  },
};

/** 트릭 효과음 재생. */
export function playTrickSound(name: TrickName) {
  try {
    SOUNDS[name]?.();
  } catch {
    /* 오디오 실패는 무시 */
  }
}

/** 또또 클릭/쓰다듬기 등 — 짧고 귀여운 "왈". */
export function playYip() {
  try {
    blip({ f0: 680, f1: 920, type: "triangle", dur: 0.09, gain: 0.26 });
    blip({ f0: 560, f1: 700, type: "sine", dur: 0.1, gain: 0.16, delay: 0.07 });
  } catch {
    /* noop */
  }
}
