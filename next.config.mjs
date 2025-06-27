/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {


    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
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