// app/login/page.jsx (o .js)

"use client";
import { signIn } from "next-auth/react";
import Link from 'next/link';

// Simulación del código de la página de login con el diseño mejorado.
export default function LoginPage() {
  
  // Función para iniciar sesión con Google (usa la función real de NextAuth)
  const handleGoogleSignIn = () => {
      signIn("google");
  };

  return (
    // Contenedor principal para centrar el formulario en la página (usando min-h-[80vh] para que no ocupe toda la pantalla)
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 p-4">
      
      {/* Tarjeta de Formulario de Login - Limpia y Elegante */}
      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-2xl border border-gray-100">
        
        {/* Encabezado */}
        <div>
          <h2 className="text-center font-headline text-3xl font-bold text-app-foreground">
            Bienvenido a BettyModas
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa para acceder a tu panel de vendedor o administrador.
          </p>
        </div>
        
        {/* 1. Botón de Autenticación de Google (Acento visual principal) */}
        <button
          onClick={handleGoogleSignIn} // Llama a la función de NextAuth real
          className="group flex w-full items-center justify-center space-x-3 rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-semibold text-gray-700 shadow-md transition-all duration-200 hover:bg-gray-50 hover:border-accent"
        >
          {/* Icono de Google (SVG elegante) */}
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.61 20.48H24v7.02h11.83c-.5 2.58-2.02 4.7-4.48 6.13l5.7 4.41c3.34-3.13 5.34-7.77 5.34-13.56 0-1.84-.16-3.61-.47-5.32z"/>
            <path fill="#FF3D00" d="M24 8c-4.42 0-8 1.63-10.98 4.43l-5.7 4.41c-2.3-2.19-3.66-5.18-3.66-8.52 0-3.35 1.36-6.34 3.66-8.53L7.3 1.25C10.28-1.55 15-3.08 24-3.08c7.47 0 13.9 2.5 18.57 7.02l-5.7 4.41C34.78 10.42 29.8 8 24 8z"/>
            <path fill="#4CAF50" d="M24 40c4.92 0 9.27-1.63 12.36-4.44l-5.7-4.41c-2.55 1.78-5.83 2.85-8.66 2.85-4.42 0-8.1-1.92-10.77-5.02L7.3 35.84C10.37 38.65 14.64 40 24 40z"/>
            <path fill="#1976D2" d="M38.1 20.48H24v7.02h11.83c-.5 2.58-2.02 4.7-4.48 6.13l5.7 4.41c3.34-3.13 5.34-7.77 5.34-13.56 0-1.84-.16-3.61-.47-5.32z" transform="matrix(-1 0 0 1 48 0)"/>
          </svg>
          <span>Iniciar Sesión con Google</span>
        </button>
        
        {/* 2. Separador Elegante */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">
              O con tus credenciales
            </span>
          </div>
        </div>
        
        {/* 3. Formulario de Login Estándar */}
        {/* Nota: En una aplicación Next.js real, este formulario enviaría una solicitud POST a una API de credenciales */}
        <form className="space-y-4">
          
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="mt-1 block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 placeholder-gray-400 shadow-sm focus:border-accent focus:ring-accent sm:text-sm"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-accent focus:ring-accent"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Recuérdame
              </label>
            </div>

            <div className="text-sm">
              <Link href="#" className="font-medium text-accent hover:text-accent-light">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>
          
          {/* Botón de Submit - Acento Elegante (Marrón Tostado) */}
          <button
            type="submit"
            className="flex w-full justify-center rounded-md border border-transparent bg-accent py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-accent-light focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
          >
            Iniciar Sesión
          </button>
        </form>

      </div>
    </div>
  );
}