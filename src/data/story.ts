/**
 * 후반부 장소의 서사 콘텐츠 (Business · Future · Ending).
 * 텍스트만 수정하면 해당 장면 내용이 바뀐다.
 * TODO(희진): 실제 수치·문장으로 채워주세요.
 */

export const business = {
  emoji: "🌊",
  label: "BUSINESS STORY",
  title: "직접 만들고, 직접 키웠어요",
  lines: [
    "기획만 한 게 아니라 매출과 성장을 두 손으로 만들어봤어요.",
    "릴스·콘텐츠로 사람을 모으고, 데이터로 다음을 결정했죠.",
    "숫자 뒤의 사람을 보는 일 — 그게 제 사업의 방식이었어요.",
  ],
} as const;

export const future = {
  emoji: "⭐",
  label: "FUTURE",
  title: "앞으로 만들 별들",
  lines: [
    "AI로 더 다정한 서비스를.",
    "‘끄숑’ 같은, 사람의 마음을 돌보는 작은 도구들.",
    "생각에서 멈추지 않고, 계속 만들어갈 거예요.",
  ],
} as const;

export const ending = {
  emoji: "🏡",
  label: "THANK YOU",
  title: "오늘 즐거웠어",
  lines: [
    "희진은 생각만 하는 사람이 아니라,",
    "직접 만들고 실행하는 사람이야.",
    "다음엔 같이 새로운 서비스를 만들어보자.",
  ],
  contact: "zbxm2000@naver.com",
} as const;
