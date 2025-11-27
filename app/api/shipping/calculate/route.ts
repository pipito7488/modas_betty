// app/api/shipping/calculate/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import ShippingZone from '@/models/ShippingZone';

/**
 * POST /api/shipping/calculate
 * Calcular costo de envío para un vendedor según la dirección del cliente
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

        const { vendorId, commune, region } = await req.json();

        if (!vendorId) {
            return NextResponse.json(
                { error: 'Vendor ID es requerido' },
                { status: 400 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        // Buscar zonas de envío del vendedor
        const shippingZones = await ShippingZone.find({
            vendor: vendorId,
            enabled: true
        });

        if (shippingZones.length === 0) {
            return NextResponse.json({
                available: false,
                message: 'Este vendedor no tiene zonas de envío configuradas',
                pickupAvailable: false
            });
        }

        // Buscar zona que coincida con la dirección del cliente
        let matchingZone = null;

        if (commune && region) {
            matchingZone = shippingZones.find(zone => {
                if (zone.type === 'commune') {
                    return zone.commune?.toLowerCase() === commune.toLowerCase() &&
                        zone.region?.toLowerCase() === region.toLowerCase();
                }
                return false;
            });
        }

        // Verificar si hay pickup disponible
        const pickupZone = shippingZones.find(zone => zone.pickupAvailable === true);

        const response: any = {
            available: !!matchingZone,
            zones: []
        };

        // Agregar opción de delivery si hay zona coincidente
        if (matchingZone) {
            response.zones.push({
                type: 'delivery',
                name: `Envío a ${matchingZone.commune}, ${matchingZone.region}`,
                cost: matchingZone.cost || 0,
                estimatedDays: matchingZone.estimatedDays || 3,
                zoneId: matchingZone._id
            });
        }

        // Agregar opción de pickup si está disponible
        if (pickupZone) {
            response.zones.push({
                type: 'pickup',
                name: 'Retiro en tienda',
                cost: pickupZone.pickupCost || 0,
                estimatedDays: 0,
                address: pickupZone.pickupAddress,
                zoneId: pickupZone._id
            });
        }

        // Si no hay opciones disponibles
        if (response.zones.length === 0) {
            response.message = 'Este vendedor no hace envíos a tu zona. Contacta directamente al vendedor.';
        }

        return NextResponse.json(response);

    } catch (error) {
        console.error('Error calculating shipping:', error);
        return NextResponse.json(
            { error: 'Error al calcular envío' },
            { status: 500 }
        );
    }
}
