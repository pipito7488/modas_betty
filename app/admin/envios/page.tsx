// app/admin/envios/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Truck, Filter, Download, CheckSquare, Square, Loader2, Eye, Ban, Check } from 'lucide-react';

interface ShippingZone {
    _id: string;
    vendor: {
        _id: string;
        name: string;
        email: string;
    };
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

export default function AdminShippingPage() {
    const [zones, setZones] = useState<ShippingZone[]>([]);
    const [filteredZones, setFilteredZones] = useState<ShippingZone[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedZones, setSelectedZones] = useState<Set<string>>(new Set());

    // Filtros
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        loadZones();
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
            z.type === 'commune' ? 'Comuna' : z.type === 'metro_station' ? 'Metro' : 'Personalizada',
            z.commune || z.metroStation || z.customArea || '-',
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
                        <button
                            onClick={exportToCSV}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Download className="w-5 h-5" />
                            Exportar CSV
                        </button>
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
                            <option value="metro_station">Estación Metro</option>
                            <option value="custom_area">Área Personalizada</option>
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
                                                {zone.type === 'metro_station' && 'Metro'}
                                                {zone.type === 'custom_area' && 'Personalizada'}
                                            </td>
                                            <td className="px-4 py-3 text-sm text-gray-600">
                                                {zone.type === 'commune' && (
                                                    <>{zone.commune}, {zone.region}</>
                                                )}
                                                {zone.type === 'metro_station' && (
                                                    <>{zone.metroLine} - {zone.metroStation}</>
                                                )}
                                                {zone.type === 'custom_area' && zone.customArea}
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
        </div>
    );
}
