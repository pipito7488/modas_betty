// app/registro/page.tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, UserPlus, Check, X } from 'lucide-react';

export default function RegistroPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
    });

    const [passwordStrength, setPasswordStrength] = useState({
        length: false,
        number: false,
        special: false,
    });

    const handlePasswordChange = (password: string) => {
        setFormData({ ...formData, password });
        setPasswordStrength({
            length: password.length >= 8,
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validaciones
        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden');
            setLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            setError('La contraseña debe tener al menos 8 caracteres');
            setLoading(false);
            return;
        }

        try {
            // Llamar API de registro
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Error al registrar usuario');
            }

            // Auto-login después del registro
            const result = await signIn('credentials', {
                email: formData.email,
                password: formData.password,
                redirect: false,
            });

            if (result?.error) {
                throw new Error('Error al iniciar sesión');
            }

            // Redirigir a home
            router.push('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Error desconocido');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-[80vh] items-center justify-center bg-gray-50 p-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-10 shadow-2xl border border-gray-100">

                {/* Header */}
                <div>
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-amber-100 rounded-full">
                            <UserPlus className="w-8 h-8 text-amber-700" />
                        </div>
                    </div>
                    <h2 className="text-center font-headline text-3xl font-bold text-gray-900">
                        Crear Cuenta
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        Regístrate para empezar a comprar en BettyModas
                    </p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">

                    {/* Nombre */}
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre Completo *
                        </label>
                        <input
                            id="name"
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                            placeholder="Juan Pérez"
                        />
                    </div>

                    {/* Email */}
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Correo Electrónico *
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                            placeholder="tu@email.com"
                        />
                    </div>

                    {/* Password */}
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Contraseña *
                        </label>
                        <input
                            id="password"
                            type="password"
                            required
                            value={formData.password}
                            onChange={(e) => handlePasswordChange(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                            placeholder="Mínimo 8 caracteres"
                        />

                        {/* Password Strength Indicators */}
                        {formData.password && (
                            <div className="mt-2 space-y-1">
                                <div className={`flex items-center gap-2 text-xs ${passwordStrength.length ? 'text-green-600' : 'text-gray-400'}`}>
                                    {passwordStrength.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    <span>Al menos 8 caracteres</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs ${passwordStrength.number ? 'text-green-600' : 'text-gray-400'}`}>
                                    {passwordStrength.number ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    <span>Incluye un número</span>
                                </div>
                                <div className={`flex items-center gap-2 text-xs ${passwordStrength.special ? 'text-green-600' : 'text-gray-400'}`}>
                                    {passwordStrength.special ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                                    <span>Incluye un carácter especial</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirmar Contraseña *
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            required
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600"
                            placeholder="Repite tu contraseña"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition-colors font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Registrando...
                            </>
                        ) : (
                            <>
                                <UserPlus className="w-5 h-5" />
                                Crear Cuenta
                            </>
                        )}
                    </button>
                </form>

                {/* Separador */}
                <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-gray-200"></span>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-white px-2 text-gray-500">O regístrate con</span>
                    </div>
                </div>

                {/* Google Button */}
                <button
                    onClick={() => signIn('google')}
                    className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                    <svg className="h-5 w-5" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.61 20.48H24v7.02h11.83c-.5 2.58-2.02 4.7-4.48 6.13l5.7 4.41c3.34-3.13 5.34-7.77 5.34-13.56 0-1.84-.16-3.61-.47-5.32z" />
                        <path fill="#FF3D00" d="M24 8c-4.42 0-8 1.63-10.98 4.43l-5.7 4.41c-2.3-2.19-3.66-5.18-3.66-8.52 0-3.35 1.36-6.34 3.66-8.53L7.3 1.25C10.28-1.55 15-3.08 24-3.08c7.47 0 13.9 2.5 18.57 7.02l-5.7 4.41C34.78 10.42 29.8 8 24 8z" />
                        <path fill="#4CAF50" d="M24 40c4.92 0 9.27-1.63 12.36-4.44l-5.7-4.41c-2.55 1.78-5.83 2.85-8.66 2.85-4.42 0-8.1-1.92-10.77-5.02L7.3 35.84C10.37 38.65 14.64 40 24 40z" />
                        <path fill="#1976D2" d="M38.1 20.48H24v7.02h11.83c-.5 2.58-2.02 4.7-4.48 6.13l5.7 4.41c3.34-3.13 5.34-7.77 5.34-13.56 0-1.84-.16-3.61-.47-5.32z" transform="matrix(-1 0 0 1 48 0)" />
                    </svg>
                    <span className="text-sm font-medium text-gray-700">Continuar con Google</span>
                </button>

                {/* Link to Login */}
                <p className="text-center text-sm text-gray-600">
                    ¿Ya tienes cuenta?{' '}
                    <Link href="/login" className="font-medium text-amber-700 hover:text-amber-800">
                        Inicia sesión aquí
                    </Link>
                </p>
            </div>
        </div>
    );
}
