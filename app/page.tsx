// app/page.tsx
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, Clock, RefreshCw } from 'lucide-react';

export default function HomePage() {
    return (
        <main className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="relative h-[85vh] min-h-[600px] w-full overflow-hidden">
                <Image
                    src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070"
                    alt="Fashion Collection"
                    fill
                    priority
                    className="object-cover brightness-75"
                />

                <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-black/60" />

                <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-8 text-white">
                    <h1 className="font-headline text-5xl md:text-7xl font-bold mb-6">
                        Elegancia Atemporal
                    </h1>

                    <p className="text-lg md:text-2xl font-light max-w-2xl mb-10">
                        Descubre colecciones exclusivas que definen tu estilo único.
                    </p>

                    <Link
                        href="/shop"
                        className="inline-flex items-center px-8 py-4 bg-amber-700 text-white text-sm font-medium uppercase tracking-wider hover:bg-amber-600 transition-all shadow-lg"
                    >
                        Explorar Colección
                    </Link>
                </div>
            </section>

            {/* Categories */}
            <section className="py-20 bg-white">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="text-center mb-16">
                        <h2 className="font-headline text-4xl md:text-5xl font-semibold mb-4">
                            Explora por Categoría
                        </h2>
                        <div className="w-20 h-1 bg-amber-700 mx-auto" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { name: 'Vestidos', img: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?q=80&w=800' },
                            { name: 'Blusas', img: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?q=80&w=800' },
                            { name: 'Pantalones', img: 'https://images.unsplash.com/photo-1624206112918-f140f087f9b5?q=80&w=800' },
                            { name: 'Accesorios', img: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?q=80&w=800' },
                        ].map((cat) => (
                            <Link key={cat.name} href="/shop" className="group relative block aspect-[3/4] overflow-hidden shadow-md hover:shadow-xl transition-all">
                                <img
                                    src={cat.img}
                                    alt={cat.name}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/60" />
                                <h3 className="absolute inset-0 flex items-center justify-center font-headline text-2xl font-semibold text-white uppercase">
                                    {cat.name}
                                </h3>
                            </Link>
                        ))}
                    </div>
                </div>
            </section>

            {/* Value Proposition */}
            <section className="py-24 bg-gray-50">
                <div className="container mx-auto px-4 max-w-7xl">
                    <div className="grid md:grid-cols-3 gap-12">
                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 bg-amber-700 rounded-full flex items-center justify-center">
                                <Check className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-headline text-2xl font-semibold mb-3">Calidad Premium</h3>
                            <p className="text-gray-600">
                                Prendas seleccionadas con tejidos de la más alta calidad.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 bg-amber-700 rounded-full flex items-center justify-center">
                                <Clock className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-headline text-2xl font-semibold mb-3">Envío Express</h3>
                            <p className="text-gray-600">
                                Recibe tus prendas en tiempo récord con envío rápido.
                            </p>
                        </div>

                        <div className="text-center">
                            <div className="w-16 h-16 mx-auto mb-6 bg-amber-700 rounded-full flex items-center justify-center">
                                <RefreshCw className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="font-headline text-2xl font-semibold mb-3">Devoluciones Fáciles</h3>
                            <p className="text-gray-600">
                                30 días para devoluciones sin complicaciones.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Newsletter */}
            <section className="py-24 bg-gray-900 text-white">
                <div className="container mx-auto px-4 max-w-4xl text-center">
                    <h2 className="font-headline text-4xl md:text-5xl font-semibold mb-6">
                        Mantente al Día
                    </h2>
                    <p className="text-xl text-gray-300 mb-10">
                        Suscríbete para recibir noticias exclusivas y tendencias de moda.
                    </p>

                    <form className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                        <input
                            type="email"
                            placeholder="Tu correo electrónico"
                            className="flex-1 px-6 py-4 bg-white/10 border border-white/20 text-white placeholder:text-gray-400 focus:outline-none focus:border-amber-500"
                        />
                        <button
                            type="submit"
                            className="px-8 py-4 bg-amber-700 hover:bg-amber-600 text-white font-medium uppercase flex items-center justify-center gap-2"
                        >
                            Suscribirse
                            <ArrowRight className="w-5 h-5" />
                        </button>
                    </form>
                </div>
            </section>
        </main>
    );
}
