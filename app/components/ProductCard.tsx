// app/components/ProductCard.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, Clock } from 'lucide-react';

interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  costPrice?: number;
  profitPercentage?: number;
  discountPercentage?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  launchDate?: string;
  stock: number;
  category: string;
  sizes: string[];
  images: string[];
  featured: boolean;
  visible?: boolean;
}

interface ProductCardProps {
  product: Product;
}

// Función para formatear números en CLP
const formatCLP = (value: number) => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function ProductCard({ product }: ProductCardProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');

  const mainImage = product.images?.[0] || '/placeholder-product.jpg';
  const isOutOfStock = product.stock === 0;

  // Calcular si hay oferta activa
  const now = new Date();
  const hasActiveDiscount = product.discountPercentage && product.discountPercentage > 0 && (
    !product.discountStartDate || new Date(product.discountStartDate) <= now
  ) && (
      !product.discountEndDate || new Date(product.discountEndDate) >= now
    );

  // Calcular precios
  const costPrice = product.costPrice || 0;
  const profitPercentage = product.profitPercentage || 0;
  const basePrice = costPrice * (1 + profitPercentage / 100);
  const finalPrice = product.price;

  // Verificar si hay lanzamiento próximo
  const hasUpcomingLaunch = product.launchDate && new Date(product.launchDate) > now;

  // Countdown para lanzamiento
  useEffect(() => {
    if (!hasUpcomingLaunch) return;

    const updateCountdown = () => {
      const launch = new Date(product.launchDate!);
      const diff = launch.getTime() - Date.now();

      if (diff <= 0) {
        setTimeLeft('');
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}h ${minutes}m`);
      } else {
        setTimeLeft(`${minutes}m ${seconds}s`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [hasUpcomingLaunch, product.launchDate]);

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
            ${isImageLoaded ? 'opacity-100' : 'opacity-0'} `}
          onLoad={() => setIsImageLoaded(true)}
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
        />

        {/* Overlay oscuro sutil al hover */}
        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity duration-300" />

        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {/* Badge OFERTA en rojo */}
          {hasActiveDiscount && (
            <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg animate-pulse">
              OFERTA -{product.discountPercentage}%
            </span>
          )}

          {product.featured && !hasActiveDiscount && (
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

        {/* Countdown para lanzamiento */}
        {hasUpcomingLaunch && timeLeft && (
          <div className="absolute bottom-3 left-3 right-3 bg-blue-600 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-lg flex items-center justify-center gap-2">
            <Clock className="w-4 h-4" />
            Lanza en: {timeLeft}
          </div>
        )}

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

        {/* Precios */}
        <div className="flex items-baseline justify-between pt-2">
          <div>
            {hasActiveDiscount ? (
              <div className="flex flex-col gap-1">
                <p className="text-sm text-gray-500 line-through">
                  {formatCLP(basePrice)}
                </p>
                <p className="text-xl font-bold text-red-600">
                  {formatCLP(finalPrice)}
                </p>
              </div>
            ) : (
              <p className="text-xl font-bold text-gray-900">
                {formatCLP(finalPrice)}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}