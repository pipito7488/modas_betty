// app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function PATCH(
    req: Request,
    { params }: { params: { id: string } }
) {
    try {
        const session = await getServerSession();

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 403 }
            );
        }

        await connectDB();

        const { role } = await req.json();

        // Validate role
        if (!['cliente', 'vendedor', 'admin'].includes(role)) {
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
            { error: 'Error al actualizar el rol' },
            { status: 500 }
        );
    }
}
