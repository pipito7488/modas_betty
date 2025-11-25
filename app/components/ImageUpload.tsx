// app/components/ImageUpload.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Upload, X, Loader2 } from 'lucide-react';

interface ImageUploadProps {
    images: string[];
    onImagesChange: (images: string[]) => void;
    maxImages?: number;
}

export default function ImageUpload({ images, onImagesChange, maxImages = 5 }: ImageUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleFileUpload = async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const remainingSlots = maxImages - images.length;
        if (remainingSlots <= 0) {
            alert(`Máximo ${maxImages} imágenes permitidas`);
            return;
        }

        const filesToUpload = Array.from(files).slice(0, remainingSlots);
        setUploading(true);

        try {
            const uploadPromises = filesToUpload.map(async (file) => {
                const formData = new FormData();
                formData.append('file', file);

                const response = await fetch('/api/upload', {
                    method: 'POST',
                    body: formData,
                });

                if (!response.ok) {
                    const error = await response.json();
                    throw new Error(error.error || 'Error al subir imagen');
                }

                const data = await response.json();
                return data.url;
            });

            const uploadedUrls = await Promise.all(uploadPromises);
            onImagesChange([...images, ...uploadedUrls]);

        } catch (error) {
            console.error('Error uploading images:', error);
            alert(error instanceof Error ? error.message : 'Error al subir imágenes');
        } finally {
            setUploading(false);
        }
    };

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFileUpload(e.dataTransfer.files);
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onImagesChange(newImages);
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${dragActive ? 'border-amber-500 bg-amber-50' : 'border-gray-300 hover:border-amber-500'}
          ${images.length >= maxImages ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        `}
            >
                <input
                    type="file"
                    id="file-upload"
                    multiple
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleFileUpload(e.target.files)}
                    disabled={images.length >= maxImages || uploading}
                    className="hidden"
                />

                <label
                    htmlFor="file-upload"
                    className={`cursor-pointer ${images.length >= maxImages ? 'cursor-not-allowed' : ''}`}
                >
                    <div className="flex flex-col items-center gap-3">
                        {uploading ? (
                            <>
                                <Loader2 className="w-12 h-12 text-amber-700 animate-spin" />
                                <p className="text-gray-600">Subiendo imágenes...</p>
                            </>
                        ) : (
                            <>
                                <Upload className="w-12 h-12 text-gray-400" />
                                <div>
                                    <p className="text-gray-700 font-medium">
                                        Arrastra imágenes aquí o haz click para seleccionar
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        JPG, PNG o WebP (máx. 5MB por imagen)
                                    </p>
                                    <p className="text-xs text-gray-400 mt-1">
                                        {images.length}/{maxImages} imágenes subidas
                                    </p>
                                </div>
                            </>
                        )}
                    </div>
                </label>
            </div>

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {images.map((url, index) => (
                        <div key={index} className="relative group">
                            <div className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                                <Image
                                    src={url}
                                    alt={`Product image ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
                                />

                                {/* Remove Button */}
                                <button
                                    onClick={() => removeImage(index)}
                                    className="absolute top-2 right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                    type="button"
                                >
                                    <X className="w-4 h-4" />
                                </button>

                                {/* Primary Badge */}
                                {index === 0 && (
                                    <div className="absolute bottom-2 left-2 bg-amber-700 text-white text-xs px-2 py-1 rounded">
                                        Principal
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
