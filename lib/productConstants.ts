// lib/productConstants.ts
export const AVAILABLE_COLORS = [
    'Negro', 'Blanco', 'Gris', 'Beige', 'Marrón',
    'Rojo', 'Rosa', 'Fucsia', 'Morado', 'Lila',
    'Azul', 'Azul Marino', 'Celeste', 'Turquesa',
    'Verde', 'Verde Oliva', 'Menta',
    'Amarillo', 'Naranja', 'Dorado', 'Plateado',
    'Multicolor', 'Estampado'
];

export const AVAILABLE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export const COLOR_HEX_MAP: Record<string, string> = {
    'Negro': '#000000',
    'Blanco': '#FFFFFF',
    'Gris': '#808080',
    'Beige': '#F5F5DC',
    'Marrón': '#8B4513',
    'Rojo': '#FF0000',
    'Rosa': '#FFC0CB',
    'Fucsia': '#FF00FF',
    'Morado': '#800080',
    'Lila': '#C8A2C8',
    'Azul': '#0000FF',
    'Azul Marino': '#000080',
    'Celeste': '#87CEEB',
    'Turquesa': '#40E0D0',
    'Verde': '#008000',
    'Verde Oliva': '#808000',
    'Menta': '#98FF98',
    'Amarillo': '#FFFF00',
    'Naranja': '#FFA500',
    'Dorado': '#FFD700',
    'Plateado': '#C0C0C0',
    'Multicolor': 'linear-gradient(90deg, red, orange, yellow, green, blue, indigo, violet)',
    'Estampado': 'repeating-linear-gradient(45deg, #606dbc, #606dbc 10px, #465298 10px, #465298 20px)'
};
