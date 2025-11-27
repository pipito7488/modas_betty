// app/checkout/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, CreditCard, Loader2 } from 'lucide-react';

interface OrderData {
    orderId: string;
    orderNumber: string;
    vendor: {
        id: string;
        name: string;
        email: string;
        paymentMethods: any[];
    };
    total: number;
    items: any[];
}

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const [processing, setProcessing] = useState(false);
    const [orders, setOrders] = useState<OrderData[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            processCheckout();
        }
    }, [status, router]);

    const processCheckout = async () => {
        setProcessing(true);
        setError('');

        try {
            // Obtener datos del carrito y envío desde sessionStorage
            const shippingData = sessionStorage.getItem('cart_shipping');

            if (!shippingData) {
                setError('No se encontró información de envío. Por favor vuelve al carrito.');
                setProcessing(false);
                return;
            }

            // Obtener dirección del usuario
            const addressRes = await fetch('/api/user/addresses');
            if (!addressRes.ok) {
                throw new Error('Error al obtener dirección');
            }
            const addresses = await addressRes.json();
            const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];

            if (!defaultAddress) {
                setError('No tienes una dirección registrada. Por favor configura tu perfil.');
                setProcessing(false);
                return;
            }

            // Obtener teléfono del usuario
            const phoneRes = await fetch('/api/user/phones');
            if (!phoneRes.ok) {
                throw new Error('Error al obtener teléfono');
            }
            const phones = await phoneRes.json();
            const defaultPhone = phones.find((p: any) => p.isDefault) || phones[0];

            if (!defaultPhone) {
                setError('No tienes un teléfono registrado. Por favor configura tu perfil.');
                setProcessing(false);
                return;
            }

            // Procesar checkout
            const checkoutRes = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shippingData: JSON.parse(shippingData),
                    customerAddress: defaultAddress,
                    customerPhone: defaultPhone.number
                })
            });

            if (!checkoutRes.ok) {
                const errorData = await checkoutRes.json();
                throw new Error(errorData.error || 'Error al procesar checkout');
            }

            const data = await checkoutRes.json();

            // Limpiar sessionStorage
            sessionStorage.removeItem('cart_shipping');

            setOrders(data.orders);
            setSuccess(true);
            setProcessing(false);

        } catch (err: any) {
            console.error('Checkout error:', err);
            setError(err.message || 'Error al procesar el pago');
            setProcessing(false);
        }
    };

    if (status === 'loading' || processing) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-16 h-16 animate-spin text-amber-700 mx-auto mb-4" />
                    <p className="text-lg text-gray-700">Procesando tu pedido...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Error en el Checkout</h2>
                    <p className="text-gray-600 mb-6">{error}</p>
                    <button
                        onClick={() => router.push('/carrito')}
                        className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                    >
                        Volver al Carrito
                    </button>
                </div>
            </div>
        );
    }

    if (!success || orders.length === 0) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Success Header */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle className="w-12 h-12 text-green-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Recibido!</h1>
                    <p className="text-gray-600">
                        Se {orders.length === 1 ? 'ha creado' : 'han creado'} {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}
                    </p>
                </div>

                {/* Órdenes */}
                <div className="space-y-6">
                    {orders.map((order, index) => (
                        <div key={order.orderId} className="bg-white rounded-lg shadow-md overflow-hidden">
                            {/* Order Header */}
                            <div className="bg-gradient-to-r from-amber-50 to-white px-6 py-4 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            Orden #{order.orderNumber}
                                        </h3>
                                        <p className="text-sm text-gray-600">
                                            Vendedor: {order.vendor.name}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-2xl font-bold text-amber-700">
                                            ${order.total.toLocaleString('es-CL')}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Payment Instructions */}
                            <div className="p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="w-5 h-5 text-amber-700" />
                                    <h4 className="text-lg font-semibold text-gray-900">
                                        Instrucciones de Pago
                                    </h4>
                                </div>

                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <p className="text-sm text-blue-900 mb-2">
                                        <strong>Importante:</strong> Realiza la transferencia bancaria con los siguientes datos:
                                    </p>
                                </div>

                                {/* Payment Methods */}
                                {order.vendor.paymentMethods && order.vendor.paymentMethods.length > 0 ? (
                                    <div className="space-y-4">
                                        {order.vendor.paymentMethods.map((method: any, idx: number) => (
                                            <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <p className="text-xs text-gray-500">Banco:</p>
                                                        <p className="font-semibold text-gray-900">{method.bankName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Tipo de Cuenta:</p>
                                                        <p className="font-semibold text-gray-900 capitalize">
                                                            {method.accountType?.replace('_', ' ')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Número de Cuenta:</p>
                                                        <p className="font-semibold text-gray-900">{method.accountNumber}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500">Titular:</p>
                                                        <p className="font-semibold text-gray-900">{method.accountHolder}</p>
                                                    </div>
                                                    {method.rut && (
                                                        <div>
                                                            <p className="text-xs text-gray-500">RUT:</p>
                                                            <p className="font-semibold text-gray-900">{method.rut}</p>
                                                        </div>
                                                    )}
                                                    {method.email && (
                                                        <div>
                                                            <p className="text-xs text-gray-500">Email:</p>
                                                            <p className="font-semibold text-gray-900">{method.email}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-3 pt-3 border-t border-gray-200">
                                                    <p className="text-xs text-gray-500">Monto a Transferir:</p>
                                                    <p className="text-2xl font-bold text-amber-700">
                                                        ${order.total.toLocaleString('es-CL')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-sm text-yellow-900">
                                            El vendedor no tiene métodos de pago configurados.
                                            Por favor contacta directamente a: <strong>{order.vendor.email}</strong>
                                        </p>
                                    </div>
                                )}

                                {/* Next Steps */}
                                <div className="mt-6 bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-semibold text-gray-900 mb-3">Próximos pasos:</h5>
                                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
                                        <li>Realiza la transferencia bancaria con los datos proporcionados</li>
                                        <li>Una vez realizada, sube el comprobante de pago en "Mis Órdenes"</li>
                                        <li>El vendedor confirmará tu pago manualmente</li>
                                        <li>Recibirás una notificación cuando tu pedido sea confirmado</li>
                                    </ol>
                                </div>
                            </div>

                            {/* Products Summary */}
                            <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                                <p className="text-sm font-semibold text-gray-700 mb-2">
                                    Productos ({order.items.length}):
                                </p>
                                <div className="space-y-1">
                                    {order.items.map((item: any, idx: number) => (
                                        <div key={idx} className="flex justify-between text-sm">
                                            <span className="text-gray-600">
                                                {item.quantity}x {item.name}
                                                {item.size && ` - Talla: ${item.size}`}
                                                {item.color && ` - Color: ${item.color}`}
                                            </span>
                                            <span className="text-gray-900 font-medium">
                                                ${(item.price * item.quantity).toLocaleString('es-CL')}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Action Buttons */}
                <div className="mt-8 flex gap-4 justify-center">
                    <button
                        onClick={() => router.push('/mis-ordenes')}
                        className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-semibold"
                    >
                        Ver Mis Órdenes
                    </button>
                    <button
                        onClick={() => router.push('/productos')}
                        className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                        Seguir Comprando
                    </button>
                </div>
            </div>
        </div>
    );
}
