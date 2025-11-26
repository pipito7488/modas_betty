// app/components/Header.tsx
'use client';

import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import { ShoppingCart, User, LogIn, LogOut, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';

export default function Header() {
    const { data: session } = useSession();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    // Detectar scroll para efecto glassmorphism
    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 20);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <header
            className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
                ? 'bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm'
                : 'bg-white border-b border-transparent'
                }`}
        >
            <div className="container mx-auto max-w-7xl px-4">
                <div className="flex items-center justify-between h-20 transition-all duration-300">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-2">
                        <span className="text-3xl font-bold text-gray-900 tracking-wider font-headline group-hover:text-amber-700 transition-colors duration-300">
                            Betty Modas
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                </button>
            </div>
        </div>

                {/* Mobile Menu */ }
    <div className={`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <nav className="flex flex-col gap-2 py-4 border-t border-gray-100">
            {[
                { name: 'Productos', href: '/productos' },
                { name: 'Nosotros', href: '/about' },
                { name: 'Contacto', href: '/contact' },
            ].map((item) => (
                <Link
                    key={item.name}
                    href={item.href}
                    className="text-gray-600 hover:text-amber-700 hover:bg-gray-50 px-4 py-3 rounded-lg transition-colors font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    {item.name}
                </Link>
            ))}

            <div className="h-px bg-gray-100 my-2"></div>

            {session ? (
                <>
                    {session.user.role === 'admin' && (
                        <Link
                            href="/admin"
                            className="text-amber-700 hover:bg-amber-50 px-4 py-3 rounded-lg transition-colors font-medium"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Panel Admin
                        </Link>
                    )}
                    {session.user.role === 'vendedor' && (
                        <Link
                            href="/vendedor"
                            className="text-amber-700 hover:bg-amber-50 px-4 py-3 rounded-lg transition-colors font-medium"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            Panel Vendedor
                        </Link>
                    )}
                    <button
                        onClick={() => {
                            signOut();
                            setMobileMenuOpen(false);
                        }}
                        className="text-left text-red-600 hover:bg-red-50 px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2"
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar Sesión
                    </button>
                </>
            ) : (
                <Link
                    href="/login"
                    className="text-gray-900 hover:bg-gray-100 px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                >
                    <LogIn className="w-4 h-4" />
                    Ingresar
                </Link>
            )}
        </nav>
    </div>
            </div >
        </header >
    );
}
