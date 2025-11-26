// app/api/user/profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import User from '@/models/User';

export async function GET() {
    try {
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

        return NextResponse.json({
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone || '',
                address: user.address || {
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    country: 'Argentina',
                },
                image: user.image,
                role: user.role,
            }
        });

    } catch (error) {
        console.error('Error fetching profile:', error);
        return NextResponse.json(
            { error: 'Error al cargar perfil' },
            { status: 500 }
        );
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { name, phone, address } = await req.json();

        await mongoose.connect(process.env.MONGODB_URI!);

        const updateData: any = {};
        if (name) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        if (address) updateData.address = address;

        const user = await User.findOneAndUpdate(
            { email: session.user.email },
            updateData,
            { new: true }
        );

        if (!user) {
            return NextResponse.json(
                { error: 'Usuario no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            message: 'Perfil actualizado exitosamente',
            user: {
                name: user.name,
                email: user.email,
                phone: user.phone,
                address: user.address,
            }
        });

    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json(
            { error: 'Error al actualizar perfil' },
            { status: 500 }
        );
    }
}
