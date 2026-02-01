/**
 * DEPRECATED: Este archivo está deprecado.
 * Usar utils/input-validator.ts en su lugar.
 * 
 * Este archivo se mantiene temporalmente para compatibilidad.
 * TODO: Eliminar después de migrar todas las referencias.
 */

import {
  isValidEmail as _isValidEmail,
  validatePassword,
  isValidName,
} from './input-validator';

// Re-export para compatibilidad temporal
export function isValidEmail(email: string): boolean {
  return _isValidEmail(email);
}

export function isValidPassword(password: string): boolean {
  const result = validatePassword(password);
  return result.valid;
}

export function isNotEmpty(value: string): boolean {
  return value.trim().length > 0;
}

// Interfaces y utilidades adicionales
export interface ValidationRule {
  validate: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

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
        break;
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}

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
