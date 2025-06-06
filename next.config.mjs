/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['placehold.co'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  async redirects() {
    return [
      {
        source: '/',
        has: [{ type: 'host', value: 'bookabash.com' }],
        destination: 'https://www.bookabash.com',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;