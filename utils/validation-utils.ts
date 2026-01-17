/**
 * Utilidades para validación de formularios
 * Reduce código duplicado en validaciones
 */

export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Validador de email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validador de contraseña (mínimo 6 caracteres)
 */
export function isValidPassword(password: string): boolean {
  return password.length >= 6;
}

/**
 * Valida si un campo no está vacío
 */
export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

/**
 * Valida múltiples campos con reglas personalizadas
 */
export function validateFields(
  fields: Record<string, string>,
  rules: Record<string, ValidationRule[]>,
): ValidationResult {
  const errors: Record<string, string> = {};

  for (const [fieldName, value] of Object.entries(fields)) {
    const fieldRules = rules[fieldName];
    if (!fieldRules) continue;

    for (const rule of fieldRules) {
      if (!rule.validate(value)) {
        errors[fieldName] = rule.message;
        break; // Solo mostrar el primer error por campo
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Reglas de validación comunes
 */
export const commonRules = {
  required: (fieldName: string): ValidationRule => ({
    validate: isNotEmpty,
    message: `${fieldName} es requerido`,
  }),
  email: (): ValidationRule => ({
    validate: isValidEmail,
    message: "Email inválido",
  }),
  password: (): ValidationRule => ({
    validate: isValidPassword,
    message: "Mínimo 6 caracteres",
  }),
  minLength: (length: number): ValidationRule => ({
    validate: (value: string) => value.trim().length >= length,
    message: `Mínimo ${length} caracteres`,
  }),
  maxLength: (length: number): ValidationRule => ({
    validate: (value: string) => value.trim().length <= length,
    message: `Máximo ${length} caracteres`,
  }),
  match: (otherValue: string, fieldName: string): ValidationRule => ({
    validate: (value: string) => value === otherValue,
    message: `No coincide con ${fieldName}`,
  }),
};
