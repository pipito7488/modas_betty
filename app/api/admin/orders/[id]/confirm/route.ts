// app/api/admin/orders/[id]/confirm/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Order from '@/models/Order';

/**
 * POST /api/admin/orders/[id]/confirm
 * Confirmar pago de una orden
 */
export async function POST(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const order = await Order.findById(params.id);

        if (!order) {
            return NextResponse.json(
                { error: 'Orden no encontrada' },
                { status: 404 }
            );
        }

        // Actualizar estado
        order.status = 'confirmed';
        order.paymentConfirmed = true;
        order.paymentConfirmedAt = new Date();
        order.paymentConfirmedBy = session.user.id;

        await order.save();

        return NextResponse.json({
            message: 'Orden confirmada exitosamente',
            order
        });

    } catch (error) {
        console.error('Error confirming order:', error);
        return NextResponse.json(
            { error: 'Error al confirmar orden' },
            { status: 500 }
        );
    }
}
