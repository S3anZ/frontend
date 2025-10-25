/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false, // Disable to avoid issues with external scripts
  // Memory and build optimizations
  experimental: {
    // Reduce memory usage during build
    workerThreads: false,
    // Optimize bundle splitting
    optimizePackageImports: ['framer-motion', 'lucide-react', '@tabler/icons-react']
  },
  // Webpack optimizations for memory usage
  webpack: (config, { isServer, dev }) => {
    // Memory optimizations
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        // Reduce memory usage during build
        minimize: true,
        // Split chunks more aggressively to reduce memory pressure
        splitChunks: {
          ...config.optimization.splitChunks,
          cacheGroups: {
            ...config.optimization.splitChunks?.cacheGroups,
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
              maxSize: 244000, // 244KB chunks
            },
          },
        },
      };
    }

    // Preserve jQuery and other external libraries
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Add path alias for @ to resolve to project root
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname),
    };
    
    return config;
  },
  // Allow loading external scripts and resources
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
