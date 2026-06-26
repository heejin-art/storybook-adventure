# 🌙 TOTTO'S STORY

> 또또와 함께 떠나는 동화 속 모험 — 웹에서 플레이하는 짧은 감성 인터랙티브 경험

일반적인 포트폴리오 웹사이트가 아니라, **하나의 살아있는 숲 월드를 또또(강아지)를 따라 탐험하는**
감성 인디게임 같은 경험입니다. 스크롤하면 카메라가 또또를 따라 월드를 여행하고, 장소에 다가가면
콘텐츠가 발견됩니다. (정보보다 장면이 먼저, 세계 자체가 UI)

## ✨ 현재 상태 (Stage 1 — 수직 슬라이스)

월드 엔진 + 살아있는 숲 + **작은 집(About 발견)** 까지 완성했습니다.
이후 단계에서 숲길(Career) · 버섯숲(NOTALK) · 풍선언덕(오늘뽁) · 강(Business) · 별언덕(Future) · 귀환(Ending)을
동일한 패턴으로 추가합니다.

## 🚀 실행

```bash
npm install
npm run dev      # http://localhost:3000
```

> 💡 개발 중 캔버스가 빈 화면으로 보이면 **WebGL 컨텍스트 소진**(반복 리로드 누적)일 수 있습니다.
> 코드 문제가 아니며, 탭을 모두 닫고 새 탭에서 열면 회복됩니다. 정확성 검증은 `npm run build`로.

## 🧱 기술 스택

Next.js 14(App Router) · TypeScript · TailwindCSS · **React Three Fiber / three.js / drei** · Framer Motion · Lenis(부드러운 스크롤)

후처리는 버전 호환성 때문에 EffectComposer 대신 **CSS 비네팅·필름 그레인 오버레이**로 감성 톤을 입힙니다.
모든 3D 에셋은 **코드/셰이더로 절차 생성**(외부 모델·텍스처 0 → 저작권 이슈 없음).

## 📁 구조

```
src/
├─ app/                      진입점 (page = WorldCanvas + ScrollController + 오버레이)
├─ components/
│  ├─ world/                월드 엔진
│  │  ├─ WorldCanvas        단일 영속 R3F 캔버스(모든 풍경·또또·파티클)
│  │  ├─ JourneyRig         진행도→카메라 dolly + 또또를 항상 화면 중앙에 고정
│  │  ├─ Atmosphere         조명·안개(시간대)
│  │  ├─ ScrollController   보이지 않는 긴 스크롤 → 여정 진행도(0~1)
│  │  ├─ journeyStore       진행도/속도 (월드 전체를 구동)
│  │  ├─ journeyPath        여정 경로 + 장소 waypoint
│  │  └─ discoveryStore     근접 발견 상태(About 등)
│  ├─ scenery/              살아있는 월드 (Sky/Hills/Ground/Trees/Grass/Flowers/Pollen/Butterfly)
│  ├─ places/               장소 (home: 집 + About 발견 트리거)
│  ├─ character/            ⭐ 또또 (교체 용이) — 아래 참조
│  └─ ui/                   미니멀 오버레이(시작 힌트, 발견 콘텐츠, 분위기 그레인)
└─ data/                    콘텐츠(profile 등)
```

## 🐶 또또 교체하기 — 단 한 파일

현재 또또는 **저작권 안전한 Placeholder**(코드로 생성한 비숑 스타일, 부드러운 toon 셰이딩)입니다.
실제 반려견 또또의 GLB가 준비되면 **`src/components/character/characterConfig.ts` 한 파일만** 수정하세요.

```ts
export const characterConfig = {
  source: "glb",                  // "placeholder" → "glb"
  modelPath: "/models/totto.glb", // public/models/totto.glb
  scale: 1, yOffset: 0,
  animationClipMap: {             // 표준 상태 → GLB 클립 이름
    idle:"Idle", walk:"Walk", run:"Run", sit:"Sit", wave:"Wave", jump:"Jump", tailWag:"TailWag",
  },
};
```

또또의 행동은 **이동(idle/walk/run)** 과 **가이드 행동 비트(꽃 바라보기·나비 추적·킁킁·앉기·돌아보기·인사)** 두 층으로 구성되며,
이 상태 "계약"을 Placeholder와 GLB가 공유하므로 모델만 바꿔도 동일하게 동작합니다.
(행동 조율: `character/BehaviorDirector.tsx`)

## 🗺 장소(Place) 추가하기

1. `src/components/world/journeyPath.ts` 의 `WAYPOINTS`에 지점 추가(progress 0~1)
2. `src/components/places/<name>/` 에 장소 컴포넌트 작성 — 풍경 배치 + 근접/클릭 시 `discoveryStore.set(id)`
3. `WorldCanvas`에 추가하고, `ui/DiscoveryOverlay`에 해당 id의 콘텐츠 블록 추가

장소·콘텐츠가 서로 독립적이라 추가/삭제/순서변경이 자유롭습니다.

## 🎮 인터랙션

- **스크롤** → 또또가 걷고(속도에 따라 walk/run), 멈추면 idle·잔잔한 마이크로 행동
- **장소 근접** → 콘텐츠 발견(예: 집 → About)
- **또또 클릭** → 인사(돌아보며 꼬리 흔들기)

## 🎨 무드

Gris / Journey / Animal Crossing / Monument Valley / Ghibli의 분위기를 **재해석** —
페인터리 그라데이션 하늘, 레이어드 실루엣, 파스텔 톤, 부드러운 toon 캐릭터, 비네팅·그레인.
감성적이고 여백이 많으며, "귀여운 게임"이 아니라 **감성적 인터랙티브 포트폴리오**를 지향합니다.
