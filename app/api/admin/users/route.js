// app/api/admin/users/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import User from "@/models/User";

// GET - Obtener lista de todos los usuarios
export async function GET(request) {
    try {
        await mongoose.connect(process.env.MONGODB_URI);

        // Obtener todos los usuarios
        const users = await User.find({}).select('name email role createdAt').sort({ createdAt: -1 });

        return NextResponse.json({ users }, { status: 200 });
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        return NextResponse.json({ error: "Error al obtener usuarios" }, { status: 500 });
    }
}
