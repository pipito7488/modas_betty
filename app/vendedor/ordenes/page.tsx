// app/vendedor/ordenes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
    Package,
    Clock,
    CheckCircle,
    XCircle,
    Upload,
    Eye,
    Truck,
    Search,
    Loader2,
    CreditCard,
    AlertCircle
} from 'lucide-react';
import Image from 'next/image';

interface Order {
    _id: string;
    orderNumber: string;
    user: {
        name: string;
        email: string;
    };
    items: any[];
    subtotal: number;
    shippingCost: number;
    total: number;
    status: string;
    paymentProof?: {
        imageUrl: string;
        uploadedAt: Date;
    };
    shippingMethod: string;
    shippingAddress?: any;
    pickupAddress?: any;
    customerContact: {
        phone: string;
        email: string;
    };
    createdAt: Date;
}

const statusConfig: Record<string, { label: string; color: string; icon: any; bgClass: string; textClass: string }> = {
    pending_payment: {
        label: 'Pendiente de Pago',
        color: 'yellow',
        icon: Clock,
        bgClass: 'bg-yellow-100',
        textClass: 'text-yellow-800'
    },
    payment_pending: {
        label: 'Pago Pendiente',
        color: 'blue',
        icon: Upload,
        bgClass: 'bg-blue-100',
        textClass: 'text-blue-800'
    },
    confirmed: {
        label: 'Pago Confirmado',
        color: 'green',
        icon: CheckCircle,
        bgClass: 'bg-green-100',
        textClass: 'text-green-800'
    },
    preparing: {
        label: 'En Preparación',
        color: 'purple',
        icon: Package,
        bgClass: 'bg-purple-100',
        textClass: 'text-purple-800'
    },
    shipped: {
        label: 'Enviado',
        color: 'indigo',
        icon: Truck,
        bgClass: 'bg-indigo-100',
        textClass: 'text-indigo-800'
    },
    delivered: {
        label: 'Entregado',
        color: 'green',
        icon: CheckCircle,
        bgClass: 'bg-green-100',
        textClass: 'text-green-800'
    },
    cancelled: {
        label: 'Cancelado',
        color: 'red',
        icon: XCircle,
        bgClass: 'bg-red-100',
        textClass: 'text-red-800'
    }
};

