'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Package } from 'lucide-react';

export default function MisOrdenesPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            loadOrders();
        }
    }, [status, router]);

    const loadOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            if (res.ok) {
                const data = await res.json();
                // Support multiple response formats
                const ordersData = data.orders || data || [];
                setOrders(Array.isArray(ordersData) ? ordersData : []);
            } else {
                setOrders([]);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Mis Órdenes</h1>

                {!Array.isArray(orders) || orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                        <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No tienes órdenes
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Cuando realices una compra, aparecerá aquí
                        </p>
                        <button
                            onClick={() => router.push('/productos')}
                            className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                        >
                            Ver Productos
                        </button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order: any) => (
                            <div key={order._id || Math.random()} className="bg-white rounded-lg shadow-sm p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="text-lg font-semibold">
                                            Orden #{order.orderNumber || 'N/A'}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Vendedor: {order.vendor?.name || 'N/A'}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            Estado: <span className="font-medium">{order.status || 'N/A'}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg text-amber-700">
                                            ${order.total?.toLocaleString('es-CL') || '0'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {order.createdAt ? new Date(order.createdAt).toLocaleDateString('es-CL') : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                {/* Items */}
                                {Array.isArray(order.items) && order.items.length > 0 && (
                                    <div className="border-t pt-4 mt-4">
                                        <p className="text-sm font-medium text-gray-700 mb-2">
                                            {order.items.length} producto(s)
                                        </p>
                                        <div className="space-y-2">
                                            {order.items.map((item: any, idx: number) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-gray-600">
                                                        {item.name || 'Producto'} x {item.quantity || 1}
                                                    </span>
                                                    <span className="text-gray-900">
                                                        ${((item.price || 0) * (item.quantity || 1)).toLocaleString('es-CL')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
