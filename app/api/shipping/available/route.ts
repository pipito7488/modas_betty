// app/api/shipping/available/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Cart from '@/models/Cart';
import ShippingZone from '@/models/ShippingZone';

/**
 * GET /api/shipping/available
 * Obtener opciones de envío disponibles para el carrito del usuario
 * Agrupa por vendedor y retorna las zonas de envío habilitadas de cada uno
 */
export async function GET() {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
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

        // Para cada vendedor, obtener sus métodos de envío habilitados
        const shippingOptions: any = {};

        for (const group of groupedByVendor) {
            const vendorId = group.vendor._id || group.vendor;

            // Buscar zonas de envío habilitadas del vendedor
            const zones = await ShippingZone.find({
                vendor: vendorId,
                enabled: true
            }).sort({ cost: 1 }); // Ordenar por costo ascendente

            shippingOptions[vendorId.toString()] = {
                vendor: group.vendor,
                subtotal: group.subtotal,
                zones: zones.map((zone) => ({
                    _id: zone._id,
                    name: zone.name,
                    type: zone.type,
                    commune: zone.commune,
                    region: zone.region,
                    metroLine: zone.metroLine,
                    metroStation: zone.metroStation,
                    customArea: zone.customArea,
                    cost: zone.cost,
                    estimatedDays: zone.estimatedDays,
                    pickupAvailable: zone.pickupAvailable,
                    pickupCost: zone.pickupCost,
                    pickupAddress: zone.pickupAddress
                }))
            };
        }

        return NextResponse.json({ shippingOptions });

    } catch (error) {
        console.error('Error fetching shipping options:', error);
        return NextResponse.json(
            { error: 'Error al obtener opciones de envío' },
            { status: 500 }
        );
    }
}
