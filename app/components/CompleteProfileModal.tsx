// app/components/CompleteProfileModal.tsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface CompleteProfileModalProps {
    isOpen: boolean;
    onClose?: () => void;
    validation: {
        isComplete: boolean;
        missing: string[];
        canBuy: boolean;
        canSell: boolean;
    };
    requiredFor?: 'buy' | 'sell';
}

export default function CompleteProfileModal({
    isOpen,
    onClose,
    validation,
    requiredFor = 'buy'
}: CompleteProfileModalProps) {
    const router = useRouter();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted || !isOpen) return null;

    const handleGoToSettings = () => {
        router.push('/perfil/configuracion');
        if (onClose) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Background overlay */}
                <div
                    className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
                    aria-hidden="true"
                    onClick={onClose}
                ></div>

                {/* Center modal */}
                <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

                <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
                    <div>
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100">
                            <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <div className="mt-3 text-center sm:mt-5">
                            <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                                Perfil Incompleto
                            </h3>
                            <div className="mt-2">
                                <p className="text-sm text-gray-500 mb-4">
                                    {requiredFor === 'sell'
                                        ? 'Para poder publicar productos, necesitas completar tu perfil.'
                                        : 'Para poder realizar compras, necesitas completar tu perfil.'
                                    }
                                </p>

                                {validation.missing.length > 0 && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 text-left">
                                        <p className="text-sm font-medium text-yellow-800 mb-2">
                                            Te falta agregar:
                                        </p>
                                        <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                                            {validation.missing.map((item, idx) => (
                                                <li key={idx}>{item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                            type="button"
                            onClick={handleGoToSettings}
                            className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:col-start-2 sm:text-sm"
                        >
                            Completar Perfil
                        </button>
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                            >
                                Cancelar
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
