import mongoose from "mongoose";

const OrderSchema = new mongoose.Schema({
  buyer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
    },
  ],
  status: {
    type: String,
    enum: ["pendiente de pago", "pendiente de envío", "enviado", "completado"],
    default: "pendiente de pago",
  },
  proofImage: String,
});

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
