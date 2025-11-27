import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'El nombre del producto es requerido'],
    trim: true,
    maxlength: [100, 'El nombre no puede exceder 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'La descripción es requerida'],
    maxlength: [2000, 'La descripción no puede exceder 2000 caracteres']
  },
  price: {
    type: Number,
    required: [true, 'El precio es requerido'],
    min: [0, 'El precio no puede ser negativo']
  },
  // Nuevos campos para sistema de precios CLP
  costPrice: {
    type: Number,
    required: [true, 'El precio de costo es requerido'],
    min: [0, 'El precio de costo no puede ser negativo']
  },
  profitPercentage: {
    type: Number,
    default: 0,
    min: [0, 'El porcentaje de ganancia no puede ser negativo'],
    max: [1000, 'El porcentaje de ganancia no puede exceder 1000%']
  },
  // Campos para ofertas/descuentos
  discountPercentage: {
    type: Number,
    default: 0,
    min: [0, 'El descuento no puede ser negativo'],
    max: [100, 'El descuento no puede exceder 100%']
  },
  discountStartDate: {
    type: Date,
    default: null
  },
  discountEndDate: {
    type: Date,
    default: null
  },
  // Control de visibilidad
  visible: {
    type: Boolean,
    default: true
  },
  // Fecha de lanzamiento para countdown
  launchDate: {
    type: Date,
    default: null
  },
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
  // Inventario por variante (opcional, si se usa anula el stock general)
  variants: [{
    size: {
      type: String,
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL']
    },
    color: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    sku: String // Código único opcional para esta variante
  }],
  category: {
    type: String,
    required: [true, 'La categoría es requerida'],
    enum: ['Vestidos', 'Blusas', 'Pantalones', 'Faldas', 'Accesorios', 'Zapatos']
  },
  sizes: {
    type: [String],
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    default: []
  },
  colors: {
    type: [String],
    enum: [
      'Negro', 'Blanco', 'Gris', 'Beige', 'Marrón',
      'Rojo', 'Rosa', 'Fucsia', 'Morado', 'Lila',
      'Azul', 'Azul Marino', 'Celeste', 'Turquesa',
      'Verde', 'Verde Oliva', 'Menta',
      'Amarillo', 'Naranja', 'Dorado', 'Plateado',
      'Multicolor', 'Estampado'
    ],
    default: []
  },
  images: {
    type: [String],
    required: [true, 'Al menos una imagen es requerida'],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'Debe tener al menos una imagen'
    }
  },
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, 'El vendedor es requerido']
  },
}, {
  timestamps: true, // Agrega createdAt y updatedAt automáticamente
});

// Índices para mejorar búsquedas
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ category: 1, price: 1 });
ProductSchema.index({ active: 1, featured: -1 });

export default mongoose.models.Product || mongoose.model("Product", ProductSchema);
