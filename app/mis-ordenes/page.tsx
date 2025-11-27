// app/mis-ordenes/page.tsx
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
    CreditCard
} from 'lucide-react';
import Image from 'next/image';

interface Order {
    _id: string;
    orderNumber: string;
    vendor: {
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
    createdAt: Date;
}

const statusConfig: Record<string, { label: string; color: string; icon: any }> = {
    pending_payment: { label: 'Pendiente de Pago', color: 'yellow', icon: Clock },
    payment_submitted: { label: 'Comprobante Enviado', color: 'blue', icon: Upload },
    payment_confirmed: { label: 'Pago Confirmado', color: 'green', icon: CheckCircle },
    processing: { label: 'En Preparación', color: 'purple', icon: Package },
    shipped: { label: 'Enviado', color: 'indigo', icon: Truck },
    delivered: { label: 'Entregado', color: 'green', icon: CheckCircle },
    cancelled: { label: 'Cancelado', color: 'red', icon: XCircle }
};

export default function MyOrdersPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploadingProof, setUploadingProof] = useState<string | null>(null);

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
                setOrders(data);
            }
        } catch (error) {
            console.error('Error loading orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadProof = async (orderId: string, file: File) => {
        setUploadingProof(orderId);

        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch(`/api/orders/${orderId}/upload-proof`, {
                method: 'POST',
                body: formData
            });

            if (res.ok) {
                alert('Comprobante subido exitosamente');
                loadOrders(); // Recargar órdenes
            } else {
                const error = await res.json();
                alert(error.error || 'Error al subir comprobante');
            }
        } catch (error) {
            console.error('Error uploading proof:', error);
            alert('Error al subir comprobante');
        } finally {
            setUploadingProof(null);
        }
    };

    const getStatusConfig = (status: string) => {
        return statusConfig[status] || { label: status, color: 'gray', icon: Package };
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Mis Órdenes</h1>
                    <p className="text-gray-600 mt-1">
                        Historial y estado de tus pedidos
                    </p>
                </div>

                {/* Órdenes */}
                {orders.length === 0 ? (
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
                        {orders.map((order) => {
                            const statusInfo = getStatusConfig(order.status);
                            const StatusIcon = statusInfo.icon;

                            return (
                                <div key={order._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    {/* Order Header */}
                                    <div className="bg-gradient-to-r from-amber-50 to-white px-6 py-4 border-b border-gray-200">
                                        <div className="flex flex-wrap items-center justify-between gap-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    Orden #{order.orderNumber}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    {new Date(order.createdAt).toLocaleDateString('es-CL', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                                <p className="text-sm text-gray-600">
                                                    Vendedor: {order.vendor.name}
                                                </p>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {/* Status Badge */}
                                                <div className={`flex items-center gap-2 px-4 py-2 rounded-full bg-${statusInfo.color}-100`}>
                                                    <StatusIcon className={`w-4 h-4 text-${statusInfo.color}-700`} />
                                                    <span className={`text-sm font-medium text-${statusInfo.color}-700`}>
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

                                    {/* Order Items */}
                                    <div className="px-6 py-4">
                                        <div className="space-y-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex items-center gap-4">
                                                    {/* Image */}
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

                                                    {/* Info */}
                                                    <div className="flex-1">
                                                        <p className="font-medium text-gray-900">{item.name}</p>
                                                        <p className="text-sm text-gray-500">
                                                            Cantidad: {item.quantity}
                                                            {item.size && ` • Talla: ${item.size}`}
                                                            {item.color && ` • Color: ${item.color}`}
                                                        </p>
                                                    </div>

                                                    {/* Price */}
                                                    <div className="text-right">
                                                        <p className="font-semibold text-gray-900">
                                                            ${(item.price * item.quantity).toLocaleString('es-CL')}
                                                        </p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Totals */}
                                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-1">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Subtotal:</span>
                                                <span className="text-gray-900">${order.subtotal.toLocaleString('es-CL')}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-600">Envío:</span>
                                                <span className="text-gray-900">
                                                    {order.shippingCost === 0
                                                        ? 'Gratis'
                                                        : `$${order.shippingCost.toLocaleString('es-CL')}`}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Payment Proof Section */}
                                    {(order.status === 'pending_payment' || order.status === 'payment_submitted') && (
                                        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <CreditCard className="w-5 h-5 text-gray-600" />
                                                    <span className="text-sm font-medium text-gray-700">
                                                        Comprobante de Pago
                                                    </span>
                                                </div>

                                                {order.paymentProof ? (
                                                    <div className="flex items-center gap-3">
                                                        <span className="text-xs text-gray-500">
                                                            Subido {new Date(order.paymentProof.uploadedAt).toLocaleDateString('es-CL')}
                                                        </span>
                                                        <a
                                                            href={order.paymentProof.imageUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1 text-sm text-amber-700 hover:text-amber-800"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Ver
                                                        </a>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) => {
                                                                const file = e.target.files?.[0];
                                                                if (file) {
                                                                    handleUploadProof(order._id, file);
                                                                }
                                                            }}
                                                            disabled={uploadingProof === order._id}
                                                        />
                                                        <div className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors">
                                                            {uploadingProof === order._id ? (
                                                                <>
                                                                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                                                    <span className="text-sm">Subiendo...</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Upload className="w-4 h-4" />
                                                                    <span className="text-sm">Subir Comprobante</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
