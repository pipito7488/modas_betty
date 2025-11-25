// lib/cloudinary.ts
import { v2 as cloudinary } from 'cloudinary';

// Configurar Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;

// Helper para subir imagen
export async function uploadImage(file: string, folder: string = 'products') {
    try {
        const result = await cloudinary.uploader.upload(file, {
            folder: `betty-modas/${folder}`,
            transformation: [
                { width: 1000, height: 1250, crop: 'limit' },
                { quality: 'auto:good' },
                { fetch_format: 'auto' }
            ]
        });

        return {
            url: result.secure_url,
            publicId: result.public_id
        };
    } catch (error) {
        console.error('Error uploading to Cloudinary:', error);
        throw new Error('Failed to upload image');
    }
}

// Helper para eliminar imagen
export async function deleteImage(publicId: string) {
    try {
        await cloudinary.uploader.destroy(publicId);
    } catch (error) {
        console.error('Error deleting from Cloudinary:', error);
        throw new Error('Failed to delete image');
    }
}
