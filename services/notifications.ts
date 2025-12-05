import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar comportamiento de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export interface NotificationData {
  type: 'route_started' | 'route_paused' | 'route_ended' | 'truck_nearby' | 'connection_lost';
  conductorId?: string;
  conductorNombre?: string;
  rutaId?: string;
  rutaNombre?: string;
  distancia?: number;
  unidad?: string;
}

/**
 * Registra el dispositivo para recibir notificaciones push
 */
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice) {
    console.log('Las notificaciones push solo funcionan en dispositivos físicos');
    return undefined;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('No se obtuvo permiso para notificaciones');
      return undefined;
    }

    // Obtener token de Expo Push
    const projectId = Constants.expoConfig?.extra?.eas?.projectId;
    
    if (!projectId) {
      console.error('No se encontró projectId en app.json');
      return undefined;
    }

    const token = await Notifications.getExpoPushTokenAsync({ projectId });
    console.log('Token de notificaciones:', token.data);

    // Configurar canal de notificaciones para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Notificaciones de TraceTrash',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#4CAF50',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });

      // Canal para notificaciones urgentes
      await Notifications.setNotificationChannelAsync('urgent', {
        name: 'Alertas Urgentes',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#FF0000',
        sound: 'default',
        enableVibrate: true,
        showBadge: true,
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error al registrar notificaciones:', error);
    return undefined;
  }
}

/**
 * Envía una notificación local
 */
export async function sendLocalNotification(
  title: string,
  body: string,
  data?: Record<string, unknown>
) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: data || {},
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.HIGH,
      },
      trigger: null, // Enviar inmediatamente
    });
  } catch (error) {
    console.error('Error al enviar notificación local:', error);
  }
}

/**
 * Notificación cuando el conductor inicia ruta
 */
export async function notifyRouteStarted(
  conductorNombre: string,
  rutaNombre: string,
  unidad: string
) {
  await sendLocalNotification(
    '🚛 ¡El camión está en camino!',
    `${conductorNombre} (Unidad ${unidad}) ha iniciado la ruta ${rutaNombre}`,
    {
      type: 'route_started',
      conductorNombre,
      rutaNombre,
      unidad,
    }
  );
}

/**
 * Notificación cuando el camión está cerca (100m)
 */
export async function notifyTruckNearby(
  conductorNombre: string,
  distancia: number,
  unidad: string
) {
  await sendLocalNotification(
    '📍 ¡El camión está cerca!',
    `Unidad ${unidad} se encuentra a ${Math.round(distancia)}m de tu ubicación. Prepara tu basura.`,
    {
      type: 'truck_nearby',
      conductorNombre,
      distancia,
      unidad,
    }
  );
}

/**
 * Notificación cuando el conductor pausa la ruta
 */
export async function notifyRoutePaused(conductorNombre: string, unidad: string) {
  await sendLocalNotification(
    '⏸️ Ruta pausada',
    `${conductorNombre} (Unidad ${unidad}) ha pausado temporalmente la recolección`,
    {
      type: 'route_paused',
      conductorNombre,
      unidad,
    }
  );
}

/**
 * Notificación cuando el conductor finaliza la ruta
 */
export async function notifyRouteEnded(conductorNombre: string, unidad: string) {
  await sendLocalNotification(
    '✅ Ruta finalizada',
    `${conductorNombre} (Unidad ${unidad}) ha completado la recolección de hoy`,
    {
      type: 'route_ended',
      conductorNombre,
      unidad,
    }
  );
}

/**
 * Notificación de pérdida de conexión (más de 2 minutos)
 */
export async function notifyConnectionLost(conductorNombre: string, unidad: string) {
  await sendLocalNotification(
    '⚠️ Problema de conexión',
    `Se perdió la señal de la Unidad ${unidad}. Última actualización hace más de 2 minutos.`,
    {
      type: 'connection_lost',
      conductorNombre,
      unidad,
    }
  );
}

/**
 * Suscribirse a notificaciones recibidas mientras la app está abierta
 */
export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void
) {
  return Notifications.addNotificationReceivedListener(callback);
}

/**
 * Suscribirse a notificaciones tocadas por el usuario
 */
export function addNotificationResponseReceivedListener(
  callback: (response: Notifications.NotificationResponse) => void
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}

/**
 * Cancelar todas las notificaciones
 */
export async function cancelAllNotifications() {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
