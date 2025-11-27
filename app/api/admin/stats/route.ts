// app/api/admin/stats/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import User from '@/models/User';
import Product from '@/models/Product';

/**
 * GET /api/admin/stats
 * Obtener estadísticas completas del marketplace
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

        // Estadísticas generales
        const totalUsers = await User.countDocuments({ role: 'cliente' });
        const totalVendors = await User.countDocuments({ role: 'vendedor' });
        const activeVendors = await User.countDocuments({ role: 'vendedor', active: true });
        const totalProducts = await Product.countDocuments();
        const activeProducts = await Product.countDocuments({ active: true });

        // Estadísticas de órdenes
        const totalOrders = await Order.countDocuments();
        const completedOrders = await Order.countDocuments({
            status: { $in: ['delivered', 'payment_confirmed'] }
        });
        const pendingOrders = await Order.countDocuments({
            status: { $in: ['pending', 'payment_pending', 'payment_submitted'] }
        });

        // Ventas totales y comisiones
        const salesStats = await Order.aggregate([
            {
                $match: {
                    status: { $in: ['payment_confirmed', 'processing', 'shipped', 'delivered'] }
                }
            },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$total' },
                    totalCommissions: { $sum: '$commissionAmount' },
                    totalVendorNet: { $sum: '$vendorNetAmount' },
                    averageOrderValue: { $avg: '$total' }
                }
            }
        ]);

        const sales = salesStats[0] || {
            totalSales: 0,
            totalCommissions: 0,
            totalVendorNet: 0,
            averageOrderValue: 0
        };

        // Top 5 vendedores por ventas
        const topVendors = await Order.aggregate([
            {
                $match: {
                    status: { $in: ['payment_confirmed', 'processing', 'shipped', 'delivered'] }
                }
            },
            {
                $group: {
                    _id: '$vendor',
                    totalSales: { $sum: '$total' },
                    totalOrders: { $sum: 1 },
                    totalCommissions: { $sum: '$commissionAmount' }
                }
            },
            { $sort: { totalSales: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'users',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'vendorInfo'
                }
            },
            { $unwind: '$vendorInfo' },
            {
                $project: {
                    vendorId: '$_id',
                    vendorName: '$vendorInfo.name',
                    vendorEmail: '$vendorInfo.email',
                    totalSales: 1,
                    totalOrders: 1,
                    totalCommissions: 1
                }
            }
        ]);

        // Top 5 productos más vendidos
        const topProducts = await Order.aggregate([
            {
                $match: {
                    status: { $in: ['payment_confirmed', 'processing', 'shipped', 'delivered'] }
                }
            },
            { $unwind: '$items' },
            {
                $group: {
                    _id: '$items.product',
                    totalQuantity: { $sum: '$items.quantity' },
                    totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
                }
            },
            { $sort: { totalQuantity: -1 } },
            { $limit: 5 },
            {
                $lookup: {
                    from: 'products',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'productInfo'
                }
            },
            { $unwind: '$productInfo' },
            {
                $project: {
                    productId: '$_id',
                    productName: '$productInfo.name',
                    productImage: { $arrayElemAt: ['$productInfo.images', 0] },
                    totalQuantity: 1,
                    totalRevenue: 1
                }
            }
        ]);

        // Ventas por mes (últimos 6 meses)
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

        const salesByMonth = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: sixMonthsAgo },
                    status: { $in: ['payment_confirmed', 'processing', 'shipped', 'delivered'] }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' }
                    },
                    totalSales: { $sum: '$total' },
                    totalOrders: { $sum: 1 },
                    totalCommissions: { $sum: '$commissionAmount' }
                }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } }
        ]);

        return NextResponse.json({
            general: {
                totalUsers,
                totalVendors,
                activeVendors,
                totalProducts,
                activeProducts
            },
            orders: {
                totalOrders,
                completedOrders,
                pendingOrders
            },
            sales: {
                totalSales: sales.totalSales,
                totalCommissions: sales.totalCommissions,
                totalVendorNet: sales.totalVendorNet,
                averageOrderValue: sales.averageOrderValue
            },
            topVendors,
            topProducts,
            salesByMonth
        });

    } catch (error) {
        console.error('Error fetching stats:', error);
        return NextResponse.json(
            { error: 'Error al obtener estadísticas' },
            { status: 500 }
        );
    }
}
