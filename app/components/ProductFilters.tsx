// app/components/ProductFilters.tsx
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface ProductFiltersProps {
    onFilterChange: (filters: FilterState) => void;
    currentFilters: FilterState;
}

export interface FilterState {
    category: string;
    minPrice: string;
    maxPrice: string;
    size: string;
}

const categories = ['Vestidos', 'Blusas', 'Pantalones', 'Faldas', 'Accesorios', 'Zapatos'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductFilters({ onFilterChange, currentFilters }: ProductFiltersProps) {
    const [localFilters, setLocalFilters] = useState<FilterState>(currentFilters);

    const handleCategoryChange = (category: string) => {
        const newFilters = {
            ...localFilters,
            category: localFilters.category === category ? '' : category
        };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleSizeChange = (size: string) => {
        const newFilters = {
            ...localFilters,
            size: localFilters.size === size ? '' : size
        };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handlePriceChange = (field: 'minPrice' | 'maxPrice', value: string) => {
        const newFilters = {
            ...localFilters,
            [field]: value
        };
        setLocalFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const emptyFilters: FilterState = {
            category: '',
            minPrice: '',
            maxPrice: '',
            size: ''
        };
        setLocalFilters(emptyFilters);
        onFilterChange(emptyFilters);
    };

    const hasActiveFilters = Object.values(localFilters).some(v => v !== '');

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-lg">Filtros</h3>
                {hasActiveFilters && (
                    <button
                        onClick={clearFilters}
                        className="text-sm text-amber-700 hover:text-amber-800 flex items-center gap-1"
                    >
                        <X className="w-4 h-4" />
                        Limpiar
                    </button>
                )}
            </div>

            {/* Categorías */}
            <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Categoría</h4>
                <div className="space-y-2">
                    {categories.map((category) => (
                        <label key={category} className="flex items-center cursor-pointer group">
                            <input
                                type="checkbox"
                                checked={localFilters.category === category}
                                onChange={() => handleCategoryChange(category)}
                                className="w-4 h-4 text-amber-700 border-gray-300 rounded focus:ring-amber-500"
                            />
                            <span className="ml-2 text-sm text-gray-700 group-hover:text-gray-900">
                                {category}
                            </span>
                        </label>
                    ))}
                </div>
            </div>

            {/* Precio */}
            <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Precio</h4>
                <div className="grid grid-cols-2 gap-2">
                    <input
                        type="number"
                        placeholder="Mín"
                        value={localFilters.minPrice}
                        onChange={(e) => handlePriceChange('minPrice', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <input
                        type="number"
                        placeholder="Máx"
                        value={localFilters.maxPrice}
                        onChange={(e) => handlePriceChange('maxPrice', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>
            </div>

            {/* Tallas */}
            <div>
                <h4 className="font-medium text-gray-900 mb-3">Talla</h4>
                <div className="grid grid-cols-3 gap-2">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            onClick={() => handleSizeChange(size)}
                            className={`py-2 border rounded-md text-sm font-medium transition-colors ${localFilters.size === size
                                    ? 'bg-amber-700 text-white border-amber-700'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-amber-700'
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
