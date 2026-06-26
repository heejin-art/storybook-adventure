/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
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
