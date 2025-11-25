import { NextResponse } from "next/server";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
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

export async function PUT(req: Request, { params }: { params: { id: string } }) {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);

        const data = await req.json();
        const product = await Product.findByIdAndUpdate(params.id, data, { new: true });

        if (!product) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json(product);

    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json(
            { error: 'Error al actualizar el producto' },
            { status: 500 }
        );
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);

        const product = await Product.findByIdAndDelete(params.id);

        if (!product) {
            return NextResponse.json(
                { error: 'Producto no encontrado' },
                { status: 404 }
            );
        }

        return NextResponse.json({ message: 'Producto eliminado exitosamente' });

    } catch (error) {
        console.error('Error deleting product:', error);
        return NextResponse.json(
            { error: 'Error al eliminar el producto' },
            { status: 500 }
        );
    }
}
