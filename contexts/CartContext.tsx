'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSession } from 'next-auth/react';

interface CartItem {
    _id: string;
    product: any;
    vendor: any;
    quantity: number;
    price: number;
    selectedSize?: string;
    selectedColor?: string;
}

interface VendorGroup {
    vendor: any;
    items: CartItem[];
    subtotal: number;
}

interface CartContextType {
    groupedByVendor: VendorGroup[];
    itemCount: number;
    loading: boolean;
    refreshCart: () => Promise<void>;
    addItem: (productId: string, quantity: number, size?: string, color?: string) => Promise<boolean>;
    updateItemQuantity: (itemId: string, quantity: number) => Promise<void>;
    removeItem: (itemId: string) => Promise<void>;
    clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const { data: session, status } = useSession();
    const [groupedByVendor, setGroupedByVendor] = useState<VendorGroup[]>([]);
    const [loading, setLoading] = useState(true);

    // Cargar carrito
    const refreshCart = async () => {
        if (status === 'unauthenticated') {
            setGroupedByVendor([]);
            setLoading(false);
            return;
        }

        if (status === 'loading') {
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/cart');

            if (res.ok) {
                const data = await res.json();
                setGroupedByVendor(data.groupedByVendor || []);
            } else {
                setGroupedByVendor([]);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
            setGroupedByVendor([]);
        } finally {
            setLoading(false);
        }
    };

    // Cargar carrito cuando cambia la sesión
    useEffect(() => {
        refreshCart();
    }, [status]);

    // Agregar producto
    const addItem = async (
        productId: string,
        quantity: number,
        size?: string,
        color?: string
    ): Promise<boolean> => {
        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ productId, quantity, size, color })
            });

            if (res.ok) {
                await refreshCart();
                return true;
            } else {
                const error = await res.json();
                alert(error.error || 'Error al agregar producto');
                return false;
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error al agregar producto al carrito');
            return false;
        }
    };

    // Actualizar cantidad
    const updateItemQuantity = async (itemId: string, quantity: number) => {
        try {
            const res = await fetch(`/api/cart/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });

            if (res.ok) {
                await refreshCart();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al actualizar cantidad');
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            alert('Error al actualizar cantidad');
        }
    };

    // Eliminar producto
    const removeItem = async (itemId: string) => {
        try {
            const res = await fetch(`/api/cart/${itemId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await refreshCart();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al eliminar producto');
            }
        } catch (error) {
            console.error('Error removing item:', error);
            alert('Error al eliminar producto');
        }
    };

    // Vaciar carrito
    const clearCart = async () => {
        try {
            const res = await fetch('/api/cart', {
                method: 'DELETE'
            });

            if (res.ok) {
                await refreshCart();
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
        }
    };

    const itemCount = groupedByVendor.reduce((total, group) =>
        total + group.items.reduce((sum, item) => sum + item.quantity, 0), 0
    );

    return (
        <CartContext.Provider
            value={{
                groupedByVendor,
                itemCount,
                loading,
                refreshCart,
                addItem,
                updateItemQuantity,
                removeItem,
                clearCart
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
