import { World } from "@/components/world/World";

/**
 * 진입점. 전체 동화 월드를 렌더링한다.
 * (구조 확정 단계: Intro → About → Career. 이후 챕터는 registry.ts 에 추가)
 */
export default function Home() {
  return <World />;
}
