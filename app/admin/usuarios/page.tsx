// app/admin/usuarios/page.tsx
'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Shield, Store, User as UserIcon, Sparkles, CheckCircle2 } from 'lucide-react';

interface User {
    _id: string;
    name: string;
    email: string;
    role: 'cliente' | 'vendedor' | 'admin';
    createdAt: string;
}

export default function UsuariosAdminPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'admin') {
            router.push('/');
        } else if (status === 'authenticated') {
            fetchUsers();
        }
    }, [status, session, router]);

    const fetchUsers = async () => {
        try {
            const response = await fetch('/api/admin/users');
            if (!response.ok) throw new Error('Error al cargar usuarios');

            const data = await response.json();
            setUsers(data.users);
        } catch (err) {
            setError('Error al cargar usuarios');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateUserRole = async (userId: string, newRole: string, userName: string) => {
        setUpdating(userId);
        setError(null);
        setSuccessMessage(null);

        try {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ role: newRole }),
            });

            if (!response.ok) throw new Error('Error al actualizar rol');

            setUsers(users.map(user =>
                user._id === userId ? { ...user, role: newRole as any } : user
            ));

            setSuccessMessage(`${userName} ahora es ${newRole}`);
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err) {
            setError('Error al actualizar el rol');
            console.error(err);
        } finally {
            setUpdating(null);
        }
    };

    const getRoleIcon = (role: string) => {
        switch (role) {
            case 'admin': return <Shield className="w-5 h-5 text-amber-600" />;
            case 'vendedor': return <Store className="w-5 h-5 text-blue-600" />;
            default: return <UserIcon className="w-5 h-5 text-gray-600" />;
        }
    };

    const getRoleBadgeClass = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 border-amber-300 shadow-sm';
            case 'vendedor': return 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border-blue-300 shadow-sm';
            default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-300 shadow-sm';
        }
    };

    if (status === 'loading' || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-white to-blue-50">
                <div className="text-center">
                    <div className="animate-spin w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando usuarios...</p>
                </div>
            </div>
        );
    }

    if (session?.user?.role !== 'admin') {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-12">
            <div className="container mx-auto px-4 max-w-7xl">
                {/* Header */}
                <div className="mb-10 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl mb-4 shadow-lg">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="font-headline text-5xl font-bold bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-3">
                        Gestión de Usuarios
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Administra roles y permisos del marketplace
                    </p>
                </div>

                {/* Success Message */}
                {successMessage && (
                    <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-md animate-fade-in flex items-center gap-3">
                        <CheckCircle2 className="w-6 h-6 text-green-600" />
                        <span className="font-medium">{successMessage}</span>
                    </div>
                )}

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-gradient-to-r from-red-50 to-rose-50 border-2 border-red-200 text-red-700 px-6 py-4 rounded-xl shadow-md">
                        {error}
                    </div>
                )}

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 shadow-xl border-2 border-amber-200 rounded-xl group hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
                                <Shield className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-700 mb-1">Administradores</p>
                                <p className="text-4xl font-bold text-amber-900">
                                    {users.filter(u => u.role === 'admin').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-xl border-2 border-blue-200 rounded-xl group hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
                                <Store className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-blue-700 mb-1">Vendedores</p>
                                <p className="text-4xl font-bold text-blue-900">
                                    {users.filter(u => u.role === 'vendedor').length}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-6 shadow-xl border-2 border-gray-200 rounded-xl group hover:scale-105 transition-transform duration-300">
                        <div className="flex items-center gap-4">
                            <div className="p-4 bg-gradient-to-br from-gray-500 to-slate-600 rounded-2xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
                                <UserIcon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-1">Clientes</p>
                                <p className="text-4xl font-bold text-gray-900">
                                    {users.filter(u => u.role === 'cliente').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white shadow-2xl border-2 border-gray-100 overflow-hidden rounded-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-slate-50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Usuario
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Rol Actual
                                    </th>
                                    <th className="px-6 py-5 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                                        Cambiar Rol
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user, index) => (
                                    <tr
                                        key={user._id}
                                        className="hover:bg-gradient-to-r hover:from-amber-50 hover:to-transparent transition-all duration-200 group"
                                    >
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center text-white text-sm font-bold shadow-md">
                                                    {user.name?.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-sm font-semibold text-gray-900 group-hover:text-amber-700 transition-colors">
                                                    {user.name}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="text-sm text-gray-600">{user.email}</div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className={`inline-flex items-center gap-2 px-4 py-2 border-2 text-sm font-bold rounded-full ${getRoleBadgeClass(user.role)}`}>
                                                {getRoleIcon(user.role)}
                                                <span className="capitalize">{user.role}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => updateUserRole(user._id, e.target.value, user.name)}
                                                    disabled={updating === user._id || user.email === session?.user?.email}
                                                    className="text-sm font-medium border-2 border-gray-300 px-4 py-2 rounded-lg bg-white hover:border-amber-500 focus:border-amber-600 focus:ring-2 focus:ring-amber-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                                                >
                                                    <option value="cliente">Cliente</option>
                                                    <option value="vendedor">Vendedor</option>
                                                    <option value="admin">Admin</option>
                                                </select>
                                                {updating === user._id && (
                                                    <div className="flex items-center gap-2 text-amber-600">
                                                        <div className="animate-spin w-4 h-4 border-2 border-amber-200 border-t-amber-600 rounded-full"></div>
                                                        <span className="text-xs font-medium">Actualizando...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-16">
                            <Sparkles className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg">No hay usuarios registrados todavía</p>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="mt-8 bg-gradient-to-r from-blue-600 to-cyan-600 p-8 rounded-2xl shadow-2xl text-white relative overflow-hidden">
                    {/* Decorative elements */}
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full"></div>
                    <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-white opacity-10 rounded-full"></div>

                    <div className="relative">
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles className="w-6 h-6" />
                            <p className="font-bold text-xl">¿Cómo funciona?</p>
                        </div>
                        <ul className="space-y-3 text-blue-50">
                            <li className="flex items-start gap-3">
                                <Sparkles className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>Todos los nuevos usuarios se registran automáticamente como <strong className="text-white">Cliente</strong></span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Store className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>Puedes promover clientes a <strong className="text-white">Vendedor</strong> para que puedan vender productos</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <Shield className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                <span>Los <strong className="text-white">Admins</strong> tienen acceso total al panel de administración</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
