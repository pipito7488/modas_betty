// app/api/orders/[id]/upload-proof/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import { uploadImage } from '@/lib/cloudinary';

/**
 * POST /api/orders/[id]/upload-proof
 * Subir comprobante de pago para una orden
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
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

        await mongoose.connect(process.env.MONGODB_URI!);

        // Await params (Next.js 16)
        const { id } = await params;

        // Verificar que la orden pertenece al usuario
        const order = await Order.findOne({
            _id: id,
            user: session.user.id
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Orden no encontrada' },
                { status: 404 }
            );
        }

        // Convertir File a base64
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const base64 = `data:${file.type};base64,${buffer.toString('base64')}`;

        // Subir imagen a Cloudinary
        const result = await uploadImage(base64, 'payment_proofs');

        // Actualizar orden
        order.paymentProof = {
            imageUrl: result.url,
            uploadedAt: new Date()
        };
        order.status = 'payment_submitted';
        await order.save();

        return NextResponse.json({
            success: true,
            imageUrl: result.url,
            message: 'Comprobante subido exitosamente'
        });

    } catch (error) {
        console.error('Error uploading proof:', error);
        return NextResponse.json(
            { error: 'Error al subir comprobante' },
            { status: 500 }
        );
    }
}