export default function VendorOrdersPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);  // Initialize as empty array
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredStatus, setFilteredStatus] = useState<string>('all');
    const [processingOrder, setProcessingOrder] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated' && session?.user?.role !== 'vendedor') {
            router.push('/');
            return;
        }

        if (status === 'authenticated') {
            loadOrders();
        }
    }, [status, session, router]);

    const loadOrders = async () => {
        try {
            const res = await fetch('/api/vendedor/orders');
            console.log('API Response status:', res.status);

            if (res.ok) {
                const data = await res.json();
                console.log('API Response data:', data);
                console.log('Type of data:', typeof data);
                console.log('Type of data.orders:', typeof data.orders);

                // Ensure we always set an array
                const ordersArray = data.orders || data || [];
                console.log('Orders array length:', Array.isArray(ordersArray) ? ordersArray.length : 'NOT AN ARRAY');

                setOrders(Array.isArray(ordersArray) ? ordersArray : []);
            } else {
                console.error('API error:', res.status, res.statusText);
                setOrders([]);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmPayment = async (orderId: string) => {
        if (!confirm('¿Confirmar el pago de esta orden? Esto descontará el stock automáticamente.')) {
            return;
        }

        setProcessingOrder(orderId);
        try {
            const res = await fetch(`/api/vendedor/orders/${orderId}/confirm-payment`, {
                method: 'POST'
            });

            if (res.ok) {
                alert('Pago confirmado y stock actualizado');
                loadOrders();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al confirmar pago');
            }
        } catch (error) {
            console.error('Error confirming payment:', error);
            alert('Error al confirmar pago');
        } finally {
            setProcessingOrder(null);
        }
    };

    const handleUpdateStatus = async (orderId: string, newStatus: string) => {
        setProcessingOrder(orderId);
        try {
            const res = await fetch(`/api/vendedor/orders/${orderId}/update-status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                alert('Estado actualizado');
                loadOrders();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al actualizar estado');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            alert('Error al actualizar estado');
        } finally {
            setProcessingOrder(null);
        }
    };

    const getStatusConfig = (status: string) => {
        return statusConfig[status] || {
            label: status,
            color: 'gray',
            icon: Package,
            bgClass: 'bg-gray-100',
            textClass: 'text-gray-800'
        };
    };


    const filteredOrders = Array.isArray(orders) ? orders.filter((order) => {
        const matchesSearch = order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.user.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = filteredStatus === 'all' || order.status === filteredStatus;
        return matchesSearch && matchesStatus;
    }) : [];

    const stats = {
        pending: Array.isArray(orders) ? orders.filter(o => o.status === 'payment_pending').length : 0,
        confirmed: Array.isArray(orders) ? orders.filter(o => o.status === 'confirmed' || o.status === 'preparing').length : 0,
        shipped: Array.isArray(orders) ? orders.filter(o => o.status === 'shipped').length : 0,
        total: Array.isArray(orders) ? orders.length : 0
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
                    <h1 className="font-headline text-4xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 bg-clip-text text-transparent mb-2">
                        Gestión de Órdenes
                    </h1>
                    <p className="text-gray-600">
                        Administra los pedidos de tus clientes
                    </p>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-lg shadow-lg border-2 border-white backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Pendientes</p>
                                <p className="text-3xl font-bold text-amber-700">{stats.pending}</p>
                            </div>
                            <div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-3 rounded-xl">
                                <Clock className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-lg shadow-lg border-2 border-white backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Confirmadas</p>
                                <p className="text-3xl font-bold text-green-700">{stats.confirmed}</p>
                            </div>
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                                <CheckCircle className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-lg shadow-lg border-2 border-white backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Enviadas</p>
                                <p className="text-3xl font-bold text-blue-700">{stats.shipped}</p>
                            </div>
                            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-3 rounded-xl">
                                <Truck className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-lg shadow-lg border-2 border-white backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600 mb-1">Total</p>
                                <p className="text-3xl font-bold text-purple-700">{stats.total}</p>
                            </div>
                            <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border-2 border-amber-100">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Search */}
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por orden o cliente..."
                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>

                        {/* Status Filter */}
                        <select
                            value={filteredStatus}
                            onChange={(e) => setFilteredStatus(e.target.value)}
                            className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="pending_payment">Pendiente de Pago</option>
                            <option value="payment_pending">Pago Pendiente</option>
                            <option value="confirmed">Pago Confirmado</option>
                            <option value="preparing">En Preparación</option>
                            <option value="shipped">Enviado</option>
                            <option value="delivered">Entregado</option>
                            <option value="cancelled">Cancelado</option>
                        </select>
                    </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-lg p-12 text-center border-2 border-amber-100">
                        <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No hay órdenes
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery || filteredStatus !== 'all'
                                ? 'No se encontraron órdenes con los filtros aplicados'
                                : 'Cuando recibas pedidos, aparecerán aquí'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {Array.isArray(filteredOrders) && filteredOrders.map((order) => {
                            const statusInfo = getStatusConfig(order.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div key={order._id} className="bg-white rounded-lg shadow-lg overflow-hidden border-2 border-amber-100 hover:border-amber-200 transition-all">
                                    {/* Order Header */}
                                    <div className="bg-gradient-to-r from-amber-50 to-white px-6 py-4 border-b border-amber-100">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Orden #{order.orderNumber}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString('es-CL', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Cliente: <span className="font-medium">{order.user.name}</span>
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {/* Status Badge */}
                                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full ${statusInfo.bgClass}`}>
                                                    <StatusIcon className={`w-4 h-4 ${statusInfo.textClass}`} />
                                                    <span className={`text-sm font-medium ${statusInfo.textClass}`}>
                                                        {statusInfo.label}
                                                    </span>
                                                </div>

                                                {/* Total */}
                                                <div className="text-right">
                                                    <p className="text-sm text-gray-500">Total</p>
                                                    <p className="text-xl font-bold text-amber-700">
                                                        ${order.total.toLocaleString('es-CL')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Body */}
                                    <div className="p-6">
                                        {/* Products */}
                                        <div className="mb-6">
                                            <h4 className="font-semibold text-gray-900 mb-3">Productos</h4>
                                            <div className="space-y-3">
                                                {Array.isArray(order.items) && order.items.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                                                            {item.image ? (
                                                                <Image
                                                                    src={item.image}
                                                                    alt={item.name}
                                                                    width={64}
                                                                    height={64}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center">
                                                                    <Package className="w-6 h-6 text-gray-400" />
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="font-medium text-gray-900">{item.name}</p>
                                                            <p className="text-sm text-gray-500">
                                                                Cantidad: {item.quantity}
                                                                {item.size && ` • Talla: ${item.size}`}
                                                                {item.color && ` • Color: ${item.color}`}
                                                            </p>
                                                        </div>
                                                        <div className="text-right">
                                                            <p className="font-semibold text-gray-900">
                                                                ${(item.price * item.quantity).toLocaleString('es-CL')}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Customer Info */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                    <CreditCard className="w-4 h-4" />
                                                    Contacto del Cliente
                                                </h5>
                                                <p className="text-sm text-gray-600">Email: {order.customerContact.email}</p>
                                                <p className="text-sm text-gray-600">Teléfono: {order.customerContact.phone}</p>
                                            </div>

                                            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                                                <h5 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                                                    <Truck className="w-4 h-4" />
                                                    {order.shippingMethod === 'pickup' ? 'Retiro' : 'Envío'}
                                                </h5>
                                                {order.shippingMethod === 'pickup' ? (
                                                    <p className="text-sm text-gray-600">Retiro en tienda</p>
                                                ) : order.shippingAddress ? (
                                                    <>
                                                        <p className="text-sm text-gray-600">{order.shippingAddress.street}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {order.shippingAddress.commune}, {order.shippingAddress.region}
                                                        </p>
                                                    </>
                                                ) : (
                                                    <p className="text-sm text-gray-600">No especificado</p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Payment Proof */}
                                        {order.status === 'payment_pending' && order.paymentProof && (
                                            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h5 className="font-semibold text-gray-900 flex items-center gap-2">
                                                        <AlertCircle className="w-5 h-5 text-yellow-700" />
                                                        Comprobante de Pago Pendiente
                                                    </h5>
                                                    <a
                                                        href={order.paymentProof.imageUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-800"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Ver Comprobante
                                                    </a>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">
                                                    Subido el {new Date(order.paymentProof.uploadedAt).toLocaleDateString('es-CL')}
                                                </p>
                                                <button
                                                    onClick={() => handleConfirmPayment(order._id)}
                                                    disabled={processingOrder === order._id}
                                                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                                                >
                                                    {processingOrder === order._id ? (
                                                        <>
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            Procesando...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <CheckCircle className="w-5 h-5" />
                                                            Confirmar Pago y Actualizar Stock
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        )}

                                        {/* Actions */}
                                        {order.status === 'confirmed' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleUpdateStatus(order._id, 'preparing')}
                                                    disabled={processingOrder === order._id}
                                                    className="flex-1 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
                                                >
                                                    Marcar En Preparación
                                                </button>
                                            </div>
                                        )}

                                        {order.status === 'preparing' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleUpdateStatus(order._id, 'shipped')}
                                                    disabled={processingOrder === order._id}
                                                    className="flex-1 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                                                >
                                                    Marcar como Enviado
                                                </button>
                                            </div>
                                        )}

                                        {order.status === 'shipped' && (
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleUpdateStatus(order._id, 'delivered')}
                                                    disabled={processingOrder === order._id}
                                                    className="flex-1 bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                                                >
                                                    Marcar como Entregado
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary */}
                {filteredOrders.length > 0 && (
                    <div className="mt-6 text-sm text-gray-600 text-center">
                        Mostrando {filteredOrders.length} de {orders.length} órdenes
                    </div>
                )}
            </div>
        </div>
    );
}
