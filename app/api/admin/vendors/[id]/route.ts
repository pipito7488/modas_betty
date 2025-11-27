// app/api/admin/vendors/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import User from '@/models/User';

/**
 * PATCH /api/admin/vendors/[id]
 * Actualizar comisión de un vendedor
 */
export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        if (session.user.role !== 'admin') {
            return NextResponse.json(
                { error: 'Solo administradores pueden actualizar vendedores' },
                { status: 403 }
            );
        }

        const { id } = await params;
        const { commission } = await req.json();

        if (commission === undefined || commission < 0 || commission > 100) {
            return NextResponse.json(
                { error: 'La comisión debe estar entre 0 y 100%' },
                { status: 400 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const vendor = await User.findById(id);

        if (!vendor || vendor.role !== 'vendedor') {
            return NextResponse.json(
                { error: 'Vendedor no encontrado' },
                { status: 404 }
            );
        }

        vendor.commission = commission;
        await vendor.save();

        return NextResponse.json({
            success: true,
            message: 'Comisión actualizada',
            vendor: {
                _id: vendor._id,
                name: vendor.name,
                commission: vendor.commission
            }
        });

    } catch (error) {
        console.error('Error updating commission:', error);
        return NextResponse.json(
            { error: 'Error al actualizar comisión' },
            { status: 500 }
        );
    }
}
