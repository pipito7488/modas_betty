import mongoose from "mongoose";

const shippingZoneSchema = new mongoose.Schema({
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: [true, "El vendedor es requerido"],
        index: true
    },

    // === TIPO DE ZONA ===
    type: {
        type: String,
        enum: ['commune', 'region', 'metro', 'pickup_store'],
        required: [true, "El tipo de zona es requerido"]
    },

    // === DATOS SEGÚN TIPO ===

    // Para type="commune" - Envío a comuna específica
    commune: {
        type: String,
        trim: true
    },
    region: {
        type: String,
        trim: true
    },

    // Para type="metro" - Punto de encuentro en metro
    metroLine: {
        type: String,
        enum: ['L1', 'L2', 'L3', 'L4', 'L4A', 'L5', 'L6', 'L7'],
        trim: true
    },
    metroStation: {
        type: String,
        trim: true
    },

    // Para type="pickup_store" - Retiro en tienda
    storeAddress: {
        street: String,
        commune: String,
        region: String,
        reference: String // Ej: "Entre Av. Providencia y Av. Suecia"
    },

    // === COSTOS Y TIEMPOS ===
    cost: {
        type: Number,
        required: [true, "El costo es requerido"],
        min: [0, "El costo no puede ser negativo"],
        default: 0
    },
    estimatedDays: {
        type: Number,
        default: 2,
        min: [0, "Los días estimados no pueden ser negativos"],
        max: [30, "Máximo 30 días"]
    },

    // === INFORMACIÓN ADICIONAL ===
    name: {
        type: String,
        trim: true
        // Auto-generado si no se provee
    },
    instructions: {
        type: String,
        trim: true
        // Ej: "Salida norte del metro", "Horario: Lun-Vie 10-19hrs"
    },

    // === ESTADO ===
    enabled: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// === ÍNDICES ===
shippingZoneSchema.index({ vendor: 1, enabled: 1 });
shippingZoneSchema.index({ type: 1 });
shippingZoneSchema.index({ commune: 1, region: 1 });
shippingZoneSchema.index({ metroStation: 1 });

// === VALIDACIÓN PRE-GUARDADO ===
shippingZoneSchema.pre('save', function (next) {
    // Validar campos requeridos según tipo
    if (this.type === 'commune') {
        if (!this.commune || !this.region) {
            return next(new Error('Comuna y región son requeridos para tipo "commune"'));
        }
    }

    if (this.type === 'region') {
        if (!this.region) {
            return next(new Error('Región es requerida para tipo "region"'));
        }
    }

    if (this.type === 'metro') {
        if (!this.metroStation || !this.metroLine) {
            return next(new Error('Estación y línea son requeridas para tipo "metro"'));
        }
    }

    if (this.type === 'pickup_store') {
        if (!this.storeAddress || !this.storeAddress.street) {
            return next(new Error('Dirección de tienda es requerida para tipo "pickup_store"'));
        }
    }

    // Auto-generar nombre si no existe
    if (!this.name) {
        if (this.type === 'commune') {
            this.name = `Envío a ${this.commune}`;
        } else if (this.type === 'region') {
            this.name = `Envío a ${this.region}`;
        } else if (this.type === 'metro') {
            this.name = `Metro ${this.metroStation} (${this.metroLine})`;
        } else if (this.type === 'pickup_store') {
            this.name = 'Retiro en Tienda';
        }
    }

    next();
});

// === MÉTODO VIRTUAL: Descripción completa ===
shippingZoneSchema.virtual('displayName').get(function () {
    let display = this.name;

    if (this.cost === 0) {
        display += ' - GRATIS';
    } else {
        display += ` - $${this.cost.toLocaleString('es-CL')}`;
    }

    if (this.type !== 'pickup_store' && this.estimatedDays > 0) {
        display += ` (${this.estimatedDays} ${this.estimatedDays === 1 ? 'día' : 'días'})`;
    }

    return display;
});

// === MÉTODO: Verificar si coincide con dirección del cliente ===
shippingZoneSchema.methods.matchesAddress = function (clientCommune, clientRegion) {
    if (!this.enabled) return false;

    if (this.type === 'commune') {
        return this.commune?.toLowerCase() === clientCommune?.toLowerCase() &&
            this.region?.toLowerCase() === clientRegion?.toLowerCase();
    }

    if (this.type === 'region') {
        return this.region?.toLowerCase() === clientRegion?.toLowerCase();
    }

    // Metro y pickup_store siempre están disponibles (cliente puede ir)
    if (this.type === 'metro' || this.type === 'pickup_store') {
        return true;
    }

    return false;
};

const ShippingZone = mongoose.models.ShippingZone || mongoose.model("ShippingZone", shippingZoneSchema);

export default ShippingZone;
