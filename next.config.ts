import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
  },
   env: {
    // Expose environment variables to the browser
    NEXT_PUBLIC_USE_MOCK_API: process.env.NEXT_PUBLIC_USE_MOCK_API,
    NEXT_PUBLIC_BACKEND_API_ENDPOINT: process.env.NEXT_PUBLIC_BACKEND_API_ENDPOINT, // Expose backend endpoint
  },
};

export default nextConfig;
