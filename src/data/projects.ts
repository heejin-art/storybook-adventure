/**
 * 프로젝트 콘텐츠 데이터.
 * 텍스트만 수정하면 발견되는 프로젝트 내용이 바뀐다. (디자인/구조와 분리)
 * TODO(희진): 실제 수치·내용으로 채워주세요.
 */
export interface Project {
  id: string;
  emoji: string;
  title: string;
  tagline: string;
  problem: string;
  solution: string;
  result: string;
  stack: string[];
}

export const todaypop: Project = {
  id: "todaypop",
  emoji: "🎈",
  title: "오늘뽁",
  tagline: "희진이가 만든 서비스예요 — 오늘 하루를 톡 터뜨리는 작은 즐거움!",
  problem:
    "‘반복되는 일상에 작은 동기부여가 필요하다’는 문제를 가설로 세웠어요.",
  solution:
    "매일 하나씩 떠오르는 가벼운 미션·기록으로 참여 허들을 낮추고, 데이터로 리텐션 포인트를 설계했어요.",
  result: "낮은 진입장벽 → 꾸준한 재방문. 가벼운 참여가 습관으로 이어졌어요.",
  stack: ["서비스 기획", "리텐션 설계", "그로스"],
};

export const notalk: Project = {
  id: "notalk",
  emoji: "🍄",
  title: "NOTALK",
  tagline: "희진이가 만든 서비스예요 — 혼자 있어도 외롭지 않게!",
  problem:
    "‘대화는 부담스럽지만 연결은 원한다’는 사용자 니즈를 핵심 문제로 정의했어요.",
  solution:
    "대화 없이도 존재를 느끼는 조용한 연결을 설계 — 부담 없는 신호와 분위기로 곁에 있어주는 경험.",
  result: "조용한 사용자층의 깊은 몰입과 높은 재방문. ‘외롭지 않다’는 핵심 피드백 확보.",
  stack: ["서비스 기획", "문제 정의", "UX 설계"],
};
