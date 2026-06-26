import type { Metadata, Viewport } from "next";
import { Jua, Gowun_Dodum } from "next/font/google";
import "./globals.css";

/**
 * 폰트: 둥글고 읽기 쉽지만 과하게 장난스럽지 않은 조합.
 * - display(Jua): 제목/말풍선 등 강조 (둥글고 따뜻함)
 * - body(Gowun Dodum): 본문 (담백하고 가독성 높음)
 * 두 폰트 모두 한글 지원.
 */
const display = Jua({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Gowun_Dodum({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TOTTO'S STORY — 또또와 함께 떠나는 동화 속 모험",
  description:
    "스크롤이 아니라 하나의 짧은 동화를 플레이하는 인터랙티브 포트폴리오. 또또를 따라 희진의 세상을 모험해보세요.",
};

export const viewport: Viewport = {
  themeColor: "#FBF6EC",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased">{children}</body>
    </html>
  );
}
