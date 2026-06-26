import type { ChapterMeta } from "./types";
import { meta as introMeta } from "./intro/IntroChapter";
import { meta as aboutMeta } from "./about/AboutChapter";
import { meta as careerMeta } from "./career/CareerChapter";

/**
 * ⭐ 챕터 레지스트리 — 챕터 추가/삭제/순서 변경의 단일 지점 ⭐
 * --------------------------------------------------
 * 새 챕터(예: NOTALK 버섯숲, 오늘뽁 풍선언덕 등)를 만들려면:
 *   1) src/components/chapters/<name>/<Name>Chapter.tsx 작성 + `meta` export
 *   2) 아래 배열에 추가
 * 그러면 페이지·HUD·길이가 모두 자동으로 반영된다.
 *
 * 개발 원칙(기획안): 우선 Intro → About → Career 까지만 확정.
 * 이후 챕터는 이 배열에 한 줄씩 추가하면 된다.
 */
export const chapters: ChapterMeta[] = [introMeta, aboutMeta, careerMeta];
