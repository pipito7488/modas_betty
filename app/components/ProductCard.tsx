// components/ProductCard.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag } from 'lucide-react';

// Skeleton con diseño elegante
const ProductCardSkeleton = () => (
  <div className="animate-pulse space-y-3">
    <div className="bg-gray-200 aspect-[3/4] w-full"></div>
    <div className="h-4 bg-gray-200 w-3/4"></div>
    <div className="h-4 bg-gray-200 w-1/4"></div>
  </div>
);

export default function ProductCard({ product }: { product: any }) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="group relative bg-white rounded-none overflow-hidden transition-all duration-500 hover:shadow-2xl">
      {/* Contenedor de Imagen */}
      <Link href={`/productos/${product.slug}`} className="block relative aspect-[3/4] overflow-hidden bg-gray-100">
        {!isImageLoaded && <ProductCardSkeleton />}

        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className={`
            object-cover object-center 
            transition-all duration-700 ease-out
            group-hover:scale-110
            ${isImageLoaded ? 'opacity-100' : 'opacity-0'}
          `}
          onLoadingComplete={() => setIsImageLoaded(true)}
        />

        {/* Overlay oscuro sutil al hover */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-500"></div>

        {/* Botón de Favorito */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
          className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white z-10"
          aria-label="Agregar a favoritos"
        >
          <Heart
            className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'}`}
          />
        </button>
      </Link>

      {/* Información del Producto */}
      <div className="p-5 space-y-2 relative">
        <h3 className="text-base font-medium text-gray-900 line-clamp-2 min-h-[3rem]">
          <Link href={`/productos/${product.slug}`} className="hover:text-amber-700 transition-colors">
            {product.name}
          </Link>
        </h3>

        <p className="text-sm text-gray-500 uppercase tracking-wide">{product.category || 'Moda'}</p>

        <div className="flex items-baseline justify-between pt-2">
          <p className="text-xl font-semibold text-gray-900">
            ${product.price.toLocaleString('es-AR')}
          </p>

          {product.oldPrice && (
            <p className="text-sm text-gray-400 line-through">
              ${product.oldPrice.toLocaleString('es-AR')}
            </p>
          )}
        </div>

        {/* Botón de Agregar al Carrito - Se revela al hover */}
        <button className="w-full mt-4 bg-gray-900 text-white py-3 text-sm font-medium uppercase tracking-wider opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-500 hover:bg-amber-700 flex items-center justify-center gap-2">
          <ShoppingBag className="w-4 h-4" />
          Añadir al Carrito
        </button>
      </div>
    </div>
  );
}