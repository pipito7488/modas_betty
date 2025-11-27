// app/api/vendedor/orders/[id]/confirm-payment/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Order from '@/models/Order';
import Product from '@/models/Product';

/**
 * POST /api/vendedor/orders/[id]/confirm-payment
 * Confirmar pago de una orden y descontar stock automáticamente
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

        if (session.user.role !== 'vendedor') {
            return NextResponse.json(
                { error: 'Solo vendedores pueden confirmar pagos' },
                { status: 403 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        // Await params (Next.js 16)
        const { id } = await params;

        // Verificar que la orden pertenece al vendedor
        const order = await Order.findOne({
            _id: id,
            vendor: session.user.id
        }).populate('items.product');

        if (!order) {
            return NextResponse.json(
                { error: 'Orden no encontrada' },
                { status: 404 }
            );
        }

        if (order.status === 'payment_confirmed') {
            return NextResponse.json(
                { error: 'El pago ya fue confirmado anteriormente' },
                { status: 400 }
            );
        }

        if (!order.paymentProof) {
            return NextResponse.json(
                { error: 'No se ha subido comprobante de pago' },
                { status: 400 }
            );
        }

        // Actualizar stock de productos
        for (const item of order.items) {
            const product = await Product.findById(item.product);

            if (product) {
                const newStock = Math.max(0, product.stock - item.quantity);
                product.stock = newStock;
                await product.save();
            }
        }

        // Actualizar estado de orden
        order.status = 'payment_confirmed';
        order.paymentConfirmedAt = new Date();
        await order.save();

        return NextResponse.json({
            success: true,
            message: 'Pago confirmado y stock actualizado',
            order
        });

    } catch (error) {
        console.error('Error confirming payment:', error);
        return NextResponse.json(
            { error: 'Error al confirmar pago' },
            { status: 500 }
        );
    }
}
