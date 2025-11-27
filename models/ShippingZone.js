import mongoose from "mongoose";

const shippingZoneSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "El vendedor es requerido"],
        index: true
    },
    name: {
        type: String,
        required: [true, "El nombre de la zona es requerido"],
        trim: true
    },
    type: {
        type: String,
        enum: ['commune', 'metro', 'custom'],
        required: [true, "El tipo de zona es requerido"]
    },

    // Para type="commune"
    commune: {
        type: String,
        trim: true
    },
    region: {
        type: String,
        trim: true
    },

    // Para type="metro"
    metroLine: {
        type: String
    },
    metroStation: {
        type: String,
        trim: true
    },

    // Para type="custom"
    customArea: {
        type: String,
        trim: true
    },

    // Costo y tiempos de delivery
    cost: {
        type: Number,
        required: [true, "El costo de envío es requerido"],
        min: [0, "El costo no puede ser negativo"]
    },
    estimatedDays: {
        type: Number,
        default: 3,
        min: [0, "Los días estimados no pueden ser negativos"]
    },

    // Estado
    enabled: {
        type: Boolean,
        default: true
    },

    // === OPCIONES DE RETIRO/ENCUENTRO ===

    // 1. Retiro en Tienda (dirección fija del vendedor)
    pickupStoreAvailable: {
        type: Boolean,
        default: false
    },
    pickupStoreCost: {
        type: Number,
        default: 0,
        min: [0, "El costo de retiro no puede ser negativo"]
    },
    pickupStoreAddress: {
        street: String,
        commune: String,
        region: String,
        instructions: String
    },

    // 2. Punto de Encuentro (metro, lugares públicos)
    meetingPointAvailable: {
        type: Boolean,
        default: false
    },
    meetingPointCost: {
        type: Number,
        default: 0,
        min: [0, "El costo de punto de encuentro no puede ser negativo"]
    },
    meetingPointLocation: {
        name: String, // Ej: "Metro Baquedano", "Plaza de Armas"
        description: String,
        commune: String,
        region: String
    },

    // 3. Coordinar con Vendedor (flexible - muestra datos del vendedor)
    coordinateAvailable: {
        type: Boolean,
        default: false
    },
    coordinateCost: {
        type: Number,
        default: 0,
        min: [0, "El costo de coordinación no puede ser negativo"]
    },
    coordinateInstructions: {
        type: String,
        default: "Contacta al vendedor para coordinar lugar y horario de entrega"
    },

    // LEGACY: mantener compatibilidad con código antiguo
    pickupAvailable: {
        type: Boolean,
        default: false
    },
    pickupCost: {
        type: Number,
        default: 0
    },
    pickupAddress: {
        street: String,
        commune: String,
        region: String,
        instructions: String
    }
}, {
    timestamps: true
});

// Índices
shippingZoneSchema.index({ vendor: 1, enabled: 1 });
shippingZoneSchema.index({ commune: 1, region: 1 });
shippingZoneSchema.index({ type: 1 });

const ShippingZone = mongoose.models.ShippingZone || mongoose.model("ShippingZone", shippingZoneSchema);

export default ShippingZone;
