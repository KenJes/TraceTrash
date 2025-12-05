import * as Location from 'expo-location';
import { firebaseService } from './firebase';

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private isTracking: boolean = false;
  private isPaused: boolean = false;
  private currentConductorId: string | null = null;
  private currentRutaId: string | null = null;

  /**
   * Solicita permisos de ubicación al usuario
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Solicitar permisos de primer plano
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        console.error('❌ Permiso de ubicación denegado');
        return false;
      }

      // Solicitar permisos de segundo plano (necesario para tracking continuo)
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.warn('⚠️ Permiso de ubicación en segundo plano denegado');
      }

      console.log('✅ Permisos de ubicación concedidos');
      return true;
    } catch (error) {
      console.error('Error al solicitar permisos:', error);
      return false;
    }
  }

  /**
   * Inicia el tracking de ubicación para un conductor
   */
  async startTracking(
    conductorId: string,
    conductorNombre: string,
    rutaId: string,
    unidad: string
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      if (this.isTracking && !this.isPaused) {
        console.log('⚠️ Tracking ya está activo');
        return true;
      }

      // Reanudar o iniciar
      if (this.isPaused) {
        this.isPaused = false;
        console.log('▶️ Tracking reanudado');
        return true;
      }

      this.currentConductorId = conductorId;
      this.currentRutaId = rutaId;

      console.log(`🚛 Iniciando tracking para ${conductorNombre} - Ruta ${rutaId}`);

      // Configurar tracking con intervalo de 30 segundos
      this.watchId = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 30000, // 30 segundos
          distanceInterval: 10, // O cada 10 metros
          mayShowUserSettingsDialog: true,
        },
        async (location) => {
          if (this.isPaused) {
            console.log('⏸️ Tracking pausado, saltando actualización');
            return;
          }

          try {
            const { latitude, longitude, speed, heading } = location.coords;
            console.log(`📍 Ubicación: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);

            await firebaseService.guardarUbicacion({
              conductorId,
              conductorNombre,
              rutaId,
              unidad,
              latitude,
              longitude,
              velocidad: speed ? Math.round(speed * 3.6) : 0, // m/s a km/h
              heading: heading || undefined,
            });
          } catch (error) {
            console.error('❌ Error al guardar ubicación:', error);
          }
        }
      );

      this.isTracking = true;
      this.isPaused = false;
      console.log('✅ Tracking iniciado correctamente');
      return true;
    } catch (error) {
      console.error('❌ Error al iniciar tracking:', error);
      return false;
    }
  }

  /**
   * Pausa el tracking (no envía actualizaciones pero mantiene el watch activo)
   */
  pauseTracking(): void {
    if (!this.isTracking) {
      console.warn('⚠️ No hay tracking activo para pausar');
      return;
    }

    this.isPaused = true;
    console.log('⏸️ Tracking pausado');
  }

  /**
   * Reanuda el tracking
   */
  resumeTracking(): void {
    if (!this.isTracking) {
      console.warn('⚠️ No hay tracking activo para reanudar');
      return;
    }

    this.isPaused = false;
    console.log('▶️ Tracking reanudado');
  }

  /**
   * Detiene completamente el tracking
   */
  async stopTracking(): Promise<void> {
    try {
      if (this.watchId) {
        this.watchId.remove();
        this.watchId = null;
      }

      this.isTracking = false;
      this.isPaused = false;
      this.currentConductorId = null;
      this.currentRutaId = null;
      
      console.log('🛑 Tracking detenido completamente');
    } catch (error) {
      console.error('❌ Error al detener tracking:', error);
    }
  }

  /**
   * Obtiene la ubicación actual sin iniciar tracking
   */
  async getCurrentLocation(): Promise<Location.LocationObject | null> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return null;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      return location;
    } catch (error) {
      console.error('❌ Error al obtener ubicación:', error);
      return null;
    }
  }

  /**
   * Verifica si el tracking está activo
   */
  isTrackingActive(): boolean {
    return this.isTracking && !this.isPaused;
  }

  /**
   * Verifica si el tracking está pausado
   */
  isTrackingPaused(): boolean {
    return this.isPaused;
  }

  /**
   * Obtiene el ID del conductor actual
   */
  getCurrentConductorId(): string | null {
    return this.currentConductorId;
  }

  /**
   * Obtiene el ID de la ruta actual
   */
  getCurrentRutaId(): string | null {
    return this.currentRutaId;
  }
}

export const locationService = new LocationService();
