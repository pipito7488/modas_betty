// app/api/admin/users/[id]/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import User from '@/models/User';

export async function PATCH(
    req: Request,
    context: { params: Promise<{ id: string }> }
) {
    try {
        // En Next.js 16, params es una Promise
        const params = await context.params;

        console.log('=== UPDATE USER ROLE DEBUG ===');
        console.log('Received user ID:', params.id);
        console.log('ID type:', typeof params.id);
        console.log('ID length:', params.id.length);

        const session = await getServerSession() as any;
        console.log('Session found:', !!session);
        console.log('User role:', session?.user?.role);

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
        console.log('New role requested:', role);

        // Validate role
        if (!['cliente', 'vendedor', 'admin'].includes(role)) {
            console.error('Invalid role:', role);
            return NextResponse.json(
                { error: 'Rol inválido' },
                { status: 400 }
            );
        }

        // Primero buscar el usuario para ver si existe
        const existingUser = await User.findById(params.id);
        console.log('User exists:', !!existingUser);
        if (existingUser) {
            console.log('Current user role:', existingUser.role);
        }

        // Intentar también buscar por email si el ID no funciona
        if (!existingUser) {
            console.log('Trying to find all users...');
            const allUsers = await User.find({});
            console.log('Total users in DB:', allUsers.length);
            console.log('User IDs in DB:', allUsers.map(u => ({ id: u._id.toString(), email: u.email })));
        }

        const user = await User.findByIdAndUpdate(
            params.id,
            { role },
            { new: true }
        ).select('name email role');

        console.log('Update result:', user ? 'Success' : 'Failed - User not found');

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado', receivedId: params.id },
                { status: 404 }
            );
        }

        console.log('=== UPDATE SUCCESSFUL ===');
        return NextResponse.json({ user, message: 'Rol actualizado exitosamente' });
    } catch (error) {
        console.error('Error updating user role:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el rol', details: error instanceof Error ? error.message : 'Unknown error' },
            { status: 500 }
        );
    }
}
