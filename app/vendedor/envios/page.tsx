// app/vendedor/envios/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Edit2, Loader2, MapPin, Train, Store, Save, X, Package } from 'lucide-react';

interface ShippingZone {
    _id?: string;
    type: 'commune' | 'region' | 'metro' | 'pickup_store';
    name?: string;
    cost: number;
    estimatedDays: number;
    enabled: boolean;
    commune?: string;
    region?: string;
    metroLine?: string;
    metroStation?: string;
    storeAddress?: {
        street: string;
        commune: string;
        region: string;
        reference?: string;
    };
    instructions?: string;
}

type TabType = 'commune' | 'region' | 'metro' | 'pickup_store';

const REGIONES = [
    'Región Metropolitana', 'Región de Valparaíso', 'Región del Biobío',
    'Región de la Araucanía', 'Región de Los Lagos', 'Región de Antofagasta',
    'Región de Coquimbo', "Región del Libertador General Bernardo O'Higgins",
    'Región del Maule', 'Región de Ñuble', 'Región de Los Ríos',
    'Región de Aysén', 'Región de Magallanes', 'Región de Arica y Parinacota',
    'Región de Tarapacá', 'Región de Atacama'
];

const COMUNAS_RM = [
    'Santiago', 'Providencia', 'Las Condes', 'Vitacura', 'La Reina',
    'Ñuñoa', 'Macul', 'Peñalolén', 'La Florida', 'San Joaquín',
    'La Granja', 'San Miguel', 'San Ramón', 'La Cisterna', 'El Bosque',
    'Pedro Aguirre Cerda', 'Lo Espejo', 'Estación Central', 'Cerrillos',
    'Maipú', 'Quinta Normal', 'Lo Prado', 'Pudahuel', 'Cerro Navia',
    'Renca', 'Quilicura', 'Huechuraba', 'Conchalí', 'Recoleta',
    'Independencia', 'Santiago Centro'
];

const LINEAS_METRO = ['L1', 'L2', 'L3', 'L4', 'L4A', 'L5', 'L6', 'L7'];

const ESTACIONES_L1 = ['San Pablo', 'Neptuno', 'Pajaritos', 'Las Rejas', 'Ecuador', 'San Alberto Hurtado', 'Universidad de Santiago', 'Estación Central', 'ULA', 'República', 'Los Héroes', 'La Moneda', 'Universidad de Chile', 'Santa Lucía', 'Universidad Católica', 'Baquedano', 'Salvador', 'Manuel Montt', 'Pedro de Valdivia', 'Los Leones', 'Tobalaba', 'El Golf', 'Alcántara', 'Escuela Militar', 'Manquehue', 'Hernando de Magallanes', 'Los Dominicos'];

