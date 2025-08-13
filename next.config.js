/** @type {import("next").NextConfig} */
const config = {
  images: {
    domains: ['localhost'],
  },
  // 忽略备份目录
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack: (config, { dev, isServer }) => {
    // 忽略备份目录
    config.watchOptions = {
      ...config.watchOptions,
      ignored: ['**/backup/**', '**/node_modules/**'],
    };
    return config;
  },
};

export default config;
