/** @type {import('next').NextConfig} */

// GitHub Pages는 https://heejin-art.github.io/storybook-adventure/ 처럼
// 저장소 이름 하위 경로로 서빙되므로 basePath/assetPrefix가 필요하다.
// 배포(GitHub Actions)에서만 켜고, 로컬 dev에서는 끈다.
const repo = "storybook-adventure";
const isPages = process.env.GITHUB_PAGES === "true";

const nextConfig = {
  // 정적 사이트로 내보내기 (GitHub Pages는 정적 파일만 서빙)
  output: "export",
  basePath: isPages ? `/${repo}` : "",
  assetPrefix: isPages ? `/${repo}/` : "",
  images: { unoptimized: true },
  trailingSlash: true,

  // dev에서 StrictMode 이중 마운트는 R3F WebGL 컨텍스트를 중복 생성하므로 비활성화
  reactStrictMode: false,
  // GLB/GLTF 같은 3D 에셋을 import 할 수 있도록 처리 (추후 또또 모델 교체 대비)
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glb|gltf)$/,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
