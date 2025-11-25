// app/components/Footer.tsx
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-100 mt-20">
      <div className="container mx-auto max-w-7xl px-4 py-12 md:py-16">

        {/* Grid de Contenido */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5 md:gap-12">

          {/* Columna Principal / Logo */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="text-xl font-bold text-gray-900 tracking-wider mb-3 block font-headline">
              Betty Modas
            </Link>
            <p className="text-sm text-gray-600">
              Elegancia en cada hilo. Descubre la moda que te define.
            </p>
          </div>

          {/* Columna 1: Empresa */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-base">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/about" className="text-gray-600 hover:text-amber-700 transition">Sobre nosotros</Link></li>
              <li><Link href="/blog" className="text-gray-600 hover:text-amber-700 transition">Blog</Link></li>
              <li><Link href="/careers" className="text-gray-600 hover:text-amber-700 transition">Carreras</Link></li>
            </ul>
          </div>

          {/* Columna 2: Ayuda */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-base">Ayuda</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/contact" className="text-gray-600 hover:text-amber-700 transition">Contacto</Link></li>
              <li><Link href="/support" className="text-gray-600 hover:text-amber-700 transition">Soporte</Link></li>
              <li><Link href="/faq" className="text-gray-600 hover:text-amber-700 transition">Preguntas frecuentes</Link></li>
            </ul>
          </div>

          {/* Columna 3: Legal */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-4 text-base">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/terms" className="text-gray-600 hover:text-amber-700 transition">Términos de servicio</Link></li>
              <li><Link href="/privacy" className="text-gray-600 hover:text-amber-700 transition">Política de privacidad</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Betty Modas. Todos los derechos reservados.
          </p>
        </div>

      </div>
    </footer>
  );
}