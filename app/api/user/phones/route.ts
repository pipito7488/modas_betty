// app/api/user/phones/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import User from '@/models/User';

/**
 * GET /api/user/phones
 * Obtener teléfonos del usuario
 */
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
            phones: user.phones || []
        });

    } catch (error) {
        console.error('Error fetching phones:', error);
        return NextResponse.json(
            { error: 'Error al obtener teléfonos' },
            { status: 500 }
        );
    }
}

/**
 * POST /api/user/phones
 * Agregar teléfono
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: 'No autorizado' },
                { status: 401 }
            );
        }

        const { number, label, isDefault } = await req.json();

        if (!number) {
            return NextResponse.json(
                { error: 'El número de teléfono es requerido' },
                { status: 400 }
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

        // Verificar límite de 2 teléfonos
        if (user.phones && user.phones.length >= 2) {
            return NextResponse.json(
                { error: 'Solo puedes tener máximo 2 teléfonos' },
                { status: 400 }
            );
        }

        // Si es default, quitar el default de los demás
        if (isDefault && user.phones) {
            user.phones.forEach((phone: any) => {
                phone.isDefault = false;
            });
        }

        // Si es el primer teléfono, hacerlo default automáticamente
        const shouldBeDefault = !user.phones || user.phones.length === 0 || isDefault;

        // Agregar nuevo teléfono
        user.phones = user.phones || [];
        user.phones.push({
            number,
            label: label || 'Principal',
            isDefault: shouldBeDefault
        });

        await user.save();

        return NextResponse.json({
            message: 'Teléfono agregado exitosamente',
            phone: user.phones[user.phones.length - 1]
        }, { status: 201 });

    } catch (error: any) {
        console.error('Error adding phone:', error);
        return NextResponse.json(
            { error: error.message || 'Error al agregar teléfono' },
            { status: 500 }
        );
    }
}
