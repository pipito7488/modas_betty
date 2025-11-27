// app/api/vendedor/productos/route.js
import { NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth";
import Product from "@/models/Product";
import mongoose from "mongoose";

/**
 * GET /api/vendedor/productos
 * Obtener productos del vendedor autenticado
 */
export async function GET() {
    try {
        const session = await getServerSession();

        // Verificar autenticación
        if (!session || !session.user?.email) {
            return NextResponse.json(
                { error: "No autorizado" },
                { status: 401 }
            );
        }

        // Verificar rol de vendedor
        if (session.user.role !== 'vendedor' && session.user.role !== 'admin') {
            return NextResponse.json(
                { error: "Acceso denegado" },
                { status: 403 }
            );
        }

        await mongoose.connect(process.env.MONGODB_URI);

        // Filtrar productos solo del vendedor autenticado
        // Admin puede ver todos, vendedor solo los suyos
        const query = session.user.role === 'admin'
            ? {}
            : { seller: session.user.id };

        const products = await Product.find(query)
            .populate('seller', 'name email')
            .sort({ createdAt: -1 });

        return NextResponse.json(products);

    } catch (error) {
        console.error("Error fetching vendor products:", error);
        return NextResponse.json(
            { error: "Error al obtener productos" },
            { status: 500 }
        );
    }
}
