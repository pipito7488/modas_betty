// app/api/user/addresses/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import User from '@/models/User';

// PUT - Actualizar dirección
export async function PUT(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const addressData = await req.json();
        const addressIndex = user.addresses.findIndex((addr: any) => addr._id.toString() === params.id);

        if (addressIndex === -1) {
            return NextResponse.json(
                { error: 'Dirección no encontrada' },
                { status: 404 }
            );
        }

        // Si se marca como default, quitar default de las demás
        if (addressData.isDefault) {
            user.addresses.forEach((addr: any, idx: number) => {
                if (idx !== addressIndex) {
                    addr.isDefault = false;
                }
            });
        }

        // Actualizar la dirección
        Object.assign(user.addresses[addressIndex], addressData);

        await user.save();

        return NextResponse.json({
            message: 'Dirección actualizada exitosamente',
            address: user.addresses[addressIndex]
        });
    } catch (error) {
        console.error('Error updating address:', error);
        return NextResponse.json(
            { error: 'Error al actualizar dirección' },
            { status: 500 }
        );
    }
}

// DELETE - Eliminar dirección
export async function DELETE(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        const params = await context.params;
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const user = await User.findOne({ email: session.user.email });

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        const addressIndex = user.addresses.findIndex((addr: any) => addr._id.toString() === params.id);

        if (addressIndex === -1) {
            return NextResponse.json(
                { error: 'Dirección no encontrada' },
                { status: 404 }
            );
        }

        const wasDefault = user.addresses[addressIndex].isDefault;

        // Eliminar la dirección
        user.addresses.splice(addressIndex, 1);

        // Si era la default y quedan direcciones, hacer la primera como default
        if (wasDefault && user.addresses.length > 0) {
            user.addresses[0].isDefault = true;
        }

        await user.save();

        return NextResponse.json({
            message: 'Dirección eliminada exitosamente'
        });
    } catch (error) {
        console.error('Error deleting address:', error);
        return NextResponse.json(
            { error: 'Error al eliminar dirección' },
            { status: 500 }
        );
    }
}
