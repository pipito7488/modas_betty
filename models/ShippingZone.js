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
        enum: ['commune', 'metro_station', 'custom_area'],
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

    // Para type="metro_station"
    metroLine: {
        type: String,
        enum: ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7']
    },
    metroStation: {
        type: String,
        trim: true
    },

    // Para type="custom_area"
    customArea: {
        type: String,
        trim: true
    },

    // Costo y tiempos
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
    }
}, {
    timestamps: true
});

// Índices para búsquedas eficientes
shippingZoneSchema.index({ vendor: 1, enabled: 1 });
shippingZoneSchema.index({ commune: 1, region: 1 });
shippingZoneSchema.index({ type: 1 });

// Validación personalizada
shippingZoneSchema.pre('save', function (next) {
    // Validar que los campos requeridos según el tipo estén presentes
    if (this.type === 'commune' && (!this.commune || !this.region)) {
        next(new Error('Comuna y región son requeridos para zonas tipo "commune"'));
    } else if (this.type === 'metro_station' && (!this.metroLine || !this.metroStation)) {
        next(new Error('Línea y estación de metro son requeridos para zonas tipo "metro_station"'));
    } else if (this.type === 'custom_area' && !this.customArea) {
        next(new Error('Descripción de área es requerida para zonas tipo "custom_area"'));
    } else {
        next();
    }
});

const ShippingZone = mongoose.models.ShippingZone || mongoose.model("ShippingZone", shippingZoneSchema);

export default ShippingZone;
