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
  // Teléfonos (obligatorio, máximo 2)
  phones: [{
    number: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (v) {
          return /^[\d\s\+\-\(\)]+$/.test(v);
        },
        message: "Formato de teléfono inválido"
      }
    },
    label: {
      type: String,
      default: 'Principal'
    },
    isDefault: {
      type: Boolean,
      default: false
    }
  }],
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
  // Validación de perfil completo
  profileComplete: {
    type: Boolean,
    default: false
  },
  canSell: {
    type: Boolean,
    default: false
  },
  // Comisión del vendedor (0-100%)
  commission: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Validación: Máximo 3 direcciones
userSchema.pre('save', function (next) {
  if (this.addresses && this.addresses.length > 3) {
    return next(new Error('Solo puedes tener máximo 3 direcciones'));
  }
  next();
});

// Validación: Máximo 2 teléfonos
userSchema.pre('save', function (next) {
  if (this.phones && this.phones.length > 2) {
    return next(new Error('Solo puedes tener máximo 2 teléfonos'));
  }
  next();
});

// Validación: Máximo 3 métodos de pago
userSchema.pre('save', function (next) {
  if (this.paymentMethods && this.paymentMethods.length > 3) {
    return next(new Error('Solo puedes tener máximo 3 métodos de pago'));
  }
  next();
});

// Método virtual: Verificar si el perfil está completo
userSchema.methods.isProfileComplete = function () {
  const hasAddress = this.addresses && this.addresses.length > 0;
  const hasPhone = this.phones && this.phones.length > 0;

  if (this.role === 'vendedor') {
    const hasPaymentMethod = this.paymentMethods && this.paymentMethods.length > 0;
    return hasAddress && hasPhone && hasPaymentMethod;
  }

  return hasAddress && hasPhone;
};

// Método virtual: Actualizar flags de perfil completo
userSchema.pre('save', function (next) {
  this.profileComplete = this.isProfileComplete();
  this.canSell = this.role === 'vendedor' && this.profileComplete;
  next();
});


const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
