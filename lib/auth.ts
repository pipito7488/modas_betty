// lib/auth.ts
import { getServerSession as getNextAuthServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getServerSession() {
    return await getNextAuthServerSession(authOptions);
}
