import { useAuthContext } from "@/components/auth-context";
import ConductorMapView from "@/components/conductor-map-view";
import { useThemeContext } from "@/components/theme-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { firebaseService, RutaData, UbicacionData } from "@/services/firebase";
import { locationService } from "@/services/location";
import {
    notifyRutaFinalizada,
    notifyRutaIniciada,
} from "@/services/notification-service";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    TouchableOpacity,
    View,
} from "react-native";
import { getModernStyles } from "../_styles/modernStyles";

export default function ConductorIndexScreen() {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const [enRuta, setEnRuta] = useState(false);
  const [ruta, setRuta] = useState<RutaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [ubicacionActual, setUbicacionActual] = useState<UbicacionData | null>(
    null,
  );
  const [direccionesCompletadas, setDireccionesCompletadas] = useState<
    string[]
  >([]);

  const isDarkMode = theme === "dark";
  const styles = getModernStyles(isDarkMode);

  const cargarRuta = async () => {
    try {
      if (!user?.rutaId) {
        setRuta(null);
        return;
      }

      const rutaData = await firebaseService.getRutaById(user.rutaId);
      setRuta(rutaData);
    } catch (error) {
      console.error("Error al cargar ruta:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      cargarRuta();

      // Verificar si ya está trackeando
      setEnRuta(locationService.isTrackingActive());
    }, [user?.rutaId]),
  );

  // Listener para actualizaciones de ubicación en tiempo real
  useEffect(() => {
    if (!enRuta || !user?.uid || !ruta?.id) {
      return;
    }

    const unsubscribe = firebaseService.subscribeToUbicacionConductor(
      user.uid,
      (ubicacion) => {
        setUbicacionActual(ubicacion);
      },
    );

    return () => unsubscribe();
  }, [enRuta, user?.uid, ruta?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    cargarRuta();
  };

  const handleIniciarRuta = async () => {
    if (!ruta?.id || !user?.uid || !user?.nombre || !user?.unidad) {
      if (Platform.OS === "web") {
        window.alert("Error: No tienes una ruta asignada");
      } else {
        Alert.alert("Error", "No tienes una ruta asignada");
      }
      return;
    }

    if (enRuta) {
      // Detener ruta
      const confirmar =
        Platform.OS === "web"
          ? window.confirm("¿Deseas detener el compartir tu ubicación?")
          : await new Promise<boolean>((resolve) => {
              Alert.alert(
                "Finalizar Ruta",
                "¿Deseas detener el compartir tu ubicación?",
                [
                  {
                    text: "Cancelar",
                    style: "cancel",
                    onPress: () => resolve(false),
                  },
                  {
                    text: "Finalizar",
                    style: "destructive",
                    onPress: () => resolve(true),
                  },
                ],
              );
            });

      if (confirmar) {
        try {
          await locationService.stopTracking();

          // Enviar notificación de ruta finalizada
          await notifyRutaFinalizada(ruta.id!, user.nombre, user.unidad || "");

          // Actualizar estado de ruta a finalizada
          await firebaseService.actualizarEstadoRuta(ruta.id!, "finalizada");

          setEnRuta(false);
          setUbicacionActual(null);

          if (Platform.OS === "web") {
            window.alert(
              "Ruta Finalizada: Has dejado de compartir tu ubicación",
            );
          } else {
            Alert.alert(
              "Ruta Finalizada",
              "Has dejado de compartir tu ubicación",
            );
          }
        } catch (error) {
          console.error("Error al finalizar ruta:", error);
          if (Platform.OS === "web") {
            window.alert("Error: No se pudo finalizar la ruta");
          } else {
            Alert.alert("Error", "No se pudo finalizar la ruta");
          }
        }
      }
    } else {
      // Iniciar ruta
      const success = await locationService.startTracking(
        user.uid,
        user.nombre,
        ruta.id,
        user.unidad,
      );

      if (success) {
        try {
          // Actualizar estado de ruta a activa PRIMERO
          await firebaseService.actualizarEstadoRuta(ruta.id!, "activa");

          // Enviar notificación de ruta iniciada (incluye admin)
          await notifyRutaIniciada(ruta.id!, user.nombre, user.unidad || "");

          setEnRuta(true);

          if (Platform.OS === "web") {
            window.alert(
              "Ruta Iniciada: Ahora estás compartiendo tu ubicación en tiempo real",
            );
          } else {
            Alert.alert(
              "Ruta Iniciada",
              "Ahora estás compartiendo tu ubicación en tiempo real",
            );
          }
        } catch (error) {
          console.error("Error al actualizar estado de ruta:", error);
          setEnRuta(true);
        }
      } else {
        if (Platform.OS === "web") {
          window.alert(
            "Error: No se pudo iniciar el tracking. Verifica que los permisos de ubicación estén activados.",
          );
        } else {
          Alert.alert(
            "Error",
            "No se pudo iniciar el tracking. Verifica que los permisos de ubicación estén activados.",
          );
        }
      }
    }
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
          Panel de Conductor
        </ThemedText>

        {/* Estado actual */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: enRuta
                ? isDarkMode
                  ? "rgba(76,175,80,0.2)"
                  : "rgba(76,175,80,0.1)"
                : undefined,
            },
          ]}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 8,
            }}
          >
            <View
              style={[
                styles.iconBadge,
                {
                  backgroundColor: enRuta ? "#4CAF50" : "#9E9E9E",
                  marginRight: 12,
                },
              ]}
            >
              <Ionicons
                name={enRuta ? "radio-button-on" : "radio-button-off"}
                size={20}
                color="#FFF"
              />
            </View>
            <View>
              <ThemedText style={styles.label}>Estado actual</ThemedText>
              <ThemedText
                style={[
                  styles.valor,
                  { color: enRuta ? "#4CAF50" : undefined },
                ]}
              >
                {enRuta ? "🟢 En Ruta" : "⚪ Detenido"}
              </ThemedText>
            </View>
          </View>
          {enRuta && (
            <ThemedText
              style={[
                styles.bodyText,
                { fontSize: 12, opacity: 0.7, marginTop: 8 },
              ]}
            >
              UBICACIÓN: Compartiendo ubicación en tiempo real
            </ThemedText>
          )}
        </View>

        {/* Mapa de ruta en curso */}
        {enRuta && ruta && (
          <View style={localStyles.mapContainer}>
            <View
              style={[
                localStyles.progressHeader,
                { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" },
              ]}
            >
              <View style={localStyles.progressInfo}>
                <Ionicons name="navigate" size={20} color="#4CAF50" />
                <ThemedText style={localStyles.progressText}>
                  RUTA EN CURSO
                </ThemedText>
              </View>
              <ThemedText style={localStyles.progressPercentage}>
                {ruta.direcciones && ruta.direcciones.length > 0
                  ? Math.round(
                      (direccionesCompletadas.length /
                        ruta.direcciones.length) *
                        100,
                    )
                  : 0}
                %
              </ThemedText>
            </View>

            {Platform.OS === "web" ? (
              <View
                style={[
                  localStyles.webMapPlaceholder,
                  { backgroundColor: isDarkMode ? "#2A2A2A" : "#F5F5F5" },
                ]}
              >
                <Ionicons
                  name="map-outline"
                  size={48}
                  color={isDarkMode ? "#666" : "#999"}
                />
                <ThemedText style={{ marginTop: 12, opacity: 0.7 }}>
                  Mapa disponible en app móvil
                </ThemedText>
                {ubicacionActual && (
                  <View
                    style={{
                      marginTop: 16,
                      padding: 12,
                      backgroundColor: isDarkMode ? "#333" : "#E8F5E9",
                      borderRadius: 8,
                    }}
                  >
                    <ThemedText style={{ fontSize: 12, color: "#4CAF50" }}>
                      UBICACIÓN: {ubicacionActual.conductorNombre}
                    </ThemedText>
                    <ThemedText
                      style={{ fontSize: 11, marginTop: 4, opacity: 0.7 }}
                    >
                      Unidad {ubicacionActual.unidad}
                    </ThemedText>
                  </View>
                )}
              </View>
            ) : (
              <ConductorMapView
                ubicacionActual={ubicacionActual}
                ruta={ruta}
                direccionesCompletadas={direccionesCompletadas}
                onMarcarDireccion={(direccion) => {
                  if (!direccionesCompletadas.includes(direccion)) {
                    setDireccionesCompletadas([
                      ...direccionesCompletadas,
                      direccion,
                    ]);
                  }
                }}
              />
            )}

            {ruta.direcciones && ruta.direcciones.length > 0 && (
              <View
                style={[
                  localStyles.direccionesList,
                  { backgroundColor: isDarkMode ? "#1E1E1E" : "#FFF" },
                ]}
              >
                <ThemedText style={localStyles.direccionesTitle}>
                  PUNTOS DE RECOLECCIÓN:
                </ThemedText>
                <ScrollView
                  style={{ maxHeight: 120 }}
                  showsVerticalScrollIndicator={false}
                >
                  {ruta.direcciones.map((dir, index) => {
                    const completado = direccionesCompletadas.includes(dir);
                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          localStyles.direccionItem,
                          {
                            backgroundColor: completado
                              ? isDarkMode
                                ? "rgba(76,175,80,0.2)"
                                : "rgba(76,175,80,0.1)"
                              : "transparent",
                          },
                        ]}
                        onPress={() => {
                          if (completado) {
                            setDireccionesCompletadas(
                              direccionesCompletadas.filter((d) => d !== dir),
                            );
                          } else {
                            setDireccionesCompletadas([
                              ...direccionesCompletadas,
                              dir,
                            ]);
                          }
                        }}
                      >
                        <Ionicons
                          name={
                            completado ? "checkmark-circle" : "ellipse-outline"
                          }
                          size={20}
                          color={
                            completado
                              ? "#4CAF50"
                              : isDarkMode
                                ? "#666"
                                : "#999"
                          }
                        />
                        <ThemedText
                          style={[
                            localStyles.direccionText,
                            {
                              textDecorationLine: completado
                                ? "line-through"
                                : "none",
                              opacity: completado ? 0.6 : 1,
                            },
                          ]}
                        >
                          {dir}
                        </ThemedText>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            <TouchableOpacity
              style={[
                localStyles.pausarButton,
                { backgroundColor: isDarkMode ? "#8B4513" : "#FF9800" },
              ]}
              onPress={() => {
                Alert.alert(
                  "Pausar Ruta",
                  "Esta función estará disponible próximamente",
                );
              }}
            >
              <Ionicons name="pause" size={20} color="#FFF" />
              <ThemedText style={localStyles.pausarText}>
                PAUSAR RUTA
              </ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                localStyles.finalizarButton,
                { backgroundColor: "#E53935" },
              ]}
              onPress={handleIniciarRuta}
            >
              <Ionicons name="checkmark-circle" size={20} color="#FFF" />
              <ThemedText style={localStyles.finalizarText}>
                FINALIZAR RUTA
              </ThemedText>
            </TouchableOpacity>
          </View>
        )}

        {/* Información de ruta */}
        {!enRuta && ruta ? (
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
                      backgroundColor: ruta.color || "#2196F3",
                      marginRight: 12,
                    },
                  ]}
                >
                  <Ionicons name="map" size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.label}>Ruta Asignada</ThemedText>
                  <ThemedText style={styles.sectionTitle}>
                    {ruta.nombre}
                  </ThemedText>
                </View>
              </View>

              <View style={{ marginTop: 8 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Ionicons
                    name="location"
                    size={16}
                    color={isDarkMode ? "#AAA" : "#666"}
                  />
                  <ThemedText
                    style={{ fontSize: 13, opacity: 0.7, marginLeft: 6 }}
                  >
                    {ruta.calle}, {ruta.colonia}
                  </ThemedText>
                </View>
                {ruta.horario && (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 6,
                    }}
                  >
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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="people"
                    size={16}
                    color={isDarkMode ? "#AAA" : "#666"}
                  />
                  <ThemedText
                    style={{ fontSize: 13, opacity: 0.7, marginLeft: 6 }}
                  >
                    {ruta.usuariosCount || 0} usuario
                    {ruta.usuariosCount !== 1 ? "s" : ""}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Botón iniciar ruta */}
            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: "#4CAF50",
                  paddingVertical: 16,
                },
              ]}
              onPress={handleIniciarRuta}
            >
              <Ionicons name="play-circle" size={24} color="#FFF" />
              <ThemedText
                style={[styles.buttonText, { fontSize: 16, marginLeft: 12 }]}
              >
                Iniciar Ruta
              </ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.card}>
            <View style={{ alignItems: "center", paddingVertical: 20 }}>
              <Ionicons
                name="alert-circle-outline"
                size={48}
                color={isDarkMode ? "#666" : "#999"}
              />
              <ThemedText
                style={{ marginTop: 12, textAlign: "center", opacity: 0.7 }}
              >
                No tienes una ruta asignada
              </ThemedText>
              <ThemedText
                style={{
                  marginTop: 4,
                  fontSize: 12,
                  textAlign: "center",
                  opacity: 0.5,
                }}
              >
                Contacta al administrador para que te asigne una ruta
              </ThemedText>
            </View>
          </View>
        )}

        {/* Información adicional */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Tu Información</ThemedText>
          <View style={[styles.row, { marginTop: 12 }]}>
            <ThemedText style={styles.label2}>Unidad:</ThemedText>
            <ThemedText style={styles.label2}>
              {user?.unidad || "N/A"}
            </ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={styles.label2}>Nombre:</ThemedText>
            <ThemedText style={styles.label2}>{user?.nombre}</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

// Estilos específicos para el mapa de conductor
const localStyles = StyleSheet.create({
  mapContainer: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  progressInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  progressText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4CAF50",
  },
  progressPercentage: {
    fontSize: 24,
    fontWeight: "700",
    color: "#4CAF50",
  },
  webMapPlaceholder: {
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  direccionesList: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  direccionesTitle: {
    fontSize: 12,
    fontWeight: "700",
    opacity: 0.7,
    marginBottom: 12,
  },
  direccionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    gap: 12,
  },
  direccionText: {
    fontSize: 13,
    flex: 1,
  },
  pausarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  pausarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
  finalizarButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    gap: 8,
  },
  finalizarText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#FFF",
  },
});
