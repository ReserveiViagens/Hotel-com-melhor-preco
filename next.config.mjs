/** @type {import('next').NextConfig} */
const nextConfig = {
  // ========================================
  // OTIMIZAÇÕES DE PERFORMANCE
  // ========================================
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
    scrollRestoration: true,
    forceSwcTransforms: true
  },

  // ========================================
  // CDN GLOBAL E ASSETS
  // ========================================
  assetPrefix: process.env.NODE_ENV === 'production' ? 'https://cdn.reservei.com.br' : '',
  
  images: {
    domains: [
      'reservei.com.br',
      'images.unsplash.com',
      'via.placeholder.com',
      'cdn.reservei.com.br',
      'lh3.googleusercontent.com',
      'graph.facebook.com'
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 dias
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // ========================================
  // COMPRESSÃO E BUNDLE
  // ========================================
  compress: true,
  
  webpack: (config, { dev, isServer }) => {
    // Otimizações para produção
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      };
    }

    // Otimização de SVG
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    return config;
  },

  // ========================================
  // HEADERS DE SEGURANÇA
  // ========================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },

  // ========================================
  // REDIRECTS E REWRITES
  // ========================================
  async redirects() {
    return [
      {
        source: '/admin',
        destination: '/admin/dashboard',
        permanent: true,
      },
      {
        source: '/hotel',
        destination: '/hoteis',
        permanent: true,
      },
      {
        source: '/atracao',
        destination: '/atracoes',
        permanent: true,
      },
    ];
  },

  async rewrites() {
    return [
      {
        source: '/api/health',
        destination: '/api/health/route',
      },
      {
        source: '/sitemap.xml',
        destination: '/api/sitemap',
      },
      {
        source: '/robots.txt',
        destination: '/api/robots',
      },
      {
        source: '/manifest.json',
        destination: '/api/manifest',
      },
      {
        source: '/sw.js',
        destination: '/api/service-worker',
      },
    ];
  },

  // ========================================
  // ENVIRONMENT VARIABLES
  // ========================================
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // ========================================
  // OUTPUT CONFIGURATION
  // ========================================
  output: 'standalone',

  // ========================================
  // POWERED BY HEADER
  // ========================================
  poweredByHeader: false,

  // ========================================
  // REACT STRICT MODE
  // ========================================
  reactStrictMode: true,

  // ========================================
  // TYPESCRIPT
  // ========================================
  typescript: {
    ignoreBuildErrors: false,
  },

  // ========================================
  // ESLINT
  // ========================================
  eslint: {
    ignoreDuringBuilds: false,
  },

  // ========================================
  // TRAILING SLASH
  // ========================================
  trailingSlash: false,

  // ========================================
  // BASE PATH
  // ========================================
  basePath: '',

  // ========================================
  // SERVER EXTERNAL PACKAGES
  // ========================================
  serverExternalPackages: ['@prisma/client'],
};

export default nextConfig;
