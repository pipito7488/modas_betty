import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        await mongoose.connect(process.env.MONGODB_URI!);

        const product = await Product.findById(params.id).populate('seller', 'name email');

        if (!product) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);

    } catch (error) {
        console.error('Error fetching product:', error);
        return NextResponse.json(
            { error: 'Error al obtener el producto' },
            { status: 500 }
        );
    }
}

export async function PUT(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        // Verificar autenticación
        const session = await getServerSession() as any;

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        // Obtener el producto para verificar ownership
        const existingProduct = await Product.findById(params.id);

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        // Verificar permisos
        const userRole = (session.user as any).role;
        const userId = (session.user as any).id;

        // Admin puede editar cualquier producto
        // Vendedor solo puede editar sus propios productos
        if (userRole !== 'admin' && existingProduct.seller.toString() !== userId) {
            return NextResponse.json(
                { error: 'No autorizado para editar este producto' },
                { status: 403 }
            );
        }

        const data = await req.json();

        // Prevenir que vendedores cambien el seller
        if (userRole !== 'admin') {
            delete data.seller;
        }

        const product = await Product.findByIdAndUpdate(params.id, data, {
            new: true,
            runValidators: true
        });

        return NextResponse.json(product);

    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el producto' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, context: { params: Promise<{ id: string }> }) {
    try {
        const params = await context.params;
        // Verificar autenticación
        const session = await getServerSession() as any;

        if (!session || !session.user) {
            return NextResponse.json(
                { error: 'No autenticado' },
                { status: 401 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        // Obtener el producto para verificar ownership
        const existingProduct = await Product.findById(params.id);

        if (!existingProduct) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        // Verificar permisos
        const userRole = (session.user as any).role;
        const userId = (session.user as any).id;

        // Admin puede eliminar cualquier producto
        // Vendedor solo puede eliminar sus propios productos
        if (userRole !== 'admin' && existingProduct.seller.toString() !== userId) {
            return NextResponse.json(
                { error: 'No autorizado para eliminar este producto' },
                { status: 403 }
            );
        }

        await Product.findByIdAndDelete(params.id);

        return NextResponse.json({ message: 'Producto eliminado exitosamente' });

    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Error al eliminar el producto' },
            { status: 500 }
        );
    }
}
