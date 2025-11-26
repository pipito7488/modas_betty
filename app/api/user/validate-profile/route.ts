// app/api/user/validate-profile/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import User from '@/models/User';
import { validateUserProfile } from '@/lib/validators';

/**
 * GET /api/user/validate-profile
 * Verifica si el perfil del usuario está completo
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

        const validation = validateUserProfile(user);

        return NextResponse.json({
            isComplete: validation.isValid,
            missing: validation.missing,
            canBuy: validation.canBuy,
            canSell: validation.canSell,
            user: {
                role: user.role,
                hasAddresses: user.addresses?.length > 0,
                addressCount: user.addresses?.length || 0,
                hasPhones: user.phones?.length > 0,
                phoneCount: user.phones?.length || 0,
                hasPaymentMethods: user.paymentMethods?.length > 0,
                paymentMethodCount: user.paymentMethods?.length || 0
            }
        });

    } catch (error) {
        console.error('Error validating profile:', error);
        return NextResponse.json(
            { error: 'Error al validar perfil' },
            { status: 500 }
        );
    }
}
