// app/faq/page.tsx
'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FAQItem {
    question: string;
    answer: string;
}

const faqs: FAQItem[] = [
    {
        question: '¿Cómo puedo realizar una compra?',
        answer: 'Para realizar una compra, navega por nuestro catálogo de productos, agrega los artículos que desees al carrito, y procede al checkout. Deberás tener tu perfil completo (dirección y teléfono) para poder comprar. Una vez confirmado tu pedido, recibirás los datos bancarios del vendedor para realizar la transferencia.'
    },
    {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Actualmente aceptamos transferencias bancarias. Cada vendedor tiene sus propias cuentas bancarias configuradas. Después de realizar tu pedido, recibirás los datos de la cuenta del vendedor para realizar la transferencia.'
    },
    {
        question: '¿Cómo confirmo mi pago?',
        answer: 'Una vez realizada la transferencia bancaria, debes subir el comprobante de pago desde la sección "Mis Órdenes". El vendedor verificará tu comprobante y confirmará el pago manualmente. Recibirás una notificación cuando tu pago sea confirmado.'
    },
    {
        question: '¿Cuánto tiempo tarda en confirmarse mi pago?',
        answer: 'El tiempo de confirmación depende de cada vendedor, pero generalmente se confirma en 24-48 horas hábiles después de que subas el comprobante de pago.'
    },
    {
        question: '¿Puedo vender en Betty Modas?',
        answer: 'Sí, puedes registrarte como vendedor. Primero regístrate como usuario normal, luego completa tu perfil con dirección, teléfono y métodos de pago. Contacta al administrador para que active tu rol de vendedor. Una vez activo, podrás crear productos y gestionar tus ventas.'
    },
    {
        question: '¿Qué necesito para completar mi perfil?',
        answer: 'Para clientes: necesitas al menos una dirección de envío y un teléfono. Para vendedores: además de dirección y teléfono, necesitas configurar al menos un método de pago (cuenta bancaria) y las zonas de envío que ofreces.'
    },
    {
        question: '¿Cómo funcionan los envíos?',
        answer: 'Cada vendedor configura sus propias zonas de envío con tarifas específicas por comuna o región. También pueden ofrecer retiro en tienda. Al momento de checkout, seleccionas el método de envío que prefieras de las opciones que ofrece cada vendedor.'
    },
    {
        question: '¿Puedo comprar productos de diferentes vendedores?',
        answer: 'Sí, puedes agregar productos de múltiples vendedores a tu carrito. El sistema creará una orden separada para cada vendedor, y deberás realizar transferencias independientes a cada uno.'
    },
    {
        question: '¿Cómo hago seguimiento de mi pedido?',
        answer: 'Puedes ver el estado de todos tus pedidos en la sección "Mis Órdenes". Los estados incluyen: Pendiente de Pago, Comprobante Enviado, Pago Confirmado, En Preparación, Enviado, y Entregado.'
    },
    {
        question: '¿Qué hago si hay un problema con mi pedido?',
        answer: 'Si tienes algún problema con tu pedido, contacta directamente al vendedor usando los datos de contacto que aparecen en tu orden. Cada vendedor es responsable de la gestión de sus propias ventas.'
    },
    {
        question: '¿Puedo cancelar mi orden?',
        answer: 'Una vez realizada la orden, debes contactar directamente al vendedor para solicitar la cancelación. Si aún no has realizado el pago, simplemente no transfieras el dinero. Si ya pagaste, el vendedor decidirá sobre la devolución.'
    },
    {
        question: '¿Cómo configuro mis zonas de envío como vendedor?',
        answer: 'Como vendedor, debes acceder al panel de configuración y crear tus zonas de envío especificando las comunas o regiones que cubres, el costo de envío para cada zona, y si ofreces retiro en tienda. Esto permite que los clientes vean las opciones de envío al comprar tus productos.'
    }
];

export default function FAQPage() {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 py-12">
            <div className="container mx-auto px-4 max-w-4xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full mb-4">
                        <HelpCircle className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="font-headline text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-700 via-amber-600 to-amber-700 bg-clip-text text-transparent mb-4">
                        Preguntas Frecuentes
                    </h1>
                    <p className="text-gray-600 text-lg">
                        Encuentra respuestas a las preguntas más comunes sobre Betty Modas
                    </p>
                </div>

                {/* FAQs */}
                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className="bg-white rounded-lg shadow-md border-2 border-amber-100 overflow-hidden transition-all hover:border-amber-200"
                        >
                            <button
                                onClick={() => toggleFAQ(index)}
                                className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-amber-50 transition-colors"
                            >
                                <span className="font-semibold text-gray-900 pr-8">
                                    {faq.question}
                                </span>
                                <ChevronDown
                                    className={`w-5 h-5 text-amber-700 flex-shrink-0 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''
                                        }`}
                                />
                            </button>
                            <div
                                className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96' : 'max-h-0'
                                    }`}
                            >
                                <div className="px-6 py-4 bg-gray-50 border-t border-amber-100">
                                    <p className="text-gray-600 leading-relaxed">
                                        {faq.answer}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Contact Info */}
                <div className="mt-12 text-center p-6 bg-white rounded-lg shadow-md border-2 border-amber-100">
                    <h3 className="font-semibold text-gray-900 mb-2">
                        ¿No encontraste lo que buscabas?
                    </h3>
                    <p className="text-gray-600">
                        Para consultas específicas, contacta directamente al vendedor del producto que te interesa.
                    </p>
                </div>
            </div>
        </div>
    );
}
