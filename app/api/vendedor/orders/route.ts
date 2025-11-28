// app/api/vendedor/orders/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Order from '@/models/Order';

/**
 * GET /api/vendedor/orders
 * Obtener órdenes del vendedor autenticado
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

        if (session.user.role !== 'vendedor') {
            return NextResponse.json(
                { error: 'Solo vendedores pueden acceder' },
                { status: 403 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const orders = await Order.find({ vendor: session.user.id })
            .populate('user', 'name email')
            .sort({ createdAt: -1 });

        console.log('Vendedor orders fetched:', orders.length);

        // Ensure we always return an array
        const ordersArray = Array.isArray(orders) ? orders : [];

        return NextResponse.json({ orders: ordersArray });

    } catch (error) {
        console.error('Error fetching vendor orders:', error);
        return NextResponse.json(
            { error: 'Error al obtener órdenes' },
            { status: 500 }
        );
    }
}
