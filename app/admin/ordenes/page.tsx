// app/admin/ordenes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Package, CheckCircle, XCircle, Clock, Eye, Loader2, Search } from 'lucide-react';

interface Order {
    _id: string;
    orderNumber: string;
    user: {
        name: string;
        email: string;
    };
    vendor: {
        name: string;
        email: string;
    };
    items: any[];
    total: number;
    status: string;
    paymentProof?: {
        imageUrl: string;
        uploadedAt: Date;
    };
    createdAt: Date;
}

export default function AdminOrdenesPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            // Verificar que sea admin
            if (session?.user?.role !== 'admin') {
                router.push('/');
                return;
            }
            loadOrders();
        }
    }, [status, router, session]);

    const loadOrders = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/admin/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOrder = async (orderId: string) => {
        if (!confirm('¿Confirmar esta orden?')) return;

        try {
            setProcessing(orderId);
            const res = await fetch(`/api/admin/orders/${orderId}/confirm`, {
                method: 'POST'
            });

            if (res.ok) {
                alert('Orden confirmada exitosamente');
                loadOrders();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al confirmar orden');
            }
        } catch (error) {
            console.error('Error confirming order:', error);
            alert('Error al confirmar orden');
        } finally {
            setProcessing(null);
        }
    };

    const handleCancelOrder = async (orderId: string) => {
        const reason = prompt('Razón de cancelación:');
        if (!reason) return;

        try {
            setProcessing(orderId);
            const res = await fetch(`/api/admin/orders/${orderId}/cancel`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            });

            if (res.ok) {
                alert('Orden cancelada exitosamente');
                loadOrders();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al cancelar orden');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            alert('Error al cancelar orden');
        } finally {
            setProcessing(null);
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'payment_pending': 'bg-yellow-100 text-yellow-800',
            'pending': 'bg-yellow-100 text-yellow-800',
            'confirmed': 'bg-green-100 text-green-800',
            'preparing': 'bg-blue-100 text-blue-800',
            'shipped': 'bg-purple-100 text-purple-800',
            'delivered': 'bg-green-100 text-green-800',
            'cancelled': 'bg-red-100 text-red-800'
        };
        return colors[status] || 'bg-gray-100 text-gray-800';
    };

    const getStatusText = (status: string) => {
        const texts: Record<string, string> = {
            'payment_pending': 'Pago Pendiente',
            'pending': 'Pendiente',
            'confirmed': 'Confirmado',
            'preparing': 'Preparando',
            'shipped': 'Enviado',
            'delivered': 'Entregado',
            'cancelled': 'Cancelado'
        };
        return texts[status] || status;
    };

    const filteredOrders = orders.filter(order => {
        // Filtro por estado
        if (filter !== 'all' && order.status !== filter) return false;

        // Filtro por búsqueda
        if (search) {
            const searchLower = search.toLowerCase();
            return (
                order.orderNumber.toLowerCase().includes(searchLower) ||
                order.user.name.toLowerCase().includes(searchLower) ||
                order.user.email.toLowerCase().includes(searchLower) ||
                order.vendor.name.toLowerCase().includes(searchLower)
            );
        }

        return true;
    });

    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'payment_pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        delivered: orders.filter(o => o.status === 'delivered').length
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-amber-700" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Gestión de Órdenes</h1>
                    <p className="text-gray-600 mt-1">Administra todas las órdenes del sistema</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
                        <p className="text-sm text-gray-600">Total Órdenes</p>
                        <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                    </div>
                    <div className="bg-yellow-50 rounded-lg shadow-sm p-4 border border-yellow-200">
                        <p className="text-sm text-yellow-700">Pendientes</p>
                        <p className="text-2xl font-bold text-yellow-900">{stats.pending}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg shadow-sm p-4 border border-green-200">
                        <p className="text-sm text-green-700">Confirmadas</p>
                        <p className="text-2xl font-bold text-green-900">{stats.confirmed}</p>
                    </div>
                    <div className="bg-blue-50 rounded-lg shadow-sm p-4 border border-blue-200">
                        <p className="text-sm text-blue-700">Entregadas</p>
                        <p className="text-2xl font-bold text-blue-900">{stats.delivered}</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Buscar por orden, usuario o vendedor..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="payment_pending">Pago Pendiente</option>
                            <option value="confirmed">Confirmado</option>
                            <option value="preparing">Preparando</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                </div>

                {/* Orders Table */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Orden
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Cliente
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Vendedor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Total
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Comprobante
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                                                <p className="text-xs text-gray-500">
                                                    {new Date(order.createdAt).toLocaleDateString('es-CL')}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div>
                                                <p className="text-sm font-medium text-gray-900">{order.user.name}</p>
                                                <p className="text-xs text-gray-500">{order.user.email}</p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm text-gray-900">{order.vendor.name}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <p className="text-sm font-semibold text-gray-900">
                                                ${order.total.toLocaleString('es-CL')}
                                            </p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {getStatusText(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {order.paymentProof ? (
                                                <a
                                                    href={order.paymentProof.imageUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 text-sm text-amber-700 hover:text-amber-800"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                    Ver
                                                </a>
                                            ) : (
                                                <span className="text-xs text-gray-400">Sin comprobante</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                {order.status === 'payment_pending' && order.paymentProof && (
                                                    <button
                                                        onClick={() => handleConfirmOrder(order._id)}
                                                        disabled={processing === order._id}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        <CheckCircle className="w-3 h-3" />
                                                        Confirmar
                                                    </button>
                                                )}
                                                {(order.status === 'payment_pending' || order.status === 'confirmed') && (
                                                    <button
                                                        onClick={() => handleCancelOrder(order._id)}
                                                        disabled={processing === order._id}
                                                        className="inline-flex items-center gap-1 px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        <XCircle className="w-3 h-3" />
                                                        Cancelar
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {filteredOrders.length === 0 && (
                        <div className="text-center py-12">
                            <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500">No se encontraron órdenes</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
