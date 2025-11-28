import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Product from '@/models/Product';

export async function POST(req: Request) {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        if (session.user.role !== 'vendedor' && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Solo vendedores y admins pueden crear productos' }, { status: 403 });
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const body = await req.json();

        const product = await Product.create({
            ...body,
            seller: session.user.id
        });

        return NextResponse.json({ success: true, product }, { status: 201 });

    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Error al crear producto' },
            { status: 500 }
        );
    }
}
