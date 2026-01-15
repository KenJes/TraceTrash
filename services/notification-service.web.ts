/**
 * Versión WEB del servicio de notificaciones
 * Stub que no hace nada - las notificaciones solo funcionan en móvil
 */

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  console.log('📱 Notificaciones push no disponibles en web');
  return undefined;
}

export async function sendPushNotifications(): Promise<boolean> {
  console.log('📱 Notificaciones push no disponibles en web');
  return false;
}

export async function notifyRutaIniciada(): Promise<void> {
  console.log('📱 Notificaciones push no disponibles en web');
}

export async function notifyAdmins(): Promise<void> {
  console.log('📱 Notificaciones push no disponibles en web');
}

export async function notifyRutaFinalizada(): Promise<void> {
  console.log('📱 Notificaciones push no disponibles en web');
}

export async function notifyTruckNearby(): Promise<void> {
  console.log('📱 Notificaciones push no disponibles en web');
}

export async function notifyReporteNuevo(): Promise<void> {
  console.log('📱 Notificaciones push no disponibles en web');
}

export async function notifyReporteResuelto(): Promise<void> {
  console.log('📱 Notificaciones push no disponibles en web');
}
