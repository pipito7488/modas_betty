// components/Hero.tsx
import Image from 'next/image';

export default function Hero() {
  return (
    <div className="relative w-full h-[500px]">
      <Image
        src="/assets/hero-banner-modas-betty.webp" // Ruta de la imagen local (en /public) o remota
        alt="Nueva Colección de Modas Betty"
        fill // Ocupa el contenedor div
        priority={true} // Prioriza la carga para mejorar el LCP [9, 8]
        fetchPriority="high" // Indicación directa al navegador 
        className="object-cover"
        sizes="(max-width: 768px) 100vw, 50vw" // Define el tamaño que ocupará en diferentes viewports 
      />
      <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
        <h1 className="text-4xl md:text-6xl text-white font-bold tracking-wider">
          Elegancia sin Esfuerzo
        </h1>
      </div>
    </div>
  );
}
