import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: String,
  description: String,
  price: Number,
  stock: Number,
  category: String,
  size: [String],
  image: String,
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
});

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