export default function VendedorEnviosPage() {
    const [activeTab, setActiveTab] = useState<TabType>('commune');
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState<Partial<ShippingZone>>({
        type: 'commune',
        cost: 0,
        estimatedDays: 2,
        enabled: true
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
                setZones(data.zones || []);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const zonesByType = (type: TabType) => zones.filter(z => z.type === type);

    const handleOpenModal = (type: TabType, zone?: ShippingZone) => {
        if (zone) {
            setEditingZone(zone);
            setFormData(zone);
        } else {
            setEditingZone(null);
            setFormData({
                type,
                cost: 0,
                estimatedDays: type === 'pickup_store' ? 0 : 2,
                enabled: true,
                ...(type === 'pickup_store' && { storeAddress: { street: '', commune: '', region: '' } })
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingZone(null);
        setError('');
    };

    const handleSave = async () => {
        setError('');
        setSaving(true);

        try {
            const url = editingZone ? `/api/shipping/${editingZone._id}` : '/api/shipping';
            const method = editingZone ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (res.ok) {
                setSuccess(editingZone ? 'Zona actualizada ✅' : 'Zona creada ✅');
                setTimeout(() => setSuccess(''), 3000);
                handleCloseModal();
                loadZones();
            } else {
                const data = await res.json();
                setError(data.error || 'Error al guardar');
            }
        } catch (error) {
            setError('Error al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta zona?')) return;

        try {
            const res = await fetch(`/api/shipping/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setSuccess('Zona eliminada ✅');
                setTimeout(() => setSuccess(''), 3000);
                loadZones();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const updateFormData = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const updateNestedField = (parent: string, field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [parent]: { ...(prev as any)[parent], [field]: value }
        }));
    };

    const renderZoneCard = (zone: ShippingZone) => (
        <div key={zone._id} className="bg-white border rounded-lg p-4 hover:shadow-md transition">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-1">{zone.name}</h4>
                    {zone.type === 'commune' && <p className="text-sm text-gray-600">{zone.commune}, {zone.region}</p>}
                    {zone.type === 'region' && <p className="text-sm text-gray-600">{zone.region}</p>}
                    {zone.type === 'metro' && <p className="text-sm text-gray-600">L{zone.metroLine} - {zone.metroStation}</p>}
                    {zone.type === 'pickup_store' && <p className="text-sm text-gray-600">{zone.storeAddress?.street}</p>}

                    <div className="mt-2 flex gap-4 text-sm">
                        <span className="font-bold text-amber-700">
                            {zone.cost === 0 ? 'GRATIS' : `$${zone.cost.toLocaleString()}`}
                        </span>
                        {zone.estimatedDays > 0 && <span className="text-gray-500">{zone.estimatedDays}d</span>}
                    </div>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(zone.type, zone)} className="p-2 hover:bg-gray-100 rounded">
                        <Edit2 className="w-4 h-4 text-gray-600" />
                    </button>
                    <button onClick={() => handleDelete(zone._id!)} className="p-2 hover:bg-red-50 rounded">
                        <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderForm = () => {
        const type = formData.type!;

        return (
            <div className="space-y-4">
                {/* COMMUNE */}
                {type === 'commune' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Región *</label>
                            <select
                                value={formData.region || ''}
                                onChange={(e) => updateFormData('region', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="">Seleccionar...</option>
                                {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Comuna *</label>
                            <select
                                value={formData.commune || ''}
                                onChange={(e) => updateFormData('commune', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="">Seleccionar...</option>
                                {COMUNAS_RM.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                    </>
                )}

                {/* REGION */}
                {type === 'region' && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Región *</label>
                        <select
                            value={formData.region || ''}
                            onChange={(e) => updateFormData('region', e.target.value)}
                            className="w-full px-3 py-2 border rounded-lg"
                        >
                            <option value="">Seleccionar...</option>
                            {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                        <p className="text-xs text-gray-500 mt-1">Aplica a todas las comunas de esta región</p>
                    </div>
                )}

                {/* METRO */}
                {type === 'metro' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Línea *</label>
                            <select
                                value={formData.metroLine || ''}
                                onChange={(e) => updateFormData('metroLine', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="">Seleccionar...</option>
                                {LINEAS_METRO.map(l => <option key={l} value={l}>Línea {l}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Estación *</label>
                            <select
                                value={formData.metroStation || ''}
                                onChange={(e) => updateFormData('metroStation', e.target.value)}
                                className="w-full px-3 py-2 border rounded-lg"
                            >
                                <option value="">Seleccionar...</option>
                                {ESTACIONES_L1.map(e => <option key={e} value={e}>{e}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Instrucciones</label>
                            <input
                                type="text"
                                value={formData.instructions || ''}
                                onChange={(e) => updateFormData('instructions', e.target.value)}
                                placeholder="Ej: Salida norte, junto al Starbucks"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </>
                )}

                {/* PICKUP STORE */}
                {type === 'pickup_store' && (
                    <>
                        <div>
                            <label className="block text-sm font-medium mb-1">Dirección *</label>
                            <input
                                type="text"
                                value={formData.storeAddress?.street || ''}
                                onChange={(e) => updateNestedField('storeAddress', 'street', e.target.value)}
                                placeholder="Av. Providencia 123"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm font-medium mb-1">Comuna *</label>
                                <select
                                    value={formData.storeAddress?.commune || ''}
                                    onChange={(e) => updateNestedField('storeAddress', 'commune', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">Seleccionar...</option>
                                    {COMUNAS_RM.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">Región *</label>
                                <select
                                    value={formData.storeAddress?.region || ''}
                                    onChange={(e) => updateNestedField('storeAddress', 'region', e.target.value)}
                                    className="w-full px-3 py-2 border rounded-lg"
                                >
                                    <option value="">Seleccionar...</option>
                                    {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Referencia</label>
                            <input
                                type="text"
                                value={formData.storeAddress?.reference || ''}
                                onChange={(e) => updateNestedField('storeAddress', 'reference', e.target.value)}
                                placeholder="Entre Av. Providencia y Av. Suecia"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Instrucciones (horario, etc.)</label>
                            <input
                                type="text"
                                value={formData.instructions || ''}
                                onChange={(e) => updateFormData('instructions', e.target.value)}
                                placeholder="Lun-Vie 10-19hrs, Sáb 10-14hrs"
                                className="w-full px-3 py-2 border rounded-lg"
                            />
                        </div>
                    </>
                )}

                {/* Common fields */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium mb-1">Costo ($) *</label>
                        <input
                            type="number"
                            value={formData.cost || 0}
                            onChange={(e) => updateFormData('cost', parseInt(e.target.value) || 0)}
                            min="0"
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Días estimados</label>
                        <input
                            type="number"
                            value={formData.estimatedDays || 0}
                            onChange={(e) => updateFormData('estimatedDays', parseInt(e.target.value) || 0)}
                            min="0"
                            max="30"
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto max-w-6xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-bold mb-2">Configuración de Envíos</h1>
                    <p className="text-gray-600">Configura cómo tus clientes recibirán sus productos</p>
                </div>

                {success && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">
                        {success}
                    </div>
                )}

                {/* Tabs */}
                <div className="bg-white rounded-lg shadow">
                    <div className="border-b">
                        <nav className="flex -mb-px">
                            {[
                                { type: 'commune' as TabType, label: 'Comunas', icon: MapPin },
                                { type: 'region' as TabType, label: 'Regiones', icon: MapPin },
                                { type: 'metro' as TabType, label: 'Metro', icon: Train },
                                { type: 'pickup_store' as TabType, label: 'Retiro', icon: Store }
                            ].map(({ type, label, icon: Icon }) => (
                                <button
                                    key={type}
                                    onClick={() => setActiveTab(type)}
                                    className={`flex items-center gap-2 px-6 py-4 border-b-2 font-medium ${activeTab === type
                                            ? 'border-amber-700 text-amber-700'
                                            : 'border-transparent text-gray-500 hover:text-gray-700'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    {label}
                                    <span className="px-2 py-0.5 bg-gray-100 text-xs rounded">
                                        {zonesByType(type).length}
                                    </span>
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="p-6">
                        {loading ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-sm text-gray-600">
                                        {zonesByType(activeTab).length} {zonesByType(activeTab).length === 1 ? 'zona' : 'zonas'}
                                    </p>
                                    <button
                                        onClick={() => handleOpenModal(activeTab)}
                                        className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Agregar
                                    </button>
                                </div>

                                {zonesByType(activeTab).length === 0 ? (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed">
                                        <Package className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-600 mb-4">No hay zonas configuradas</p>
                                        <button
                                            onClick={() => handleOpenModal(activeTab)}
                                            className="text-amber-700 font-medium"
                                        >
                                            + Agregar primera zona
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        {zonesByType(activeTab).map(renderZoneCard)}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                                {editingZone ? 'Editar' : 'Nueva'} Zona
                            </h3>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                                    {error}
                                </div>
                            )}

                            {renderForm()}

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 disabled:opacity-50"
                                >
                                    {saving ? (
                                        <><Loader2 className="w-4 h-4 animate-spin" /> Guardando...</>
                                    ) : (
                                        <><Save className="w-4 h-4" /> Guardar</>
                                    )}
                                </button>
                                <button
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
