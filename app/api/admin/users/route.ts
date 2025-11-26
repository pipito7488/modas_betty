// app/api/admin/users/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import User from '@/models/User';

export async function GET() {
    try {
        const session = await getServerSession() as any;

        if (!session || session.user?.role !== 'admin') {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 403 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        // Obtener todos los usuarios y mostrar datos de debug
        const users = await User.find({}).select('name email role createdAt').sort({ createdAt: -1 });

        console.log('Total users found:', users.length);
        if (users.length > 0) {
            console.log('Sample user ID:', users[0]._id, 'Type:', typeof users[0]._id);
        }

        return NextResponse.json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json(
            { error: 'Error al obtener usuarios' },
            { status: 500 }
        );
    }
}
