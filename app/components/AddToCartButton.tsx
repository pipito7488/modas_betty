// app/components/AddToCartButton.tsx
'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface AddToCartButtonProps {
    productId: string;
    productName: string;
    stock: number;
    selectedSize?: string;
    selectedColor?: string;
    className?: string;
}

export default function AddToCartButton({
    productId,
    productName,
    stock,
    selectedSize,
    selectedColor,
    className = ''
}: AddToCartButtonProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const handleAddToCart = async () => {
        // Verificar autenticación
        if (status === 'unauthenticated') {
            router.push('/login');
            return;
        }

        if (stock < 1) {
            alert('Producto sin stock');
            return;
        }

        setLoading(true);
        setSuccess(false);

        try {
            const res = await fetch('/api/cart', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId,
                    quantity: 1,
                    size: selectedSize,
                    color: selectedColor
                })
            });

            if (res.ok) {
                setSuccess(true);

                // Mostrar mensaje de éxito brevemente
                setTimeout(() => {
                    setSuccess(false);
                }, 2000);

                // Opcional: Actualizar contador del carrito en header
                // window.dispatchEvent(new Event('cartUpdated'));
            } else {
                const error = await res.json();
                alert(error.error || 'Error al agregar al carrito');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            alert('Error al agregar al carrito');
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={handleAddToCart}
            disabled={loading || stock < 1}
            className={`${className} ${success
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-amber-700 hover:bg-amber-800'
                } text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg transform hover:-translate-y-0.5`}
        >
            {loading ? (
                <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Agregando...</span>
                </>
            ) : success ? (
                <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>¡Agregado!</span>
                </>
            ) : (
                <>
                    <ShoppingCart className="w-5 h-5" />
                    <span>{stock < 1 ? 'Sin Stock' : 'Agregar al Carrito'}</span>
                </>
            )}
        </button>
    );
}
