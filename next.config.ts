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
      // Si tienes otros dominios de imágenes (como Unsplash, Google, Vercel, etc.), agrégalos aquí como remotePatterns
    ],
  },

  // Puedes dejar otras configuraciones aquí (como experimental: { turbo: false })
  // ...
};

module.exports = nextConfig;