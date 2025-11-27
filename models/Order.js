import mongoose from "mongoose";

const orderSchema = new mongoose.Schema({
  // Número de orden único
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Usuario y vendedor
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "El usuario es requerido"],
    index: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "El vendedor es requerido"],
    index: true
  },

  // Items del pedido
  items: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    name: String,
    price: Number,
    quantity: {
      type: Number,
      required: true,
      min: 1
    },
    size: String,
    color: String,
    image: String
  }],

  // Totales
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  shippingCost: {
    type: Number,
    required: true,
    min: 0
  },
  total: {
    type: Number,
    required: true,
    min: 0
  },

  // Comisiones (calculadas automáticamente)
  vendorCommissionRate: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  commissionAmount: {
    type: Number,
    default: 0
  },
  vendorNetAmount: {
    type: Number,
    default: 0
  },

  // Estado de la orden
  status: {
    type: String,
    enum: ['pending', 'payment_pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'],
    default: 'payment_pending',
    index: true
  },

  // Método de envío
  shippingMethod: {
    type: String,
    enum: ['delivery', 'pickup'],
    required: true
  },

  // Si es delivery
  shippingZone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "ShippingZone"
  },
  shippingAddress: {
    label: String,
    street: String,
    commune: String,
    region: String,
    zipCode: String,
    country: String,
    lat: Number,
    lng: Number
  },

  // Si es pickup
  pickupAddress: {
    label: String,
    street: String,
    commune: String,
    region: String,
    country: String
  },

  // Información de contacto
  customerName: {
    type: String,
    required: true
  },
  customerEmail: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },

  // Información de pago
  paymentMethod: {
    bankName: String,
    accountType: String,
    accountNumber: String,
    accountHolder: String,
    rut: String
  },
  paymentProof: {
    imageUrl: String, // URL de Cloudinary
    uploadedAt: Date
  },
  paymentConfirmed: {
    type: Boolean,
    default: false
  },
  paymentConfirmedAt: Date,
  paymentConfirmedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  // Información de contacto del vendedor
  vendorContactInfo: {
    email: String,
    phones: [String]
  },

  // Tracking
  trackingNumber: String,

  // Notas
  customerNotes: String,
  vendorNotes: String,

  // Fechas estimadas
  estimatedDeliveryDate: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String
}, {
  timestamps: true
});

// Índices
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, status: 1 });
orderSchema.index({ vendor: 1, status: 1 });
orderSchema.index({ createdAt: -1 });

// Generar número de orden único antes de guardar
orderSchema.pre('save', async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');

    // Buscar el último número del día
    const lastOrder = await mongoose.model('Order').findOne({
      orderNumber: new RegExp(`^${year}${month}${day}`)
    }).sort({ orderNumber: -1 });

    let sequence = 1;
    if (lastOrder) {
      const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
      sequence = lastSequence + 1;
    }

    this.orderNumber = `${year}${month}${day}${sequence.toString().padStart(4, '0')}`;
  }
  next();
});

const Order = mongoose.models.Order || mongoose.model("Order", orderSchema);

export default Order;
