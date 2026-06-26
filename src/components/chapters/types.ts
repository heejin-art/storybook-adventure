import type { ComponentType } from "react";

/** 챕터별 배경 무드 (파스텔 팔레트 조합) */
export interface ChapterTheme {
  /** CSS 그라데이션 (배경) */
  gradient: string;
  /** 배경 장식 종류 */
  decoration:
    | "leaves"
    | "clouds"
    | "butterflies"
    | "fireflies"
    | "stars"
    | "petals";
  /** 글자 기본색 (밝은 배경=ink, 어두운 배경=흰색 계열) */
  textTone: "dark" | "light";
}

export interface ChapterMeta {
  /** 고유 id (앵커/HUD용) */
  id: string;
  /** HUD에 표시될 짧은 라벨 */
  label: string;
  /** 챕터 제목 */
  title: string;
  subtitle?: string;
  theme: ChapterTheme;
  /** 실제 렌더링 컴포넌트 */
  Component: ComponentType;
}
