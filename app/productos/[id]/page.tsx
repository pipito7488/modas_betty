// app/productos/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ShoppingBag, Heart, Loader2, ArrowLeft, Check } from 'lucide-react';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    sizes: string[];
    colors: string[];
    images: string[];
    featured: boolean;
    seller: {
        name: string;
        email: string;
    };
}

export default function ProductDetailPage() {
    const params = useParams();
    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(0);
    const [selectedSize, setSelectedSize] = useState('');
    const [selectedColor, setSelectedColor] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [isFavorite, setIsFavorite] = useState(false);

    useEffect(() => {
        if (params.id) {
            fetchProduct(params.id as string);
        }
    }, [params.id]);

    const fetchProduct = async (id: string) => {
        setLoading(true);
        setError('');

        try {
            const response = await fetch(`/api/productos/${id}`);

            if (!response.ok) {
                throw new Error('Producto no encontrado');
            }

            const data = await response.json();
            setProduct(data);

            // Set default selections
            if (data.sizes && data.sizes.length > 0) {
                setSelectedSize(data.sizes[0]);
            }
            if (data.colors && data.colors.length > 0) {
                setSelectedColor(data.colors[0]);
            }

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error al cargar el producto');
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        // TODO: Implement add to cart functionality
        console.log('Adding to cart:', {
            productId: product?._id,
            size: selectedSize,
            color: selectedColor,
            quantity
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-amber-700" />
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <p className="text-gray-600 text-lg mb-4">{error || 'Producto no encontrado'}</p>
                    <Link
                        href="/productos"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a Productos
                    </Link>
                </div>
            </div>
        );
    }

    const isOutOfStock = product.stock === 0;
    const mainImage = product.images[selectedImage] || product.images[0];

    return (
        <main className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-8 max-w-7xl">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8">
                    <Link href="/" className="hover:text-gray-900">Inicio</Link>
                    <span>/</span>
                    <Link href="/productos" className="hover:text-gray-900">Productos</Link>
                    <span>/</span>
                    <span className="text-gray-900">{product.name}</span>
                </nav>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                    {/* Images Section */}
                    <div>
                        {/* Main Image */}
                        <div className="relative aspect-[4/5] bg-gray-100 rounded-lg overflow-hidden mb-4">
                            <Image
                                src={mainImage}
                                alt={product.name}
                                fill
                                className="object-cover"
                                sizes="(max-width: 1024px) 100vw, 50vw"
                                priority
                            />

                            {/* Favorite Button */}
                            <button
                                onClick={() => setIsFavorite(!isFavorite)}
                                className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-shadow"
                            >
                                <Heart
                                    className={`w-6 h-6 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-700'
                                        }`}
                                />
                            </button>
                        </div>

                        {/* Thumbnail Images */}
                        {product.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {product.images.map((image, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setSelectedImage(index)}
                                        className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${selectedImage === index
                                                ? 'border-amber-700'
                                                : 'border-transparent hover:border-gray-300'
                                            }`}
                                    >
                                        <Image
                                            src={image}
                                            alt={`${product.name} ${index + 1}`}
                                            fill
                                            className="object-cover"
                                            sizes="(max-width: 1024px) 25vw, 12vw"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Product Info Section */}
                    <div>
                        <p className="text-sm text-gray-600 uppercase tracking-wide font-medium mb-2">
                            {product.category}
                        </p>

                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                            {product.name}
                        </h1>

                        <div className="flex items-center gap-4 mb-6">
                            <p className="text-3xl font-bold text-gray-900">
                                ${product.price.toLocaleString('es-AR')}
                            </p>

                            {product.stock > 0 && product.stock < 10 && (
                                <span className="text-sm text-orange-600 font-medium">
                                    ¡Solo quedan {product.stock}!
                                </span>
                            )}
                        </div>

                        <p className="text-gray-600 leading-relaxed mb-8">
                            {product.description}
                        </p>

                        {/* Size Selector */}
                        {product.sizes && product.sizes.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-900 mb-3">
                                    Talla
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.sizes.map((size) => (
                                        <button
                                            key={size}
                                            onClick={() => setSelectedSize(size)}
                                            className={`px-6 py-3 border rounded-lg font-medium transition-all ${selectedSize === size
                                                    ? 'bg-amber-700 text-white border-amber-700'
                                                    : 'bg-white text-gray-900 border-gray-300 hover:border-amber-700'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Color Selector */}
                        {product.colors && product.colors.length > 0 && (
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-900 mb-3">
                                    Color
                                </label>
                                <div className="flex flex-wrap gap-2">
                                    {product.colors.map((color) => (
                                        <button
                                            key={color}
                                            onClick={() => setSelectedColor(color)}
                                            className={`px-6 py-3 border rounded-lg font-medium transition-all ${selectedColor === color
                                                    ? 'bg-amber-700 text-white border-amber-700'
                                                    : 'bg-white text-gray-900 border-gray-300 hover:border-amber-700'
                                                }`}
                                        >
                                            {color}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quantity Selector */}
                        <div className="mb-8">
                            <label className="block text-sm font-medium text-gray-900 mb-3">
                                Cantidad
                            </label>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    -
                                </button>
                                <span className="text-lg font-semibold min-w-[3rem] text-center">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                    disabled={quantity >= product.stock}
                                    className="w-10 h-10 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Add to Cart Button */}
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className={`w-full py-4 rounded-lg font-semibold uppercase tracking-wider flex items-center justify-center gap-2 transition-all ${isOutOfStock
                                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                    : 'bg-amber-700 text-white hover:bg-amber-800 shadow-lg hover:shadow-xl'
                                }`}
                        >
                            {isOutOfStock ? (
                                'Agotado'
                            ) : (
                                <>
                                    <ShoppingBag className="w-5 h-5" />
                                    Añadir al Carrito
                                </>
                            )}
                        </button>

                        {/* Product Features */}
                        <div className="mt-8 pt-8 border-t border-gray-200">
                            <h3 className="font-semibold text-gray-900 mb-4">Detalles del Producto</h3>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">Envío gratis en compras superiores a $50.000</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">Devoluciones gratuitas dentro de 30 días</span>
                                </li>
                                <li className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                    <span className="text-gray-600">100% Auténtico</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
