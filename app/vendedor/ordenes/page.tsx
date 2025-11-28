'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function VendedorOrdenesPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState([]);
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
            const res = await fetch('/api/vendedor/orders');
            if (res.ok) {
                const data = await res.json();
                setOrders(data.orders || []);
            }
        } catch (error) {
            console.error('Error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Cargando órdenes...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">Mis Órdenes de Venta</h1>

                {orders.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-8 text-center">
                        <p className="text-gray-600">No tienes órdenes aún</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="bg-white rounded-lg shadow p-6">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className="font-semibold">Orden #{order.orderNumber}</h3>
                                        <p className="text-sm text-gray-600">Cliente: {order.user?.name}</p>
                                        <p className="text-sm text-gray-600">
                                            Estado: <span className="font-medium">{order.status}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-lg">${order.total?.toLocaleString('es-CL')}</p>
                                        <p className="text-xs text-gray-500">
                                            {new Date(order.createdAt).toLocaleDateString('es-CL')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
