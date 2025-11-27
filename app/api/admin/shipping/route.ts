// app/api/admin/shipping/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import ShippingZone from '@/models/ShippingZone';

/**
 * GET /api/admin/shipping
 * Obtener todas las zonas de envío (solo admin)
 */
export async function GET(req: Request) {
    try {
        const session = await getServerSession() as any;

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const { searchParams } = new URL(req.url);
        const vendorId = searchParams.get('vendor');
        const type = searchParams.get('type');
        const enabled = searchParams.get('enabled');

        // Construir filtros
        const filters: any = {};
        if (vendorId) filters.vendor = vendorId;
        if (type) filters.type = type;
        if (enabled !== null && enabled !== '') {
            filters.enabled = enabled === 'true';
        }

        // Obtener zonas con populate del vendedor
        const zones = await ShippingZone.find(filters)
            .populate('vendor', 'name email')
            .sort({ createdAt: -1 });

        // Calcular estadísticas
        const stats = {
            total: zones.length,
            active: zones.filter(z => z.enabled).length,
            inactive: zones.filter(z => !z.enabled).length,
            byType: {
                commune: zones.filter(z => z.type === 'commune').length,
                metro_station: zones.filter(z => z.type === 'metro_station').length,
                custom_area: zones.filter(z => z.type === 'custom_area').length
            },
            withPickup: zones.filter(z => z.pickupAvailable).length
        };

        return NextResponse.json({ zones, stats });

    } catch (error) {
        console.error('Error fetching shipping zones:', error);
        return NextResponse.json(
            { error: 'Error al obtener zonas de envío' },
            { status: 500 }
        );
    }
}

/**
 * PATCH /api/admin/shipping
 * Actualizar múltiples zonas (habilitar/deshabilitar en bulk)
 */
export async function PATCH(req: Request) {
    try {
        const session = await getServerSession() as any;

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        if (session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        const { zoneIds, enabled } = await req.json();

        if (!Array.isArray(zoneIds) || typeof enabled !== 'boolean') {
            return NextResponse.json(
                { error: 'Datos inválidos' },
                { status: 400 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const result = await ShippingZone.updateMany(
            { _id: { $in: zoneIds } },
            { $set: { enabled } }
        );

        return NextResponse.json({
            message: `${result.modifiedCount} zonas actualizadas`,
            modified: result.modifiedCount
        });

    } catch (error) {
        console.error('Error updating shipping zones:', error);
        return NextResponse.json(
            { error: 'Error al actualizar zonas' },
            { status: 500 }
        );
    }
}
