import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET(req) {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    const { searchParams } = new URL(req.url);

    // Construir query de filtros
    const query = { active: true }; // Solo productos activos por defecto

    // Filtro por categoría
    const category = searchParams.get('category');
    if (category) {
      query.category = category;
    }

    // Filtro por rango de precio
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }

    // Filtro por talla
    const size = searchParams.get('size');
    if (size) {
      query.sizes = { $in: [size] };
    }

    // Búsqueda por texto
    const search = searchParams.get('search');
    if (search) {
      query.$text = { $search: search };
    }

    // Opciones de ordenamiento
    let sort = { createdAt: -1 }; // Por defecto: más recientes
    const sortParam = searchParams.get('sort');

    switch (sortParam) {
      case 'price-asc':
        sort = { price: 1 };
        break;
      case 'price-desc':
        sort = { price: -1 };
        break;
      case 'name-asc':
        sort = { name: 1 };
        break;
      case 'featured':
        sort = { featured: -1, createdAt: -1 };
        break;
      default:
        sort = { createdAt: -1 };
    }

    // Paginación
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    // Ejecutar query
    const products = await Product.find(query)
      .populate('seller', 'name email')
      .sort(sort)
      .skip(skip)
      .limit(limit);

    // Contar total para paginación
    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    // Verificar autenticación
    const session = await getServerSession();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'No autenticado' },
        { status: 401 }
      );
    }

    // Verificar rol
    const userRole = session.user.role;
    if (userRole !== 'admin' && userRole !== 'vendedor') {
      return NextResponse.json(
        { error: 'No autorizado. Se requiere rol de admin o vendedor' },
        { status: 403 }
      );
    }

    await mongoose.connect(process.env.MONGODB_URI);
    const data = await req.json();

    // Auto-asignar el seller desde la sesión
    data.seller = session.user.id;

    const newProduct = await Product.create(data);
    return NextResponse.json(newProduct, { status: 201 });

  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error al crear producto', details: error.message },
      { status: 400 }
    );
  }
}
