// app/terms/page.tsx
import { FileText } from 'lucide-react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mb-4">
                        <FileText className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 bg-clip-text text-transparent mb-4">
                        Términos de Servicio
                    </h1>
                    <p className="text-gray-600">
                        Última actualización: {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-amber-100 prose prose-amber max-w-none">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Aceptación de los Términos</h2>
                    <p className="text-gray-600 mb-6">
                        Al acceder y utilizar Betty Modas, usted acepta estar sujeto a estos términos de servicio.
                        Si no está de acuerdo con alguno de estos términos, por favor no utilice nuestra plataforma.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Descripción del Servicio</h2>
                    <p className="text-gray-600 mb-6">
                        Betty Modas es un marketplace que conecta vendedores independientes con compradores.
                        Facilitamos la plataforma tecnológica, pero cada vendedor es responsable de sus propias
                        transacciones, productos, y servicios al cliente.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Registro y Cuentas</h2>
                    <p className="text-gray-600 mb-6">
                        Para realizar compras o vender en nuestra plataforma, debe crear una cuenta proporcionando
                        información precisa y completa. Usted es responsable de mantener la confidencialidad de
                        su cuenta y contraseña.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Compras y Pagos</h2>
                    <p className="text-gray-600 mb-6">
                        Los pagos se realizan directamente a los vendedores mediante transferencia bancaria.
                        Betty Modas no maneja los fondos de las transacciones. Cada vendedor establece sus
                        propios precios, términos de envío, y políticas de devolución.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Responsabilidades del Vendedor</h2>
                    <p className="text-gray-600 mb-6">
                        Los vendedores son responsables de: (a) la exactitud de las descripciones de productos,
                        (b) el cumplimiento de las órdenes, (c) la gestión de envíos, (d) el servicio al cliente,
                        y (e) el cumplimiento de todas las leyes aplicables.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Propiedad Intelectual</h2>
                    <p className="text-gray-600 mb-6">
                        Todo el contenido de la plataforma Betty Modas, incluyendo diseño, código, y marca,
                        es propiedad de Betty Modas o sus licenciantes. Los vendedores retienen los derechos
                        sobre sus propias imágenes y descripciones de productos.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Limitación de Responsabilidad</h2>
                    <p className="text-gray-600 mb-6">
                        Betty Modas actúa únicamente como intermediario. No nos hacemos responsables por la
                        calidad, seguridad, o legalidad de los productos, la exactitud de los anuncios, o la
                        capacidad de los vendedores para completar una venta.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Modificaciones</h2>
                    <p className="text-gray-600 mb-6">
                        Nos reservamos el derecho de modificar estos términos en cualquier momento.
                        Las modificaciones entrarán en vigor inmediatamente después de su publicación en la plataforma.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Contacto</h2>
                    <p className="text-gray-600">
                        Para cualquier pregunta sobre estos términos, contacta directamente a los vendedores
                        o al administrador de la plataforma.
                    </p>
                </div>
            </div>
        </div>
    );
}
