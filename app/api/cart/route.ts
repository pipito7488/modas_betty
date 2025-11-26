// app/api/cart/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Cart from '@/models/Cart';
import Product from '@/models/Product';

/**
 * GET /api/cart
 * Obtener carrito del usuario agrupado por vendedor
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

        await mongoose.connect(process.env.MONGODB_URI!);

        // Buscar carrito del usuario
        let cart = await Cart.findOne({ user: session.user.id })
            .populate('items.product')
            .populate('items.vendor', 'name email');

        if (!cart) {
            // Crear carrito vacío si no existe
            cart = await Cart.create({
                user: session.user.id,
                items: []
            });
        }

        // Agrupar por vendedor
        const groupedByVendor = cart.groupByVendor();

        return NextResponse.json({
            cart,
            groupedByVendor
        });

    } catch (error) {
        console.error('Error fetching cart:', error);
        return NextResponse.json(
            { error: 'Error al obtener carrito' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/cart
 * Agregar producto al carrito
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { productId, quantity, size, color } = await req.json();

        if (!productId || !quantity) {
            return NextResponse.json(
                { error: 'Product ID y cantidad son requeridos' },
                { status: 400 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        // Verificar que el producto existe y está activo
        const product = await Product.findById(productId);
        if (!product || !product.active) {
            return NextResponse.json(
                { error: 'Producto no encontrado o no disponible' },
                { status: 404 }
            );
        }

        // Verificar stock
        if (product.stock < quantity) {
            return NextResponse.json(
                { error: `Stock insuficiente. Disponible: ${product.stock}` },
                { status: 400 }
            );
        }

        // Buscar o crear carrito
        let cart = await Cart.findOne({ user: session.user.id });

        if (!cart) {
            cart = new Cart({
                user: session.user.id,
                items: []
            });
        }

        // Verificar si el producto ya está en el carrito
        const existingItemIndex = cart.items.findIndex((item: any) =>
            item.product.toString() === productId &&
            item.selectedSize === size &&
            item.selectedColor === color
        );

        if (existingItemIndex > -1) {
            // Actualizar cantidad
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;

            if (newQuantity > product.stock) {
                return NextResponse.json(
                    { error: `Stock insuficiente. Disponible: ${product.stock}` },
                    { status: 400 }
                );
            }

            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Agregar nuevo item
            cart.items.push({
                product: productId,
                vendor: product.seller,
                quantity,
                price: product.price,
                selectedSize: size,
                selectedColor: color,
                addedAt: new Date()
            });
        }

        await cart.save();

        // Repoblar para devolver datos completos
        await cart.populate('items.product');
        await cart.populate('items.vendor', 'name email');

        return NextResponse.json({
            message: 'Producto agregado al carrito',
            cart
        }, { status: 201 });

    } catch (error) {
        console.error('Error adding to cart:', error);
        return NextResponse.json(
            { error: 'Error al agregar al carrito' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/cart/clear
 * Vaciar carrito completo
 */
export async function DELETE() {
    try {
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

        cart.items = [];
        await cart.save();

        return NextResponse.json({
            message: 'Carrito vaciado exitosamente'
        });

    } catch (error) {
        console.error('Error clearing cart:', error);
        return NextResponse.json(
            { error: 'Error al vaciar carrito' },
            { status: 500 }
        );
    }
}
