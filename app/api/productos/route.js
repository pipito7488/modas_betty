import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodbClient";
import Product from "@/models/Product";
import mongoose from "mongoose";

export async function GET() {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find().populate("seller");
  return NextResponse.json(products);
}

export async function POST(req) {
  await mongoose.connect(process.env.MONGODB_URI);
  const data = await req.json();
  const newProduct = await Product.create(data);
  return NextResponse.json(newProduct);
}
