// app/api/admin/orders/[id]/cancel/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Order from '@/models/Order';

/**
 * POST /api/admin/orders/[id]/cancel
 * Cancelar una orden
 */
export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const session = await getServerSession() as any;

        if (!session || !session.user?.email || session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { reason } = await req.json();

        if (!reason) {
            return NextResponse.json(
                { error: 'Se requiere una razón de cancelación' },
                { status: 400 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const order = await Order.findById(id);

        if (!order) {
            return NextResponse.json(
                { error: 'Orden no encontrada' },
                { status: 404 }
            );
        }

        // Actualizar estado
        order.status = 'cancelled';
        order.cancelledAt = new Date();
        order.cancellationReason = reason;

        await order.save();

        return NextResponse.json({
            message: 'Orden cancelada exitosamente',
            order
        });

    } catch (error) {
        console.error('Error cancelling order:', error);
        return NextResponse.json(
            { error: 'Error al cancelar orden' },
            { status: 500 }
        );
    }
}
