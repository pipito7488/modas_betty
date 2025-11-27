// app/api/shipping/calculate/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import ShippingZone from '@/models/ShippingZone';

/**
 * POST /api/shipping/calculate
 * Calcular opciones de envío disponibles para un cliente
 * 
 * Body: {
 *   vendorId: string,
 *   clientAddress: {
 *     commune: string,
 *     region: string
 *   }
 * }
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

        const { vendorId, clientAddress } = await req.json();

        if (!vendorId) {
            return NextResponse.json(
                { error: 'Vendor ID es requerido' },
                { status: 400 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        // Buscar TODAS las zonas habilitadas del vendedor
        const shippingZones = await ShippingZone.find({
            vendor: vendorId,
            enabled: true
        }).sort({ cost: 1 }); // Ordenar por costo (más barato primero)

        if (shippingZones.length === 0) {
            return NextResponse.json({
                available: false,
                message: 'Este vendedor no tiene métodos de envío configurados',
                options: []
            });
        }

        const clientCommune = clientAddress?.commune;
        const clientRegion = clientAddress?.region;

        // Filtrar zonas que coinciden con la dirección del cliente
        const matchingZones = shippingZones.filter(zone =>
            zone.matchesAddress(clientCommune, clientRegion)
        );

        if (matchingZones.length === 0) {
            return NextResponse.json({
                available: false,
                message: 'Este vendedor no hace envíos a tu zona. Puedes intentar cambiar tu dirección o contactar directamente.',
                options: []
            });
        }

        // Formatear opciones para el cliente
        const options = matchingZones.map(zone => {
            const option: any = {
                id: zone._id.toString(),
                type: zone.type,
                name: zone.name,
                cost: zone.cost,
                estimatedDays: zone.estimatedDays,
                instructions: zone.instructions || ''
            };

            // Agregar detalles específicos según tipo
            if (zone.type === 'commune') {
                option.deliveryTo = `${zone.commune}, ${zone.region}`;
            } else if (zone.type === 'region') {
                option.deliveryTo = zone.region;
            } else if (zone.type === 'metro') {
                option.metroInfo = {
                    line: zone.metroLine,
                    station: zone.metroStation
                };
            } else if (zone.type === 'pickup_store') {
                option.storeInfo = {
                    address: zone.storeAddress?.street,
                    commune: zone.storeAddress?.commune,
                    reference: zone.storeAddress?.reference
                };
            }

            return option;
        });

        return NextResponse.json({
            available: true,
            vendorId,
            options
        });

    } catch (error) {
        console.error('Error calculating shipping:', error);
        return NextResponse.json(
            { error: 'Error al calcular envío' },
            { status: 500 }
        );
    }
}
