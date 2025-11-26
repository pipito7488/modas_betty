import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";
import clientPromise from "@/lib/mongodbClient";
import User from "@/models/User";
import mongoose from "mongoose";

const handler = NextAuth({
    adapter: MongoDBAdapter(clientPromise),
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
    ],
    secret: process.env.NEXTAUTH_SECRET,
    callbacks: {
        // Redirigir según el rol después del login
        async signIn({ user, account, profile }) {
            return true; // Permite el login
        },
        // Se ejecuta al crear o cargar la sesión
        async session({ session }) {
            await mongoose.connect(process.env.MONGODB_URI);
            const user = await User.findOne({ email: session.user.email });
            session.user.role = user?.role || "cliente";
            session.user.id = user?._id.toString();
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    events: {
        async signIn({ user }) {
            // Este evento se ejecuta después de un login exitoso
            // Pero NextAuth no permite redirección directa aquí
            // La redirección se hará desde el cliente
        }
    },
});

export { handler as GET, handler as POST };
