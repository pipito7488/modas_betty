// app/api/admin/vendors/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import User from '@/models/User';
import Product from '@/models/Product';
import Order from '@/models/Order';

/**
 * GET /api/admin/vendors
 * Obtener lista de vendedores con estadísticas
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

        if (session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Solo administradores pueden acceder' },
                { status: 403 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        // Obtener todos los vendedores
        const vendors = await User.find({ role: 'vendedor' }).select('-password');

        // Obtener estadísticas para cada vendedor
        const vendorsWithStats = await Promise.all(
            vendors.map(async (vendor) => {
                const productsCount = await Product.countDocuments({ vendor: vendor._id });
                const ordersCount = await Order.countDocuments({ vendor: vendor._id });
                const totalSales = await Order.aggregate([
                    { $match: { vendor: vendor._id, status: { $in: ['payment_confirmed', 'processing', 'shipped', 'delivered'] } } },
                    { $group: { _id: null, total: { $sum: '$total' } } }
                ]);

                return {
                    _id: vendor._id,
                    name: vendor.name,
                    email: vendor.email,
                    active: vendor.active,
                    profileComplete: vendor.profileComplete,
                    canSell: vendor.canSell,
                    createdAt: vendor.createdAt,
                    phones: vendor.phones,
                    addresses: vendor.addresses,
                    paymentMethods: vendor.paymentMethods,
                    stats: {
                        products: productsCount,
                        orders: ordersCount,
                        totalSales: totalSales[0]?.total || 0
                    }
                };
            })
        );

        return NextResponse.json(vendorsWithStats);

    } catch (error) {
        console.error('Error fetching vendors:', error);
        return NextResponse.json(
            { error: 'Error al obtener vendedores' },
            { status: 500 }
        );
    }
}
