// app/vendedor/productos/[id]/editar/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import ProductForm from '@/app/components/ProductForm';

export default function VendorEditProductPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const params = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'vendedor') {
            router.push('/');
        }
    }, [status, session, router]);

    useEffect(() => {
        if (params.id && session?.user?.id) {
            fetchProduct(params.id as string);
        }
    }, [params.id, session]);

    const fetchProduct = async (id: string) => {
        setLoading(true);
        setError('');
        try {
            const response = await fetch(`/api/productos/${id}`);
            if (response.ok) {
                const data = await response.json();

                // Verificar que el producto pertenece al vendedor
                if (data.seller._id !== session?.user?.id) {
                    setError('No tienes permiso para editar este producto');
                    return;
                }

                setProduct(data);
            } else {
                setError('Producto no encontrado');
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            setError('Error al cargar el producto');
        } finally {
            setLoading(false);
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-12 h-12 animate-spin text-amber-700" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/vendedor/productos')}
                        className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800"
                    >
                        Volver a Mis Productos
                    </button>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600">Producto no encontrado</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Editar Producto</h1>
                    <p className="text-gray-600 mt-1">Actualiza la información de tu producto</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8">
                    <ProductForm product={product} isEdit={true} />
                </div>
            </div>
        </div>
    );
}
