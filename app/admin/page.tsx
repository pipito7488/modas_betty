// app/admin/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { Users, Store, Package, Settings, TrendingUp, BarChart3, Crown } from 'lucide-react';

export default function AdminDashboard() {
    const { data: session, status } = useSession();
    const router = useRouter();

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-blue-50">
                <div className="animate-pulse text-gray-600">Cargando...</div>
            </div>
        );
    }

    if (session?.user?.role !== 'admin') {
        return null;
    }

    const adminSections = [
        {
            title: 'Gestión de Usuarios',
            description: 'Administra roles: cliente, vendedor, admin',
            icon: Users,
            href: '/admin/usuarios',
            gradient: 'from-amber-400 to-orange-500',
            bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50',
            iconBg: 'bg-gradient-to-br from-amber-500 to-orange-600',
        },
        {
            title: 'Productos',
            description: 'Administra el catálogo de productos',
            icon: Package,
            href: '/admin/productos',
            gradient: 'from-blue-400 to-cyan-500',
            bgColor: 'bg-gradient-to-br from-blue-50 to-cyan-50',
            iconBg: 'bg-gradient-to-br from-blue-500 to-cyan-600',
        },
        {
            title: 'Vendedores',
            description: 'Gestiona vendedores y comisiones',
            icon: Store,
            href: '/admin/vendedores',
            gradient: 'from-green-400 to-emerald-500',
            bgColor: 'bg-gradient-to-br from-green-50 to-emerald-50',
            iconBg: 'bg-gradient-to-br from-green-500 to-emerald-600',
        },
        {
            title: 'Estadísticas',
            description: 'Métricas y análisis del marketplace',
            icon: TrendingUp,
            href: '/admin/estadisticas',
            gradient: 'from-purple-400 to-pink-500',
            bgColor: 'bg-gradient-to-br from-purple-50 to-pink-50',
            iconBg: 'bg-gradient-to-br from-purple-500 to-pink-600',
        },
        {
            title: 'Reportes',
            description: 'Genera reportes de ventas',
            icon: BarChart3,
            href: '/admin/reportes',
            gradient: 'from-rose-400 to-red-500',
            bgColor: 'bg-gradient-to-br from-rose-50 to-red-50',
            iconBg: 'bg-gradient-to-br from-rose-500 to-red-600',
        },
        {
            title: 'Configuración',
            description: 'Ajustes generales del sistema',
            icon: Settings,
            href: '/admin/configuracion',
            gradient: 'from-gray-400 to-slate-500',
            bgColor: 'bg-gradient-to-br from-gray-50 to-slate-50',
            iconBg: 'bg-gradient-to-br from-gray-500 to-slate-600',
        },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header with crown icon */}
                <div className="mb-12 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mb-4 shadow-lg">
                        <Crown className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="font-headline text-5xl md:text-6xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 bg-clip-text text-transparent mb-3">
                        Panel de Administración
                    </h1>
                    <p className="text-lg text-gray-600">
                        Bienvenido, <span className="font-semibold text-amber-700">{session.user.name}</span>
                    </p>
                    <div className="mt-2 inline-flex items-center gap-2 px-4 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full border border-amber-300">
                        <Crown className="w-4 h-4" />
                        <span>Administrador</span>
                    </div>
                </div>

                {/* Admin Sections Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {adminSections.map((section) => {
                        const Icon = section.icon;

                        return (
                            <Link
                                key={section.href}
                                href={section.href}
                                className={`group relative ${section.bgColor} p-8 shadow-lg border-2 border-white backdrop-blur-sm transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:border-amber-200 overflow-hidden`}
                            >
                                {/* Decorative gradient overlay on hover */}
                                <div className={`absolute inset-0 bg-gradient-to-br ${section.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                                <div className="relative">
                                    <div className={`inline-flex items-center justify-center w-16 h-16 ${section.iconBg} rounded-2xl mb-4 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>

                                    <h3 className="font-headline text-2xl font-bold text-gray-900 mb-2 group-hover:text-amber-700 transition-colors">
                                        {section.title}
                                    </h3>
                                    <p className="text-gray-600 leading-relaxed">
                                        {section.description}
                                    </p>

                                    {/* Arrow indicator */}
                                    <div className="mt-4 flex items-center text-amber-700 font-medium text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                                        <span>Acceder</span>
                                        <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Quick Stats Banner */}
                <div className="mt-12 bg-gradient-to-r from-amber-600 to-orange-600 p-8 shadow-xl border border-amber-300 overflow-hidden relative">
                    {/* Decorative circles */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>

                    <div className="relative">
                        <h2 className="font-headline text-2xl font-semibold text-white mb-4 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6" />
                            Accesos Rápidos
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Link
                                href="/admin/usuarios"
                                className="flex items-center gap-3 p-4 bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all border border-white border-opacity-30 group"
                            >
                                <Users className="w-6 h-6 text-white" />
                                <span className="text-white font-medium group-hover:translate-x-1 transition-transform">Gestionar Usuarios</span>
                            </Link>
                            <Link
                                href="/admin/productos"
                                className="flex items-center gap-3 p-4 bg-white bg-opacity-20 backdrop-blur-sm hover:bg-opacity-30 transition-all border border-white border-opacity-30 group"
                            >
                                <Package className="w-6 h-6 text-white" />
                                <span className="text-white font-medium group-hover:translate-x-1 transition-transform">Ver Productos</span>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
