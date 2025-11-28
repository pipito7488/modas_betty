// app/carrito/page.tsx
'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { ShoppingCart, Truck, MapPin, Train, Store, Minus, Plus, Trash2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import CompleteProfileModal from '@/app/components/CompleteProfileModal';

interface ShippingOption {
    id: string;
    name: string;
    type: 'commune' | 'region' | 'metro' | 'pickup_store';
    cost: number;
    estimatedDays: number;
    instructions?: string;
}

interface VendorShipping {
    [vendorId: string]: {
        selected: ShippingOption | null;
        options: ShippingOption[];
        loading: boolean;
    };
}

export default function CartPage() {
    const router = useRouter();
    const { data: session, status } = useSession();
    const { groupedByVendor, itemCount, loading, updateItemQuantity, removeItem } = useCart();

    const [shippingByVendor, setShippingByVendor] = useState<VendorShipping>({});
    const [userAddress, setUserAddress] = useState<any>(null);
    const [userPhone, setUserPhone] = useState<string>('');
    const [profileValidation, setProfileValidation] = useState<any>(null);
    const [showProfileModal, setShowProfileModal] = useState(false);

    // Verificar autenticación
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
    }, [status, router]);

    // Cargar dirección del usuario y validar perfil
    useEffect(() => {
        if (status === 'authenticated') {
            loadUserData();
        }
    }, [status]);

    // Calcular envíos cuando cambia el carrito o la dirección
    useEffect(() => {
        if (userAddress && groupedByVendor.length > 0) {
            calculateShippingForAllVendors();
        }
    }, [userAddress, groupedByVendor]);

    const loadUserData = async () => {
        try {
            // Cargar validación de perfil
            const profileRes = await fetch('/api/user/validate-profile');
            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setProfileValidation(profileData);

                if (!profileData.canBuy) {
                    setShowProfileModal(true);
                }
            }

            // Cargar direcciones del usuario
            const addressRes = await fetch('/api/user/addresses');
            if (addressRes.ok) {
                const data = await addressRes.json();
                const addresses = Array.isArray(data) ? data : (data.addresses || []);
                const defaultAddress = addresses.find((a: any) => a.isDefault) || addresses[0];
                setUserAddress(defaultAddress);
            }

            // Cargar teléfonos del usuario
            const phoneRes = await fetch('/api/user/phones');
            if (phoneRes.ok) {
                const data = await phoneRes.json();
                const phones = Array.isArray(data) ? data : (data.phones || []);
                const defaultPhone = phones.find((p: any) => p.isDefault) || phones[0];
                setUserPhone(defaultPhone?.number || '');
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };


    const calculateShippingForAllVendors = useCallback(async () => {
        const newShipping: VendorShipping = {};

        for (const group of groupedByVendor) {
            const vendorId = group.vendor._id;
            newShipping[vendorId] = {
                selected: null,
                options: [],
                loading: true
            };
        }

        setShippingByVendor(newShipping);

        // Calcular para cada vendedor
        for (const group of groupedByVendor) {
            const vendorId = group.vendor._id;

            try {
                const res = await fetch('/api/shipping/calculate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        vendorId,
                        clientAddress: {
                            commune: userAddress?.commune,
                            region: userAddress?.region
                        }
                    })
                });

                if (res.ok) {
                    const data = await res.json();

                    setShippingByVendor(prev => ({
                        ...prev,
                        [vendorId]: {
                            selected: data.options?.[0] || null,
                            options: data.options || [],
                            loading: false
                        }
                    }));
                }
            } catch (error) {
                console.error(`Error calculating shipping for vendor ${vendorId}:`, error);
                setShippingByVendor(prev => ({
                    ...prev,
                    [vendorId]: {
                        selected: null,
                        options: [],
                        loading: false
                    }
                }));
            }
        }
    }, [groupedByVendor, userAddress]);

    const handleShippingSelection = (vendorId: string, option: ShippingOption) => {
        setShippingByVendor(prev => ({
            ...prev,
            [vendorId]: {
                ...prev[vendorId],
                selected: option
            }
        }));
    };

    const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity >= 1) {
            await updateItemQuantity(itemId, newQuantity);
        }
    };

    const handleRemoveItem = async (itemId: string) => {
        if (confirm('¿Eliminar este producto del carrito?')) {
            await removeItem(itemId);
        }
    };

    const getTotalProducts = () => {
        return groupedByVendor.reduce((total, group) => {
            return total + group.items.reduce((sum, item) => sum + item.quantity, 0);
        }, 0);
    };

    const getProductsSubtotal = () => {
        return groupedByVendor.reduce((total, group) => total + group.subtotal, 0);
    };

    const getTotalShipping = () => {
        return groupedByVendor.reduce((total, group) => {
            const vendorId = group.vendor._id;
            const shipping = shippingByVendor[vendorId];
            return total + (shipping?.selected?.cost || 0);
        }, 0);
    };

    const getGrandTotal = () => {
        return getProductsSubtotal() + getTotalShipping();
    };

    const canProceedToCheckout = () => {
        if (!profileValidation?.canBuy) return false;
        if (groupedByVendor.length === 0) return false;

        // Verificar que todos los vendedores tengan método de envío seleccionado
        for (const group of groupedByVendor) {
            const vendorId = group.vendor._id;
            const shipping = shippingByVendor[vendorId];
            if (!shipping?.selected) return false;
        }

        return true;
    };

    const handleCheckout = () => {
        if (!canProceedToCheckout()) {
            alert('Por favor selecciona un método de envío para todos los vendedores');
            return;
        }

        // Guardar datos completos en sessionStorage para el checkout
        sessionStorage.setItem('cart_shipping', JSON.stringify(shippingByVendor));
        sessionStorage.setItem('cart_data', JSON.stringify({
            vendors: groupedByVendor,
            subtotal: getProductsSubtotal(),
            shippingTotal: getTotalShipping(),
            grandTotal: getGrandTotal(),
            userAddress: userAddress,
            userPhone: userPhone
        }));

        router.push('/checkout');
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
            </div>
        );
    }

    if (itemCount === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                    <ShoppingCart className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Tu carrito está vacío</h2>
                    <p className="text-gray-600 mb-6">
                        Agrega productos para comenzar tu compra
                    </p>
                    <button
                        onClick={() => router.push('/productos')}
                        className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                    >
                        Ver Productos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4 max-w-6xl">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Mi Carrito</h1>
                        <p className="text-gray-600 mt-1">
                            {getTotalProducts()} {getTotalProducts() === 1 ? 'producto' : 'productos'}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Productos */}
                        <div className="lg:col-span-2 space-y-6">
                            {groupedByVendor.map((group, vendorIndex) => (
                                <div key={vendorIndex} className="bg-white rounded-lg shadow-sm overflow-hidden">
                                    {/* Vendedor Header */}
                                    <div className="bg-gradient-to-r from-amber-50 to-white px-6 py-4 border-b border-gray-200">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {group.vendor?.name || 'Vendedor'}
                                        </h3>
                                    </div>

                                    {/* Items */}
                                    <div className="divide-y divide-gray-200">
                                        {group.items.map((item) => (
                                            <div key={item._id} className="p-6 hover:bg-gray-50 transition-colors">
                                                <div className="flex gap-4">
                                                    {/* Imagen */}
                                                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                                                        {item.product?.images?.[0] ? (
                                                            <Image
                                                                src={item.product.images[0]}
                                                                alt={item.product.name}
                                                                width={96}
                                                                height={96}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ShoppingCart className="w-10 h-10 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info y Controles */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-base font-medium text-gray-900">
                                                            {item.product?.name || 'Producto'}
                                                        </h4>

                                                        {(item.selectedSize || item.selectedColor) && (
                                                            <p className="text-sm text-gray-500 mt-1">
                                                                {item.selectedSize && `Talla: ${item.selectedSize}`}
                                                                {item.selectedSize && item.selectedColor && ' • '}
                                                                {item.selectedColor && `Color: ${item.selectedColor}`}
                                                            </p>
                                                        )}

                                                        <div className="mt-3 flex items-center justify-between">
                                                            {/* Cantidad */}
                                                            <div className="flex items-center gap-2">
                                                                <button
                                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                    className="p-2 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </button>
                                                                <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                                    className="p-2 border border-gray-300 rounded hover:bg-gray-100"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                            {/* Precio */}
                                                            <div className="text-right">
                                                                <p className="text-sm text-gray-500">
                                                                    ${item.price.toLocaleString('es-CL')} c/u
                                                                </p>
                                                                <p className="text-lg font-bold text-amber-700">
                                                                    ${(item.price * item.quantity).toLocaleString('es-CL')}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        {/* Eliminar */}
                                                        <button
                                                            onClick={() => handleRemoveItem(item._id)}
                                                            className="mt-3 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                            Eliminar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Opciones de Envío */}
                                    <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                                            <Truck className="w-4 h-4" />
                                            Método de envío
                                        </h4>

                                        {shippingByVendor[group.vendor._id]?.loading ? (
                                            <p className="text-sm text-gray-600">Calculando opciones...</p>
                                        ) : shippingByVendor[group.vendor._id]?.options.length === 0 ? (
                                            <p className="text-sm text-red-600">
                                                No hay opciones de envío disponibles para tu  zona
                                            </p>
                                        ) : (
                                            <div className="space-y-2">
                                                {shippingByVendor[group.vendor._id]?.options.map((option, idx) => {
                                                    // Determinar icono según tipo
                                                    let Icon = MapPin;
                                                    if (option.type === 'metro') Icon = Train;
                                                    if (option.type === 'pickup_store') Icon = Store;

                                                    return (
                                                        <label
                                                            key={option.id || idx}
                                                            className={`flex items-start justify-between p-3 border-2 rounded-lg cursor-pointer transition ${shippingByVendor[group.vendor._id]?.selected?.id === option.id
                                                                ? 'border-amber-700 bg-amber-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <div className="flex items-start gap-3 flex-1">
                                                                <input
                                                                    type="radio"
                                                                    name={`shipping-${group.vendor._id}`}
                                                                    checked={shippingByVendor[group.vendor._id]?.selected?.id === option.id}
                                                                    onChange={() => handleShippingSelection(group.vendor._id, option)}
                                                                    className="w-4 h-4 text-amber-700 mt-0.5"
                                                                />
                                                                <Icon className="w-5 h-5 text-gray-600 mt-0.5" />
                                                                <div className="flex-1">
                                                                    <p className="text-sm font-medium text-gray-900">{option.name}</p>
                                                                    {option.estimatedDays > 0 && (
                                                                        <p className="text-xs text-gray-500 mt-0.5">
                                                                            {option.estimatedDays} {option.estimatedDays === 1 ? 'día' : 'días'}
                                                                        </p>
                                                                    )}
                                                                    {option.instructions && (
                                                                        <p className="text-xs text-gray-500 italic mt-1">{option.instructions}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <p className="text-sm font-bold text-gray-900 ml-2">
                                                                {option.cost === 0 ? 'GRATIS' : `$${option.cost.toLocaleString('es-CL')}`}
                                                            </p>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Resumen */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">Resumen del Pedido</h3>

                                <div className="space-y-3 mb-4">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Productos:</span>
                                        <span>${getProductsSubtotal().toLocaleString('es-CL')}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Envío:</span>
                                        <span>
                                            {getTotalShipping() === 0
                                                ? 'Gratis'
                                                : `$${getTotalShipping().toLocaleString('es-CL')}`
                                            }
                                        </span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-3">
                                        <div className="flex justify-between text-xl font-bold text-gray-900">
                                            <span>Total:</span>
                                            <span className="text-amber-700">${getGrandTotal().toLocaleString('es-CL')}</span>
                                        </div>
                                    </div>
                                </div>

                                {userAddress && (
                                    <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                        <p className="text-xs font-semibold text-gray-700 mb-1">Enviar a:</p>
                                        <p className="text-sm text-gray-900">{userAddress.street}</p>
                                        <p className="text-sm text-gray-600">
                                            {userAddress.commune}, {userAddress.region}
                                        </p>
                                        <button
                                            onClick={() => router.push('/perfil/configuracion')}
                                            className="text-xs text-amber-700 hover:text-amber-800 mt-2"
                                        >
                                            Cambiar dirección
                                        </button>
                                    </div>
                                )}

                                <button
                                    onClick={handleCheckout}
                                    disabled={!canProceedToCheckout()}
                                    className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Proceder al Pago
                                </button>

                                {!canProceedToCheckout() && profileValidation?.canBuy && (
                                    <p className="text-xs text-red-600 mt-2 text-center">
                                        Selecciona un método de envío para todos los vendedores
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de Perfil Incompleto */}
            {profileValidation && (
                <CompleteProfileModal
                    isOpen={showProfileModal}
                    onClose={() => setShowProfileModal(false)}
                    validation={profileValidation}
                    requiredFor="buy"
                />
            )}
        </>
    );
}
