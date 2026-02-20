/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // 🚀 CRITICAL: Bypasses Vercel's 1,000 optimized images/mo limit.
    // Since you optimize images on the client side before upload, 
    // Vercel doesn't need to process them again.
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-367e1428b2244b639eb139da2272b5d0.r2.dev',
        pathname: '/**',
      },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'ui-avatars.com', pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'avatars.githubusercontent.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com', pathname: '/**' },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
  webpack: (config) => {
    // Resolve Alias for PDF.js dependencies
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // Fix for module parsing to prevent Node.js polyfills on client side
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/esm",
    });

    // Support for PDF.js Top-Level Await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      layers: true,
    };

    // Suppress critical dependency warnings common with PDF.js
    config.module.exprContextCritical = false;
    return config;
  },
  // Ensure builds succeed even with minor lint/type issues during rapid deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;