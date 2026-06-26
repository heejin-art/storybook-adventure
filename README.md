# 🐾 TOTTO'S STORY

> 또또와 함께 떠나는 동화 속 모험 — 인터랙티브 포트폴리오

스크롤이 아니라 **하나의 짧은 동화를 플레이하는 경험**을 목표로 한 인터랙티브 웹 포트폴리오입니다.
사용자는 강아지 캐릭터 "또또"를 따라 숲을 여행하며 희진의 커리어와 프로젝트를 자연스럽게 만나게 됩니다.

## ✨ 현재 상태 (구조 확정 단계)

기획안의 개발 원칙에 따라 **Intro → Chapter 1(About) → Chapter 2(Career)** 까지 먼저 완성했습니다.
구조가 확정되었으므로, 이후 챕터(NOTALK / 오늘뽁 / Business / Future / Ending)는 동일한 패턴으로 추가하면 됩니다.

## 🚀 실행 방법

```bash
npm install
npm run dev      # http://localhost:3000
```

기타 스크립트: `npm run build`(프로덕션 빌드), `npm run start`, `npm run typecheck`

## 🧱 기술 스택

- **Next.js 14 (App Router) + TypeScript**
- **TailwindCSS** — 파스텔 동화 팔레트 (`tailwind.config.ts`)
- **Framer Motion** — 등장/플로팅 애니메이션
- **Lenis** — 부드러운 스크롤 + 스크롤 속도 → 캐릭터 이동 상태 변환
- **React Three Fiber / three.js / drei** — 3D 캐릭터

## 📁 폴더 구조

```
src/
├─ app/                     # Next.js 진입점 (layout, page, globals)
├─ components/
│  ├─ world/World.tsx       # 전체 월드 조립 (챕터 + 캐릭터 + HUD)
│  ├─ providers/            # SmoothScrollProvider (Lenis + 이동상태)
│  ├─ character/            # ⭐ 캐릭터 시스템 (교체 용이)
│  ├─ chapters/             # ⭐ 챕터들 (독립 컴포넌트 + registry)
│  ├─ background/           # 배경 장식 (잎새/구름/나비/별 등)
│  └─ ui/                   # 말풍선, 버튼, HUD
└─ data/                    # 콘텐츠 데이터 (profile, career)
```

## 🐶 캐릭터(또또) 교체하기 — 단 한 파일

현재 캐릭터는 **저작권 안전한 Placeholder**입니다.
외부 모델/텍스처를 일절 사용하지 않고, three.js 기본 도형(구·캡슐)을 **코드로 절차적으로 생성**한
**비숑(Bichon) 스타일 강아지**입니다. (인터넷에서 받은 에셋 없음 → 라이선스 이슈 없음)

실제 반려견 또또의 3D 모델(GLB)이 준비되면 **`src/components/character/characterConfig.ts` 한 파일만** 수정하세요.

```ts
export const characterConfig = {
  source: "glb",                 // "placeholder" → "glb"
  modelPath: "/models/totto.glb",// public/models/totto.glb 에 모델 배치
  scale: 1,
  yOffset: 0,
  animationClipMap: {            // 우리 표준 상태 → GLB 클립 이름 매핑
    idle: "Idle", walk: "Walk", run: "Run",
    sit: "Sit", wave: "Wave", jump: "Jump", tailWag: "TailWag",
  },
};
```

나머지 코드는 전혀 손대지 않아도 홈페이지 전체 캐릭터가 자동 교체됩니다.
표준 애니메이션 상태(`idle/walk/run/sit/wave/jump/tailWag`)가 Placeholder와 GLB가 공유하는 공통 계약입니다.

> ⚠️ **저작권**: GLB는 반드시 본인이 직접 제작/소유한 모델(또또)만 사용하세요.
> 외부 마켓 모델은 라이선스를 반드시 확인해야 합니다.

## 📖 챕터 추가하기 — 레지스트리에 한 줄

1. `src/components/chapters/<name>/<Name>Chapter.tsx` 작성 후 `meta`를 export
   (기존 `about/AboutChapter.tsx` 를 복사해 시작하면 가장 쉽습니다)
2. `src/components/chapters/registry.ts` 의 `chapters` 배열에 추가

페이지·HUD·챕터 순서가 모두 자동으로 반영됩니다. 챕터는 서로 독립적이라 추가/삭제/순서변경이 자유롭습니다.

## 🎮 인터랙션

- **스크롤** → 또또가 걸어감(walk/run), 멈추면 idle (스크롤 속도에 반응)
- **또또 클릭** → 인사 시퀀스(손 흔들기 → 점프 → 꼬리 흔들기)
- **우측 HUD 점** → 챕터로 이동 (몰입을 위해 최소화)

## 🎨 디자인 원칙

지브리 / 닌텐도 / 따뜻한 동화책 무드. 파스텔톤, 과하지 않고 자연스러운 애니메이션,
가독성 높은 둥근 폰트(Jua / Gowun Dodum), 모션 최소화 선호 사용자 배려(`prefers-reduced-motion`).
