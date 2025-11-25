// app/types/product.ts
export interface Product {
    id: string;
    name: string;
    slug: string;
    imageUrl: string;
    price: number;
    oldPrice?: number;
    category?: string;
    description?: string;
    inStock?: boolean;
}
