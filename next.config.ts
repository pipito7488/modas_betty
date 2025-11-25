/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuración para permitir imágenes de Unsplash
  images: {
    domains: [
      'images.unsplash.com', // ¡Añade este dominio!
      // Si tienes otros dominios de imágenes (como Google, Vercel, etc.), agrégalos aquí
    ],
  },
  
  // Puedes dejar otras configuraciones aquí (como experimental: { turbo: false })
  // ...
};

module.exports = nextConfig;