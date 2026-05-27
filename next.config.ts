import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'recharts',
      '@base-ui/react',
      'sonner',
      'cmdk',
    ],
    staleTimes: { dynamic: 60, static: 300 },
  },
  // Trim Prisma's bundle and avoid bundling its query engine into the client
  serverExternalPackages: ['@prisma/client', 'prisma'],
}

export default nextConfig
