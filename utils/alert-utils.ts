import { Alert, Platform } from "react-native";

/**
 * Utilidades para mostrar alertas y manejar errores de forma consistente
 */

/**
 * Muestra una alerta de error de forma consistente
 */
export function showErrorAlert(message: string, title = "Error") {
  if (Platform.OS === "web") {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
}

/**
 * Muestra una alerta de éxito
 */
export function showSuccessAlert(message: string, title = "Éxito") {
  if (Platform.OS === "web") {
    alert(`${title}: ${message}`);
  } else {
    Alert.alert(title, message);
  }
}

/**
 * Muestra una alerta de confirmación con callback
 */
export function showConfirmAlert(
  title: string,
  message: string,
  onConfirm: () => void,
  onCancel?: () => void,
) {
  if (Platform.OS === "web") {
    if (confirm(`${title}\n\n${message}`)) {
      onConfirm();
    } else if (onCancel) {
      onCancel();
    }
  } else {
    Alert.alert(title, message, [
      { text: "Cancelar", style: "cancel", onPress: onCancel },
      { text: "Confirmar", onPress: onConfirm },
    ]);
  }
}

/**
 * Extrae un mensaje de error amigable desde un error de Firebase o genérico
 */
export function getErrorMessage(
  error: any,
  defaultMessage = "Ocurrió un error",
): string {
  if (error?.message) return error.message;
  if (typeof error === "string") return error;
  return defaultMessage;
}

/**
 * Mensajes de error comunes de Firebase Auth traducidos
 */
export const AUTH_ERROR_MESSAGES: Record<string, string> = {
  "auth/invalid-email": "El correo electrónico no es válido",
  "auth/user-disabled": "Esta cuenta ha sido deshabilitada",
  "auth/user-not-found": "No existe una cuenta con este correo",
  "auth/wrong-password": "Contraseña incorrecta",
  "auth/email-already-in-use": "Este correo ya está registrado",
  "auth/weak-password": "La contraseña debe tener al menos 6 caracteres",
  "auth/operation-not-allowed": "Operación no permitida",
  "auth/too-many-requests": "Demasiados intentos. Intenta más tarde",
  "auth/network-request-failed": "Error de conexión. Verifica tu internet",
};

/**
 * Obtiene un mensaje de error traducido para Firebase Auth
 */
export function getFirebaseAuthError(errorCode: string): string {
  return AUTH_ERROR_MESSAGES[errorCode] || "Error de autenticación";
}
