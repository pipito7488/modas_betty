import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "El nombre es requerido"],
  },
  email: {
    type: String,
    required: [true, "El email es requerido"],
    unique: true,
    lowercase: true,
    trim: true,
  },
  password: {
    type: String,
    // Password es opcional porque algunos usuarios usarán OAuth
    required: false,
    select: false, // No incluir password en queries por defecto
  },
  image: String,
  role: {
    type: String,
    enum: ["cliente", "vendedor", "admin"],
    default: "cliente",
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function (v) {
        // Validar formato de teléfono (opcional)
        if (!v) return true; // Opcional
        return /^[\d\s\+\-\(\)]+$/.test(v);
      },
      message: "Formato de teléfono inválido"
    }
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: {
      type: String,
      default: "Argentina"
    }
  },
  emailVerified: Date,
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
