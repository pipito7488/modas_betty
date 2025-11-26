// app/api/user/addresses/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import User from '@/models/User';

// GET - Listar direcciones del usuario
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

        return NextResponse.json({ addresses: user.addresses || [] });
    } catch (error) {
        console.error('Error fetching addresses:', error);
        return NextResponse.json(
            { error: 'Error al obtener direcciones' },
            { status: 500 }
        );
    }
}

// POST - Agregar nueva dirección
export async function POST(req: Request) {
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

        // Validar máximo 3 direcciones
        if (user.addresses && user.addresses.length >= 3) {
            return NextResponse.json(
                { error: 'Máximo 3 direcciones permitidas' },
                { status: 400 }
            );
        }

        const addressData = await req.json();

        // Validar campos requeridos
        if (!addressData.street || !addressData.commune || !addressData.region) {
            return NextResponse.json(
                { error: 'Calle, comuna y región son requeridos' },
                { status: 400 }
            );
        }

        // Si es la primera dirección o se marca como default, hacer default
        const isDefault = user.addresses.length === 0 || addressData.isDefault;

        // Si se marca como default, quitar default de las demás
        if (isDefault && user.addresses.length > 0) {
            user.addresses.forEach((addr: any) => addr.isDefault = false);
        }

        const newAddress = {
            ...addressData,
            isDefault,
            country: addressData.country || 'Chile'
        };

        user.addresses.push(newAddress);
        await user.save();

        // Obtener el ID de la dirección recién creada
        const addedAddress = user.addresses[user.addresses.length - 1];

        return NextResponse.json({
            message: 'Dirección agregada exitosamente',
            address: addedAddress
        });
    } catch (error) {
        console.error('Error adding address:', error);
        return NextResponse.json(
            { error: 'Error al agregar dirección' },
            { status: 500 }
        );
    }
}
