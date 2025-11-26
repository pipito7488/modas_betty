"use client";
import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/productos")
      .then((res) => res.json())
      .then((data) => setProducts(data));
  }, []);

  return (
    <section id="catalogo" className="py-16 bg-gray-50">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10 text-gray-900">
          Últimos productos
        </h2>

        {products.length === 0 ? (
          <p className="text-center text-gray-500">
            No hay productos disponibles todavía 😔
          </p>
        ) : (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map((p) => (
              <ProductCard key={p._id} product={p as any} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
