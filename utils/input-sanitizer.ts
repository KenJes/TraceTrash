/**
 * INPUT SANITIZER & VALIDATOR
 *
 * Utilidades para validar y sanitizar entradas de usuario
 * Previene inyecciones XSS, SQL y valida formatos
 */

/**
 * Valida formato de email
 *
 * @param email - Email a validar
 * @returns true si el formato es válido
 * @example
 * ```typescript
 * validateEmail('user@example.com'); // true
 * validateEmail('invalid-email'); // false
 * ```
 */
export function validateEmail(email: string): boolean {
  if (!email || typeof email !== "string") {
    return false;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const trimmed = email.trim();

  // Validaciones adicionales
  if (trimmed.length > 320) return false; // RFC 5321 max length
  if (trimmed.includes("..")) return false; // No permite puntos consecutivos

  return emailRegex.test(trimmed);
}

/**
 * Valida longitud y caracteres de contraseña
 *
 * @param password - Contraseña a validar
 * @param minLength - Longitud mínima (default: 6)
 * @returns Objeto con validez y mensaje de error
 * @example
 * ```typescript
 * validatePassword('abc123'); // { valid: true, error: undefined }
 * validatePassword('12'); // { valid: false, error: 'Mínimo 6 caracteres' }
 * ```
 */
export function validatePassword(
  password: string,
  minLength: number = 6,
): { valid: boolean; error?: string } {
  if (!password || typeof password !== "string") {
    return { valid: false, error: "Contraseña requerida" };
  }

  if (password.length < minLength) {
    return { valid: false, error: `Mínimo ${minLength} caracteres` };
  }

  if (password.length > 128) {
    return { valid: false, error: "Máximo 128 caracteres" };
  }

  // Opcional: validar complejidad
  // const hasUpperCase = /[A-Z]/.test(password);
  // const hasLowerCase = /[a-z]/.test(password);
  // const hasNumber = /[0-9]/.test(password);

  return { valid: true };
}

/**
 * Sanitiza texto general removiendo caracteres peligrosos
 *
 * @param text - Texto a sanitizar
 * @param maxLength - Longitud máxima permitida (default: 500)
 * @returns Texto sanitizado
 * @remarks Remueve HTML, scripts y caracteres especiales
 * @example
 * ```typescript
 * sanitizeText('<script>alert("xss")</script>'); // 'scriptalert("xss")/script'
 * sanitizeText('  texto con espacios  '); // 'texto con espacios'
 * ```
 */
export function sanitizeText(text: string, maxLength: number = 500): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  return text
    .trim()
    .replace(/[<>]/g, "") // Remover < y > para prevenir HTML injection
    .replace(/['"]/g, "") // Remover comillas para prevenir SQL injection
    .replace(/javascript:/gi, "") // Remover javascript: protocol
    .replace(/on\w+=/gi, "") // Remover event handlers (onclick=, onerror=, etc)
    .slice(0, maxLength);
}

/**
 * Sanitiza nombre de persona (permite letras, espacios, acentos)
 *
 * @param name - Nombre a sanitizar
 * @returns Nombre sanitizado
 * @example
 * ```typescript
 * sanitizeName('José María'); // 'José María'
 * sanitizeName('John<script>'); // 'John'
 * sanitizeName('  Ana  López  '); // 'Ana López'
 * ```
 */
export function sanitizeName(name: string): string {
  if (!name || typeof name !== "string") {
    return "";
  }

  return name
    .trim()
    .replace(/[<>]/g, "")
    .replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, "") // Solo letras y espacios
    .replace(/\s+/g, " ") // Normalizar espacios múltiples
    .slice(0, 100);
}

/**
 * Valida y sanitiza dirección
 *
 * @param address - Dirección a sanitizar
 * @returns Dirección sanitizada
 * @example
 * ```typescript
 * sanitizeAddress('Calle 5 #123'); // 'Calle 5 #123'
 * sanitizeAddress('<script>alert(1)</script>'); // 'scriptalert(1)/script'
 * ```
 */
export function sanitizeAddress(address: string): string {
  if (!address || typeof address !== "string") {
    return "";
  }

  return address
    .trim()
    .replace(/[<>]/g, "")
    .replace(/['"]/g, "")
    .replace(/javascript:/gi, "")
    .slice(0, 200);
}

/**
 * Valida número de teléfono mexicano
 *
 * @param phone - Número de teléfono
 * @returns true si el formato es válido (10 dígitos)
 * @example
 * ```typescript
 * validatePhoneNumber('5512345678'); // true
 * validatePhoneNumber('123'); // false
 * ```
 */
export function validatePhoneNumber(phone: string): boolean {
  if (!phone || typeof phone !== "string") {
    return false;
  }

  // Remover espacios, guiones y paréntesis
  const cleaned = phone.replace(/[\s\-()]/g, "");

  // Validar 10 dígitos para México
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(cleaned);
}

/**
 * Sanitiza número de teléfono removiendo caracteres no numéricos
 *
 * @param phone - Número de teléfono a sanitizar
 * @returns Solo dígitos del teléfono
 * @example
 * ```typescript
 * sanitizePhoneNumber('(55) 1234-5678'); // '5512345678'
 * sanitizePhoneNumber('+52 55 1234 5678'); // '525512345678'
 * ```
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone || typeof phone !== "string") {
    return "";
  }

  return phone.replace(/[^0-9]/g, "").slice(0, 15);
}

/**
 * Valida formato de URL
 *
 * @param url - URL a validar
 * @returns true si el formato es válido
 * @example
 * ```typescript
 * validateUrl('https://example.com'); // true
 * validateUrl('javascript:alert(1)'); // false
 * ```
 */
export function validateUrl(url: string): boolean {
  if (!url || typeof url !== "string") {
    return false;
  }

  try {
    const parsed = new URL(url);
    // Solo permitir http y https
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * Valida extensión de archivo de imagen
 *
 * @param filename - Nombre del archivo
 * @returns true si es una imagen permitida
 * @example
 * ```typescript
 * validateImageFile('photo.jpg'); // true
 * validateImageFile('document.pdf'); // false
 * ```
 */
export function validateImageFile(filename: string): boolean {
  if (!filename || typeof filename !== "string") {
    return false;
  }

  const allowedExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];
  const ext = filename.toLowerCase().slice(filename.lastIndexOf("."));

  return allowedExtensions.includes(ext);
}

/**
 * Valida tamaño de archivo
 *
 * @param sizeInBytes - Tamaño del archivo en bytes
 * @param maxSizeMB - Tamaño máximo permitido en MB (default: 5)
 * @returns Objeto con validez y mensaje de error
 * @example
 * ```typescript
 * validateFileSize(2048000, 5); // { valid: true }
 * validateFileSize(10000000, 5); // { valid: false, error: 'Archivo muy grande...' }
 * ```
 */
export function validateFileSize(
  sizeInBytes: number,
  maxSizeMB: number = 5,
): { valid: boolean; error?: string } {
  if (typeof sizeInBytes !== "number" || sizeInBytes < 0) {
    return { valid: false, error: "Tamaño de archivo inválido" };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (sizeInBytes > maxSizeBytes) {
    return {
      valid: false,
      error: `Archivo muy grande. Máximo ${maxSizeMB}MB permitidos`,
    };
  }

  return { valid: true };
}

/**
 * Valida código postal mexicano
 *
 * @param postalCode - Código postal
 * @returns true si el formato es válido (5 dígitos)
 * @example
 * ```typescript
 * validatePostalCode('01234'); // true
 * validatePostalCode('123'); // false
 * ```
 */
export function validatePostalCode(postalCode: string): boolean {
  if (!postalCode || typeof postalCode !== "string") {
    return false;
  }

  const cleaned = postalCode.replace(/\s/g, "");
  return /^[0-9]{5}$/.test(cleaned);
}

/**
 * Escapa caracteres especiales para prevenir inyecciones
 *
 * @param text - Texto a escapar
 * @returns Texto con caracteres especiales escapados
 * @example
 * ```typescript
 * escapeHtml('<div>Hello</div>'); // '&lt;div&gt;Hello&lt;/div&gt;'
 * ```
 */
export function escapeHtml(text: string): string {
  if (!text || typeof text !== "string") {
    return "";
  }

  const htmlEscapeMap: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };

  return text.replace(/[&<>"'/]/g, (char) => htmlEscapeMap[char]);
}

/**
 * Valida objeto completo de formulario de registro
 *
 * @param data - Datos del formulario
 * @returns Objeto con validez y errores por campo
 * @example
 * ```typescript
 * const result = validateRegistrationForm({
 *   email: 'user@example.com',
 *   password: 'password123',
 *   nombre: 'John Doe'
 * });
 * // { valid: true, errors: {} }
 * ```
 */
export function validateRegistrationForm(data: {
  email: string;
  password: string;
  confirmPassword?: string;
  nombre: string;
  calle?: string;
  numero?: string;
  colonia?: string;
}): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};

  // Validar email
  if (!validateEmail(data.email)) {
    errors.email = "Formato de email inválido";
  }

  // Validar password
  const passwordValidation = validatePassword(data.password);
  if (!passwordValidation.valid) {
    errors.password = passwordValidation.error || "Contraseña inválida";
  }

  // Validar confirmación de password
  if (data.confirmPassword && data.password !== data.confirmPassword) {
    errors.confirmPassword = "Las contraseñas no coinciden";
  }

  // Validar nombre
  if (!data.nombre || data.nombre.trim().length < 2) {
    errors.nombre = "Nombre requerido (mínimo 2 caracteres)";
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Sanitiza objeto completo de datos de usuario
 *
 * @param data - Datos del usuario
 * @returns Datos sanitizados
 * @example
 * ```typescript
 * const clean = sanitizeUserData({
 *   email: '  user@example.com  ',
 *   nombre: 'John<script>',
 *   calle: 'Calle 5'
 * });
 * // { email: 'user@example.com', nombre: 'John', calle: 'Calle 5' }
 * ```
 */
export function sanitizeUserData(data: {
  email?: string;
  nombre?: string;
  calle?: string;
  numero?: string;
  colonia?: string;
  telefono?: string;
}): typeof data {
  return {
    email: data.email?.trim().toLowerCase(),
    nombre: data.nombre ? sanitizeName(data.nombre) : undefined,
    calle: data.calle ? sanitizeAddress(data.calle) : undefined,
    numero: data.numero ? sanitizeText(data.numero, 10) : undefined,
    colonia: data.colonia ? sanitizeAddress(data.colonia) : undefined,
    telefono: data.telefono ? sanitizePhoneNumber(data.telefono) : undefined,
  };
}
