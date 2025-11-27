// app/api/vendedor/orders/[id]/update-status/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Order from '@/models/Order';

/**
 * PATCH /api/vendedor/orders/[id]/update-status
 * Actualizar estado de una orden
 */
export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        if (session.user.role !== 'vendedor') {
            return NextResponse.json(
                { error: 'Solo vendedores pueden actualizar estado' },
                { status: 403 }
            );
        }

        const { status } = await req.json();

        if (!status) {
            return NextResponse.json(
                { error: 'Estado requerido' },
                { status: 400 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        // Verificar que la orden pertenece al vendedor
        const order = await Order.findOne({
            _id: params.id,
            vendor: session.user.id
        });

        if (!order) {
            return NextResponse.json(
                { error: 'Orden no encontrada' },
                { status: 404 }
            );
        }

        order.status = status;

        // Agregar timestamps para diferentes estados
        if (status === 'shipped') {
            order.shippedAt = new Date();
        } else if (status === 'delivered') {
            order.deliveredAt = new Date();
        }

        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Estado actualizado',
            order
        });

    } catch (error) {
        console.error('Error updating status:', error);
        return NextResponse.json(
            { error: 'Error al actualizar estado' },
            { status: 500 }
        );
    }
}
