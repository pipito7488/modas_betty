// app/perfil/configuracion/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface Phone {
    _id: string;
    number: string;
    label: string;
    isDefault: boolean;
}

interface Address {
    _id: string;
    label: string;
    street: string;
    commune: string;
    region: string;
    zipCode?: string;
    isDefault: boolean;
}

interface ProfileValidation {
    isComplete: boolean;
    missing: string[];
    canBuy: boolean;
    canSell: boolean;
    user: {
        role: string;
        hasAddresses: boolean;
        addressCount: number;
        hasPhones: boolean;
        phoneCount: number;
        hasPaymentMethods: boolean;
        paymentMethodCount: number;
    };
}

export default function ConfiguracionPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [validation, setValidation] = useState<ProfileValidation | null>(null);
    const [phones, setPhones] = useState<Phone[]>([]);
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'perfil' | 'phones' | 'addresses'>('perfil');

    // Estado para formularios
    const [showPhoneForm, setShowPhoneForm] = useState(false);
    const [phoneForm, setPhoneForm] = useState({ number: '', label: 'Principal' });
    const [editingPhone, setEditingPhone] = useState<Phone | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            loadData();
        }
    }, [status, router]);

    const loadData = async () => {
        try {
            setLoading(true);

            // Cargar validación de perfil
            const validationRes = await fetch('/api/user/validate-profile');
            if (validationRes.ok) {
                const data = await validationRes.json();
                setValidation(data);
            }

            // Cargar teléfonos
            const phonesRes = await fetch('/api/user/phones');
            if (phonesRes.ok) {
                const data = await phonesRes.json();
                setPhones(data.phones);
            }

            // Cargar direcciones
            const addressesRes = await fetch('/api/user/addresses');
            if (addressesRes.ok) {
                const data = await addressesRes.json();
                setAddresses(data.addresses);
            }

        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPhone = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/user/phones', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(phoneForm)
            });

            if (res.ok) {
                setPhoneForm({ number: '', label: 'Principal' });
                setShowPhoneForm(false);
                loadData();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al agregar teléfono');
            }
        } catch (error) {
            console.error('Error adding phone:', error);
            alert('Error al agregar teléfono');
        }
    };

    const handleDeletePhone = async (id: string) => {
        if (!confirm('¿Estás seguro de eliminar este teléfono?')) return;

        try {
            const res = await fetch(`/api/user/phones/${id}`, {
                method: 'DELETE'
            });

            if (res.ok) {
                loadData();
            } else {
                const error = await res.json();
                alert(error.error || 'Error al eliminar teléfono');
            }
        } catch (error) {
            console.error('Error deleting phone:', error);
            alert('Error al eliminar teléfono');
        }
    };

    if (loading || status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Cargando configuración...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <h1 className="text-3xl font-bold mb-6">Configuración de Perfil</h1>

                {/* Alert de perfil incompleto */}
                {validation && !validation.isComplete && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-700">
                                    <strong>Tu perfil está incompleto.</strong> Completa los siguientes campos:
                                </p>
                                <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside">
                                    {validation.missing.map((item, idx) => (
                                        <li key={idx}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}

                {/* Estado del perfil */}
                {validation && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Estado del Perfil</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600">Direcciones</p>
                                <p className="text-2xl font-bold">{validation.user.addressCount}/3</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded">
                                <p className="text-sm text-gray-600">Teléfonos</p>
                                <p className="text-2xl font-bold">{validation.user.phoneCount}/2</p>
                            </div>
                            {validation.user.role === 'vendedor' && (
                                <div className="text-center p-4 bg-gray-50 rounded">
                                    <p className="text-sm text-gray-600">Métodos de Pago</p>
                                    <p className="text-2xl font-bold">{validation.user.paymentMethodCount}/3</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow">
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex">
                            <button
                                onClick={() => setActiveTab('perfil')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'perfil'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Perfil
                            </button>
                            <button
                                onClick={() => setActiveTab('phones')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'phones'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Teléfonos ({phones.length}/2)
                            </button>
                            <button
                                onClick={() => setActiveTab('addresses')}
                                className={`py-4 px-6 text-sm font-medium border-b-2 ${activeTab === 'addresses'
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                Direcciones ({addresses.length}/3)
                            </button>
                        </nav>
                    </div>

                    <div className="p-6">
                        {/* Tab: Perfil */}
                        {activeTab === 'perfil' && (
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Información del Perfil</h3>
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Nombre</label>
                                        <p className="mt-1 text-gray-900">{session?.user?.name}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Email</label>
                                        <p className="mt-1 text-gray-900">{session?.user?.email}</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700">Rol</label>
                                        <p className="mt-1 text-gray-900 capitalize">{validation?.user.role}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Tab: Teléfonos */}
                        {activeTab === 'phones' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Mis Teléfonos</h3>
                                    {phones.length < 2 && (
                                        <button
                                            onClick={() => setShowPhoneForm(!showPhoneForm)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            {showPhoneForm ? 'Cancelar' : 'Agregar Teléfono'}
                                        </button>
                                    )}
                                </div>

                                {/* Formulario */}
                                {showPhoneForm && (
                                    <form onSubmit={handleAddPhone} className="mb-6 p-4 bg-gray-50 rounded-lg">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Número de Teléfono *
                                                </label>
                                                <input
                                                    type="tel"
                                                    value={phoneForm.number}
                                                    onChange={(e) => setPhoneForm({ ...phoneForm, number: e.target.value })}
                                                    placeholder="+56912345678"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    required
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Etiqueta
                                                </label>
                                                <input
                                                    type="text"
                                                    value={phoneForm.label}
                                                    onChange={(e) => setPhoneForm({ ...phoneForm, label: e.target.value })}
                                                    placeholder="Personal, Trabajo, etc."
                                                    className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                            </div>
                                        </div>
                                        <button
                                            type="submit"
                                            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                        >
                                            Guardar Teléfono
                                        </button>
                                    </form>
                                )}

                                {/* Lista de teléfonos */}
                                <div className="space-y-3">
                                    {phones.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">
                                            No tienes teléfonos registrados. Agrega al menos uno para completar tu perfil.
                                        </p>
                                    ) : (
                                        phones.map((phone) => (
                                            <div
                                                key={phone._id}
                                                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <p className="font-medium">{phone.number}</p>
                                                        {phone.isDefault && (
                                                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                                                Principal
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-sm text-gray-600">{phone.label}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleDeletePhone(phone._id)}
                                                    className="ml-4 text-red-600 hover:text-red-800"
                                                >
                                                    Eliminar
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab: Direcciones */}
                        {activeTab === 'addresses' && (
                            <div>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="text-lg font-semibold">Mis Direcciones</h3>
                                    {addresses.length < 3 && (
                                        <button
                                            onClick={() => router.push('/perfil/configuracion/direcciones/nueva')}
                                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                                        >
                                            Agregar Dirección
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    {addresses.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">
                                            No tienes direcciones registradas. Agrega al menos una para completar tu perfil.
                                        </p>
                                    ) : (
                                        addresses.map((address) => (
                                            <div
                                                key={address._id}
                                                className="p-4 bg-gray-50 rounded-lg"
                                            >
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <p className="font-medium">{address.label}</p>
                                                            {address.isDefault && (
                                                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                                                    Principal
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-gray-700">{address.street}</p>
                                                        <p className="text-sm text-gray-600">
                                                            {address.commune}, {address.region}
                                                            {address.zipCode && ` - ${address.zipCode}`}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2 ml-4">
                                                        <button
                                                            onClick={() => router.push(`/perfil/configuracion/direcciones/${address._id}`)}
                                                            className="text-blue-600 hover:text-blue-800"
                                                        >
                                                            Editar
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
