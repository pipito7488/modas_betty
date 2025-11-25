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
  stock: {
    type: Number,
    required: [true, 'El stock es requerido'],
    min: [0, 'El stock no puede ser negativo'],
    default: 0
  },
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
