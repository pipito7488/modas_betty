// app/admin/vendedores/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Store, Package, ShoppingCart, DollarSign, Check, X, Search, Loader2, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Vendor {
    _id: string;
    name: string;
    email: string;
    active: boolean;
    profileComplete: boolean;
    canSell: boolean;
    createdAt: Date;
    phones: any[];
    addresses: any[];
    paymentMethods: any[];
    stats: {
        products: number;
        orders: number;
        totalSales: number;
    };
}

export default function AdminVendorsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [vendors, setVendors] = useState<Vendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [togglingVendor, setTogglingVendor] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        }
    }, [status, session, router]);

    useEffect(() => {
        fetchVendors();
    }, []);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/vendors');
            const data = await response.json();
            setVendors(data || []);
        } catch (error) {
            console.error('Error fetching vendors:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleActive = async (vendorId: string, currentStatus: boolean) => {
        setTogglingVendor(vendorId);
        try {
            const response = await fetch(`/api/admin/users/${vendorId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: !currentStatus })
            });

            if (response.ok) {
                fetchVendors();
            } else {
                alert('Error al actualizar vendedor');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error al actualizar vendedor');
        } finally {
            setTogglingVendor(null);
        }
    };

    const filteredVendors = vendors.filter((vendor) =>
        vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vendor.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalStats = {
        vendors: vendors.length,
        activeVendors: vendors.filter(v => v.active).length,
        totalProducts: vendors.reduce((sum, v) => sum + v.stats.products, 0),
        totalSales: vendors.reduce((sum, v) => sum + v.stats.totalSales, 0)
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-amber-700" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/admin" className="text-sm text-amber-700 hover:text-amber-800 mb-2 inline-block">
                        ← Volver al Dashboard
                    </Link>
                    <h1 className="font-headline text-4xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 bg-clip-text text-transparent mb-2">
                        Gestión de Vendedores
                    </h1>
                    <p className="text-gray-600">
                        Administra los vendedores y sus estadísticas
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow-lg border-2 border-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Vendedores</p>
                                <p className="text-3xl font-bold text-green-700">{totalStats.vendors}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                                <Store className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg shadow-lg border-2 border-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Vendedores Activos</p>
                                <p className="text-3xl font-bold text-blue-700">{totalStats.activeVendors}</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl">
                                <Check className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg shadow-lg border-2 border-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total Productos</p>
                                <p className="text-3xl font-bold text-purple-700">{totalStats.totalProducts}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg shadow-lg border-2 border-white">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Ventas Totales</p>
                                <p className="text-3xl font-bold text-amber-700">${totalStats.totalSales.toLocaleString('es-CL')}</p>
                            </div>
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
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
                            placeholder="Buscar por nombre o email..."
                            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white"
                        />
                    </div>
                </div>

                {/* Vendors Table */}
                <div className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-amber-100">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gradient-to-r from-amber-50 to-white">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Vendedor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Perfil
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Productos
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Órdenes
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Ventas
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredVendors.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                            {loading ? 'Cargando...' : 'No se encontraron vendedores'}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredVendors.map((vendor) => (
                                        <tr key={vendor._id} className="hover:bg-amber-50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div>
                                                    <div className="font-medium text-gray-900">{vendor.name}</div>
                                                    <div className="text-sm text-gray-500">{vendor.email}</div>
                                                    <div className="text-xs text-gray-400 mt-1">
                                                        Desde: {new Date(vendor.createdAt).toLocaleDateString('es-CL')}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        {vendor.canSell ? (
                                                            <Check className="w-4 h-4 text-green-600" />
                                                        ) : (
                                                            <X className="w-4 h-4 text-red-600" />
                                                        )}
                                                        <span className="text-sm">
                                                            {vendor.canSell ? 'Puede vender' : 'No puede vender'}
                                                        </span>
                                                    </div>
                                                    {!vendor.canSell && (
                                                        <div className="flex items-center gap-1 text-xs text-amber-700">
                                                            <AlertCircle className="w-3 h-3" />
                                                            <span>Perfil incompleto</span>
                                                        </div>
                                                    )}
                                                    <div className="text-xs text-gray-500">
                                                        {vendor.addresses?.length || 0} dirección(es) • {vendor.phones?.length || 0} teléfono(s) • {vendor.paymentMethods?.length || 0} método(s) de pago
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <Package className="w-4 h-4 text-purple-600" />
                                                    <span className="font-medium text-gray-900">
                                                        {vendor.stats.products}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                                                    <span className="font-medium text-gray-900">
                                                        {vendor.stats.orders}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <DollarSign className="w-4 h-4 text-green-600" />
                                                    <span className="font-medium text-gray-900">
                                                        ${vendor.stats.totalSales.toLocaleString('es-CL')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${vendor.active
                                                        ? 'bg-green-100 text-green-800'
                                                        : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {vendor.active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleToggleActive(vendor._id, vendor.active)}
                                                    disabled={togglingVendor === vendor._id}
                                                    className={`inline-flex items-center gap-1 px-3 py-1.5 text-sm rounded transition-colors ${vendor.active
                                                            ? 'text-red-700 hover:bg-red-50'
                                                            : 'text-green-700 hover:bg-green-50'
                                                        } disabled:opacity-50`}
                                                >
                                                    {togglingVendor === vendor._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : vendor.active ? (
                                                        <X className="w-4 h-4" />
                                                    ) : (
                                                        <Check className="w-4 h-4" />
                                                    )}
                                                    {vendor.active ? 'Desactivar' : 'Activar'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Summary */}
                {filteredVendors.length > 0 && (
                    <div className="mt-4 text-sm text-gray-600 text-center">
                        Mostrando {filteredVendors.length} de {vendors.length} vendedores
                    </div>
                )}
            </div>
        </div>
    );
}
