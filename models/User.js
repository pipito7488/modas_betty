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
  // Múltiples direcciones (máximo 3)
  addresses: [{
    label: {
      type: String,
      default: 'Principal'
    },
    street: {
      type: String,
      required: true
    },
    commune: {
      type: String,
      required: true
    },
    region: {
      type: String,
      required: true
    },
    zipCode: String,
    country: {
      type: String,
      default: 'Chile'
    },
    // Coordenadas de geocoding
    lat: Number,
    lng: Number,
    // Tipo y flags
    isDefault: {
      type: Boolean,
      default: false
    },
    isStoreLocation: {
      type: Boolean,
      default: false
    }
  }],
  // Métodos de pago para vendedores (máximo 3)
  paymentMethods: [{
    type: {
      type: String,
      enum: ['bank_transfer'],
      default: 'bank_transfer'
    },
    bankName: {
      type: String,
      required: true
    },
    accountType: {
      type: String,
      enum: ['cuenta_corriente', 'cuenta_vista', 'cuenta_rut'],
      required: true
    },
    accountNumber: {
      type: String,
      required: true
    },
    accountHolder: {
      type: String,
      required: true
    },
    rut: String, // RUT del titular
    email: String, // Email opcional
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
  emailVerified: Date,
}, {
  timestamps: true
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
