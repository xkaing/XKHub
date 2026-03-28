/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['antd', '@ant-design/icons', '@ant-design/cssinjs'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'faltruhdczvgyfltmick.supabase.co',
      },
    ],
  },
}

export default nextConfig