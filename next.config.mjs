/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pub-8919634e068e49d68b6b02660a92796e.r2.dev', 
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ui-avatars.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.r2.cloudflarestorage.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '15mb',
    },
  },
  webpack: (config, { isServer }) => {
    // 1. Resolve Alias for PDF.js dependencies
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;

    // 2. Fix for "Object.defineProperty" and module parsing
    // We target the legacy build specifically to prevent Webpack from 
    // trying to use Node.js polyfills on the client side.
    config.module.rules.push({
      test: /\.mjs$/,
      include: /node_modules/,
      type: "javascript/esm",
    });

    // 3. Support for PDF.js Top-Level Await
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
      layers: true,
    };

    // 4. Suppress critical dependency warnings (common with PDF.js)
    config.module.exprContextCritical = false;

    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;