import mongoose from "mongoose";

const cartSchema = new mongoose.Schema({
    // Usuario autenticado
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        sparse: true, // Permite nulos para usuarios no autenticados
        index: true
    },

    // ID de sesión para usuarios no autenticados
    sessionId: {
        type: String,
        sparse: true,
        index: true
    },

    // Items del carrito
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            required: true
        },
        vendor: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: [1, "La cantidad mínima es 1"],
            default: 1
        },
        price: {
            type: Number,
            required: true,
            min: [0, "El precio no puede ser negativo"]
        },
        selectedSize: {
            type: String,
            trim: true
        },
        selectedColor: {
            type: String,
            trim: true
        },
        addedAt: {
            type: Date,
            default: Date.now
        }
    }],

    // Fecha de expiración para limpiar carritos abandonados
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        index: true
    }
}, {
    timestamps: true
});

// Índices compuestos para búsquedas eficientes
cartSchema.index({ user: 1, createdAt: -1 });
cartSchema.index({ sessionId: 1, createdAt: -1 });
cartSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL index

// Validación: Al menos uno de user o sessionId debe estar presente
cartSchema.pre('save', function (next) {
    if (!this.user && !this.sessionId) {
        return next(new Error('Debe especificar user o sessionId'));
    }
    next();
});

// Método para agrupar items por vendedor
cartSchema.methods.groupByVendor = function () {
    const grouped = {};

    this.items.forEach(item => {
        const vendorId = item.vendor.toString();
        if (!grouped[vendorId]) {
            grouped[vendorId] = {
                vendor: item.vendor,
                items: [],
                subtotal: 0
            };
        }
        grouped[vendorId].items.push(item);
        grouped[vendorId].subtotal += item.price * item.quantity;
    });

    return Object.values(grouped);
};

const Cart = mongoose.models.Cart || mongoose.model("Cart", cartSchema);

export default Cart;
