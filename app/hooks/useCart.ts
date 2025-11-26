// app/hooks/useCart.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
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

interface Cart {
    _id: string;
    items: CartItem[];
}

interface GroupedByVendor {
    vendor: any;
    items: CartItem[];
    subtotal: number;
}

export function useCart() {
    const { data: session, status } = useSession();
    const [cart, setCart] = useState<Cart | null>(null);
    const [groupedByVendor, setGroupedByVendor] = useState<GroupedByVendor[]>([]);
    const [loading, setLoading] = useState(true);
    const [itemCount, setItemCount] = useState(0);

    const loadCart = useCallback(async () => {
        if (status !== 'authenticated') {
            setCart(null);
            setGroupedByVendor([]);
            setItemCount(0);
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            const res = await fetch('/api/cart');

            if (res.ok) {
                const data = await res.json();
                setCart(data.cart);
                setGroupedByVendor(data.groupedByVendor || []);
                setItemCount(data.cart?.items?.length || 0);
            }
        } catch (error) {
            console.error('Error loading cart:', error);
        } finally {
            setLoading(false);
        }
    }, [status]);

    useEffect(() => {
        loadCart();
    }, [loadCart]);

    const updateItemQuantity = async (itemId: string, quantity: number) => {
        try {
            const res = await fetch(`/api/cart/${itemId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });

            if (res.ok) {
                await loadCart();
                return true;
            } else {
                const error = await res.json();
                throw new Error(error.error);
            }
        } catch (error) {
            console.error('Error updating quantity:', error);
            return false;
        }
    };

    const removeItem = async (itemId: string) => {
        try {
            const res = await fetch(`/api/cart/${itemId}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                await loadCart();
                return true;
            } else {
                const error = await res.json();
                throw new Error(error.error);
            }
        } catch (error) {
            console.error('Error removing item:', error);
            return false;
        }
    };

    const clearCart = async () => {
        try {
            const res = await fetch('/api/cart', {
                method: 'DELETE'
            });

            if (res.ok) {
                await loadCart();
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error clearing cart:', error);
            return false;
        }
    };

    return {
        cart,
        groupedByVendor,
        itemCount,
        loading,
        loadCart,
        updateItemQuantity,
        removeItem,
        clearCart
    };
}
