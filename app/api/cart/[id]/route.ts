// app/api/cart/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

/**
 * PUT /api/cart/[id]
 * Actualizar cantidad de un item en el carrito
 */
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;
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
            return NextResponse.json({ error: 'Carrito no encontrado' }, { status: 404 });
        }

        const itemIndex = cart.items.findIndex((item: any) => item._id.toString() === id);
        if (itemIndex === -1) {
            return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
        }

        const item = cart.items[itemIndex];

        // Verificar stock antes de actualizar
        const product = await Product.findById(item.product);
        if (!product) {
            return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
        }

        // Validar stock por variante específica
        if (product.variants && product.variants.length > 0) {
            const variant = product.variants.find((v: any) =>
                v.size === item.selectedSize && v.color === item.selectedColor
            );

            if (!variant) {
                return NextResponse.json(
                    { error: 'Variante no encontrada' },
                    { status: 400 }
                );
            }

            if (variant.stock < quantity) {
                return NextResponse.json(
                    { error: `Stock insuficiente. Disponible: ${variant.stock}` },
                    { status: 400 }
                );
            }
        } else {
            // Producto sin variantes
            if (product.stock < quantity) {
                return NextResponse.json(
                    { error: `Stock insuficiente. Disponible: ${product.stock}` },
                    { status: 400 }
                );
            }
        }

        // Actualizar cantidad
        cart.items[itemIndex].quantity = quantity;
        await cart.save();

        return NextResponse.json({ message: 'Cantidad actualizada' });

    } catch (error) {
        console.error('Error updating cart item:', error);
        return NextResponse.json(
            { error: 'Error al actualizar item' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/cart/[id]
 * Eliminar un item del carrito
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const { id } = await params;

        await mongoose.connect(process.env.MONGODB_URI!);

        const cart = await Cart.findOne({ user: session.user.id });
        if (!cart) {
            return NextResponse.json({ error: 'Carrito no encontrado' }, { status: 404 });
        }

        const initialLength = cart.items.length;
        cart.items = cart.items.filter((item: any) => item._id.toString() !== id);

        if (cart.items.length === initialLength) {
            return NextResponse.json({ error: 'Item no encontrado' }, { status: 404 });
        }

        await cart.save();

        return NextResponse.json({ message: 'Item eliminado del carrito' });

    } catch (error) {
        console.error('Error deleting cart item:', error);
        return NextResponse.json(
            { error: 'Error al eliminar item' },
            { status: 500 }
        );
    }
}
