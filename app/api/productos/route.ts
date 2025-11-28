// app/api/productos/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from '@/lib/auth';
import mongoose from 'mongoose';
import Product from '@/models/Product';

/**
 * GET /api/productos
 * List products with filtering
 * Query params:
 * - seller: filter by seller ID
 * - category: filter by category
 * - featured: filter featured products
 * - active: filter active/inactive
 * - limit: limit results (default 50)
 */
export async function GET(req: Request) {
    try {
        await mongoose.connect(process.env.MONGODB_URI!);

        const { searchParams } = new URL(req.url);
        const seller = searchParams.get('seller');
        const category = searchParams.get('category');
        const featured = searchParams.get('featured');
        const active = searchParams.get('active');
        const limit = parseInt(searchParams.get('limit') || '50');

        // Build query filters
        const filters: any = {};

        // CRITICAL: Filter by seller if provided
        if (seller) {
            filters.seller = seller;
        }

        if (category) {
            filters.category = category;
        }

        if (featured === 'true') {
            filters.featured = true;
        }

        if (active !== null && active !== '') {
            filters.active = active === 'true';
        }

        // Execute query
        const products = await Product.find(filters)
            .populate('seller', 'name email')
            .limit(limit)
            .sort({ createdAt: -1 });

        // Get total count for pagination
        const total = await Product.countDocuments(filters);
        const pages = Math.ceil(total / limit);

        return NextResponse.json({
            products,
            count: products.length,
            pagination: {
                page: 1, // Default page since we're not implementing paging yet
                limit,
                total,
                pages
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

/**
 * POST /api/productos
 * Create a new product
 */
export async function POST(req: Request) {
    try {
        const session = await getServerSession() as any;

        if (!session || !session.user?.email) {
            return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
        }

        if (session.user.role !== 'vendedor' && session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Solo vendedores y admins pueden crear productos' }, { status: 403 });
        }

        await mongoose.connect(process.env.MONGODB_URI!);

        const body = await req.json();

        const product = await Product.create({
            ...body,
            seller: session.user.id
        });

        return NextResponse.json({ success: true, product }, { status: 201 });

    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json(
            { error: 'Error al crear producto' },
            { status: 500 }
        );
    }
}
