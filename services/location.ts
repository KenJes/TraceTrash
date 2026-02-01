import * as Location from "expo-location";
import { firebaseService } from "./firebase";
import { notifyTruckNearby } from "./notification-service";

class LocationService {
  private watchId: Location.LocationSubscription | null = null;
  private isTracking: boolean = false;
  private isPaused: boolean = false;
  private currentConductorId: string | null = null;
  private currentRutaId: string | null = null;
  private notifiedUsers: Set<string> = new Set(); // Control de usuarios ya notificados

  /**
   * Calcula la distancia entre dos puntos usando la fórmula de Haversine
   * @returns Distancia en metros
   */
  private calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number {
    const R = 6371e3; // Radio de la Tierra en metros
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distancia en metros
  }

  /**
   * Verifica proximidad con usuarios de la ruta y envía notificaciones
   */
  private async checkProximityAndNotify(
    conductorLat: number,
    conductorLon: number,
    rutaId: string,
    conductorNombre: string,
    unidad: string,
  ): Promise<void> {
    try {
      // Obtener usuarios de la ruta con pushToken
      const usuarios = await firebaseService.getUsuariosRuta(rutaId);

      for (const usuario of usuarios) {
        // Si el usuario no tiene coordenadas, saltar
        if (!usuario.latitude || !usuario.longitude) {
          continue;
        }

        // Calcular distancia
        const distancia = this.calculateDistance(
          conductorLat,
          conductorLon,
          usuario.latitude,
          usuario.longitude,
        );

        console.log(
          `[LOCATION] Distancia a ${usuario.nombre}: ${Math.round(distancia)}m`,
        );

        // Si está a menos de 100m y no ha sido notificado
        if (distancia < 100 && !this.notifiedUsers.has(usuario.uid)) {
          console.log(
            `[NOTIFY] Notificando a ${usuario.nombre} - ${Math.round(distancia)}m`,
          );

          // Enviar notificación si tiene pushToken
          if (usuario.pushToken) {
            await notifyTruckNearby(
              usuario.uid,
              usuario.pushToken,
              conductorNombre,
              Math.round(distancia),
              unidad,
            );
          }

          // Marcar como notificado
          this.notifiedUsers.add(usuario.uid);
        }

        // Si se aleja más de 200m, permitir notificar de nuevo
        if (distancia > 200 && this.notifiedUsers.has(usuario.uid)) {
          this.notifiedUsers.delete(usuario.uid);
        }
      }
    } catch (error) {
      console.error("❌ Error en verificación de proximidad:", error);
    }
  }

  /**
   * Solicita permisos de ubicación al usuario
   */
  async requestPermissions(): Promise<boolean> {
    try {
      // Solicitar permisos de primer plano
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        console.error("❌ Permiso de ubicación denegado");
        return false;
      }

      // Solicitar permisos de segundo plano (necesario para tracking continuo)
      const { status: backgroundStatus } =
        await Location.requestBackgroundPermissionsAsync();

      if (backgroundStatus !== "granted") {
        console.warn("⚠️ Permiso de ubicación en segundo plano denegado");
      }

      console.log("✅ Permisos de ubicación concedidos");
      return true;
    } catch (error) {
      console.error("Error al solicitar permisos:", error);
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
    unidad: string,
  ): Promise<boolean> {
    try {
      const hasPermission = await this.requestPermissions();
      if (!hasPermission) {
        return false;
      }

      if (this.isTracking && !this.isPaused) {
        console.log("⚠️ Tracking ya está activo");
        return true;
      }

      // Reanudar o iniciar
      if (this.isPaused) {
        this.isPaused = false;
        console.log("▶️ Tracking reanudado");
        return true;
      }

      this.currentConductorId = conductorId;
      this.currentRutaId = rutaId;

      console.log(
        `[TRACKING] Iniciando tracking para ${conductorNombre} - Ruta ${rutaId}`,
      );

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
            console.log("[TRACKING] Tracking pausado, saltando actualización");
            return;
          }

          try {
            const { latitude, longitude, speed, heading } = location.coords;
            console.log(
              `[LOCATION] Ubicación: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            );

            // Guardar ubicación en Firestore
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

            // Verificar proximidad con usuarios y notificar
            await this.checkProximityAndNotify(
              latitude,
              longitude,
              rutaId,
              conductorNombre,
              unidad,
            );
          } catch (error) {
            console.error("❌ Error al guardar ubicación:", error);
          }
        },
      );

      this.isTracking = true;
      this.isPaused = false;
      console.log("✅ Tracking iniciado correctamente");
      return true;
    } catch (error) {
      console.error("❌ Error al iniciar tracking:", error);
      return false;
    }
  }

  /**
   * Pausa el tracking (no envía actualizaciones pero mantiene el watch activo)
   */
  pauseTracking(): void {
    if (!this.isTracking) {
      console.warn("⚠️ No hay tracking activo para pausar");
      return;
    }

    this.isPaused = true;
    console.log("⏸️ Tracking pausado");
  }

  /**
   * Reanuda el tracking
   */
  resumeTracking(): void {
    if (!this.isTracking) {
      console.warn("⚠️ No hay tracking activo para reanudar");
      return;
    }

    this.isPaused = false;
    console.log("▶️ Tracking reanudado");
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
      this.notifiedUsers.clear(); // Limpiar usuarios notificados

      console.log("[TRACKING] Tracking detenido completamente");
    } catch (error) {
      console.error("[ERROR] Error al detener tracking:", error);
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
      console.error("❌ Error al obtener ubicación:", error);
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
