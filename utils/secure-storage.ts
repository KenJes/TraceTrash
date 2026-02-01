/**
 * SECURE STORAGE HELPER
 *
 * Utilidad para almacenar datos sensibles de forma segura usando:
 * - expo-secure-store en dispositivos nativos (iOS/Android)
 * - AsyncStorage encriptado en web (con fallback seguro)
 *
 * NUNCA usar AsyncStorage directamente para credenciales.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const CREDENTIALS_KEY = "trace_secure_credentials";
const ENCRYPTION_PREFIX = "encrypted_";

/**
 * Encripta un string usando codificación base64 con ofuscación simple
 *
 * @param text - Texto plano a encriptar
 * @returns Texto encriptado con prefijo identificador
 * @remarks Solo para web. NO es criptografía real, usar crypto en producción
 * @example
 * ```typescript
 * const encrypted = simpleEncrypt("password123");
 * // Retorna: "encrypted_M3Ryb3dzc2FwXzMyMWRyb3dzc2Fw"
 * ```
 */
function simpleEncrypt(text: string): string {
  try {
    const encoded = Buffer.from(text).toString("base64");
    return ENCRYPTION_PREFIX + encoded.split("").reverse().join("");
  } catch {
    return text;
  }
}

/**
 * Desencripta un string previamente encriptado con simpleEncrypt
 *
 * @param encrypted - Texto encriptado con prefijo
 * @returns Texto plano original
 * @remarks Verifica el prefijo antes de desencriptar
 * @example
 * ```typescript
 * const decrypted = simpleDecrypt("encrypted_M3Ryb3dzc2FwXzMyMWRyb3dzc2Fw");
 * // Retorna: "password123"
 * ```
 */
function simpleDecrypt(encrypted: string): string {
  try {
    if (!encrypted.startsWith(ENCRYPTION_PREFIX)) {
      return encrypted;
    }
    const reversed = encrypted
      .substring(ENCRYPTION_PREFIX.length)
      .split("")
      .reverse()
      .join("");
    return Buffer.from(reversed, "base64").toString("utf-8");
  } catch {
    return encrypted;
  }
}

export interface SavedCredential {
  email: string;
  password: string;
}

/**
 * Guarda credenciales de forma segura en almacenamiento persistente
 *
 * @param credentials - Array de credenciales con email y password
 * @returns Promise que se resuelve cuando las credenciales se guardan
 * @throws Error si falla el almacenamiento
 * @remarks
 * - En iOS/Android usa expo-secure-store (hardware-backed)
 * - En web usa AsyncStorage con encriptación simple
 * @example
 * ```typescript
 * await saveCredentialsSecurely([
 *   { email: 'user@example.com', password: 'password123' }
 * ]);
 * ```
 */
export async function saveCredentialsSecurely(
  credentials: SavedCredential[],
): Promise<void> {
  try {
    const json = JSON.stringify(credentials);

    if (Platform.OS === "web") {
      // En web, usar AsyncStorage con encriptación simple
      const encrypted = simpleEncrypt(json);
      await AsyncStorage.setItem(CREDENTIALS_KEY, encrypted);
    } else {
      // En iOS/Android, usar SecureStore (hardware-backed)
      await SecureStore.setItemAsync(CREDENTIALS_KEY, json);
    }
  } catch (error) {
    console.error("[ERROR] Error al guardar credenciales:", error);
    throw new Error("No se pudieron guardar las credenciales de forma segura");
  }
}

/**
 * Recupera credenciales guardadas del almacenamiento seguro
 *
 * @returns Promise con array de credenciales guardadas, o array vacío si no hay
 * @remarks Maneja errores de forma segura retornando array vacío
 * @example
 * ```typescript
 * const credentials = await getCredentialsSecurely();
 * // Retorna: [{ email: 'user@example.com', password: 'password123' }]
 * ```
 */
