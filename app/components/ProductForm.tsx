// app/components/ProductForm.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ImageUpload from './ImageUpload';
import VariantsManager from './VariantsManager';
import { Loader2, Save, DollarSign, Percent, Calendar, Eye, EyeOff } from 'lucide-react';
import { AVAILABLE_COLORS, AVAILABLE_SIZES, COLOR_HEX_MAP } from '@/lib/productConstants';

interface ProductFormProps {
    product?: any;
    isEdit?: boolean;
}

const categories = ['Vestidos', 'Blusas', 'Pantalones', 'Faldas', 'Accesorios', 'Zapatos'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

// Función para formatear números en CLP
const formatCLP = (value: number) => {
    return new Intl.NumberFormat('es-CL', {
        style: 'currency',
        currency: 'CLP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(value);
};

export default function ProductForm({ product, isEdit = false }: ProductFormProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        costPrice: product?.costPrice || '',
        profitPercentage: product?.profitPercentage || 30,
        discountPercentage: product?.discountPercentage || 0,
        discountStartDate: product?.discountStartDate ? new Date(product.discountStartDate).toISOString().slice(0, 16) : '',
        discountEndDate: product?.discountEndDate ? new Date(product.discountEndDate).toISOString().slice(0, 16) : '',
        launchDate: product?.launchDate ? new Date(product.launchDate).toISOString().slice(0, 16) : '',
        visible: product?.visible !== undefined ? product.visible : true,
        stock: product?.stock || '',
        category: product?.category || 'Vestidos',
        sizes: product?.sizes || [],
        colors: product?.colors || [],
        variants: product?.variants || [],
        images: product?.images || [],
        featured: product?.featured || false,
        active: product?.active !== undefined ? product.active : true,
    });

    const [useVariants, setUseVariants] = useState(product?.variants?.length > 0 || false);

    // Calcular precio base y precio final
    const costPrice = parseFloat(formData.costPrice) || 0;
    const profitPercentage = parseFloat(formData.profitPercentage.toString()) || 0;
    const discountPercentage = parseFloat(formData.discountPercentage.toString()) || 0;

    const basePrice = costPrice * (1 + profitPercentage / 100);
    const finalPrice = basePrice * (1 - discountPercentage / 100);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validaciones
            if (!formData.name || !formData.description || !formData.costPrice || !formData.stock) {
                throw new Error('Por favor completa todos los campos requeridos');
            }

            if (formData.images.length === 0) {
                throw new Error('Debes subir al menos una imagen');
            }

            // Validar fechas de oferta
            if (formData.discountStartDate && formData.discountEndDate) {
                if (new Date(formData.discountEndDate) <= new Date(formData.discountStartDate)) {
                    throw new Error('La fecha de fin de la oferta debe ser posterior a la fecha de inicio');
                }
            }

            const url = isEdit ? `/api/productos/${product._id}` : '/api/productos';
            const method = isEdit ? 'PUT' : 'POST';

            const response = await fetch(url, {
                method,
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...formData,
                    costPrice: parseFloat(formData.costPrice),
                    price: finalPrice, // Precio calculado
                    profitPercentage: parseFloat(formData.profitPercentage.toString()),
                    discountPercentage: parseFloat(formData.discountPercentage.toString()),
                    stock: parseInt(formData.stock),
                    discountStartDate: formData.discountStartDate || null,
                    discountEndDate: formData.discountEndDate || null,
                    launchDate: formData.launchDate || null,
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al guardar el producto');
            }

            // Redirigir según el rol del usuario
            const redirectPath = (session?.user as any)?.role === 'admin'
                ? '/admin/productos'
                : '/vendedor/productos';

            router.push(redirectPath);
            router.refresh();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    const toggleSize = (size: string) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.includes(size)
                ? prev.sizes.filter((s: string) => s !== size)
                : [...prev.sizes, size]
        }));
    };

    const addColor = () => {
        if (newColor.trim() && !formData.colors.includes(newColor.trim())) {
            setFormData(prev => ({
                ...prev,
                colors: [...prev.colors, newColor.trim()]
            }));
            setNewColor('');
        }
    };

    const removeColor = (color: string) => {
        setFormData(prev => ({
            ...prev,
            colors: prev.colors.filter((c: string) => c !== color)
        }));
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                    {error}
                </div>
            )}

            {/* Información Básica */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre del Producto *
                    </label>
                    <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción *
                    </label>
                    <textarea
                        required
                        rows={4}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría *
                    </label>
                    <select
                        required
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Precios CLP */}
            <div className="space-y-4 bg-amber-50 p-6 rounded-lg border border-amber-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-700" />
                    Precios en CLP
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio de Costo (CLP) *
                        </label>
                        <input
                            type="number"
                            required
                            min="0"
                            step="1"
                            value={formData.costPrice}
                            onChange={(e) => setFormData({ ...formData, costPrice: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                            placeholder="Ej: 10000"
                        />
                        {costPrice > 0 && (
                            <p className="text-sm text-gray-600 mt-1">{formatCLP(costPrice)}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <Percent className="w-4 h-4" />
                            % de Ganancia
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="1000"
                            step="0.1"
                            value={formData.profitPercentage}
                            onChange={(e) => setFormData({ ...formData, profitPercentage: parseFloat(e.target.value) || 0 })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>

                {/* Preview de Precios */}
                <div className="bg-white p-4 rounded-lg border border-amber-300">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <p className="text-gray-600">Precio Base:</p>
                            <p className="text-lg font-bold text-gray-900">{formatCLP(basePrice)}</p>
                        </div>
                        <div>
                            <p className="text-gray-600">Precio Final:</p>
                            <p className="text-xl font-bold text-green-600">{formatCLP(finalPrice)}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ofertas y Descuentos */}
            <div className="space-y-4 bg-red-50 p-6 rounded-lg border border-red-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Percent className="w-5 h-5 text-red-700" />
                    Ofertas y Descuentos
                </h3>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        % de Descuento (0-100)
                    </label>
                    <input
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={formData.discountPercentage}
                        onChange={(e) => setFormData({ ...formData, discountPercentage: parseFloat(e.target.value) || 0 })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    />
                    {discountPercentage > 0 && (
                        <p className="text-sm text-red-600 mt-1 font-medium">
                            Descuento: {formatCLP(basePrice - finalPrice)} ({discountPercentage}% OFF)
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha Inicio Oferta (Opcional)
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.discountStartDate}
                            onChange={(e) => setFormData({ ...formData, discountStartDate: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Fecha Fin Oferta (Opcional)
                        </label>
                        <input
                            type="datetime-local"
                            value={formData.discountEndDate}
                            onChange={(e) => setFormData({ ...formData, discountEndDate: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                        />
                    </div>
                </div>

                <p className="text-sm text-gray-600">
                    💡 Si no estableces fechas, la oferta será permanente hasta que la desactives
                </p>
            </div>

            {/* Lanzamiento y Visibilidad */}
            <div className="space-y-4 bg-blue-50 p-6 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-blue-700" />
                    Lanzamiento y Visibilidad
                </h3>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de Lanzamiento (Opcional)
                    </label>
                    <input
                        type="datetime-local"
                        value={formData.launchDate}
                        onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-sm text-gray-600 mt-1">
                        Se mostrará una cuenta regresiva hasta esta fecha
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, visible: !formData.visible })}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${formData.visible
                            ? 'bg-green-100 text-green-700 hover:bg-green-200'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        {formData.visible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                        {formData.visible ? 'Visible para Clientes' : 'Oculto para Clientes'}
                    </button>
                </div>
            </div>

            {/* Stock */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Stock *
                </label>
                <input
                    type="number"
                    required
                    min="0"
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
            </div>

            {/* Tallas */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tallas Disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                    {sizes.map((size) => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`px-4 py-2 rounded-lg border-2 transition-colors ${formData.sizes.includes(size)
                                ? 'border-amber-500 bg-amber-50 text-amber-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-amber-300'
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Colores */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Colores Disponibles
                </label>
                <div className="flex gap-2 mb-2">
                    <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Ej: Rojo, Azul, Verde"
                    />
                    <button
                        type="button"
                        onClick={addColor}
                        className="px-4 py-2 bg-amber-700 text-white rounded-lg hover:bg-amber-800"
                    >
                        Agregar
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.colors.map((color: string) => (
                        <span
                            key={color}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-full"
                        >
                            {color}
                            <button
                                type="button"
                                onClick={() => removeColor(color)}
                                className="text-red-600 hover:text-red-800"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Imágenes */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Imágenes del Producto *
                </label>
                <ImageUpload
                    images={formData.images}
                    onImagesChange={(images: string[]) => setFormData({ ...formData, images })}
                />
            </div>

            {/* Opciones Adicionales */}
            <div className="space-y-3">
                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Producto Destacado</span>
                </label>

                <label className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Producto Activo</span>
                </label>
            </div>

            {/* Botón Guardar */}
            <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Guardando...
                    </>
                ) : (
                    <>
                        <Save className="w-5 h-5" />
                        {isEdit ? 'Actualizar Producto' : 'Crear Producto'}
                    </>
                )}
            </button>
        </form>
    );
}
