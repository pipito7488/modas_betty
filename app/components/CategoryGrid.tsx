import Link from "next/link";

const categories = [
  { name: "Vestidos", image: "/categories/vestidos.jpg" },
  { name: "Poleras", image: "/categories/poleras.jpg" },
  { name: "Jeans", image: "/categories/jeans.jpg" },
  { name: "Chaquetas", image: "/categories/chaquetas.jpg" },
  { name: "Zapatos", image: "/categories/zapatos.jpg" },
  { name: "Accesorios", image: "/categories/accesorios.jpg" },
];

export default function CategoryGrid() {
  return (
    <section className="py-16 bg-white" id="categorias">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
          Categorías populares
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((cat) => (
            <Link
              href={`/categoria/${cat.name.toLowerCase()}`}
              key={cat.name}
              className="group relative overflow-hidden rounded-xl shadow hover:shadow-lg transition"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-full h-48 object-cover transform group-hover:scale-105 transition"
              />
              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                <p className="text-white font-semibold text-lg">{cat.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
