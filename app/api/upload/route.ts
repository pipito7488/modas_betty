// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import { uploadImage } from '@/lib/cloudinary';

export async function POST(req: Request) {
    try {
        // Verificar autenticación
        const session = await getServerSession() as any;

        console.log('Upload API - Session user:', session?.user);

        if (!session || !session.user) {
            console.log('Upload API - No session or user');
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        // Verificar que el usuario tenga un rol válido
        const userRole = session.user?.role;
        console.log('Upload API - User role:', userRole);

        // Permitir solo a admin y vendedor
        if (userRole !== 'admin' && userRole !== 'vendedor') {
            console.log('Upload API - Role not authorized:', userRole);
            return NextResponse.json(
                { error: `No autorizado. Tu rol es: ${userRole || 'desconocido'}` },
                { status: 403 }
            );
        }

        const formData = await req.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No se proporcionó archivo' },
                { status: 400 }
            );
        }

        // Validar tipo de archivo
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { error: 'Tipo de archivo no válido. Use JPG, PNG o WebP' },
                { status: 400 }
            );
        }

        // Validar tamaño de archivo (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'El archivo es demasiado grande. Máximo 5MB' },
                { status: 400 }
            );
        }

        console.log('Upload API - Starting upload to Cloudinary');

        // Convertir archivo a base64 para Cloudinary
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Subir a Cloudinary
        const result = await uploadImage(base64, 'products');

        console.log('Upload API - Upload successful:', result.url);

        return NextResponse.json({
            url: result.url,
            publicId: result.publicId
        });

    } catch (error) {
        console.error('Error uploading image:', error);
        return NextResponse.json(
            { error: 'Error al subir la imagen: ' + (error instanceof Error ? error.message : 'desconocido') },
            { status: 500 }
        );
    }
}
