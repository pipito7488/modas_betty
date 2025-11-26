// app/api/cart/[itemId]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

/**
 * PUT /api/cart/[itemId]
 * Actualizar cantidad de un item del carrito
 */
export async function PUT(
    req: Request,
    context: { params: Promise<{ itemId: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { quantity } = await req.json();

        if (!quantity || quantity < 1) {
            return NextResponse.json(
                { error: 'Cantidad inválida' },
                { status: 400 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const cart = await Cart.findOne({ user: session.user.id });

        if (!cart) {
            return NextResponse.json(
                { error: 'Carrito no encontrado' },
                { status: 404 }
            );
        }

        const itemIndex = cart.items.findIndex((item: any) =>
            item._id.toString() === params.itemId
        );

        if (itemIndex === -1) {
            return NextResponse.json(
                { error: 'Item no encontrado en el carrito' },
                { status: 404 }
            );
        }

        // Verificar stock del producto
        const product = await Product.findById(cart.items[itemIndex].product);

        if (!product) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        if (quantity > product.stock) {
            return NextResponse.json(
                { error: `Stock insuficiente. Disponible: ${product.stock}` },
                { status: 400 }
            );
        }

        // Actualizar cantidad
        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        // Repoblar
        await cart.populate('items.product');
        await cart.populate('items.vendor', 'name email');

        return NextResponse.json({
            message: 'Cantidad actualizada exitosamente',
            cart
        });

    } catch (error) {
        console.error('Error updating cart item:', error);
        return NextResponse.json(
            { error: 'Error al actualizar item' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/cart/[itemId]
 * Eliminar un item del carrito
 */
export async function DELETE(
    req: Request,
    context: { params: Promise<{ itemId: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const cart = await Cart.findOne({ user: session.user.id });

        if (!cart) {
            return NextResponse.json(
                { error: 'Carrito no encontrado' },
                { status: 404 }
            );
        }

        const itemIndex = cart.items.findIndex((item: any) =>
            item._id.toString() === params.itemId
        );

        if (itemIndex === -1) {
            return NextResponse.json(
                { error: 'Item no encontrado en el carrito' },
                { status: 404 }
            );
        }

        // Eliminar item
        cart.items.splice(itemIndex, 1);
        await cart.save();

        return NextResponse.json({
            message: 'Item eliminado exitosamente'
        });

    } catch (error) {
        console.error('Error deleting cart item:', error);
        return NextResponse.json(
            { error: 'Error al eliminar item' },
            { status: 500 }
        );
    }
}
