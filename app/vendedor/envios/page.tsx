// app/vendedor/envios/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Truck, Plus, Edit, Trash2, Loader2, Save, X } from 'lucide-react';

interface ShippingZone {
    _id: string;
    name: string;
    type: 'commune' | 'metro_station' | 'custom_area';
    commune?: string;
    region?: string;
    metroLine?: string;
    metroStation?: string;
    customArea?: string;
    cost: number;
    estimatedDays: number;
    enabled: boolean;
    pickupAvailable: boolean;
    pickupCost?: number;
    pickupAddress?: {
        street: string;
        commune: string;
        region: string;
        instructions?: string;
    };
}

const REGIONES_CHILE = [
    'Región Metropolitana',
    'Región de Valparaíso',
    'Región del Biobío',
    "Región de O'Higgins",
    'Región del Maule'
];

const LINEAS_METRO = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7'];

export default function ShippingPage() {
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
    const [submitting, setSubmitting] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        type: 'commune' as 'commune' | 'metro_station' | 'custom_area',
        commune: '',
        region: '',
        metroLine: '',
        metroStation: '',
        customArea: '',
        cost: 0,
        estimated Days: 3,
        enabled: true,
        pickupAvailable: false,
        pickupCost: 0,
        pickupAddress: {
            street: '',
            commune: '',
            region: '',
            instructions: ''
        }
    });

    useEffect(() => {
        loadZones();
    }, []);

    const loadZones = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/shipping');
            if (res.ok) {
                const data = await res.json();
                setZones(data.zones);
            }
        } catch (error) {
            console.error('Error loading zones:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            const url = editingZone
                ? `/api/shipping/${editingZone._id}`
                : '/api/shipping';
            const method = editingZone ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                await loadZones();
                handleCloseModal();
                alert(editingZone ? 'Zona actualizada' : 'Zona creada exitosamente');
            } else {
                const data = await res.json();
                alert(data.error || 'Error al guardar');
            }
        } catch (error) {
            console.error('Error saving zone:', error);
            alert('Error al guardar');
        } finally {
            setSubmitting(false);
        }
    };

    const handleEdit = (zone: ShippingZone) => {
        setEditingZone(zone);
        setFormData({
            name: zone.name,
            type: zone.type,
            commune: zone.commune || '',
            region: zone.region || '',
            metroLine: zone.metroLine || '',
            metroStation: zone.metroStation || '',
            customArea: zone.customArea || '',
            cost: zone.cost,
            estimatedDays: zone.estimatedDays,
            enabled: zone.enabled,
            pickupAvailable: zone.pickupAvailable,
            pickupCost: zone.pickupCost || 0,
            pickupAddress: zone.pickupAddress || {
                street: '',
                commune: '',
                region: '',
                instructions: ''
            }
        });
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta zona de envío?')) return;

        try {
            const res = await fetch(`/api/shipping/${id}`, { method: 'DELETE' });
            if (res.ok) {
                await loadZones();
                alert('Zona eliminada');
            }
        } catch (error) {
            console.error('Error deleting zone:', error);
            alert('Error al eliminar');
        }
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingZone(null);
        setFormData({
            name: '',
            type: 'commune',
            commune: '',
            region: '',
            metroLine: '',
            metroStation: '',
            customArea: '',
            cost: 0,
            estimatedDays: 3,
            enabled: true,
            pickupAvailable: false,
            pickupCost: 0,
            pickupAddress: {
                street: '',
                commune: '',
                region: '',
                instructions: ''
            }
        });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                        <Truck className="w-8 h-8 text-amber-700" />
                        <h1 className="text-3xl font-bold text-gray-900">
                            Métodos de Envío
                        </h1>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Zona
                    </button>
                </div>

                {/* Zones List */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
                    </div>
                ) : zones.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No hay zonas de envío configuradas
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Configura tus primeras zonas de envío para comenzar a vender
                        </p>
                        <button
                            onClick={() => setShowModal(true)}
                            className="px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                        >
                            Crear Zona
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {zones.map((zone) => (
                            <div
                                key={zone._id}
                                className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {zone.name}
                                            </h3>
                                            <span className={`px-2 py-1 text-xs rounded-full ${zone.enabled
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {zone.enabled ? 'Activa' : 'Inactiva'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 md grid-cols-4 gap-4 mt-4">
                                            <div>
                                                <p className="text-sm text-gray-600">Tipo</p>
                                                <p className="font-medium">
                                                    {zone.type === 'commune' && 'Comuna'}
                                                    {zone.type === 'metro_station' && 'Estación Metro'}
                                                    {zone.type === 'custom_area' && 'Área Personalizada'}
                                                </p>
                                            </div>

                                            {zone.type === 'commune' && (
                                                <>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Comuna</p>
                                                        <p className="font-medium">{zone.commune}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Región</p>
                                                        <p className="font-medium">{zone.region}</p>
                                                    </div>
                                                </>
                                            )}

                                            {zone.type === 'metro_station' && (
                                                <>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Línea</p>
                                                        <p className="font-medium">{zone.metroLine}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-600">Estación</p>
                                                        <p className="font-medium">{zone.metroStation}</p>
                                                    </div>
                                                </>
                                            )}

                                            {zone.type === 'custom_area' && (
                                                <div>
                                                    <p className="text-sm text-gray-600">Área</p>
                                                    <p className="font-medium">{zone.customArea}</p>
                                                </div>
                                            )}

                                            <div>
                                                <p className="text-sm text-gray-600">Costo</p>
                                                <p className="font-medium text-amber-700">
                                                    ${zone.cost.toLocaleString('es-CL')}
                                                </p>
                                            </div>

                                            <div>
                                                <p className="text-sm text-gray-600">Días estimados</p>
                                                <p className="font-medium">{zone.estimatedDays} días</p>
                                            </div>
                                        </div>

                                        {zone.pickupAvailable && (
                                            <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                                <p className="text-sm font-medium text-blue-900 mb-1">
                                                    ✓ Retiro en tienda disponible
                                                </p>
                                                <p className="text-xs text-blue-700">
                                                    Costo: ${zone.pickupCost?.toLocaleString('es-CL') || 0}
                                                </p>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(zone)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <Edit className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(zone._id)}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Modal para crear/editar */}
                {showModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingZone ? 'Editar' : 'Nueva'} Zona de Envío
                                </h2>
                                <button
                                    onClick={handleCloseModal}
                                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Nombre de la Zona *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        placeholder="Ej: Santiago Centro"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Tipo de Zona *
                                    </label>
                                    <select
                                        value={formData.type}
                                        onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                    >
                                        <option value="commune">Comuna</option>
                                        <option value="metro_station">Estación de Metro</option>
                                        <option value="custom_area">Área Personalizada</option>
                                    </select>
                                </div>

                                {formData.type === 'commune' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Comuna *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.commune}
                                                onChange={(e) => setFormData({ ...formData, commune: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Región *
                                            </label>
                                            <select
                                                value={formData.region}
                                                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            >
                                                <option value="">Seleccionar...</option>
                                                {REGIONES_CHILE.map((r) => (
                                                    <option key={r} value={r}>{r}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                )}

                                {formData.type === 'metro_station' && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Línea *
                                            </label>
                                            <select
                                                value={formData.metroLine}
                                                onChange={(e) => setFormData({ ...formData, metroLine: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            >
                                                <option value="">Seleccionar...</option>
                                                {LINEAS_METRO.map((l) => (
                                                    <option key={l} value={l}>{l}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Estación *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={formData.metroStation}
                                                onChange={(e) => setFormData({ ...formData, metroStation: e.target.value })}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            />
                                        </div>
                                    </div>
                                )}

                                {formData.type === 'custom_area' && (
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Descripción del Área *
                                        </label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.customArea}
                                            onChange={(e) => setFormData({ ...formData, customArea: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                            placeholder="Ej: Zona Norte de Santiago"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Costo de Envío (CLP) *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.cost}
                                            onChange={(e) => setFormData({ ...formData, cost: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Días Estimados *
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.estimatedDays}
                                            onChange={(e) => setFormData({ ...formData, estimatedDays: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                                        />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="enabled"
                                        checked={formData.enabled}
                                        onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                                        className="w-4 h-4 text-amber-600 rounded"
                                    />
                                    <label htmlFor="enabled" className="text-sm font-medium text-gray-700">
                                        Zona activa
                                    </label>
                                </div>

                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={handleCloseModal}
                                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={submitting}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors disabled:opacity-50"
                                    >
                                        {submitting ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Guardando...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-5 h-5" />
                                                {editingZone ? 'Actualizar' : 'Crear'} Zona
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
