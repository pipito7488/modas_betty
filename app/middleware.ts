import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const path = req.nextUrl.pathname;

  // Si no está autenticado
  if (!token && path.startsWith("/vendedor")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Si está autenticado pero no es vendedor
  if (token && path.startsWith("/vendedor") && token.role !== "vendedor") {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Si es admin y entra a su panel, todo bien
  return NextResponse.next();
}

// Define qué rutas vigilará el middleware
export const config = {
  matcher: ["/vendedor/:path*", "/admin/:path*"],
};
