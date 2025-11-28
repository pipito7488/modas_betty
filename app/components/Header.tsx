return () => window.removeEventListener('scroll', handleScroll);
}, []);

return (
    <>
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
                    <nav className="hidden md:flex items-center gap-10">
                        {[
                            { name: 'Productos', href: '/productos' },
                            { name: 'FAQ', href: '/faq' },
                        ].map((item) => (
                            <Link
                                key={item.name}
                                href={item.href}
                                className="relative text-gray-600 hover:text-amber-700 transition-colors font-medium text-sm uppercase tracking-widest group py-2"
                            >
                                {item.name}
                                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-700 transform scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
                            </Link>
                        ))}
                    </nav>
                    Admin
                </Link>
                                )}
                {session.user.role === 'vendedor' && (
                    <Link href="/vendedor" className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-xs font-bold uppercase tracking-wider hover:bg-gray-200 transition-colors">
                        Vendedor
                    </Link>
                )}
                <Link
                    href="/perfil/configuracion"
                    className="text-gray-600 hover:text-amber-700 transition-transform hover:scale-110 duration-300"
                    title="Mi Perfil"
                >
                    <User className="w-6 h-6" />
                </Link>
                <button
                    onClick={() => signOut()}
                    className="flex items-center gap-2 text-gray-600 hover:text-red-600 transition-colors font-medium text-sm"
                    title="Cerrar Sesión"
                >
                    <LogOut className="w-5 h-5" />
                </button>
            </div>
            ) : (
            <Link
                href="/login"
                className="hidden md:flex items-center gap-2 px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-full hover:bg-amber-700 transition-all duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
                <LogIn className="w-4 h-4" />
                <span>Ingresar</span>
            </Link>
                        )}

            {/* Mobile Menu Button */}
            <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden text-gray-700 hover:text-amber-700 transition-transform active:scale-95"
            >
                {mobileMenuOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
        </div>
    </div >

        {/* Mobile Menu */ }
        < div className = {`md:hidden overflow-hidden transition-all duration-500 ease-in-out ${mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
            <nav className="flex flex-col gap-2 py-4 border-t border-gray-100">
                {[
                    { name: 'Productos', href: '/productos' },
                    { name: 'FAQ', href: '/faq' },
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
                        <Link
                            href="/perfil/configuracion"
                            className="text-gray-600 hover:bg-gray-50 px-4 py-3 rounded-lg transition-colors font-medium flex items-center gap-2"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <User className="w-4 h-4" />
                            Mi Perfil
                        </Link>
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
                </div >
            </div >
        </header >

    {/* Cart Drawer */ }
    < CartDrawer isOpen = { cartOpen } onClose = {() => setCartOpen(false)} />
    </>
);
}
