// app/api/admin/orders/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Order from '@/models/Order';

/**
 * GET /api/admin/orders
 * Obtener todas las órdenes del sistema (solo admin)
 */
export async function GET() {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        // Verificar que sea admin
        if (session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Acceso denegado' },
                { status: 403 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const orders = await Order.find({})
            .populate('user', 'name email')
            .populate('vendor', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json({ orders });

    } catch (error) {
        console.error('Error fetching admin orders:', error);
        return NextResponse.json(
            { error: 'Error al obtener órdenes' },
            { status: 500 }
        );
    }
}
