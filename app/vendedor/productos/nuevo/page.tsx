// app/vendedor/productos/nuevo/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import ProductForm from '@/app/components/ProductForm';
import CompleteProfileModal from '@/app/components/CompleteProfileModal';

export default function VendorNewProductPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [validation, setValidation] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'vendedor') {
            router.push('/');
        } else if (status === 'authenticated') {
            checkProfile();
        }
    }, [status, session, router]);

    const checkProfile = async () => {
        try {
            const res = await fetch('/api/user/validate-profile');
            if (res.ok) {
                const data = await res.json();
                setValidation(data);

                // Si no puede vender, mostrar modal
                if (!data.canSell) {
                    setShowModal(true);
                }
            }
        } catch (error) {
            console.error('Error checking profile:', error);
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

    // Si el perfil está incompleto, mostrar solo el modal
    if (validation && !validation.canSell) {
        return (
            <>
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil Incompleto</h2>
                        <p className="text-gray-600 mb-6">
                            Para publicar productos necesitas completar tu perfil de vendedor primero.
                        </p>
                        <button
                            onClick={() => router.push('/perfil/configuracion')}
                            className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                        >
                            Completar Perfil
                        </button>
                    </div>
                </div>
                <CompleteProfileModal
                    isOpen={showModal}
                    validation={validation}
                    requiredFor="sell"
                />
            </>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Publicar Nuevo Producto</h1>
                    <p className="text-gray-600 mt-1">Completa la información de tu producto</p>
                </div>

                <div className="bg-white rounded-lg shadow-sm p-8">
                    <ProductForm />
                </div>
            </div>
        </div>
    );
}
