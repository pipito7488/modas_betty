import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  role: { type: String, enum: ["cliente", "vendedor", "admin"], default: "cliente" },
  address: String,
}, {
  timestamps: true, // Añade createdAt y updatedAt automáticamente
});

export default mongoose.models.User || mongoose.model("User", UserSchema);
