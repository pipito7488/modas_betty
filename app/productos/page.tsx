// app/productos/page.tsx
export default function ProductosPage() {
    return (
        <main className="min-h-screen bg-white">
            <div className="container mx-auto px-4 py-16 max-w-7xl">
                <div className="text-center mb-12">
                    <h1 className="font-headline text-4xl md:text-5xl font-semibold mb-4">
                        Nuestros Productos
                    </h1>
                    <div className="w-20 h-1 bg-amber-700 mx-auto mb-6" />
                    <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                        Explora nuestra colección completa de prendas elegantes y atemporales.
                    </p>
                </div>

                <div className="text-center py-20">
                    <p className="text-gray-500 text-xl mb-4">
                        Próximamente: Catálogo completo de productos
                    </p>
                    <p className="text-gray-400">
                        Estamos preparando nuestra colección para ti.
                    </p>
                </div>
            </div>
        </main>
    );
}
