import { setupDevPlatform } from '@cloudflare/next-on-pages/next-dev'

// Here we use the @cloudflare/next-on-pages next-dev module to allow us to use bindings during local development
// (when running the application with `next dev`), for more information see:
// https://github.com/cloudflare/next-on-pages/blob/2408b55/internal-packages/next-dev/README.md
if (process.env.NODE_ENV === 'development') {
  await setupDevPlatform()
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    domains: ['localhost', 'firebasestorage.googleapis.com', 'images.belautocenter.by'],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 год
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    esmExternals: 'loose',
    optimizeCss: true,
    optimizePackageImports: ['firebase', 'lucide-react', '@radix-ui/react-dialog'],
  },
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Добавляем конфигурацию для совместимости с iOS Safari
  transpilePackages: ['firebase'],
  webpack: (config, { isServer }) => {
    // Добавляем полифиллы для совместимости с iOS 16.2
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      }
    }
    return config
  },
  // Оптимизация для кэширования
  headers: async () => {
    return [
      {
        source: '/api/firestore/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=60',
          },
          {
            key: 'Vary',
            value: 'Accept-Encoding',
          },
        ],
      },
      {
        source: '/((?!api|_next/static|_next/image|favicon.ico|adminbel).*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=300, stale-while-revalidate=3600',
          },
        ],
      },
    ]
  },
}

export default nextConfig
