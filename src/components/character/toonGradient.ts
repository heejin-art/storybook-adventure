import { DataTexture, RedFormat, UnsignedByteType, NearestFilter } from "three";

/**
 * 부드러운 셀(toon) 셰이딩용 그라데이션 맵.
 * 로우폴리 특유의 각진 느낌이 아니라, 페인터리한 2~3톤의 부드러운 음영을 만든다.
 * 외부 텍스처 없이 코드로 생성 → 저작권/네트워크 의존 없음.
 */
let cached: DataTexture | null = null;

export function getToonGradient(): DataTexture {
  if (cached) return cached;
  // 3단계 톤 (어두움 → 중간 → 밝음). 부드럽게 보이도록 중간톤을 넉넉히.
  const steps = new Uint8Array([90, 175, 255]);
  const tex = new DataTexture(steps, steps.length, 1, RedFormat, UnsignedByteType);
  tex.minFilter = NearestFilter;
  tex.magFilter = NearestFilter;
  tex.generateMipmaps = false;
  tex.needsUpdate = true;
  cached = tex;
  return tex;
}
