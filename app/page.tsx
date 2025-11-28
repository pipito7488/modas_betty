// app/page.tsx
'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Check, Truck, Shield, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';

interface Product {
    _id: string;
    nombre: string;
    descripcion: string;
    precio: number;
    imagenes: string[];
    estado: string;
}

export default function HomePage() {
    const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchFeaturedProducts() {
            try {
                const response = await fetch('/api/productos?limit=4');
                const data = await response.json();
                if (data.productos) {
                    // Filter only active products
                    const activeProducts = data.productos.filter((p: Product) => p.estado === 'activo');
                    setFeaturedProducts(activeProducts.slice(0, 4));
                }
            } catch (error) {
                console.error('Error fetching featured products:', error);
            } finally {
                setLoading(false);
            }
        }

        fetchFeaturedProducts();
    }, []);

    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[90vh] min-h-[700px] w-full overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070"
                    alt="Fashion Collection"
                    fill
                    priority
                    className="object-cover brightness-[0.65]"
                />

                {/* Enhanced Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />

                {/* Animated Accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-amber-400 to-amber-600 animate-gradient-shimmer" />

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-6 text-white">
                    <div className="animate-fade-in-up">
                        <h1 className="font-headline text-6xl md:text-8xl font-bold mb-6 tracking-tight">
                            Elegancia Atemporal
                        </h1>

                        <p className="text-xl md:text-2xl font-light max-w-2xl mb-12 text-gray-100 leading-relaxed">
                            Descubre colecciones exclusivas que definen tu estilo único
                        </p>

                        <Link
                            href="/productos"
                            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-gray-900 text-sm font-bold uppercase tracking-wider hover:bg-amber-50 transition-all duration-300 shadow-2xl hover:shadow-amber-500/20 transform hover:scale-105 hover:-translate-y-1"
                        >
                            <Sparkles className="w-5 h-5" />
                            Ver Productos
                        </Link>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            {!loading && featuredProducts.length > 0 && (
                <section className="py-24 bg-white">
                    <div className="container mx-auto px-4 max-w-7xl">
                        <div className="text-center mb-16 animate-fade-in-up">
                            <h2 className="font-headline text-5xl md:text-6xl font-semibold mb-4 text-gray-900">
                                Productos Destacados
                            </h2>
                            <div className="w-24 h-1.5 bg-gradient-to-r from-amber-600 to-amber-400 mx-auto" />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                            {featuredProducts.map((product, index) => (
                                <Link
                                    key={product._id}
                                    href={`/productos/${product._id}`}
                                    className={`group relative block overflow-hidden bg-white shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-scale-in animation-delay-${index * 100}`}
                                >
                                    <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
                                        {product.imagenes && product.imagenes.length > 0 ? (
                                            <img
                                                src={product.imagenes[0]}
                                                alt={product.nombre}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                <Sparkles className="w-16 h-16" />
                                            </div>
                                        )}

                                        {/* Overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                    </div>

                                    <div className="p-6">
                                        <h3 className="font-semibold text-lg mb-2 text-gray-900 line-clamp-1 group-hover:text-amber-700 transition-colors">
                                            {product.nombre}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {product.descripcion}
                                        </p>
                                        <p className="text-2xl font-bold text-amber-700">
                                            ${product.precio.toLocaleString('es-CL')}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        <div className="text-center mt-12">
                            <Link
                                href="/productos"
                                className="inline-flex items-center gap-2 px-8 py-3 border-2 border-gray-900 text-gray-900 font-medium uppercase tracking-wider hover:bg-gray-900 hover:text-white transition-all duration-300"
                            >
                                Ver Todos los Productos
                            </Link>
                        </div>
                    </div>
                </section>
            )}

            {/* Value Proposition */}
            <section className="py-28 bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid md:grid-cols-3 gap-16">
                        <div className="text-center group animate-fade-in-up">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-600 to-amber-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Check className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="font-headline text-2xl font-semibold mb-4 text-gray-900">
                                Calidad Premium
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Prendas seleccionadas con tejidos de la más alta calidad
                            </p>
                        </div>

                        <div className="text-center group animate-fade-in-up animation-delay-200">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-600 to-amber-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Truck className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="font-headline text-2xl font-semibold mb-4 text-gray-900">
                                Envío a Todo Chile
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Despacho a todo el país con múltiples opciones de entrega
                            </p>
                        </div>

                        <div className="text-center group animate-fade-in-up animation-delay-400">
                            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-amber-600 to-amber-500 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                                <Shield className="w-10 h-10 text-white" />
                            </div>
                            <h3 className="font-headline text-2xl font-semibold mb-4 text-gray-900">
                                Compra Segura
                            </h3>
                            <p className="text-gray-600 leading-relaxed">
                                Transacciones protegidas y atención personalizada
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-32 bg-gray-900 text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute inset-0" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,255,255,.05) 35px, rgba(255,255,255,.05) 70px)',
                    }} />
                </div>

                <div className="container mx-auto px-4 max-w-4xl text-center relative z-10">
                    <h2 className="font-headline text-5xl md:text-6xl font-semibold mb-6 animate-fade-in-up">
                        ¿Lista para Brillar?
                    </h2>
                    <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed animate-fade-in-up animation-delay-200">
                        Explora nuestra colección completa y encuentra las piezas perfectas que complementan tu estilo
                    </p>

                    <Link
                        href="/productos"
                        className="inline-flex items-center gap-3 px-10 py-5 bg-amber-600 hover:bg-amber-500 text-white text-sm font-bold uppercase tracking-wider transition-all duration-300 shadow-2xl hover:shadow-amber-500/50 transform hover:scale-105 animate-scale-bounce animation-delay-400"
                    >
                        <Sparkles className="w-5 h-5" />
                        Explorar Ahora
                    </Link>
                </div>
            </section>
        </main>
    );
}
