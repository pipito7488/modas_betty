// app/components/ProductCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  sizes: string[];
  images: string[];
  featured: boolean;
}

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const mainImage = product.images?.[0] || '/placeholder-product.jpg';
  const isOutOfStock = product.stock === 0;

  return (
    <div className="group relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100">
      {/* Imagen del Producto */}
      <Link href={`/productos/${product._id}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100">
        {!isImageLoaded && (
          <div className="animate-pulse bg-gray-200 w-full h-full" />
        )}

        <Image
          src={mainImage}
          alt={product.name}
          fill
          className={`
            object-cover object-center 
            transition-all duration-700 ease-out
            group-hover:scale-110
            ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoad={() => setIsImageLoaded(true)}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Overlay oscuro sutil al hover */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.featured && (
            <span className="bg-amber-700 text-white text-xs font-medium px-3 py-1 rounded-full">
              Destacado
            </span>
          )}
          {isOutOfStock && (
            <span className="bg-red-600 text-white text-xs font-medium px-3 py-1 rounded-full">
              Agotado
            </span>
          )}
        </div>

        {/* Botón de Favorito */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-3 right-3 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10"
          aria-label="Agregar a favoritos"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
              }`}
          />
        </button>
      </Link>

      {/* Información del Producto */}
      <div className="p-4 space-y-2">
        <p className="text-xs text-gray-500 uppercase tracking-wide font-medium">
          {product.category}
        </p>

        <h3 className="text-base font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
          <Link href={`/productos/${product._id}`} className="hover:text-amber-700 transition-colors">
            {product.name}
          </Link>
        </h3>

        <div className="flex items-center gap-2 text-xs text-gray-500">
          {product.sizes && product.sizes.length > 0 && (
            <span>Tallas: {product.sizes.join(', ')}</span>
          )}
        </div>

        <div className="flex items-baseline justify-between pt-2">
          <p className="text-xl font-bold text-gray-900">
            ${product.price.toLocaleString('es-AR')}
          </p>
        </div>

        {/* Botón de Agregar al Carrito */}
        <button
          disabled={isOutOfStock}
          className={`
            w-full mt-3 py-2.5 text-sm font-medium uppercase tracking-wider
            flex items-center justify-center gap-2
            transition-all duration-300
            ${isOutOfStock
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-gray-900 text-white hover:bg-amber-700'
            }
          `}
        >
          <ShoppingBag className="w-4 h-4" />
          {isOutOfStock ? 'Agotado' : 'Añadir al Carrito'}
        </button>
      </div>
    </div>
  );
}