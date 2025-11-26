// app/components/ProductForm.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import ImageUpload from './ImageUpload';
import { Loader2, Save } from 'lucide-react';

interface ProductFormProps {
    product?: any;
    isEdit?: boolean;
}

const categories = ['Vestidos', 'Blusas', 'Pantalones', 'Faldas', 'Accesorios', 'Zapatos'];
const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

export default function ProductForm({ product, isEdit = false }: ProductFormProps) {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        stock: product?.stock || '',
        category: product?.category || 'Vestidos',
        sizes: product?.sizes || [],
        colors: product?.colors || [],
        images: product?.images || [],
        featured: product?.featured || false,
        active: product?.active !== undefined ? product.active : true,
    });

    const [newColor, setNewColor] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Validaciones
            if (!formData.name || !formData.description || !formData.price || !formData.stock) {
                throw new Error('Por favor completa todos los campos requeridos');
            }

            if (formData.images.length === 0) {
                throw new Error('Debes subir al menos una imagen');
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
                    price: parseFloat(formData.price),
                    stock: parseInt(formData.stock),
                }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Error al guardar el producto');
            }

            // Redirigir según el rol del usuario
            const redirectPath = session?.user?.role === 'admin'
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
        if (newColor && !formData.colors.includes(newColor)) {
            setFormData(prev => ({
                ...prev,
                colors: [...prev.colors, newColor]
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
                <div className="bg-red-50 border border-red-200 text-red-800 rounded-lg p-4">
                    {error}
                </div>
            )}

            {/* Nombre */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Nombre del Producto *
                </label>
                <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Ej: Vestido Elegante Negro"
                    required
                />
            </div>

            {/* Descripción */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Descripción *
                </label>
                <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="Describe el producto en detalle..."
                    required
                />
            </div>

            {/* Precio y Stock */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Precio (ARS) *
                    </label>
                    <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="45000"
                        min="0"
                        step="0.01"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-900 mb-2">
                        Stock *
                    </label>
                    <input
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="10"
                        min="0"
                        required
                    />
                </div>
            </div>

            {/* Categoría */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                    Categoría *
                </label>
                <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                >
                    {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
            </div>

            {/* Tallas */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                    Tallas Disponibles
                </label>
                <div className="flex flex-wrap gap-2">
                    {sizes.map(size => (
                        <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`px-4 py-2 border rounded-lg font-medium transition-colors ${formData.sizes.includes(size)
                                    ? 'bg-amber-700 text-white border-amber-700'
                                    : 'bg-white text-gray-700 border-gray-300 hover:border-amber-700'
                                }`}
                        >
                            {size}
                        </button>
                    ))}
                </div>
            </div>

            {/* Colores */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                    Colores Disponibles
                </label>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={newColor}
                        onChange={(e) => setNewColor(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addColor())}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="Ej: Negro, Azul Marino..."
                    />
                    <button
                        type="button"
                        onClick={addColor}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                        Añadir
                    </button>
                </div>
                <div className="flex flex-wrap gap-2">
                    {formData.colors.map((color: string) => (
                        <span
                            key={color}
                            className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 text-gray-700 rounded-full"
                        >
                            {color}
                            <button
                                type="button"
                                onClick={() => removeColor(color)}
                                className="text-gray-500 hover:text-red-600"
                            >
                                ×
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* Imágenes */}
            <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                    Imágenes del Producto *
                </label>
                <ImageUpload
                    images={formData.images}
                    onImagesChange={(images) => setFormData({ ...formData, images })}
                    maxImages={5}
                />
            </div>

            {/* Opciones */}
            <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-5 h-5 text-amber-700 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-gray-900 font-medium">Producto Destacado</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.active}
                        onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                        className="w-5 h-5 text-amber-700 border-gray-300 rounded focus:ring-amber-500"
                    />
                    <span className="text-gray-900 font-medium">Producto Activo (visible en la tienda)</span>
                </label>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 px-6 py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
            </div>
        </form>
    );
}
