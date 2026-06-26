import type { Config } from "tailwindcss";

/**
 * 동화 / 지브리 / 닌텐도 감성의 파스텔 팔레트.
 * 색상은 의미 기반으로 정의해 챕터마다 일관된 무드를 유지한다.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // 기본 배경 톤
        cream: "#FBF6EC",
        beige: "#F2E6D0",
        // 자연 톤
        leaf: "#A8D5A2",
        forest: "#6FA86A",
        sky: "#BFE3F0",
        sun: "#FBE38E",
        clay: "#D8B08C",
        // 강조/감성 톤
        sunset: "#F7B7A3",
        night: "#2E3A59",
        star: "#FCE7A6",
        // 텍스트
        ink: "#4A4036",
        "ink-soft": "#7A6E5F",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        body: ["var(--font-body)", "system-ui", "sans-serif"],
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-4deg)" },
          "50%": { transform: "rotate(4deg)" },
        },
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        sway: "sway 5s ease-in-out infinite",
        "fade-up": "fade-up 0.8s ease-out forwards",
        twinkle: "twinkle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
