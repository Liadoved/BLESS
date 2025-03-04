/** @type {import('next').NextConfig} */
const nextConfig = {
  crossOrigin: 'anonymous',
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      'fs': false,
      'path': false,
    };
    return config;
  },
};

export default nextConfig;
