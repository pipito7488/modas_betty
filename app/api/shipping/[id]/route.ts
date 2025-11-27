// app/api/shipping/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import ShippingZone from '@/models/ShippingZone';

/**
 * PUT /api/shipping/[id]
 * Actualizar zona de envío
 */
export async function PUT(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession() as any;

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'vendedor') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        const { id } = await params;
        const data = await req.json();

        await mongoose.connect(process.env.MONGODB_URI!);

        const zone = await ShippingZone.findOne({
            _id: id,
            vendor: session.user.id
        });

        if (!zone) {
            return NextResponse.json(
                { error: 'Zona de envío no encontrada' },
                { status: 404 }
            );
        }

        Object.assign(zone, data);
        await zone.save();

        return NextResponse.json({ zone });

    } catch (error: any) {
        console.error('Error updating shipping zone:', error);
        return NextResponse.json(
            { error: error.message || 'Error al actualizar zona de envío' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/shipping/[id]
 * Eliminar zona de envío
 */
export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession() as any;

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        const userRole = session.user.role;
        if (userRole !== 'admin' && userRole !== 'vendedor') {
            return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 });
        }

        const { id } = await params;

        await mongoose.connect(process.env.MONGODB_URI!);

        const zone = await ShippingZone.findOneAndDelete({
            _id: id,
            vendor: session.user.id
        });

        if (!zone) {
            return NextResponse.json(
                { error: 'Zona de envío no encontrada' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Zona eliminada exitosamente' });

    } catch (error) {
        console.error('Error deleting shipping zone:', error);
        return NextResponse.json(
            { error: 'Error al eliminar zona de envío' },
            { status: 500 }
        );
    }
}
