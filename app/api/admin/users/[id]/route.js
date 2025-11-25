// app/api/admin/users/[id]/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";

// PATCH - Actualizar rol de usuario
export async function PATCH(request, { params }) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        const { id } = params;
        const { role } = await request.json();

        // Validar rol
        if (!['cliente', 'vendedor', 'admin'].includes(role)) {
            return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
        }

        // Actualizar el rol del usuario
        const updatedUser = await User.findByIdAndUpdate(
            id,
            { role },
            { new: true }
        ).select('name email role');

        if (!updatedUser) {
            return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 });
        }

        return NextResponse.json({
            message: "Rol actualizado correctamente",
            user: updatedUser
        }, { status: 200 });
    } catch (error) {
        console.error("Error al actualizar rol:", error);
        return NextResponse.json({ error: "Error al actualizar rol" }, { status: 500 });
    }
}
