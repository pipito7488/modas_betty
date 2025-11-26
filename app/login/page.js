// app/login/page.jsx
"use client";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from 'next/link';
import { Loader2, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  // Redirigir automáticamente si el usuario ya está autenticado
  useEffect(() => {
    if (status === 'authenticated' && session?.user) {
      const role = session.user.role;

      if (role === 'admin') {
        router.push('/admin');
      } else if (role === 'vendedor') {
        router.push('/vendedor/productos');
      } else {
        router.push('/');
      }
    }
  }, [status, session, router]);

  const handleCredentialsLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        setError('Email o contraseña incorrectos');
      } else {
        // La redirección se manejará en el useEffect
      }
    } catch (err) {
      setError('Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: window.location.origin + '/login' });
  };

  // Si está cargando o ya autenticado, mostrar loader
  if (status === 'loading' || status === 'authenticated') {
    return (
      <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 p-4">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-gray-200 border-t-amber-600 rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">
            {status === 'loading' ? 'Cargando...' : 'Redirigiendo...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 p-4">

      <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-2xl border border-gray-100">

        {/* Encabezado */}
        <div>
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-amber-100 rounded-full">
              <LogIn className="w-8 h-8 text-amber-700" />
            </div>
          </div>
          <h2 className="text-center font-headline text-3xl font-bold text-gray-900">
            Bienvenido a BettyModas
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa para acceder a tu cuenta
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        {/* Botón de Autenticación de Google */}
        <button
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-amber-600 transition-colors"
        >
          <svg className="h-5 w-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.61 20.48H24v7.02h11.83c-.5 2.58-2.02 4.7-4.48 6.13l5.7 4.41c3.34-3.13 5.34-7.77 5.34-13.56 0-1.84-.16-3.61-.47-5.32z" />
            <path fill="#FF3D00" d="M24 8c-4.42 0-8 1.63-10.98 4.43l-5.7 4.41c-2.3-2.19-3.66-5.18-3.66-8.52 0-3.35 1.36-6.34 3.66-8.53L7.3 1.25C10.28-1.55 15-3.08 24-3.08c7.47 0 13.9 2.5 18.57 7.02l-5.7 4.41C34.78 10.42 29.8 8 24 8z" />
            <path fill="#4CAF50" d="M24 40c4.92 0 9.27-1.63 12.36-4.44l-5.7-4.41c-2.55 1.78-5.83 2.85-8.66 2.85-4.42 0-8.1-1.92-10.77-5.02L7.3 35.84C10.37 38.65 14.64 40 24 40z" />
            <path fill="#1976D2" d="M38.1 20.48H24v7.02h11.83c-.5 2.58-2.02 4.7-4.48 6.13l5.7 4.41c3.34-3.13 5.34-7.77 5.34-13.56 0-1.84-.16-3.61-.47-5.32z" transform="matrix(-1 0 0 1 48 0)" />
          </svg>
          <span className="text-sm font-medium text-gray-700">Continuar con Google</span>
        </button>

        {/* Separador */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-gray-200"></span>
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-2 text-gray-500">O con tus credenciales</span>
          </div>
        </div>

        {/* Formulario de Login */}
        <form onSubmit={handleCredentialsLogin} className="space-y-4">

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              placeholder="tu@email.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
              placeholder="Tu contraseña"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-600"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Recuérdame
              </label>
            </div>

            <div className="text-sm">
              <Link href="#" className="font-medium text-amber-700 hover:text-amber-800">
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          {/* Botón de Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Link to Register */}
        <p className="text-center text-sm text-gray-600">
          ¿No tienes cuenta?{' '}
          <Link href="/registro" className="font-medium text-amber-700 hover:text-amber-800">
            Regístrate aquí
          </Link>
        </p>

      </div>
    </div>
  );
}