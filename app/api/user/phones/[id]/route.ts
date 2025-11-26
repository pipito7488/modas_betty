// app/api/user/phones/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import User from '@/models/User';

/**
 * PUT /api/user/phones/[id]
 * Actualizar teléfono
 */
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

        const phoneData = await req.json();
        const phoneIndex = user.phones.findIndex((phone: any) => phone._id.toString() === params.id);

        if (phoneIndex === -1) {
            return NextResponse.json(
                { error: 'Teléfono no encontrado' },
                { status: 404 }
            );
        }

        // Si se marca como default, quitar default de los demás
        if (phoneData.isDefault) {
            user.phones.forEach((phone: any, idx: number) => {
                if (idx !== phoneIndex) {
                    phone.isDefault = false;
                }
            });
        }

        // Actualizar el teléfono
        Object.assign(user.phones[phoneIndex], phoneData);

        await user.save();

        return NextResponse.json({
            message: 'Teléfono actualizado exitosamente',
            phone: user.phones[phoneIndex]
        });

    } catch (error: any) {
        console.error('Error updating phone:', error);
        return NextResponse.json(
            { error: error.message || 'Error al actualizar teléfono' },
            { status: 500 }
        );
    }
}

/**
 * DELETE /api/user/phones/[id]
 * Eliminar teléfono
 */
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

        const phoneIndex = user.phones.findIndex((phone: any) => phone._id.toString() === params.id);

        if (phoneIndex === -1) {
            return NextResponse.json(
                { error: 'Teléfono no encontrado' },
                { status: 404 }
            );
        }

        const wasDefault = user.phones[phoneIndex].isDefault;

        // Eliminar el teléfono
        user.phones.splice(phoneIndex, 1);

        // Si era el default y quedan teléfonos, hacer el primero como default
        if (wasDefault && user.phones.length > 0) {
            user.phones[0].isDefault = true;
        }

        await user.save();

        return NextResponse.json({
            message: 'Teléfono eliminado exitosamente'
        });

    } catch (error: any) {
        console.error('Error deleting phone:', error);
        return NextResponse.json(
            { error: error.message || 'Error al eliminar teléfono' },
            { status: 500 }
        );
    }
}
