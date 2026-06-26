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
  tagline: "오늘 하루를 톡 터뜨리는 작은 즐거움",
  problem: "반복되는 일상 속에서 ‘오늘만의 설렘’을 놓치는 사람들.",
  solution:
    "매일 하나씩 풍선처럼 떠오르는 작은 미션·기록으로 하루에 포인트를 만드는 서비스.",
  result: "가벼운 참여가 꾸준한 습관으로. 매일 다시 찾는 즐거움.",
  stack: ["서비스 기획", "Product Design", "그로스"],
};

export const notalk: Project = {
  id: "notalk",
  emoji: "🍄",
  title: "NOTALK",
  tagline: "혼자 있지만 외롭지 않은 사람들을 위한 서비스",
  problem:
    "말하지 않아도 연결되고 싶은 사람들. 혼자의 시간을 지키면서도 느슨하게 이어지고 싶은 마음.",
  solution:
    "대화 없이도 서로의 존재를 느끼는 조용한 연결. 부담 없는 신호와 분위기로 곁에 있어주는 경험을 설계했어요.",
  result:
    "조용한 사용자층의 깊은 몰입과 높은 재방문. ‘외롭지 않다’는 피드백.",
  stack: ["서비스 기획", "UX 라이팅", "Product Design"],
};
