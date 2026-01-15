/**
 * Servicio de notificaciones del lado del cliente
 * ALTERNATIVA A CLOUD FUNCTIONS (no requiere plan Blaze)
 */

import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { Platform } from 'react-native';
import { db } from './firebaseconfig';

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

interface PushMessage {
  to: string[];
  title: string;
  body: string;
  data?: Record<string, any>;
  sound?: string;
  priority?: string;
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
    }

    return token.data;
  } catch (error) {
    console.error('Error al registrar notificaciones:', error);
    return undefined;
  }
}

/**
 * Envía notificaciones push usando la API de Expo directamente desde el cliente
 */
export async function sendPushNotifications(message: PushMessage): Promise<boolean> {
  try {
    const messages = message.to.map(token => ({
      to: token,
      sound: message.sound || 'default',
      title: message.title,
      body: message.body,
      data: message.data || {},
      priority: message.priority || 'high',
    }));

    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Notificaciones enviadas:', result);
    return true;
  } catch (error) {
    console.error('❌ Error enviando notificaciones:', error);
    return false;
  }
}

/**
 * Notifica a usuarios de una ruta cuando el conductor inicia
 */
export async function notifyRutaIniciada(
  rutaId: string,
  conductorNombre: string,
  unidad: string
): Promise<void> {
  try {
    // Obtener usuarios de la ruta con pushToken
    const usuariosRef = collection(db, 'users');
    const q = query(
      usuariosRef,
      where('rutaId', '==', rutaId),
      where('rol', '==', 'usuario')
    );
    
    const snapshot = await getDocs(q);
    const tokens: string[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.pushToken) {
        tokens.push(data.pushToken);
      }
    });

    if (tokens.length > 0) {
      await sendPushNotifications({
        to: tokens,
        title: '🚛 ¡Camión en camino!',
        body: `${conductorNombre}${unidad ? ` (Unidad ${unidad})` : ''} ha iniciado la recolección`,
        data: {
          type: 'route_started',
          rutaId,
          conductorNombre,
        },
      });

      console.log(`✅ Notificados ${tokens.length} usuarios`);
    }

    // Notificar también a admins
    await notifyAdmins(
      '🚛 Ruta Iniciada',
      `${conductorNombre} (${unidad}) ha iniciado la ruta`,
      { rutaId, type: 'route_started' }
    );
  } catch (error) {
    console.error('❌ Error en notifyRutaIniciada:', error);
  }
}

/**
 * Notifica a usuarios cuando el camión está cerca
 */
export async function notifyTruckNearby(
  usuarioId: string,
  pushToken: string,
  conductorNombre: string,
  distancia: number,
  unidad: string
): Promise<void> {
  try {
    await sendPushNotifications({
      to: [pushToken],
      title: '🚛 ¡El camión está cerca!',
      body: `${conductorNombre}${unidad ? ` (Unidad ${unidad})` : ''} está a ${distancia} metros de tu ubicación`,
      data: {
        type: 'truck_nearby',
        distancia,
      },
      sound: 'default',
      priority: 'high',
    });

    console.log(`✅ Notificado usuario ${usuarioId} - ${distancia}m`);
  } catch (error) {
    console.error('❌ Error en notifyTruckNearby:', error);
  }
}

/**
 * Notifica a administradores
 */
export async function notifyAdmins(
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<void> {
  try {
    // Obtener admins con pushToken
    const usuariosRef = collection(db, 'users');
    const q = query(usuariosRef, where('rol', '==', 'admin'));
    
    const snapshot = await getDocs(q);
    const tokens: string[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.pushToken) {
        tokens.push(data.pushToken);
      }
    });

    if (tokens.length === 0) {
      console.log('⚠️ No hay admins con token');
      return;
    }

    await sendPushNotifications({
      to: tokens,
      title,
      body,
      data,
    });

    console.log(`✅ Notificados ${tokens.length} administradores`);
  } catch (error) {
    console.error('❌ Error en notifyAdmins:', error);
  }
}

/**
 * Notifica cuando ruta se pausa
 */
export async function notifyRutaPausada(
  rutaId: string,
  conductorNombre: string,
  unidad: string
): Promise<void> {
  try {
    // Obtener usuarios de la ruta
    const usuariosRef = collection(db, 'users');
    const q = query(
      usuariosRef,
      where('rutaId', '==', rutaId),
      where('rol', '==', 'usuario')
    );
    
    const snapshot = await getDocs(q);
    const tokens: string[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.pushToken) {
        tokens.push(data.pushToken);
      }
    });

    if (tokens.length > 0) {
      await sendPushNotifications({
        to: tokens,
        title: '⏸️ Ruta Pausada',
        body: `El camión${unidad ? ` (Unidad ${unidad})` : ''} ha pausado temporalmente`,
        data: {
          type: 'route_paused',
          rutaId,
        },
      });
    }

    // Notificar también a admins
    await notifyAdmins(
      '⏸️ Ruta Pausada',
      `${conductorNombre} ha pausado la ruta`,
      { rutaId, type: 'route_paused' }
    );

  } catch (error) {
    console.error('❌ Error en notifyRutaPausada:', error);
  }
}

/**
 * Notifica cuando ruta finaliza
 */
export async function notifyRutaFinalizada(
  rutaId: string,
  conductorNombre: string,
  unidad: string
): Promise<void> {
  try {
    // Obtener usuarios de la ruta
    const usuariosRef = collection(db, 'users');
    const q = query(
      usuariosRef,
      where('rutaId', '==', rutaId),
      where('rol', '==', 'usuario')
    );
    
    const snapshot = await getDocs(q);
    const tokens: string[] = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.pushToken) {
        tokens.push(data.pushToken);
      }
    });

    if (tokens.length > 0) {
      await sendPushNotifications({
        to: tokens,
        title: '✅ Ruta Completada',
        body: `${conductorNombre} ha finalizado la recolección`,
        data: {
          type: 'route_completed',
          rutaId,
        },
      });
    }

    // Notificar también a admins
    await notifyAdmins(
      '✅ Ruta Completada',
      `${conductorNombre} ha finalizado la ruta`,
      { rutaId, type: 'route_completed' }
    );

  } catch (error) {
    console.error('❌ Error en notifyRutaFinalizada:', error);
  }
}
