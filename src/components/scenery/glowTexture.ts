import { CanvasTexture, Texture } from "three";

/**
 * 부드러운 원형 그라데이션 스프라이트 텍스처(중심 밝음 → 가장자리 투명).
 * 가짜 블룸(빛 번짐) 헤일로와 보케 먼지 입자에 공통 사용. 코드 생성(외부 에셋 0).
 */
let cached: Texture | null = null;

export function getGlowTexture(): Texture {
  if (cached) return cached;
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2,
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.25, "rgba(255,255,255,0.65)");
  g.addColorStop(0.55, "rgba(255,255,255,0.2)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  cached = new CanvasTexture(canvas);
  cached.needsUpdate = true;
  return cached;
}
