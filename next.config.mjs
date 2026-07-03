import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  outputFileTracingIncludes: {
    '/api/psn/sync': [
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
    ],
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
