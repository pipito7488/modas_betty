"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { useRouter } from "next/navigation";

// 🔹 Definimos los campos del formulario
interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  category: string;
  size: string;
  image: string;
}

export default function NewProduct() {
  const router = useRouter();
  const [form, setForm] = useState<ProductForm>({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    size: "",
    image: "",
  });

  // 🔹 Tipamos correctamente el evento del input
  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Tipamos el evento de submit
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await fetch("/api/productos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: Number(form.price),
        stock: Number(form.stock),
        size: form.size.split(",").map((s) => s.trim()),
      }),
    });
    router.push("/vendedor");
  };

  return (
    <div className="p-6 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Nuevo Producto</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        {(
          Object.keys(form) as (keyof ProductForm)[] // ✅ Esto soluciona TS7053
        ).map((key) => (
          <input
            key={key}
            name={key}
            type="text"
            placeholder={key.charAt(0).toUpperCase() + key.slice(1)}
            value={form[key]}
            onChange={handleChange}
            className="border rounded-md p-2"
            required={["name", "price", "stock"].includes(key)}
          />
        ))}

        <button
          type="submit"
          className="bg-green-600 text-white py-2 rounded-md hover:bg-green-700"
        >
          Guardar producto
        </button>
      </form>
    </div>
  );
}
