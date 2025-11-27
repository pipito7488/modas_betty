/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para permitir imágenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },

  // Puedes dejar otras configuraciones aquí (como experimental: { turbo: false })
  // ...
};

module.exports = nextConfig;