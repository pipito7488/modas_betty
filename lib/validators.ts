// lib/validators.ts
// Validadores de perfil de usuario

/**
 * Valida si un vendedor tiene su perfil completo
 */
export function validateVendorProfile(user: any): {
    isValid: boolean;
    missing: string[];
} {
    const missing: string[] = [];

    // Verificar direcciones
    if (!user.addresses || user.addresses.length === 0) {
        missing.push('Al menos 1 dirección');
    }

    // Verificar teléfonos
    if (!user.phones || user.phones.length === 0) {
        missing.push('Al menos 1 teléfono');
    }

    // Verificar métodos de pago (solo para vendedores)
    if (!user.paymentMethods || user.paymentMethods.length === 0) {
        missing.push('Al menos 1 método de pago');
    }

    return {
        isValid: missing.length === 0,
        missing
    };
}

/**
 * Valida si un cliente tiene su perfil completo
 */
export function validateClientProfile(user: any): {
    isValid: boolean;
    missing: string[];
} {
    const missing: string[] = [];

    // Verificar direcciones
    if (!user.addresses || user.addresses.length === 0) {
        missing.push('Al menos 1 dirección');
    }

    // Verificar teléfonos
    if (!user.phones || user.phones.length === 0) {
        missing.push('Al menos 1 teléfono');
    }

    return {
        isValid: missing.length === 0,
        missing
    };
}

/**
 * Valida perfil según el rol del usuario
 */
export function validateUserProfile(user: any): {
    isValid: boolean;
    missing: string[];
    canBuy: boolean;
    canSell: boolean;
} {
    const clientValidation = validateClientProfile(user);
    const vendorValidation = user.role === 'vendedor'
        ? validateVendorProfile(user)
        : { isValid: false, missing: [] };

    return {
        isValid: clientValidation.isValid,
        missing: user.role === 'vendedor' ? vendorValidation.missing : clientValidation.missing,
        canBuy: clientValidation.isValid,
        canSell: user.role === 'vendedor' && vendorValidation.isValid
    };
}
