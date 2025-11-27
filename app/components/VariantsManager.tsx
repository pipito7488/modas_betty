// app/components/VariantsManager.tsx
'use client';

import { useState } from 'react';
import { Plus, Trash2, Package } from 'lucide-react';
import { AVAILABLE_COLORS, AVAILABLE_SIZES, COLOR_HEX_MAP } from '@/lib/productConstants';

interface Variant {
    size: string;
    color: string;
    stock: number;
    sku?: string;
}

interface VariantsManagerProps {
    variants: Variant[];
    onChange: (variants: Variant[]) => void;
    selectedSizes: string[];
    selectedColors: string[];
}

export default function VariantsManager({ variants, onChange, selectedSizes, selectedColors }: VariantsManagerProps) {
    const [showForm, setShowForm] = useState(false);
    const [newVariant, setNewVariant] = useState<Variant>({
        size: '',
        color: '',
        stock: 0,
        sku: ''
    });

    const handleAddVariant = () => {
        if (!newVariant.size || !newVariant.color) {
            alert('Debes seleccionar talla y color');
            return;
        }

        // Verificar si ya existe esta combinación
        const exists = variants.some(v => v.size === newVariant.size && v.color === newVariant.color);
        if (exists) {
            alert('Esta combinación de talla y color ya existe');
            return;
        }

        onChange([...variants, { ...newVariant }]);
        setNewVariant({ size: '', color: '', stock: 0, sku: '' });
        setShowForm(false);
    };

    const handleRemoveVariant = (index: number) => {
        onChange(variants.filter((_, i) => i !== index));
    };

    const handleUpdateVariantStock = (index: number, stock: number) => {
        const updated = [...variants];
        updated[index].stock = Math.max(0, stock);
        onChange(updated);
    };

    const getTotalStock = () => {
        return variants.reduce((sum, v) => sum + v.stock, 0);
    };

    const getColorStyle = (color: string) => {
        const hex = COLOR_HEX_MAP[color];
        if (hex?.startsWith('linear') || hex?.startsWith('repeating')) {
            return { background: hex };
        }
        return { backgroundColor: hex };
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-gray-900">Inventario por Variante</h4>
                    <p className="text-sm text-gray-600">
                        Stock total: {getTotalStock()} unidades en {variants.length} variantes
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setShowForm(!showForm)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    <Plus className="w-4 h-4" />
                    {showForm ? 'Cancelar' : 'Agregar Variante'}
                </button>
            </div>

            {/* Formulario para agregar variante */}
            {showForm && (
                <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <h5 className="font-medium text-blue-900 mb-3">Nueva Variante</h5>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Talla *</label>
                            <select
                                value={newVariant.size}
                                onChange={(e) => setNewVariant({ ...newVariant, size: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seleccionar</option>
                                {selectedSizes.map(size => (
                                    <option key={size} value={size}>{size}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Color *</label>
                            <select
                                value={newVariant.color}
                                onChange={(e) => setNewVariant({ ...newVariant, color: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Seleccionar</option>
                                {selectedColors.map(color => (
                                    <option key={color} value={color}>{color}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                            <input
                                type="number"
                                min="0"
                                value={newVariant.stock}
                                onChange={(e) => setNewVariant({ ...newVariant, stock: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button
                                type="button"
                                onClick={handleAddVariant}
                                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                            >
                                Agregar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Lista de variantes */}
            {variants.length === 0 ? (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                    <Package className="w-12 h-12 mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">
                        No hay variantes configuradas
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                        Primero selecciona tallas y colores, luego agrega variantes con stock específico
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {variants.map((variant, index) => (
                        <div
                            key={index}
                            className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors"
                        >
                            <div
                                className="w-8 h-8 rounded-full border-2 border-gray-300 flex-shrink-0"
                                style={getColorStyle(variant.color)}
                                title={variant.color}
                            />
                            <div className="flex-1 grid grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Talla</p>
                                    <p className="font-medium">{variant.size}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Color</p>
                                    <p className="font-medium">{variant.color}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Stock</p>
                                    <input
                                        type="number"
                                        min="0"
                                        value={variant.stock}
                                        onChange={(e) => handleUpdateVariantStock(index, parseInt(e.target.value) || 0)}
                                        className="w-full px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => handleRemoveVariant(index)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Eliminar variante"
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                    💡 <strong>Tip:</strong> Gestiona el stock de cada combinación de talla y color por separado.
                    Esto te permite tener control detallado de tu inventario.
                </p>
            </div>
        </div>
    );
}
