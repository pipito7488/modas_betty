// app/checkout/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { CheckCircle, CreditCard, Loader2, ChevronLeft, PackageCheck, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import StepIndicator from '../components/StepIndicator';
import ErrorMessage from '../components/ErrorMessage';

interface VendorOrder {
    vendor: {
        _id: string;
        name: string;
        email: string;
        paymentMethods: any[];
    };
    items: any[];
    subtotal: number;
    shipping: {
        cost: number;
        method: string;
        estimatedDays: number;
    };
    total: number;
}

interface CheckoutData {
    vendors: VendorOrder[];
    grandTotal: number;
    userAddress: any;
    userPhone: string;
}

export default function CheckoutPage() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [currentStep, setCurrentStep] = useState(1);
    const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [createdOrders, setCreatedOrders] = useState<any[]>([]);

    // Cargar datos del sessionStorage
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (status === 'authenticated') {
            loadCheckoutData();
        }
    }, [status, router]);

    const loadCheckoutData = async () => {
        try {
            // Obtener datos guardados del carrito
            const shippingDataStr = sessionStorage.getItem('cart_shipping');
            const cartDataStr = sessionStorage.getItem('cart_data');

            if (!shippingDataStr || !cartDataStr) {
                setError('No se encontraron datos del carrito. Por favor vuelve al carrito.');
                return;
            }

            const shippingData = JSON.parse(shippingDataStr);
            const cartData = JSON.parse(cartDataStr);

            // Transformar datos para el checkout
            const vendors: VendorOrder[] = cartData.vendors.map((vendor: any) => {
                const shipping = shippingData[vendor._id];
                return {
                    vendor: vendor.vendor,
                    items: vendor.items,
                    subtotal: vendor.subtotal,
                    shipping: {
                        cost: shipping?.selected?.cost || 0,
                        method: shipping?.selected?.name || 'Sin seleccionar',
                        estimatedDays: shipping?.selected?.estimatedDays || 0
                    },
                    total: vendor.subtotal + (shipping?.selected?.cost || 0)
                };
            });

            setCheckoutData({
                vendors,
                grandTotal: cartData.grandTotal,
                userAddress: cartData.userAddress,
                userPhone: cartData.userPhone
            });

        } catch (err) {
            console.error('Error loading checkout data:', err);
            setError('Error al cargar los datos del checkout');
        }
    };

    const handleConfirmOrder = async () => {
        if (!checkoutData) return;

        setProcessing(true);
        setError('');

        try {
            // Obtener datos del sessionStorage
            const shippingDataStr = sessionStorage.getItem('cart_shipping');
            if (!shippingDataStr) {
                throw new Error('Datos de envío no encontrados');
            }

            const response = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    shippingData: JSON.parse(shippingDataStr),
                    customerAddress: checkoutData.userAddress,
                    customerPhone: checkoutData.userPhone
                })
            });

            const data = await response.json();

            if (!response.ok) {
                // Mostrar error detallado del servidor
                const errorMsg = data.details || data.error || 'Error al crear la orden';
                console.error('Error del servidor:', data);
                throw new Error(errorMsg);
            }

            // Limpiar sessionStorage
            sessionStorage.removeItem('cart_shipping');
            sessionStorage.removeItem('cart_data');

            setCreatedOrders(data.orders);
            setCurrentStep(3);

        } catch (err: any) {
            console.error('Error confirming order:', err);
            setError(err.message || 'Error al confirmar el pedido');
        } finally {
            setProcessing(false);
        }
    };

    // Paso 1: Revisar Orden
    const renderReviewStep = () => {
        if (!checkoutData) {
            return (
                <div className="text-center py-12">
                    <Loader2 className="w-12 h-12 animate-spin text-amber-700 mx-auto mb-4" />
                    <p className="text-gray-600">Cargando información...</p>
                </div>
            );
        }

        return (
            <div className="space-y-6">
                <div className="text-center mb-8">
                    <PackageCheck className="w-16 h-16 text-amber-700 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Revisa tu Orden</h2>
                    <p className="text-gray-600">Verifica que todo esté correcto antes de continuar</p>
                </div>

                {/* Productos por vendedor */}
                <div className="space-y-4">
                    {checkoutData.vendors.map((vendorOrder, idx) => (
                        <div key={idx} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                            {/* Vendor Header */}
                            <div className="bg-gradient-to-r from-amber-50 to-white px-6 py-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {vendorOrder.vendor.name}
                                </h3>
                            </div>

                            {/* Items */}
                            <div className="p-6 space-y-4">
                                {vendorOrder.items.map((item: any, itemIdx: number) => (
                                    <div key={itemIdx} className="flex gap-4">
                                        <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                                            {item.product?.images?.[0] && (
                                                <Image
                                                    src={item.product.images[0]}
                                                    alt={item.product.name}
                                                    width={80}
                                                    height={80}
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-medium text-gray-900">{item.product?.name}</h4>
                                            {(item.selectedSize || item.selectedColor) && (
                                                <p className="text-sm text-gray-500 mt-1">
                                                    {item.selectedSize && `Talla: ${item.selectedSize}`}
                                                    {item.selectedSize && item.selectedColor && ' • '}
                                                    {item.selectedColor && `Color: ${item.selectedColor}`}
                                                </p>
                                            )}
                                            <div className="flex justify-between items-center mt-2">
                                                <span className="text-sm text-gray-600">Cantidad: {item.quantity}</span>
                                                <span className="font-medium text-amber-700">
                                                    ${(item.price * item.quantity).toLocaleString('es-CL')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                {/* Shipping info */}
                                <div className="pt-4 border-t border-gray-200">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Subtotal productos:</span>
                                        <span className="font-medium">${vendorOrder.subtotal.toLocaleString('es-CL')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm mt-2">
                                        <span className="text-gray-600">Envío ({vendorOrder.shipping.method}):</span>
                                        <span className="font-medium">
                                            {vendorOrder.shipping.cost === 0
                                                ? 'GRATIS'
                                                : `$${vendorOrder.shipping.cost.toLocaleString('es-CL')}`}
                                        </span>
                                    </div>
                                    <div className="flex justify-between font-bold text-lg mt-3 pt-3 border-t border-gray-200">
                                        <span>Total vendedor:</span>
                                        <span className="text-amber-700">${vendorOrder.total.toLocaleString('es-CL')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Datos de envío */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-4">Datos de Envío</h3>
                    <div className="space-y-2 text-sm">
                        <p className="text-gray-700">
                            <span className="font-medium">Dirección:</span> {checkoutData.userAddress?.street}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-medium">Comuna:</span> {checkoutData.userAddress?.commune}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-medium">Región:</span> {checkoutData.userAddress?.region}
                        </p>
                        <p className="text-gray-700">
                            <span className="font-medium">Teléfono:</span> {checkoutData.userPhone}
                        </p>
                    </div>
                </div>

                {/* Total General */}
                <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-center">
                        <span className="text-2xl font-bold text-gray-900">Total a Pagar:</span>
                        <span className="text-3xl font-bold text-amber-700">
                            ${checkoutData.grandTotal.toLocaleString('es-CL')}
                        </span>
                    </div>
                </div>

                {/* Botones */}
                <div className="flex gap-4 justify-between mt-8">
                    <button
                        onClick={() => router.push('/carrito')}
                        className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Volver al Carrito
                    </button>
                    <button
                        onClick={() => setCurrentStep(2)}
                        className="px-8 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-semibold"
                    >
                        Continuar
                    </button>
                </div>
            </div>
        );
    };

    // Paso 2: Instrucciones de Pago
    const renderPaymentInstructionsStep = () => {
        if (!checkoutData) return null;

        return (
            <div className="space-y-6">
                <div className="text-center mb-8">
                    <CreditCard className="w-16 h-16 text-amber-700 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Instrucciones de Pago</h2>
                    <p className="text-gray-600">Revisa los datos bancarios antes de confirmar tu pedido</p>
                </div>

                {/* Instrucciones generales */}
                <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6">
                    <h3 className="font-semibold text-amber-900 mb-3 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        Importante: Lee atentamente
                    </h3>
                    <ul className="space-y-2 text-sm text-amber-900">
                        <li>✓ Deberás realizar una transferencia bancaria a cada vendedor</li>
                        <li>✓ Una vez realizada la transferencia, debes subir el comprobante en "Mis Órdenes"</li>
                        <li>✓ El vendedor confirmará tu pago manualmente</li>
                        <li>✓ Recibirás una notificación cuando tu pedido sea confirmado</li>
                    </ul>
                </div>

                {/* Datos bancarios por vendedor */}
                <div className="space-y-4">
                    {checkoutData.vendors.map((vendorOrder, idx) => (
                        <div key={idx} className="bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
                            <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {vendorOrder.vendor.name}
                                    </h3>
                                    <p className="text-2xl font-bold text-amber-700">
                                        ${vendorOrder.total.toLocaleString('es-CL')}
                                    </p>
                                </div>
                            </div>

                            <div className="p-6">
                                {vendorOrder.vendor.paymentMethods && vendorOrder.vendor.paymentMethods.length > 0 ? (
                                    <div className="space-y-4">
                                        {vendorOrder.vendor.paymentMethods.map((method: any, methodIdx: number) => (
                                            <div key={methodIdx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                                <div className="grid grid-cols-2 gap-3 text-sm">
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Banco:</p>
                                                        <p className="font-semibold text-gray-900">{method.bankName}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Tipo de Cuenta:</p>
                                                        <p className="font-semibold text-gray-900 capitalize">
                                                            {method.accountType?.replace('_', ' ')}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Número de Cuenta:</p>
                                                        <p className="font-semibold text-gray-900">{method.accountNumber}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-gray-500 mb-1">Titular:</p>
                                                        <p className="font-semibold text-gray-900">{method.accountHolder}</p>
                                                    </div>
                                                    {method.rut && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">RUT:</p>
                                                            <p className="font-semibold text-gray-900">{method.rut}</p>
                                                        </div>
                                                    )}
                                                    {method.email && (
                                                        <div>
                                                            <p className="text-xs text-gray-500 mb-1">Email:</p>
                                                            <p className="font-semibold text-gray-900">{method.email}</p>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-gray-200">
                                                    <p className="text-xs text-gray-500 mb-1">Monto a Transferir:</p>
                                                    <p className="text-2xl font-bold text-amber-700">
                                                        ${vendorOrder.total.toLocaleString('es-CL')}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <p className="text-sm text-yellow-900">
                                            El vendedor no tiene métodos de pago configurados.
                                            Por favor contacta directamente a:{' '}
                                            <strong>{vendorOrder.vendor.email}</strong>
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Checkbox aceptar términos */}
                <div className="bg-white border-2 border-gray-200 rounded-lg p-6">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={acceptedTerms}
                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                            className="w-5 h-5 text-amber-700 rounded mt-0.5"
                        />
                        <span className="text-sm text-gray-700">
                            He leído las instrucciones de pago y entiendo que debo realizar la transferencia
                            bancaria manualmente a cada vendedor con los datos proporcionados.
                        </span>
                    </label>
                </div>

                {/* Botones */}
                <div className="flex gap-4 justify-between mt-8">
                    <button
                        onClick={() => setCurrentStep(1)}
                        className="flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Paso Anterior
                    </button>
                    <button
                        onClick={handleConfirmOrder}
                        disabled={!acceptedTerms || processing}
                        className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {processing ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Procesando...
                            </>
                        ) : (
                            'Confirmar Pedido'
                        )}
                    </button>
                </div>
            </div>
        );
    };

    // Paso 3: Confirmación
    const renderConfirmationStep = () => {
        return (
            <div className="text-center space-y-6">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle className="w-16 h-16 text-green-600" />
                </div>

                <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">¡Pedido Confirmado!</h2>
                    <p className="text-gray-600 text-lg">
                        {createdOrders.length === 1
                            ? 'Tu orden se ha creado exitosamente'
                            : `Se han creado ${createdOrders.length} órdenes`}
                    </p>
                </div>

                {/* Órdenes creadas */}
                <div className="bg-white border border-gray-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
                    <h3 className="font-semibold text-gray-900 mb-4">Números de Orden:</h3>
                    <div className="space-y-2">
                        {createdOrders.map((order, idx) => (
                            <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                                <span className="text-gray-700">{order.vendor.name}:</span>
                                <span className="font-mono font-semibold text-amber-700">#{order.orderNumber}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Próximos pasos */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-2xl mx-auto">
                    <h3 className="font-semibold text-blue-900 mb-3">Próximos pasos:</h3>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-blue-900">
                        <li>Realiza las transferencias bancarias con los datos proporcionados</li>
                        <li>Ve a "Mis Órdenes" y sube el comprobante de pago de cada orden</li>
                        <li>El vendedor confirmará tu pago manualmente</li>
                        <li>Recibirás una notificación cuando tu pedido sea confirmado</li>
                    </ol>
                </div>

                {/* Botones */}
                <div className="flex gap-4 justify-center mt-8">
                    <button
                        onClick={() => router.push('/mis-ordenes')}
                        className="px-8 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-semibold"
                    >
                        Ver Mis Órdenes
                    </button>
                    <button
                        onClick={() => router.push('/productos')}
                        className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-semibold"
                    >
                        Seguir Comprando
                    </button>
                </div>
            </div>
        );
    };

    // Renderizado principal
    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-amber-700" />
            </div>
        );
    }

    if (error && !checkoutData) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="max-w-md">
                    <ErrorMessage
                        title="Error en el Checkout"
                        message={error}
                        action={{
                            label: "Volver al Carrito",
                            link: "/carrito"
                        }}
                    />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-5xl">
                {/* Step Indicator - Solo mostrar en pasos 1 y 2 */}
                {currentStep < 3 && (
                    <StepIndicator
                        currentStep={currentStep}
                        steps={[
                            { number: 1, title: 'Revisar' },
                            { number: 2, title: 'Pago' },
                            { number: 3, title: 'Confirmar' }
                        ]}
                    />
                )}

                {/* Error message si hay */}
                {error && (
                    <div className="mb-6">
                        <ErrorMessage
                            title="Error"
                            message={error}
                        />
                    </div>
                )}

                {/* Contenido según el paso */}
                <div className="bg-gray-50">
                    {currentStep === 1 && renderReviewStep()}
                    {currentStep === 2 && renderPaymentInstructionsStep()}
                    {currentStep === 3 && renderConfirmationStep()}
                </div>
            </div>
        </div>
    );
}