export async function getCredentialsSecurely(): Promise<SavedCredential[]> {
  try {
    let json: string | null = null;

    if (Platform.OS === "web") {
      const encrypted = await AsyncStorage.getItem(CREDENTIALS_KEY);
      if (encrypted) {
        json = simpleDecrypt(encrypted);
      }
    } else {
      json = await SecureStore.getItemAsync(CREDENTIALS_KEY);
    }

    if (!json) {
      return [];
    }

    return JSON.parse(json) as SavedCredential[];
  } catch (error) {
    console.error("[ERROR] Error al leer credenciales:", error);
    return [];
  }
}

/**
 * Elimina todas las credenciales del almacenamiento seguro
 *
 * @returns Promise que se resuelve cuando las credenciales se eliminan
 * @remarks Maneja errores de forma segura sin lanzar excepciones
 * @example
 * ```typescript
 * await clearCredentialsSecurely();
 * // Todas las credenciales han sido eliminadas
 * ```
 */
export async function clearCredentialsSecurely(): Promise<void> {
  try {
    if (Platform.OS === "web") {
      await AsyncStorage.removeItem(CREDENTIALS_KEY);
    } else {
      await SecureStore.deleteItemAsync(CREDENTIALS_KEY);
    }
  } catch (error) {
    console.error("[ERROR] Error al eliminar credenciales:", error);
  }
}

/**
 * Agrega una nueva credencial o actualiza una existente
 *
 * @param email - Email del usuario (clave única)
 * @param password - Contraseña a almacenar
 * @returns Promise que se resuelve cuando la credencial se guarda
 * @throws Error si falla el almacenamiento
 * @remarks Si el email ya existe, actualiza la contraseña
 * @example
 * ```typescript
 * await addOrUpdateCredential('user@example.com', 'newPassword123');
 * ```
 */
export async function addOrUpdateCredential(
  email: string,
  password: string,
): Promise<void> {
  const credentials = await getCredentialsSecurely();

  const existingIndex = credentials.findIndex((c) => c.email === email);

  if (existingIndex >= 0) {
    credentials[existingIndex].password = password;
  } else {
    credentials.push({ email, password });
  }

  await saveCredentialsSecurely(credentials);
}

/**
 * Elimina una credencial específica del almacenamiento
 *
 * @param email - Email de la credencial a eliminar
 * @returns Promise que se resuelve cuando la credencial se elimina
 * @throws Error si falla el almacenamiento
 * @remarks Si el email no existe, no hace nada
 * @example
 * ```typescript
 * await deleteCredential('user@example.com');
 * ```
 */
export async function deleteCredential(email: string): Promise<void> {
  const credentials = await getCredentialsSecurely();
  const filtered = credentials.filter((c) => c.email !== email);
  await saveCredentialsSecurely(filtered);
}

/**
 * Migra credenciales desde AsyncStorage legacy a secure storage
 *
 * @returns Promise que se resuelve cuando la migración se completa
 * @remarks
 * - Busca credenciales en clave "savedCredentials" de AsyncStorage
 * - Las mueve a secure storage y elimina la clave antigua
 * - Es seguro ejecutar múltiples veces (solo migra si existen credenciales antiguas)
 * @example
 * ```typescript
 * await migrateOldCredentials();
 * // Credenciales legacy migradas a secure storage
 * ```
 */
export async function migrateOldCredentials(): Promise<void> {
  try {
    // Intentar leer credenciales del sistema antiguo
    const oldCredentialsJson = await AsyncStorage.getItem("savedCredentials");

    if (oldCredentialsJson) {
      const oldCredentials = JSON.parse(oldCredentialsJson);

      // Guardar en secure storage
      await saveCredentialsSecurely(oldCredentials);

      // Eliminar del storage antiguo
      await AsyncStorage.removeItem("savedCredentials");

      console.log("[MIGRATION] Credenciales migradas a secure storage");
    }
  } catch (error) {
    console.log("[INFO] No hay credenciales antiguas para migrar");
  }
}
