// app/privacy/page.tsx
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mb-4">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 bg-clip-text text-transparent mb-4">
                        Política de Privacidad
                    </h1>
                    <p className="text-gray-600">
                        Última actualización: {new Date().toLocaleDateString('es-CL', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-lg p-8 border-2 border-amber-100 prose prose-amber max-w-none">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Información que Recopilamos</h2>
                    <p className="text-gray-600 mb-6">
                        Recopilamos información que usted nos proporciona directamente, incluyendo:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                        <li>Nombre, correo electrónico y contraseña al registrarse</li>
                        <li>Direcciones de envío y números de teléfono</li>
                        <li>Información de productos si es vendedor</li>
                        <li>Datos bancarios si es vendedor (para recibir pagos)</li>
                        <li>Comprobantes de pago subidos por compradores</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Cómo Usamos su Información</h2>
                    <p className="text-gray-600 mb-6">
                        Utilizamos la información recopilada para:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                        <li>Procesar y gestionar sus pedidos</li>
                        <li>Facilitar la comunicación entre compradores y vendedores</li>
                        <li>Mejorar nuestros servicios y la experiencia del usuario</li>
                        <li>Enviar notificaciones sobre el estado de sus pedidos</li>
                        <li>Cumplir con obligaciones legales</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Compartir Información</h2>
                    <p className="text-gray-600 mb-6">
                        Compartimos su información en las siguientes circunstancias:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                        <li>Con vendedores: compartimos su nombre, dirección de envío, y datos de contacto para procesar pedidos</li>
                        <li>Con compradores: si es vendedor, compartimos su información de contacto y datos bancarios</li>
                        <li>Con proveedores de servicios que nos ayudan a operar la plataforma</li>
                        <li>Cuando sea requerido por ley o para proteger nuestros derechos</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Seguridad de Datos</h2>
                    <p className="text-gray-600 mb-6">
                        Implementamos medidas de seguridad razonables para proteger su información personal.
                        Sin embargo, ningún sistema de transmisión por Internet es completamente seguro,
                        y no podemos garantizar la seguridad absoluta de sus datos.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Retención de Datos</h2>
                    <p className="text-gray-600 mb-6">
                        Conservamos su información personal durante el tiempo necesario para cumplir con los
                        propósitos descritos en esta política, a menos que la ley requiera o permita un
                        período de retención más largo.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Sus Derechos</h2>
                    <p className="text-gray-600 mb-6">
                        Usted tiene derecho a:
                    </p>
                    <ul className="list-disc pl-6 text-gray-600 mb-6 space-y-2">
                        <li>Acceder a su información personal</li>
                        <li>Corregir información inexacta</li>
                        <li>Solicitar la eliminación de su información</li>
                        <li>Oponerse al procesamiento de sus datos</li>
                        <li>Solicitar la portabilidad de sus datos</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Cookies</h2>
                    <p className="text-gray-600 mb-6">
                        Utilizamos cookies y tecnologías similares para mejorar la funcionalidad de nuestra
                        plataforma, analizar el uso, y personalizar su experiencia.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cambios a esta Política</h2>
                    <p className="text-gray-600 mb-6">
                        Podemos actualizar esta política de privacidad ocasionalmente. Le notificaremos
                        sobre cambios importantes publicando la nueva política en esta página.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Menores de Edad</h2>
                    <p className="text-gray-600 mb-6">
                        Nuestra plataforma no está dirigida a menores de 18 años. No recopilamos
                        intencionalmente información de menores de edad.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contacto</h2>
                    <p className="text-gray-600">
                        Si tiene preguntas sobre esta política de privacidad, puede contactar al
                        administrador de la plataforma.
                    </p>
                </div>
            </div>
        </div>
    );
}
