// app/productos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/app/components/ProductCard';
import ProductFilters, { FilterState } from '@/app/components/ProductFilters';
import ProductSearch from '@/app/components/ProductSearch';
import { ChevronDown, Loader2 } from 'lucide-react';

export default function ProductosPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 0 });

    const [filters, setFilters] = useState<FilterState>({
        category: '',
        minPrice: '',
        maxPrice: '',
        size: ''
    });

    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('');

    // Fetch products cuando cambien los filtros
    useEffect(() => {
        fetchProducts();
    }, [filters, searchQuery, sortBy, pagination.page]);

    const fetchProducts = async () => {
        setLoading(true);
        setError('');

        try {
            // Construir query params
            const params = new URLSearchParams();

            if (filters.category) params.append('category', filters.category);
            if (filters.minPrice) params.append('minPrice', filters.minPrice);
            if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
            if (filters.size) params.append('size', filters.size);
            if (searchQuery) params.append('search', searchQuery);
            if (sortBy) params.append('sort', sortBy);
            params.append('page', pagination.page.toString());
            params.append('limit', pagination.limit.toString());

            const response = await fetch(`/api/productos?${params}`);

            if (!response.ok) {
                throw new Error('Error al cargar productos');
            }

            const data = await response.json();
            setProducts(data.products);
            setPagination(data.pagination);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (newFilters: FilterState) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
    };

    const handleSearch = (query: string) => {
        setSearchQuery(query);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to page 1
    };

    const handleSortChange = (newSort: string) => {
        setSortBy(newSort);
    };

    return (
        <main className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="font-headline text-4xl md:text-5xl font-bold mb-3">
                        Nuestros Productos
                    </h1>
                    <p className="text-gray-600">
                        Descubre nuestra colección de moda elegante y atemporal
                    </p>
                </div>

                {/* Search Bar */}
                <div className="mb-6">
                    <ProductSearch onSearch={handleSearch} initialValue={searchQuery} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar - Filtros */}
                    <aside className="lg:col-span-1">
                        <ProductFilters
                            onFilterChange={handleFilterChange}
                            currentFilters={filters}
                        />
                    </aside>

                    {/* Main Content - Products Grid */}
                    <div className="lg:col-span-3">

                        {/* Sort and Results Count */}
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-sm text-gray-600">
                                {loading ? (
                                    'Cargando...'
                                ) : (
                                    `${pagination.total} producto${pagination.total !== 1 ? 's' : ''} encontrado${pagination.total !== 1 ? 's' : ''}`
                                )}
                            </p>

                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => handleSortChange(e.target.value)}
                                    className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
                                >
                                    <option value="">Ordenar por</option>
                                    <option value="featured">Destacados</option>
                                    <option value="price-asc">Precio: Menor a Mayor</option>
                                    <option value="price-desc">Precio: Mayor a Menor</option>
                                    <option value="name-asc">Nombre A-Z</option>
                                </select>
                                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            </div>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                                <p className="text-red-800">{error}</p>
                                <button
                                    onClick={fetchProducts}
                                    className="mt-4 px-6 py-2 bg-red-700 text-white rounded-lg hover:bg-red-800 transition-colors"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && !error && products.length === 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
                                <p className="text-gray-600 text-lg mb-2">No se encontraron productos</p>
                                <p className="text-gray-500 text-sm">
                                    Intenta ajustar tus filtros o buscar algo diferente
                                </p>
                            </div>
                        )}

                        {/* Products Grid */}
                        {!loading && !error && products.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {products.map((product: any) => (
                                        <ProductCard key={product._id} product={product} />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-12">
                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                                            disabled={pagination.page === 1}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Anterior
                                        </button>

                                        <span className="text-sm text-gray-600">
                                            Página {pagination.page} de {pagination.pages}
                                        </span>

                                        <button
                                            onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                                            disabled={pagination.page === pagination.pages}
                                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Siguiente
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}
