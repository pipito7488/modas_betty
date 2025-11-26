// app/vendedor/productos/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Edit, Trash2, Loader2, Search } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function VendorProductsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [deleting, setDeleting] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'vendedor') {
            router.push('/');
        }
    }, [status, session, router]);

    useEffect(() => {
        if ((session?.user as any)?.id) {
            fetchMyProducts();
        }
    }, [session]);

    const fetchMyProducts = async () => {
        setLoading(true);
        try {
            const response = await fetch(`/api/productos?seller=${(session?.user as any)?.id}&limit=100`);
            const data = await response.json();
            setProducts(data.products || []);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este producto?')) return;

        setDeleting(id);
        try {
            const response = await fetch(`/api/productos/${id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setProducts(products.filter((p: any) => p._id !== id));
            } else {
                alert('Error al eliminar el producto');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al eliminar el producto');
        } finally {
            setDeleting(null);
        }
    };

    const filteredProducts = products.filter((product: any) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-amber-700" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Mis Productos</h1>
                        <p className="text-gray-600 mt-1">Gestiona tus productos publicados</p>
                    </div>
                    <Link
                        href="/vendedor/productos/nuevo"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Producto
                    </Link>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <p className="text-sm text-gray-600 mb-1">Total de Productos</p>
                        <p className="text-3xl font-bold text-gray-900">{products.length}</p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <p className="text-sm text-gray-600 mb-1">Productos Activos</p>
                        <p className="text-3xl font-bold text-green-600">
                            {products.filter((p: any) => p.active).length}
                        </p>
                    </div>
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <p className="text-sm text-gray-600 mb-1">Stock Total</p>
                        <p className="text-3xl font-bold text-amber-700">
                            {products.reduce((acc: number, p: any) => acc + (p.stock || 0), 0)}
                        </p>
                    </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Buscar en mis productos..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>

                {/* Products Grid */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Producto
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Categoría
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Precio
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Stock
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center">
                                            <div className="text-gray-500">
                                                {products.length === 0 ? (
                                                    <>
                                                        <p className="mb-2">Aún no tienes productos publicados</p>
                                                        <Link
                                                            href="/vendedor/productos/nuevo"
                                                            className="text-amber-700 hover:text-amber-800"
                                                        >
                                                            Crear tu primer producto
                                                        </Link>
                                                    </>
                                                ) : (
                                                    'No se encontraron productos con ese nombre'
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts.map((product: any) => (
                                        <tr key={product._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                                                        {product.images?.[0] && (
                                                            <Image
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="64px"
                                                            />
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{product.name}</div>
                                                        {product.featured && (
                                                            <span className="inline-block px-2 py-0.5 text-xs bg-amber-100 text-amber-800 rounded-full mt-1">
                                                                Destacado
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {product.category}
                                            </td>
                                            <td className="px-6 py-4 text-sm font-medium text-gray-900">
                                                ${product.price.toLocaleString('es-AR')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.stock === 0
                                                    ? 'bg-red-100 text-red-800'
                                                    : product.stock < 10
                                                        ? 'bg-yellow-100 text-yellow-800'
                                                        : 'bg-green-100 text-green-800'
                                                    }`}>
                                                    {product.stock} unidades
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.active
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {product.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right space-x-2">
                                                <Link
                                                    href={`/vendedor/productos/${product._id}/editar`}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-blue-700 hover:bg-blue-50 rounded transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                    Editar
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product._id)}
                                                    disabled={deleting === product._id}
                                                    className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                                >
                                                    {deleting === product._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                    Eliminar
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
