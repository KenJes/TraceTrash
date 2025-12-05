import { useEffect } from 'react';
import * as Device from 'expo-device';
import { registerForPushNotificationsAsync } from '@/services/notifications';
import { firebaseService } from '@/services/firebase';
import { useAuthContext } from '@/components/auth-context';

/**
 * Hook personalizado para registrar notificaciones push automáticamente
 * cuando el usuario inicia sesión
 */
export function usePushNotifications() {
  const { user } = useAuthContext();

  useEffect(() => {
    let isMounted = true;

    const setupPushNotifications = async () => {
      // Solo para usuarios residenciales (no conductores ni admins)
      if (!user || user.rol !== 'usuario') {
        return;
      }

      // Solo en dispositivos físicos (no emulador)
      if (!Device.isDevice) {
        console.log('⚠️ Las notificaciones push solo funcionan en dispositivos físicos');
        return;
      }

      try {
        console.log('📱 Registrando notificaciones push...');
        
        // Obtener token de notificación
        const pushToken = await registerForPushNotificationsAsync();

        if (!pushToken || !isMounted) {
          return;
        }

        console.log('✅ Push token obtenido:', pushToken.substring(0, 20) + '...');

        // Guardar pushToken en Firestore
        if (user.uid) {
          await firebaseService.updateUser(user.uid, {
            pushToken,
            lastTokenUpdate: new Date().toISOString(),
          });
          console.log('✅ Push token guardado en Firestore');
        }
      } catch (error) {
        console.error('❌ Error al configurar notificaciones push:', error);
      }
    };

    setupPushNotifications();

    return () => {
      isMounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.uid, user?.rol]);
}
