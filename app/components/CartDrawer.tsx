// app/components/CartDrawer.tsx
'use client';

import { useEffect, useState } from 'react';
import { X, ShoppingCart, Trash2, Plus, Minus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/app/hooks/useCart';

interface CartDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
    const router = useRouter();
    const { groupedByVendor, itemCount, loading, updateItemQuantity, removeItem, clearCart } = useCart();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
        if (newQuantity < 1) return;
        await updateItemQuantity(itemId, newQuantity);
    };

    const handleRemoveItem = async (itemId: string) => {
        if (confirm('¿Eliminar este producto del carrito?')) {
            await removeItem(itemId);
        }
    };

    const handleClearCart = async () => {
        if (confirm('¿Vaciar todo el carrito?')) {
            await clearCart();
        }
    };

    const getTotalItems = () => {
        return groupedByVendor.reduce((total, group) => {
            return total + group.items.reduce((sum, item) => sum + item.quantity, 0);
        }, 0);
    };

    const getGrandTotal = () => {
        return groupedByVendor.reduce((total, group) => total + group.subtotal, 0);
    };

    if (!mounted) return null;

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/15 backdrop-blur-[2px] z-40 transition-all duration-300"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'
                    }`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-white">
                    <div className="flex items-center gap-2">
                        <ShoppingCart className="w-6 h-6 text-amber-700" />
                        <h2 className="text-xl font-bold text-gray-900">
                            Mi Carrito
                            {itemCount > 0 && (
                                <span className="ml-2 text-sm font-normal text-gray-600">
                                    ({getTotalItems()} {getTotalItems() === 1 ? 'producto' : 'productos'})
                                </span>
                            )}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex flex-col h-[calc(100%-140px)] overflow-y-auto">
                    {loading ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-700"></div>
                        </div>
                    ) : itemCount === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center p-8">
                            <ShoppingCart className="w-20 h-20 text-gray-300 mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Tu carrito está vacío
                            </h3>
                            <p className="text-gray-600 mb-6">
                                Agrega productos para comenzar tu compra
                            </p>
                            <button
                                onClick={() => {
                                    onClose();
                                    router.push('/productos');
                                }}
                                className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                            >
                                Ver Productos
                            </button>
                        </div>
                    ) : (
                        <div className="p-4 space-y-6">
                            {/* Agrupado por vendedor */}
                            {groupedByVendor.map((group, vendorIndex) => (
                                <div key={vendorIndex} className="border border-gray-200 rounded-lg overflow-hidden">
                                    {/* Vendedor Header */}
                                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                                        <p className="text-sm font-semibold text-gray-800">
                                            Vendedor: {group.vendor?.name || 'Sin nombre'}
                                        </p>
                                    </div>

                                    {/* Items del vendedor */}
                                    <div className="divide-y divide-gray-200">
                                        {group.items.map((item) => (
                                            <div key={item._id} className="p-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex gap-3">
                                                    {/* Imagen */}
                                                    <div className="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg overflow-hidden">
                                                        {item.product?.images?.[0] ? (
                                                            <Image
                                                                src={item.product.images[0]}
                                                                alt={item.product.name}
                                                                width={80}
                                                                height={80}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center">
                                                                <ShoppingCart className="w-8 h-8 text-gray-400" />
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-sm font-medium text-gray-900 truncate">
                                                            {item.product?.name || 'Producto'}
                                                        </h4>

                                                        {/* Variantes */}
                                                        {(item.selectedSize || item.selectedColor) && (
                                                            <p className="text-xs text-gray-500 mt-1">
                                                                {item.selectedSize && `Talla: ${item.selectedSize}`}
                                                                {item.selectedSize && item.selectedColor && ' • '}
                                                                {item.selectedColor && `Color: ${item.selectedColor}`}
                                                            </p>
                                                        )}

                                                        {/* Precio */}
                                                        <p className="text-sm font-bold text-amber-700 mt-1">
                                                            ${item.price.toLocaleString('es-CL')}
                                                        </p>

                                                        {/* Controles */}
                                                        <div className="flex items-center gap-2 mt-2">
                                                            {/* Cantidad */}
                                                            <div className="flex items-center gap-1 border border-gray-300 rounded">
                                                                <button
                                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                                                                    disabled={item.quantity <= 1}
                                                                    className="p-1 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                                                >
                                                                    <Minus className="w-4 h-4" />
                                                                </button>
                                                                <span className="px-3 py-1 text-sm font-medium min-w-[2rem] text-center">
                                                                    {item.quantity}
                                                                </span>
                                                                <button
                                                                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                                                                    className="p-1 hover:bg-gray-100"
                                                                >
                                                                    <Plus className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                            {/* Eliminar */}
                                                            <button
                                                                onClick={() => handleRemoveItem(item._id)}
                                                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                                                                title="Eliminar"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Subtotal del item */}
                                                <div className="mt-2 text-right">
                                                    <p className="text-xs text-gray-500">
                                                        Subtotal: <span className="font-semibold text-gray-900">
                                                            ${(item.price * item.quantity).toLocaleString('es-CL')}
                                                        </span>
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Subtotal por vendedor */}
                                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm font-medium text-gray-700">Subtotal vendedor:</p>
                                            <p className="text-sm font-bold text-gray-900">
                                                ${group.subtotal.toLocaleString('es-CL')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {/* Botón vaciar carrito */}
                            {itemCount > 0 && (
                                <button
                                    onClick={handleClearCart}
                                    className="w-full text-sm text-red-600 hover:text-red-700 py-2 hover:bg-red-50 rounded transition-colors"
                                >
                                    Vaciar Carrito
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                {itemCount > 0 && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-3">
                        {/* Total */}
                        <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-gray-900">Total:</span>
                            <span className="text-2xl font-bold text-amber-700">
                                ${getGrandTotal().toLocaleString('es-CL')}
                            </span>
                        </div>

                        {/* Botones */}
                        <button
                            onClick={() => {
                                onClose();
                                router.push('/carrito');
                            }}
                            className="w-full bg-amber-700 hover:bg-amber-800 text-white py-3 rounded-lg font-semibold transition-colors shadow-md hover:shadow-lg"
                        >
                            Proceder al Pago
                        </button>
                    </div>
                )}
            </div>
        </>
    );
}
