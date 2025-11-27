// app/admin/estadisticas/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { TrendingUp, DollarSign, ShoppingCart, Users, Store, Package, Crown, Loader2, Award } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Stats {
    general: {
        totalUsers: number;
        totalVendors: number;
        activeVendors: number;
        totalProducts: number;
        activeProducts: number;
    };
    orders: {
        totalOrders: number;
        completedOrders: number;
        pendingOrders: number;
    };
    sales: {
        totalSales: number;
        totalCommissions: number;
        totalVendorNet: number;
        averageOrderValue: number;
    };
    topVendors: any[];
    topProducts: any[];
    salesByMonth: any[];
}

export default function AdminStatsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        }
    }, [status, session, router]);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        setLoading(true);
        try {
            const response = await fetch('/api/admin/stats');
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-purple-700" />
            </div>
        );
    }

    if (!stats) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <Link href="/admin" className="text-sm text-purple-700 hover:text-purple-800 mb-2 inline-block">
                        ← Volver al Dashboard
                    </Link>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
                            <TrendingUp className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="font-headline text-4xl font-bold bg-gradient-to-r from-purple-700 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                            Estadísticas del Marketplace
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Métricas, análisis y reportes de rendimiento
                    </p>
                </div>

                {/* Ventas y Comisiones - Cards Principales */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow-lg border-2 border-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Ventas Totales</p>
                        <p className="text-3xl font-bold text-green-700">${stats.sales.totalSales.toLocaleString('es-CL')}</p>
                        <p className="text-xs text-gray-500 mt-1">{stats.orders.completedOrders} órdenes completadas</p>
                    </div>

                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-lg shadow-lg border-2 border-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-3 rounded-xl">
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Comisiones Ganadas</p>
                        <p className="text-3xl font-bold text-amber-700">${stats.sales.totalCommissions.toLocaleString('es-CL')}</p>
                        <p className="text-xs text-gray-500 mt-1">Ingresos de la plataforma</p>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 rounded-lg shadow-lg border-2 border-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-3 rounded-xl">
                                <ShoppingCart className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Ticket Promedio</p>
                        <p className="text-3xl font-bold text-blue-700">${Math.round(stats.sales.averageOrderValue).toLocaleString('es-CL')}</p>
                        <p className="text-xs text-gray-500 mt-1">Por orden completada</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg shadow-lg border-2 border-white">
                        <div className="flex items-center justify-between mb-2">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">Total Órdenes</p>
                        <p className="text-3xl font-bold text-purple-700">{stats.orders.totalOrders}</p>
                        <p className="text-xs text-gray-500 mt-1">{stats.orders.pendingOrders} pendientes</p>
                    </div>
                </div>

                {/* Métricas Generales */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="w-6 h-6 text-purple-600" />
                            <h3 className="font-semibold text-gray-800">Usuarios</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Clientes:</span>
                                <span className="font-bold text-gray-800">{stats.general.totalUsers}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Vendedores:</span>
                                <span className="font-bold text-gray-800">{stats.general.totalVendors}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Vendedores activos:</span>
                                <span className="font-bold text-green-600">{stats.general.activeVendors}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <Package className="w-6 h-6 text-purple-600" />
                            <h3 className="font-semibold text-gray-800">Productos</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Total productos:</span>
                                <span className="font-bold text-gray-800">{stats.general.totalProducts}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Activos:</span>
                                <span className="font-bold text-green-600">{stats.general.activeProducts}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Inactivos:</span>
                                <span className="font-bold text-gray-500">{stats.general.totalProducts - stats.general.activeProducts}</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-lg border-2 border-purple-100">
                        <div className="flex items-center gap-3 mb-4">
                            <DollarSign className="w-6 h-6 text-purple-600" />
                            <h3 className="font-semibold text-gray-800">Distribución</h3>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Vendedores reciben:</span>
                                <span className="font-bold text-green-600">${stats.sales.totalVendorNet.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Plataforma recibe:</span>
                                <span className="font-bold text-amber-600">${stats.sales.totalCommissions.toLocaleString('es-CL')}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">% Comisión promedio:</span>
                                <span className="font-bold text-purple-600">
                                    {stats.sales.totalSales > 0
                                        ? ((stats.sales.totalCommissions / stats.sales.totalSales) * 100).toFixed(1)
                                        : 0}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Top Vendedores y Productos */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Top Vendedores */}
                    <div className="bg-white rounded-lg shadow-lg border-2 border-purple-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-lg">
                                <Award className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-800">Top 5 Vendedores</h3>
                        </div>
                        <div className="space-y-4">
                            {stats.topVendors.map((vendor, index) => (
                                <div key={vendor.vendorId} className="flex items-center gap-4 p-3 bg-gradient-to-r from-purple-50 to-transparent rounded-lg hover:from-purple-100 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">#{index + 1}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 truncate">{vendor.vendorName}</p>
                                        <p className="text-xs text-gray-500 truncate">{vendor.vendorEmail}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-700">${vendor.totalSales.toLocaleString('es-CL')}</p>
                                        <p className="text-xs text-gray-500">{vendor.totalOrders} órdenes</p>
                                    </div>
                                </div>
                            ))}
                            {stats.topVendors.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                            )}
                        </div>
                    </div>

                    {/* Top Productos */}
                    <div className="bg-white rounded-lg shadow-lg border-2 border-purple-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-lg">
                                <Package className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-800">Top 5 Productos</h3>
                        </div>
                        <div className="space-y-4">
                            {stats.topProducts.map((product, index) => (
                                <div key={product.productId} className="flex items-center gap-4 p-3 bg-gradient-to-r from-pink-50 to-transparent rounded-lg hover:from-pink-100 transition-colors">
                                    <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-purple-400 to-purple-600 rounded-full flex items-center justify-center">
                                        <span className="text-white font-bold text-sm">#{index + 1}</span>
                                    </div>
                                    {product.productImage && (
                                        <div className="relative w-12 h-12 flex-shrink-0">
                                            <Image
                                                src={product.productImage}
                                                alt={product.productName}
                                                fill
                                                className="object-cover rounded"
                                            />
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-gray-800 truncate">{product.productName}</p>
                                        <p className="text-xs text-gray-500">Vendidos: {product.totalQuantity} unidades</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-purple-700">${product.totalRevenue.toLocaleString('es-CL')}</p>
                                    </div>
                                </div>
                            ))}
                            {stats.topProducts.length === 0 && (
                                <p className="text-center text-gray-500 py-8">No hay datos disponibles</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Ventas por Mes */}
                {stats.salesByMonth.length > 0 && (
                    <div className="bg-white rounded-lg shadow-lg border-2 border-purple-100 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 p-2 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-white" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-800">Ventas por Mes (Últimos 6 meses)</h3>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full">
                                <thead>
                                    <tr className="border-b-2 border-purple-100">
                                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Mes</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Órdenes</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Ventas</th>
                                        <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Comisiones</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stats.salesByMonth.map((month, index) => {
                                        const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
                                        const monthName = monthNames[month._id.month - 1];
                                        return (
                                            <tr key={index} className="border-b border-gray-100 hover:bg-purple-50 transition-colors">
                                                <td className="py-3 px-4 font-medium text-gray-800">
                                                    {monthName} {month._id.year}
                                                </td>
                                                <td className="py-3 px-4 text-right text-gray-700">{month.totalOrders}</td>
                                                <td className="py-3 px-4 text-right font-bold text-green-700">
                                                    ${month.totalSales.toLocaleString('es-CL')}
                                                </td>
                                                <td className="py-3 px-4 text-right font-bold text-amber-700">
                                                    ${month.totalCommissions.toLocaleString('es-CL')}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
