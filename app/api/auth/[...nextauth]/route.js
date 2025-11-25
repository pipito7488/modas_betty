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
        // Se ejecuta al crear o cargar la sesión
        async session({ session }) {
            await mongoose.connect(process.env.MONGODB_URI);
            const user = await User.findOne({ email: session.user.email });
            session.user.role = user?.role || "cliente";
            return session;
        },
    },
});

export { handler as GET, handler as POST };
