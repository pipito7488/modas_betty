// app/api/orders/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Order from '@/models/Order';

/**
 * GET /api/orders
 * Obtener órdenes del usuario autenticado
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const orders = await Order.find({ user: session.user.id })
            .populate('vendor', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ orders });

    } catch (error) {
        console.error('Error fetching orders:', error);
        return NextResponse.json(
            { error: 'Error al obtener órdenes' },
            { status: 500 }
        );
    }
}
