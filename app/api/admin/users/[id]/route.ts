// app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import User from '@/models/User';

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        console.log('Updating user role for ID:', params.id);

        const session = await getServerSession() as any;
        console.log('Session:', session ? 'Found' : 'Not found', session?.user?.role);

        if (!session || session.user?.role !== 'admin') {
            console.error('Unauthorized access attempt');
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 403 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);
        console.log('MongoDB connected');

        const { role } = await req.json();
        console.log('New role:', role);

        // Validate role
        if (!['cliente', 'vendedor', 'admin'].includes(role)) {
            console.error('Invalid role:', role);
            return NextResponse.json(
                { error: 'Rol inválido' },
                { status: 400 }
            );
        }

        const user = await User.findByIdAndUpdate(
            params.id,
            { role },
            { new: true }
        ).select('name email role');

        console.log('User updated:', user ? 'Success' : 'Not found');

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ user, message: 'Rol actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el rol', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
