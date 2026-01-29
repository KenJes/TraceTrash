import { useAuthContext } from "@/components/auth-context";
import { TruckMapView } from "@/components/map-view";
import { useThemeContext } from "@/components/theme-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { firebaseService, RutaData, UbicacionData } from "@/services/firebase";
import { batchGeocode } from "@/services/geocoding";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    View,
} from "react-native";
import { getModernStyles } from "../_styles/modernStyles";

// Importación condicional para expo-location (solo en native)
let Location: typeof import("expo-location") | null = null;
if (Platform.OS !== "web") {
  Location = require("expo-location");
}

export default function IndexScreen() {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const [ruta, setRuta] = useState<RutaData | null>(null);
  const [ubicacionCamion, setUbicacionCamion] = useState<UbicacionData | null>(
    null,
  );
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [rutaCoordinates, setRutaCoordinates] = useState<
    { latitude: number; longitude: number }[] | undefined
  >(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const isDarkMode = theme === "dark";
  const styles = getModernStyles(isDarkMode);

  const cargarDatos = useCallback(async () => {
    try {
      console.log("[INDEX] Cargando datos, rutaId:", user?.rutaId);
      if (!user?.rutaId) {
        console.log("[INDEX] No hay rutaId, limpiando estado");
        setRuta(null);
        setUbicacionCamion(null);
        return;
      }

      // Cargar información de la ruta
      const rutaData = await firebaseService.getRutaById(user.rutaId);
      setRuta(rutaData);
      console.log("[INDEX] Ruta cargada:", rutaData?.nombre);

      // Si la ruta tiene coordenadas guardadas, usarlas
      if (rutaData?.coordenadas && rutaData.coordenadas.length > 0) {
        console.log(
          "[INDEX] Usando coordenadas guardadas:",
          rutaData.coordenadas.length,
        );
        setRutaCoordinates(rutaData.coordenadas);
      } else if (rutaData?.direcciones && rutaData.direcciones.length > 0) {
        // Si no tiene coordenadas pero tiene direcciones, geocodificar
        console.log("[INFO] Geocodificando direcciones de la ruta...");
        const results = await batchGeocode(rutaData.direcciones);
        const coords = results
          .filter((r) => r !== null)
          .map((r) => ({ latitude: r!.latitude, longitude: r!.longitude }));

        if (coords.length > 0) {
          console.log("[SUCCESS] Coordenadas geocodificadas:", coords.length);
          setRutaCoordinates(coords);
          // Guardar coordenadas en la ruta para futura referencia
          const centerLat =
            coords.reduce((sum, c) => sum + c.latitude, 0) / coords.length;
          const centerLon =
            coords.reduce((sum, c) => sum + c.longitude, 0) / coords.length;
          await firebaseService.updateRutaCoordinates(user.rutaId, coords, {
            latitude: centerLat,
            longitude: centerLon,
          });
        } else {
          console.log("[WARN] No se pudieron geocodificar direcciones");
        }
      } else {
        console.log("[WARN] Ruta sin coordenadas ni direcciones");
      }

      // Si la ruta tiene conductor asignado, buscar su ubicación
      if (rutaData?.conductorAsignado) {
        const ubicacion = await firebaseService.getUbicacionConductor(
          rutaData.conductorAsignado,
        );
        setUbicacionCamion(ubicacion);
        console.log("[INDEX] Ubicación del camión cargada");
      }
    } catch (error) {
      console.error("[ERROR] Error al cargar datos:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.rutaId]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      cargarDatos();
    }, [cargarDatos]),
  );

  // Suscripción en tiempo real a ubicaciones de la ruta
  useEffect(() => {
    if (!user?.rutaId || !ruta) {
      return;
    }

    const unsubscribe = firebaseService.subscribeToUbicacionesRuta(
      user.rutaId,
      (ubicaciones) => {
        if (ubicaciones.length > 0) {
          // Tomar la ubicación más reciente
          setUbicacionCamion(ubicaciones[0]);
        } else {
          setUbicacionCamion(null);
        }
      },
    );

    return () => unsubscribe();
  }, [user?.rutaId, ruta]);

  // Obtener y actualizar ubicación del usuario (UNIFICADO: WEB + NATIVE)
  useEffect(() => {
    if (Platform.OS === "web") {
      // VERSIÓN WEB: Navigator.geolocation
      let watchId: number | null = null;

      const startWatchingLocationWeb = () => {
        if (!navigator.geolocation) {
          console.warn("[LOCATION-WEB] Geolocalización no disponible");
          return;
        }

        console.log("[LOCATION-WEB] Solicitando ubicación inicial...");

        // Obtener ubicación inicial
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const userCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            setUserLocation(userCoords);
            console.log(
              `[LOCATION-WEB] Ubicación obtenida: ${userCoords.latitude}, ${userCoords.longitude}`,
            );

            if (user?.uid) {
              await firebaseService.updateUserLocation(
                user.uid,
                userCoords.latitude,
                userCoords.longitude,
              );
            }
          },
          (error) => console.error("[ERROR] Ubicación inicial:", error.message),
          { enableHighAccuracy: false, timeout: 10000, maximumAge: 30000 },
        );

        // Watch position
        watchId = navigator.geolocation.watchPosition(
          async (position) => {
            const newCoords = {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            };

            setUserLocation(newCoords);
            console.log(
              `[LOCATION-WEB] Actualizada: ${newCoords.latitude}, ${newCoords.longitude}`,
            );

            if (user?.uid) {
              await firebaseService.updateUserLocation(
                user.uid,
                newCoords.latitude,
                newCoords.longitude,
              );
            }
          },
          (error) => console.error("[ERROR] watchPosition:", error.message),
          { enableHighAccuracy: false, timeout: 30000, maximumAge: 30000 },
        );
      };

      startWatchingLocationWeb();

      return () => {
        if (watchId !== null) {
          navigator.geolocation.clearWatch(watchId);
          console.log("[LOCATION-WEB] Watch removido");
        }
      };
    } else {
      // VERSIÓN NATIVE: expo-location
      let locationSubscription: any = null;

      const startWatchingLocationNative = async () => {
        if (!Location) return;

        try {
          console.log("[LOCATION] Solicitando permisos...");
          const { status } = await Location.requestForegroundPermissionsAsync();

          if (status !== "granted") {
            console.warn("[LOCATION] Permisos denegados");
            return;
          }

          console.log("[LOCATION] Obteniendo ubicación inicial...");
          const initialLocation = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });

          const userCoords = {
            latitude: initialLocation.coords.latitude,
            longitude: initialLocation.coords.longitude,
          };

          setUserLocation(userCoords);
          console.log(
            `[LOCATION] Ubicación obtenida: ${userCoords.latitude}, ${userCoords.longitude}`,
          );

          if (user?.uid) {
            await firebaseService.updateUserLocation(
              user.uid,
              userCoords.latitude,
              userCoords.longitude,
            );
          }

          // Watch position
          locationSubscription = await Location.watchPositionAsync(
            {
              accuracy: Location.Accuracy.Balanced,
              timeInterval: 30000,
              distanceInterval: 50,
            },
            async (location) => {
              const newCoords = {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              };

              setUserLocation(newCoords);
              console.log(
                `[LOCATION] Actualizada: ${newCoords.latitude}, ${newCoords.longitude}`,
              );

              if (user?.uid) {
                await firebaseService.updateUserLocation(
                  user.uid,
                  newCoords.latitude,
                  newCoords.longitude,
                );
              }
            },
          );
        } catch (error) {
          console.error("[ERROR] Ubicación:", error);
        }
      };

      startWatchingLocationNative();

      return () => {
        if (locationSubscription) {
          locationSubscription.remove();
          console.log("[LOCATION] Suscripción removida");
        }
      };
    }
  }, [user?.uid]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  if (isLoading) {
    return (
      <ThemedView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#4CAF50" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/trace1_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <ThemedText type="title" style={styles.title}>
          Recolección de Residuos
        </ThemedText>

        {/* MAPA SIEMPRE VISIBLE PARA USUARIOS RESIDENCIALES */}
        <View style={styles.card}>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <View
              style={[
                styles.iconBadge,
                { backgroundColor: "#2196F3", marginRight: 12 },
              ]}
            >
              <Ionicons name="map" size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.sectionTitle}>
                {ruta
                  ? ubicacionCamion
                    ? "Ubicación en Tiempo Real"
                    : "Tu Ruta Asignada"
                  : "Mapa de la Zona"}
              </ThemedText>
              <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
                {ruta
                  ? ubicacionCamion
                    ? "Rastrea el camión en el mapa"
                    : `${ruta.nombre}`
                  : "Temascaltepec, México"}
              </ThemedText>
            </View>
          </View>

          {/* DEBUG: Mostrar estado actual */}
          <ThemedText style={{ fontSize: 11, opacity: 0.6, marginBottom: 8 }}>
            Estado: {userLocation ? "✓ Ubicación" : "✗ Sin ubicación"} |{" "}
            {rutaCoordinates && rutaCoordinates.length > 0
              ? `✓ Ruta (${rutaCoordinates.length} puntos)`
              : "✗ Sin ruta"}{" "}
            | {ubicacionCamion ? "✓ Camión" : "✗ Sin camión"}
          </ThemedText>

          <TruckMapView
            ubicacionCamion={ubicacionCamion}
            userLocation={userLocation}
            rutaPolyline={rutaCoordinates}
            height={250}
          />

          {ubicacionCamion?.velocidad !== undefined && (
            <View
              style={{
                marginTop: 12,
                padding: 12,
                backgroundColor: isDarkMode ? "#1a1a1a" : "#f9f9f9",
                borderRadius: 8,
                flexDirection: "row",
                justifyContent: "space-between",
              }}
            >
              <View>
                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                  Velocidad
                </ThemedText>
                <ThemedText
                  style={{ fontSize: 16, fontWeight: "600", marginTop: 2 }}
                >
                  {ubicacionCamion.velocidad} km/h
                </ThemedText>
              </View>
              <View>
                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                  Unidad
                </ThemedText>
                <ThemedText
                  style={{ fontSize: 16, fontWeight: "600", marginTop: 2 }}
                >
                  {ubicacionCamion.unidad}
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Información de ruta cuando existe */}
        {ruta ? (
          <>
            <View style={styles.card}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <View
                  style={[
                    styles.iconBadge,
                    {
                      backgroundColor: ruta.color || "#4CAF50",
                      marginRight: 12,
                    },
                  ]}
                >
                  <Ionicons name="map" size={20} color="#FFF" />
                </View>
                <View>
                  <ThemedText style={styles.label}>Tu Ruta</ThemedText>
                  <ThemedText style={styles.sectionTitle}>
                    {ruta.nombre}
                  </ThemedText>
                </View>
              </View>
              {ruta.horario && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="time"
                    size={16}
                    color={isDarkMode ? "#AAA" : "#666"}
                  />
                  <ThemedText
                    style={{ fontSize: 13, opacity: 0.7, marginLeft: 6 }}
                  >
                    Horario: {ruta.horario}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Estado del camión */}
            <View
              style={[
                styles.card,
                {
                  backgroundColor: ubicacionCamion
                    ? isDarkMode
                      ? "rgba(76,175,80,0.2)"
                      : "rgba(76,175,80,0.1)"
                    : undefined,
                },
              ]}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <View
                  style={[
                    styles.iconBadge,
                    {
                      backgroundColor: ubicacionCamion ? "#4CAF50" : "#9E9E9E",
                      marginRight: 12,
                    },
                  ]}
                >
                  <Ionicons name="car" size={20} color="#FFF" />
                </View>
                <View>
                  <ThemedText style={styles.label}>
                    Estado del Camión
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.valor,
                      { color: ubicacionCamion ? "#4CAF50" : undefined },
                    ]}
                  >
                    {ubicacionCamion ? "🟢 En Ruta" : "⚪ Detenido"}
                  </ThemedText>
                  {ruta.conductorNombre && (
                    <ThemedText
                      style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}
                    >
                      Conductor: {ruta.conductorNombre} • Unidad {ruta.unidad}
                    </ThemedText>
                  )}
                </View>
              </View>
            </View>
          </>
        ) : (
          // USUARIO SIN RUTA: SERVICIO NO DISPONIBLE
          <View style={styles.card}>
            <View style={{ alignItems: "center", paddingVertical: 24 }}>
              <View
                style={[
                  styles.iconBadge,
                  {
                    backgroundColor: "#FF9800",
                    width: 70,
                    height: 70,
                    marginBottom: 16,
                  },
                ]}
              >
                <Ionicons name="location-outline" size={36} color="#FFF" />
              </View>
              <ThemedText
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  textAlign: "center",
                  marginBottom: 10,
                }}
              >
                Servicio no disponible
              </ThemedText>
              <ThemedText
                style={{
                  fontSize: 14,
                  textAlign: "center",
                  opacity: 0.8,
                  paddingHorizontal: 20,
                  lineHeight: 21,
                }}
              >
                Aún no hay una ruta de recolección para tu zona
              </ThemedText>
              {user?.direccion && (
                <View
                  style={{
                    marginTop: 16,
                    padding: 12,
                    backgroundColor: isDarkMode
                      ? "rgba(33, 150, 243, 0.15)"
                      : "rgba(33, 150, 243, 0.08)",
                    borderRadius: 10,
                    borderLeftWidth: 4,
                    borderLeftColor: "#2196F3",
                    width: "95%",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
                    <Ionicons name="home" size={16} color="#2196F3" />
                    <ThemedText
                      style={{
                        fontSize: 12,
                        marginLeft: 6,
                        fontWeight: "600",
                        color: "#2196F3",
                      }}
                    >
                      Tu dirección
                    </ThemedText>
                  </View>
                  <ThemedText style={{ fontSize: 13, opacity: 0.9 }}>
                    {user.direccion}
                  </ThemedText>
                </View>
              )}
              <ThemedText
                style={{
                  marginTop: 16,
                  fontSize: 12,
                  textAlign: "center",
                  opacity: 0.7,
                }}
              >
                El servicio se asignará cuando el administrador configure una
                ruta para tu calle.
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}
