// app/vendedor/configuracion/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Plus, Trash2, Loader2, Save, AlertCircle } from 'lucide-react';

interface PaymentMethod {
    _id?: string;
    type: 'bank_transfer';
    bankName: string;
    accountType: 'cuenta_corriente' | 'cuenta_vista' | 'cuenta_rut';
    accountNumber: string;
    accountHolder: string;
    rut: string;
    email?: string;
}

const BANKS = [
    'Banco de Chile',
    'Banco Estado',
    'Banco Santander',
    'Banco BCI',
    'Banco Scotiabank',
    'Banco Itaú',
    'Banco Security',
    'Banco Falabella',
    'Banco Ripley',
    'Otro'
];

export default function VendedorConfigPage() {
    const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        loadPaymentMethods();
    }, []);

    const loadPaymentMethods = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/user/profile');
            if (res.ok) {
                const data = await res.json();
                setPaymentMethods(data.paymentMethods || []);
            }
        } catch (error) {
            console.error('Error loading payment methods:', error);
        } finally {
            setLoading(false);
        }
    };

    const addPaymentMethod = () => {
        if (paymentMethods.length >= 3) {
            setError('Máximo 3 métodos de pago permitidos');
            return;
        }

        setPaymentMethods([
            ...paymentMethods,
            {
                type: 'bank_transfer',
                bankName: '',
                accountType: 'cuenta_corriente',
                accountNumber: '',
                accountHolder: '',
                rut: '',
                email: ''
            }
        ]);
    };

    const removePaymentMethod = (index: number) => {
        setPaymentMethods(paymentMethods.filter((_, i) => i !== index));
    };

    const updatePaymentMethod = (index: number, field: keyof PaymentMethod, value: string) => {
        const updated = [...paymentMethods];
        (updated[index] as any)[field] = value;
        setPaymentMethods(updated);
    };

    const handleSave = async () => {
        // Validar que todos los campos estén completos
        for (const method of paymentMethods) {
            if (!method.bankName || !method.accountNumber || !method.accountHolder || !method.rut) {
                setError('Por favor completa todos los campos requeridos');
                return;
            }
        }

        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const res = await fetch('/api/user/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ paymentMethods })
            });

            if (res.ok) {
                setSuccess('✅ Métodos de pago guardados exitosamente');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                const data = await res.json();
                setError(data.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving payment methods:', error);
            setError('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto max-w-4xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <CreditCard className="w-8 h-8 text-amber-700" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Métodos de Pago
                        </h1>
                    </div>
                    <p className="text-gray-600">
                        Configura cómo recibirás los pagos de tus clientes (máximo 3 métodos)
                    </p>
                </div>

                {/* Alerts */}
                {error && (
                    <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-800">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">{success}</p>
                    </div>
                )}

                {/* Loading */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
                    </div>
                ) : (
                    <>
                        {/* Payment Methods */}
                        <div className="space-y-4 mb-6">
                            {paymentMethods.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                                    <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        No hay métodos de pago configurados
                                    </h3>
                                    <p className="text-gray-600 mb-4">
                                        Agrega al menos un método para que los clientes puedan pagarte
                                    </p>
                                </div>
                            ) : (
                                paymentMethods.map((method, index) => (
                                    <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Método {index + 1}
                                            </h3>
                                            <button
                                                onClick={() => removePaymentMethod(index)}
                                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-5 h-5" />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Banco */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Banco *
                                                </label>
                                                <select
                                                    value={method.bankName}
                                                    onChange={(e) => updatePaymentMethod(index, 'bankName', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                >
                                                    <option value="">Seleccionar banco...</option>
                                                    {BANKS.map((bank) => (
                                                        <option key={bank} value={bank}>{bank}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Tipo de Cuenta */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Tipo de Cuenta *
                                                </label>
                                                <select
                                                    value={method.accountType}
                                                    onChange={(e) => updatePaymentMethod(index, 'accountType', e.target.value as any)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                >
                                                    <option value="cuenta_corriente">Cuenta Corriente</option>
                                                    <option value="cuenta_vista">Cuenta Vista</option>
                                                    <option value="cuenta_rut">Cuenta RUT</option>
                                                </select>
                                            </div>

                                            {/* Número de Cuenta */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Número de Cuenta *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={method.accountNumber}
                                                    onChange={(e) => updatePaymentMethod(index, 'accountNumber', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    placeholder="1234567890"
                                                />
                                            </div>

                                            {/* Titular */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Titular de la Cuenta *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={method.accountHolder}
                                                    onChange={(e) => updatePaymentMethod(index, 'accountHolder', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    placeholder="Juan Pérez"
                                                />
                                            </div>

                                            {/* RUT */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    RUT *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={method.rut}
                                                    onChange={(e) => updatePaymentMethod(index, 'rut', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    placeholder="12.345.678-9"
                                                />
                                            </div>

                                            {/* Email (opcional) */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Email (opcional)
                                                </label>
                                                <input
                                                    type="email"
                                                    value={method.email || ''}
                                                    onChange={(e) => updatePaymentMethod(index, 'email', e.target.value)}
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                                    placeholder="email@ejemplo.com"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3">
                            {paymentMethods.length < 3 && (
                                <button
                                    onClick={addPaymentMethod}
                                    className="flex items-center gap-2 px-4 py-2 border border-amber-700 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors"
                                >
                                    <Plus className="w-5 h-5" />
                                    Agregar Método
                                </button>
                            )}

                            {paymentMethods.length > 0 && (
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex items-center gap-2 px-6 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50 ml-auto"
                                >
                                    {saving ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Guardando...
                                        </>
                                    ) : (
                                        <>
                                            <Save className="w-5 h-5" />
                                            Guardar Cambios
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
