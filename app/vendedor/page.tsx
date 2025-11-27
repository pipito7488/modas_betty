"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

// 🔹 Definimos el tipo de producto
interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  size: string[];
  image?: string;
  seller?: { name: string };
}

export default function VendedorPanel() {
  // 🔹 Indicamos explícitamente el tipo del estado
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    // Usar endpoint específico de vendedor que filtra por usuario autenticado
    fetch("/api/vendedor/productos")
      .then((res) => res.json())
      .then((data) => {
        // La API puede retornar { products: [...] } o directamente [...]
        const productsArray = Array.isArray(data) ? data : (data.products || []);
        setProducts(productsArray);
      })
      .catch((error) => {
        console.error('Error loading products:', error);
        setProducts([]);
      });
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-4">Panel del Vendedor</h1>

      <Link
        href="/vendedor/productos/nuevo"
        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
      >
        + Agregar nuevo producto
      </Link>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((p) => (
          <div
            key={p._id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <img
              src={p.image || "/placeholder.png"}
              alt={p.name}
              className="w-full h-48 object-cover rounded-md"
            />
            <h2 className="text-xl font-semibold mt-2">{p.name}</h2>
            <p className="text-gray-600">${p.price}</p>
            <p className="text-sm text-gray-500">Stock: {p.stock}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
