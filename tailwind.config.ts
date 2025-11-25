// tailwind.config.js

const colors = require('tailwindcss/colors');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    // Rutas de tus componentes para que Tailwind sepa qué clases generar
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      // 1. Configurar las variables de fuente definidas en layout.tsx
      fontFamily: {
        body: ['var(--font-body)'],       // Inter (para párrafos y texto general)
        headline: ['var(--font-headline)'], // Playfair Display (para títulos)
      },

      // 2. Definir una paleta de colores elegante y minimalista
      colors: {
        // Colores base para texto y fondo (usan los valores del CSS heredado)
        'app-foreground': colors.gray['950'], // Negro profundo para el texto
        'app-background': colors.white, 
        
        // Color de Acento Sofisticado (Marrón Tostado/Stone para botones y hover)
        accent: {
          DEFAULT: colors.stone['700'], // Color principal de acento
          light: colors.stone['500'],    // Color de acento para hover
        },

        // Colores secundarios y bordes más sutiles
        secondary: colors.gray, 
        border: colors.gray,
      },
      
      // Asegurar que el radio de borde (var(--radius)) sea reconocido
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [],
}