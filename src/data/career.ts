/**
 * Career Journey — 또또 시점으로 들려주는 희진의 길. (서비스 기획 관점)
 * 길을 걸으며 자연스럽게 만나는 경력 노드들. 배열 순서대로 길 위에 배치된다.
 * TODO(희진): period(기간)와 desc를 실제 내용으로 채워주세요.
 */
export interface CareerNode {
  company: string;
  role: string;
  period?: string;
  desc?: string;
  emoji: string;
}

/** 경력 핵심 요약 지표 (TODO(희진): 실제 수치로 교체) */
export const careerSummary = {
  metrics: [
    { value: "8년+", label: "기획 경력" },
    { value: "5곳", label: "거쳐온 곳" },
    { value: "기획·운영·실행", label: "혼자서 다" },
  ],
} as const;

export const careerJourney: CareerNode[] = [
  {
    company: "한샘",
    role: "기획의 시작",
    emoji: "🏡",
    desc: "여기서 희진이가 ‘문제를 보는 눈’을 처음 길렀대요.",
  },
  {
    company: "집닥",
    role: "서비스 기획",
    emoji: "🛠️",
    desc: "사용자 여정을 따라가며 문제를 정의하고 플로우를 고쳤어요.",
  },
  {
    company: "BM 기획",
    role: "비즈니스 기획",
    emoji: "📐",
    desc: "수익 구조랑 서비스를 같이 설계했대요. 똑똑하죠?",
  },
  {
    company: "자영업",
    role: "직접 운영",
    emoji: "🌾",
    desc: "직접 가게를 운영하면서 가설을 현장에서 검증했어요.",
  },
  {
    company: "서비스 기획",
    role: "프로덕트 기획",
    emoji: "🧭",
    desc: "데이터로 우선순위를 정하고, 실행까지 밀어붙였어요.",
  },
  {
    company: "AI 활용 서비스 기획",
    role: "지금",
    emoji: "✨",
    desc: "지금은 AI까지 써서 더 빠르게 검증하고, 더 다정한 경험을 만들어요.",
  },
];
