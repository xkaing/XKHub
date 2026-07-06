import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const psnSyncTraceIncludes = [
  './scripts/psn-sync.mjs',
  './node_modules/@supabase/**/*',
  './node_modules/iceberg-js/**/*',
  './node_modules/isomorphic-unfetch/**/*',
  './node_modules/node-fetch/**/*',
  './node_modules/psn-api/**/*',
  './node_modules/tr46/**/*',
  './node_modules/tslib/**/*',
  './node_modules/unfetch/**/*',
  './node_modules/webidl-conversions/**/*',
  './node_modules/whatwg-url/**/*',
]

const nextConfig = {
  allowedDevOrigins: ['127.0.0.1'],
  turbopack: {
    root: __dirname,
  },
  outputFileTracingIncludes: {
    '/api/psn/sync': psnSyncTraceIncludes,
  },
  images: {
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'image.api.playstation.com',
      },
      {
        protocol: 'https',
        hostname: 'psnobj.prod.dl.playstation.net',
      },
      {
        protocol: 'http',
        hostname: 'psn-rsc.prod.dl.playstation.net',
      },
      {
        protocol: 'https',
        hostname: 'psn-rsc.prod.dl.playstation.net',
      },
    ],
  },
}

export default nextConfig
