/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warnings don't block production builds
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
