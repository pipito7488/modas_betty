// app/admin/envios/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Truck, Filter, Download, CheckSquare, Square, Loader2, Eye, Ban, Check, Plus, Edit2, Trash2, X, Save, MapPin, Train, Store } from 'lucide-react';

interface ShippingZone {
    _id: string;
    vendor: {
        _id: string;
        name: string;
        email: string;
    };
    name: string;
    type: 'commune' | 'region' | 'metro' | 'pickup_store';
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
    cost: number;
    estimatedDays: number;
    enabled: boolean;
    pickupAvailable: boolean;
    instructions?: string;
    createdAt: string;
}

interface Stats {
    total: number;
    active: number;
    inactive: number;
    byType: {
        commune: number;
        metro_station: number;
        custom_area: number;
    };
    withPickup: number;
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

export default function AdminShippingPage() {
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [filteredZones, setFilteredZones] = useState<ShippingZone[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());

    // Modal y formulario
    const [showModal, setShowModal] = useState(false);
    const [editingZone, setEditingZone] = useState<ShippingZone | null>(null);
    const [formData, setFormData] = useState<Partial<ShippingZone>>({
        type: 'commune',
        cost: 0,
        estimatedDays: 2,
        enabled: true
    });
    const [vendors, setVendors] = useState<any[]>([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [saving, setSaving] = useState(false);

    // Filtros
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadZones();
        loadVendors();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [zones, typeFilter, statusFilter, searchQuery]);

    const loadZones = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/shipping');
            if (res.ok) {
                const data = await res.json();
                setZones(data.zones);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error loading zones:', error);
        } finally {
            setLoading(false);
        }
    };

    const loadVendors = async () => {
        try {
            const res = await fetch('/api/admin/users?role=vendedor');
            if (res.ok) {
                const data = await res.json();
                setVendors(data.users || []);
            }
        } catch (error) {
            console.error('Error loading vendors:', error);
        }
    };

    const handleOpenModal = (zone?: ShippingZone) => {
        if (zone) {
            setEditingZone(zone);
            setFormData(zone);
        } else {
            setEditingZone(null);
            setFormData({
                type: 'commune',
                cost: 0,
                estimatedDays: 2,
                enabled: true
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
            const url = editingZone ? `/api/admin/shipping/${editingZone._id}` : '/api/admin/shipping';
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
            setError('Erro al guardar');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('¿Eliminar esta zona?')) return;

        try {
            const res = await fetch(`/api/admin/shipping/${id}`, { method: 'DELETE' });
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

    const applyFilters = () => {
        let filtered = [...zones];

        // Filtro por tipo
        if (typeFilter !== 'all') {
            filtered = filtered.filter(z => z.type === typeFilter);
        }

        // Filtro por estado
        if (statusFilter === 'active') {
            filtered = filtered.filter(z => z.enabled);
        } else if (statusFilter === 'inactive') {
            filtered = filtered.filter(z => !z.enabled);
        }

        // Búsqueda
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(z =>
                z.name.toLowerCase().includes(query) ||
                z.vendor.name.toLowerCase().includes(query) ||
                z.commune?.toLowerCase().includes(query) ||
                z.region?.toLowerCase().includes(query)
            );
        }

        setFilteredZones(filtered);
    };

    const toggleZoneSelection = (zoneId: string) => {
        const newSelected = new Set(selectedZones);
        if (newSelected.has(zoneId)) {
            newSelected.delete(zoneId);
        } else {
            newSelected.add(zoneId);
        }
        setSelectedZones(newSelected);
    };

    const toggleAllSelection = () => {
        if (selectedZones.size === filteredZones.length) {
            setSelectedZones(new Set());
        } else {
            setSelectedZones(new Set(filteredZones.map(z => z._id)));
        }
    };

    const handleBulkAction = async (enabled: boolean) => {
        if (selectedZones.size === 0) {
            alert('Selecciona al menos una zona');
            return;
        }

        const action = enabled ? 'habilitar' : 'deshabilitar';
        if (!confirm(`¿${action} ${selectedZones.size} zonas seleccionadas?`)) return;

        try {
            const res = await fetch('/api/admin/shipping', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    zoneIds: Array.from(selectedZones),
                    enabled
                })
            });

            if (res.ok) {
                await loadZones();
                setSelectedZones(new Set());
                alert(`Zonas ${enabled ? 'habilitadas' : 'deshabilitadas'} exitosamente`);
            }
        } catch (error) {
            console.error('Error in bulk action:', error);
            alert('Error al actualizar zonas');
        }
    };

    const exportToCSV = () => {
        const headers = ['Vendedor', 'Nombre', 'Tipo', 'Ubicación', 'Costo', 'Días', 'Estado', 'Pickup'];
        const rows = filteredZones.map(z => [
            z.vendor.name,
            z.name,
            z.type === 'commune' ? 'Comuna' : z.type === 'region' ? 'Región' : z.type === 'metro' ? 'Metro' : 'Retiro',
            z.commune || z.region || z.metroStation || z.storeAddress?.street || '-',
            z.cost,
            z.estimatedDays,
            z.enabled ? 'Activa' : 'Inactiva',
            z.pickupAvailable ? 'Sí' : 'No'
        ]);

        const csv = [headers, ...rows].map(row => row.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zonas-envio-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="container mx-auto max-w-7xl">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <Truck className="w-8 h-8 text-amber-700" />
                            <h1 className="text-3xl font-bold text-gray-900">
                                Gestión de Envíos
                            </h1>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => handleOpenModal()}
                                className="flex items-center gap-2 px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                Agregar Zona
                            </button>
                            <button
                                onClick={exportToCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                            >
                                <Download className="w-5 h-5" />
                                Exportar CSV
                            </button>
                        </div>
                    </div>

                    {/* Estadísticas */}
                    {stats && (
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            <div className="bg-white rounded-lg p-4 border border-gray-200">
                                <p className="text-sm text-gray-600">Total Zonas</p>
                                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-green-200">
                                <p className="text-sm text-gray-600">Activas</p>
                                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-red-200">
                                <p className="text-sm text-gray-600">Inactivas</p>
                                <p className="text-2xl font-bold text-red-600">{stats.inactive}</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-blue-200">
                                <p className="text-sm text-gray-600">Con Pickup</p>
                                <p className="text-2xl font-bold text-blue-600">{stats.withPickup}</p>
                            </div>
                            <div className="bg-white rounded-lg p-4 border border-purple-200">
                                <p className="text-sm text-gray-600">Comunas</p>
                                <p className="text-2xl font-bold text-purple-600">{stats.byType.commune}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filtros y Acciones */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        {/* Búsqueda */}
                        <div className="md:col-span-2">
                            <input
                                type="text"
                                placeholder="Buscar por nombre, vendedor, ubicación..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            />
                        </div>

                        {/* Filtro por tipo */}
                        <select
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="all">Todos los tipos</option>
                            <option value="commune">Comuna</option>
                            <option value="region">Región</option>
                            <option value="metro">Metro</option>
                            <option value="pickup_store">Retiro en Tienda</option>
                        </select>

                        {/* Filtro por estado */}
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        >
                            <option value="all">Todos los estados</option>
                            <option value="active">Activas</option>
                            <option value="inactive">Inactivas</option>
                        </select>
                    </div>

                    {/* Acciones en bulk */}
                    {selectedZones.size > 0 && (
                        <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-600">
                                {selectedZones.size} seleccionada(s)
                            </span>
                            <button
                                onClick={() => handleBulkAction(true)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors"
                            >
                                <Check className="w-4 h-4" />
                                Habilitar
                            </button>
                            <button
                                onClick={() => handleBulkAction(false)}
                                className="flex items-center gap-2 px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 transition-colors"
                            >
                                <Ban className="w-4 h-4" />
                                Deshabilitar
                            </button>
                        </div>
                    )}
                </div>

                {/* Tabla de Zonas */}
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-amber-700" />
                    </div>
                ) : filteredZones.length === 0 ? (
                    <div className="bg-white rounded-lg shadow p-12 text-center">
                        <Truck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No se encontraron zonas
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                                ? 'Intenta ajustar los filtros'
                                : 'Los vendedores aún no han configurado zonas de envío'}
                        </p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gray-50 border-b border-gray-200">
                                    <tr>
                                        <th className="px-4 py-3 text-left">
                                            <button
                                                onClick={toggleAllSelection}
                                                className="p-1 hover:bg-gray-200 rounded transition-colors"
                                            >
                                                {selectedZones.size === filteredZones.length ? (
                                                    <CheckSquare className="w-5 h-5 text-amber-700" />
                                                ) : (
                                                    <Square className="w-5 h-5 text-gray-400" />
                                                )}
                                            </button>
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Vendedor
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Zona
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Tipo
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Ubicación
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Costo
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Días
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Estado
                                        </th>
                                        <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                                            Acciones
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {filteredZones.map((zone) => (
                                        <tr key={zone._id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-4 py-3">
                                                <button
                                                    onClick={() => toggleZoneSelection(zone._id)}
                                                    className="p-1 hover:bg-gray-200 rounded transition-colors"
                                                >
                                                    {selectedZones.has(zone._id) ? (
                                                        <CheckSquare className="w-5 h-5 text-amber-700" />
                                                    ) : (
                                                        <Square className="w-5 h-5 text-gray-400" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {zone.vendor.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    {zone.vendor.email}
                                                </p>
                                            </td>
                                            <td className="px-4 py-3">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {zone.name}
                                                </p>
                                                {zone.pickupAvailable && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">
                                                        Pickup
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {zone.type === 'commune' && 'Comuna'}
                                                {zone.type === 'region' && 'Región'}
                                                {zone.type === 'metro' && 'Metro'}
                                                {zone.type === 'pickup_store' && 'Retiro'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {zone.type === 'commune' && (
                                                    <>{zone.commune}, {zone.region}</>
                                                )}
                                                {zone.type === 'region' && zone.region}
                                                {zone.type === 'metro' && (
                                                    <>{zone.metroLine} - {zone.metroStation}</>
                                                )}
                                                {zone.type === 'pickup_store' && zone.storeAddress?.street}
                                            </td>
                                            <td className="px-4 py-3 text-sm font-medium text-amber-700">
                                                ${zone.cost.toLocaleString('es-CL')}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {zone.estimatedDays} días
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${zone.enabled
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-gray-100 text-gray-800'
                                                    }`}>
                                                    {zone.enabled ? 'Activa' : 'Inactiva'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleOpenModal(zone)}
                                                        className="p-2 hover:bg-blue-50 rounded transition-colors"
                                                        title="Editar"
                                                    >
                                                        <Edit2 className="w-4 h-4 text-blue-600" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(zone._id)}
                                                        className="p-2 hover:bg-red-50 rounded transition-colors"
                                                        title="Eliminar"
                                                    >
                                                        <Trash2 className="w-4 h-4 text-red-600" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Footer con totales */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
                            <p className="text-sm text-gray-600">
                                Mostrando {filteredZones.length} de {zones.length} zonas
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Success Message */}
            {success && (
                <div className="fixed bottom-4 right-4 bg-green-50 border border-green-200 rounded-lg p-4 shadow-lg">
                    <p className="text-green-800 font-medium">{success}</p>
                </div>
            )}

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                            <h3 className="text-lg font-semibold">
                                {editingZone ? 'Editar Zona' : 'Nueva Zona'}
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

                            <div className="space-y-4">
                                {/* Selector de Vendedor (solo para crear) */}
                                {!editingZone && (
                                    <div>
                                        <label className="block text-sm font-medium mb-1">Vendedor *</label>
                                        <select
                                            value={formData.vendor?._id || ''}
                                            onChange={(e) => {
                                                const vendor = vendors.find(v => v._id === e.target.value);
                                                updateFormData('vendor', vendor);
                                            }}
                                            className="w-full px-3 py-2 border rounded-lg"
                                            required
                                        >
                                            <option value="">Seleccionar vendedor...</option>
                                            {vendors.map(v => (
                                                <option key={v._id} value={v._id}>{v.name} ({v.email})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                {/* Tipo de Zona */}
                                <div>
                                    <label className="block text-sm font-medium mb-1">Tipo de Zona *</label>
                                    <select
                                        value={formData.type || 'commune'}
                                        onChange={(e) => updateFormData('type', e.target.value)}
                                        className="w-full px-3 py-2 border rounded-lg"
                                    >
                                        <option value="commune">Comuna</option>
                                        <option value="region">Región</option>
                                        <option value="metro">Metro</option>
                                        <option value="pickup_store">Retiro en Tienda</option>
                                    </select>
                                </div>

                                {/* COMMUNE */}
                                {formData.type === 'commune' && (
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
                                {formData.type === 'region' && (
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
                                )}

                                {/* METRO */}
                                {formData.type === 'metro' && (
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
                                    </>
                                )}

                                {/* PICKUP STORE */}
                                {formData.type === 'pickup_store' && (
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
                                    </>
                                )}

                                {/* Campos comunes */}
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

                                <div>
                                    <label className="block text-sm font-medium mb-1">Instrucciones</label>
                                    <input
                                        type="text"
                                        value={formData.instructions || ''}
                                        onChange={(e) => updateFormData('instructions', e.target.value)}
                                        placeholder="Información adicional"
                                        className="w-full px-3 py-2 border rounded-lg"
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <input
                                        type="checkbox"
                                        id="enabled"
                                        checked={formData.enabled || false}
                                        onChange={(e) => updateFormData('enabled', e.target.checked)}
                                        className="w-4 h-4 text-amber-700"
                                    />
                                    <label htmlFor="enabled" className="text-sm font-medium">Zona habilitada</label>
                                </div>
                            </div>

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
