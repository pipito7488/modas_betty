// app/api/shipping/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import ShippingZone from '@/models/ShippingZone';

/**
 * GET /api/shipping
 * Obtener zonas de envío del vendedor autenticado
 */
export async function GET() {
    try {
        const session = await getServerSession() as any;

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'vendedor') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const zones = await ShippingZone.find({ vendor: session.user.id })
            .sort({ createdAt: -1 });

        return NextResponse.json({ zones });

    } catch (error) {
        console.error('Error fetching shipping zones:', error);
        return NextResponse.json(
            { error: 'Error al obtener zonas de envío' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/shipping
 * Crear nueva zona de envío
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession() as any;

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'vendedor') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        const data = await req.json();

        await mongoose.connect(process.env.MONGODB_URI!);

        const zone = await ShippingZone.create({
            ...data,
            vendor: session.user.id
        });

        return NextResponse.json({ zone }, { status: 201 });

    } catch (error: any) {
        console.error('Error creating shipping zone:', error);
        return NextResponse.json(
            { error: error.message || 'Error al crear zona de envío' },
            { status: 500 }
        );
    }
}
