/**
 * INPUT VALIDATION & SANITIZATION
 *
 * Utilidades para validar y sanitizar inputs de usuarios
 * Previene XSS, injection y datos maliciosos
 */

/**
 * Sanitiza texto removiendo caracteres peligrosos
 *
 * @param text - Texto a sanitizar
 * @returns Texto sanitizado sin caracteres peligrosos
 * @example
 * ```typescript
 * sanitizeText("<script>alert('xss')</script>")
 * // Retorna: "scriptalert('xss')/script"
 * ```
 */
export function sanitizeText(text: string): string {
  if (!text || typeof text !== "string") return "";

  return text
    .replace(/[<>]/g, "") // Remover < y >
    .replace(/javascript:/gi, "") // Bloquear javascript:
    .replace(/on\w+=/gi, "") // Bloquear event handlers (onclick=, onerror=, etc)
    .replace(/data:text\/html/gi, "") // Bloquear data URIs
    .trim()
    .substring(0, 500); // Limitar longitud
}

/**
 * Valida que un email tenga formato correcto
 *
 * @param email - Email a validar
 * @returns true si el email es válido
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valida que un password cumpla requisitos mínimos
 *
 * @param password - Password a validar
 * @returns Objeto con resultado de validación y mensaje de error
 */
export function validatePassword(password: string): {
  valid: boolean;
  error?: string;
} {
  if (!password || password.length < 6) {
    return {
      valid: false,
      error: "El password debe tener al menos 6 caracteres",
    };
  }

  if (password.length > 128) {
    return { valid: false, error: "El password es demasiado largo" };
  }

  // Verificar que no sea muy simple
  const commonPasswords = [
    "123456",
    "password",
    "qwerty",
    "123456789",
    "12345678",
  ];
  if (commonPasswords.includes(password.toLowerCase())) {
    return {
      valid: false,
      error: "Password demasiado común, elige uno más seguro",
    };
  }

  return { valid: true };
}

/**
 * Valida que un nombre solo contenga caracteres permitidos
 *
 * @param nombre - Nombre a validar
 * @returns true si el nombre es válido
 */
export function isValidName(nombre: string): boolean {
  if (!nombre) return false;

  const trimmedName = nombre.trim();
  if (trimmedName.length < 2 || trimmedName.length > 100) return false;

  // Solo letras, espacios, acentos y caracteres comunes en español
  const nameRegex = /^[a-záéíóúñüA-ZÁÉÍÓÚÑÜ\s'-]+$/;
  return nameRegex.test(trimmedName);
}

/**
 * Valida coordenadas GPS dentro de los límites de México
 *
 * @param lat - Latitud
 * @param lon - Longitud
 * @returns true si las coordenadas están dentro de México
 */
export function isValidMexicoLocation(lat: number, lon: number): boolean {
  const MEXICO_BOUNDS = {
    latMin: 14.5,
    latMax: 32.7,
    lonMin: -118.4,
    lonMax: -86.7,
  };

  return (
    lat >= MEXICO_BOUNDS.latMin &&
    lat <= MEXICO_BOUNDS.latMax &&
    lon >= MEXICO_BOUNDS.lonMin &&
    lon <= MEXICO_BOUNDS.lonMax
  );
}

/**
 * Valida que la descripción de un reporte sea válida
 *
 * @param descripcion - Descripción a validar
 * @returns Objeto con resultado de validación y mensaje de error
 */
export function validateReportDescription(descripcion: string): {
  valid: boolean;
  error?: string;
} {
  if (!descripcion || descripcion.trim().length < 10) {
    return {
      valid: false,
      error: "La descripción debe tener al menos 10 caracteres",
    };
  }

  if (descripcion.length > 1000) {
    return {
      valid: false,
      error: "La descripción es demasiado larga (máximo 1000 caracteres)",
    };
  }

  return { valid: true };
}

/**
 * Valida número de unidad para conductores
 *
 * @param unidad - Número de unidad
 * @returns true si el número de unidad es válido
 */
export function isValidUnidad(unidad: string): boolean {
  // Formato: 1-4 dígitos o letras
  const unidadRegex = /^[A-Z0-9]{1,4}$/i;
  return unidadRegex.test(unidad);
}

/**
 * Detecta si hay un salto de ubicación imposible
 *
 * @param prevLat - Latitud anterior
 * @param prevLon - Longitud anterior
 * @param newLat - Nueva latitud
 * @param newLon - Nueva longitud
 * @param timeElapsedSeconds - Tiempo transcurrido en segundos
 * @returns true si el salto es imposible (>150 km/h)
 */
export function isImpossibleLocationJump(
  prevLat: number,
  prevLon: number,
  newLat: number,
  newLon: number,
  timeElapsedSeconds: number,
): boolean {
  // Calcular distancia usando fórmula haversine simplificada
  const R = 6371; // Radio de la Tierra en km
  const dLat = ((newLat - prevLat) * Math.PI) / 180;
  const dLon = ((newLon - prevLon) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((prevLat * Math.PI) / 180) *
      Math.cos((newLat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distancia en km

  // Calcular velocidad
  const timeElapsedHours = timeElapsedSeconds / 3600;
  const speed = distance / timeElapsedHours;

  // Camión de basura no debería superar 150 km/h
  return speed > 150;
}
