/**
 * Career Journey 데이터.
 * 길을 걸으며 자연스럽게 만나는 경력 노드들. 배열 순서대로 길 위에 배치된다.
 * 노드를 추가/삭제하면 Chapter 2의 길도 자동으로 늘어난다.
 * TODO(희진): period(기간)와 desc(설명)를 실제 내용으로 채워주세요.
 */
export interface CareerNode {
  company: string;
  role: string;
  period?: string;
  desc?: string;
  emoji: string;
}

export const careerJourney: CareerNode[] = [
  {
    company: "한샘",
    role: "시작점",
    emoji: "🏡",
    desc: "커리어의 첫 걸음을 뗀 곳.",
  },
  {
    company: "집닥",
    role: "성장",
    emoji: "🛠️",
    desc: "서비스가 사용자에게 닿는 과정을 배웠어요.",
  },
  {
    company: "BM 기획",
    role: "기획",
    emoji: "📐",
    desc: "비즈니스 모델을 직접 설계했어요.",
  },
  {
    company: "자영업",
    role: "실전",
    emoji: "🌾",
    desc: "직접 운영하며 현장을 온몸으로 익혔어요.",
  },
  {
    company: "서비스 기획",
    role: "기획자",
    emoji: "🧭",
    desc: "사용자 문제를 구조로 푸는 일에 몰입했어요.",
  },
  {
    company: "Product Design",
    role: "지금",
    emoji: "✨",
    desc: "기획부터 디자인, 실행까지 하나로 잇고 있어요.",
  },
];
