// app/api/checkout/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Cart from '@/models/Cart';
import Order from '@/models/Order';
import Product from '@/models/Product';
import User from '@/models/User';

/**
 * POST /api/checkout
 * Crear órdenes separadas por vendedor desde el carrito
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

        const { shippingData, customerAddress, customerPhone } = await req.json();

        if (!shippingData || !customerAddress || !customerPhone) {
            return NextResponse.json(
                { error: 'Faltan datos requeridos' },
                { status: 400 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        // Obtener carrito del usuario
        const cart = await Cart.findOne({ user: session.user.id })
            .populate('items.product')
            .populate('items.vendor');

        if (!cart || cart.items.length === 0) {
            return NextResponse.json(
                { error: 'Carrito vacío' },
                { status: 400 }
            );
        }

        // Agrupar items por vendedor
        const groupedByVendor = cart.groupByVendor();

        const createdOrders = [];

        // Crear una orden por cada vendedor
        for (const group of groupedByVendor) {
            const vendorId = group.vendor._id;
            const shipping = shippingData[vendorId];

            if (!shipping || !shipping.selected) {
                return NextResponse.json(
                    { error: `Falta método de envío para vendedor ${group.vendor.name}` },
                    { status: 400 }
                );
            }

            // Obtener información del vendedor con métodos de pago
            const vendor = await User.findById(vendorId);
            if (!vendor) {
                return NextResponse.json(
                    { error: 'Vendedor no encontrado' },
                    { status: 404 }
                );
            }

            // Preparar items de la orden
            const orderItems = group.items.map((item: any) => ({
                product: item.product._id,
                name: item.product.name,
                price: item.price,
                quantity: item.quantity,
                size: item.selectedSize,
                color: item.selectedColor,
                image: item.product.images?.[0] || null
            }));

            // Calcular totales
            const subtotal = group.subtotal;
            const shippingCost = shipping.selected.cost || 0;
            const total = subtotal + shippingCost;

            // Determinar método y dirección de envío
            let shippingMethod = 'delivery';
            let shippingAddress = null;
            let pickupAddress = null;

            if (shipping.selected.type === 'pickup') {
                shippingMethod = 'pickup';
                pickupAddress = shipping.selected.address;
            } else {
                shippingAddress = {
                    street: customerAddress.street,
                    commune: customerAddress.commune,
                    region: customerAddress.region,
                    zipCode: customerAddress.zipCode || '',
                    country: customerAddress.country || 'Chile'
                };
            }

            // Información de contacto del vendedor
            const vendorContactInfo = {
                email: vendor.email,
                phones: vendor.phones?.map((p: any) => p.number) || []
            };

            // Crear orden
            const order = await Order.create({
                user: session.user.id,
                vendor: vendorId,
                items: orderItems,
                subtotal,
                shippingCost,
                total,
                status: 'pending_payment',
                shippingMethod,
                shippingAddress,
                pickupAddress,
                customerContact: {
                    phone: customerPhone,
                    email: session.user.email
                },
                vendorContactInfo,
                paymentMethod: 'bank_transfer',
                createdAt: new Date()
            });

            createdOrders.push({
                orderId: order._id,
                orderNumber: order.orderNumber,
                vendor: {
                    id: vendor._id,
                    name: vendor.name,
                    email: vendor.email,
                    paymentMethods: vendor.paymentMethods
                },
                total: order.total,
                items: order.items
            });
        }

        // Vaciar carrito después de crear las órdenes
        cart.items = [];
        await cart.save();

        return NextResponse.json({
            success: true,
            orders: createdOrders,
            message: 'Órdenes creadas exitosamente'
        }, { status: 201 });

    } catch (error) {
        console.error('Error creating orders:', error);
        return NextResponse.json(
            { error: 'Error al procesar checkout' },
            { status: 500 }
        );
    }
}
