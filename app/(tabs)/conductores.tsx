import { useThemeContext } from "@/components/theme-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { firebaseService, RutaData, UserData } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    RefreshControl,
    ScrollView,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getModernStyles } from "../_styles/modernStyles";

export default function AdminConductoresScreen() {
  const { theme } = useThemeContext();
  const isDarkMode = theme === "dark";
  const styles = getModernStyles(isDarkMode);

  const [conductores, setConductores] = useState<UserData[]>([]);
  const [rutas, setRutas] = useState<RutaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [modalNuevoConductor, setModalNuevoConductor] = useState(false);
  const [modalAsignarRuta, setModalAsignarRuta] = useState(false);
  const [modalEditarConductor, setModalEditarConductor] = useState(false);

  // Form states - Nuevo Conductor
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [unidad, setUnidad] = useState("");

  // Form states - Asignar Ruta
  const [conductorSeleccionado, setConductorSeleccionado] =
    useState<UserData | null>(null);
  const [rutaIdSeleccionada, setRutaIdSeleccionada] = useState("");

  const cargarDatos = async () => {
    try {
      const [usuarios, rutasData] = await Promise.all([
        firebaseService.getAllUsers(),
        firebaseService.getAllRutas(),
      ]);

      const conductoresData = usuarios.filter((u) => u.rol === "conductor");
      setConductores(conductoresData);
      setRutas(rutasData);
    } catch (error: any) {
      console.error("Error al cargar datos:", error);
      Alert.alert("Error", "No se pudieron cargar los datos");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      cargarDatos();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const abrirModalNuevo = () => {
    setEmail("");
    setPassword("");
    setNombre("");
    setUnidad("");
    setModalNuevoConductor(true);
  };

  const abrirModalAsignar = (conductor: UserData) => {
    setConductorSeleccionado(conductor);
    setRutaIdSeleccionada(conductor.rutaId || "");
    setModalAsignarRuta(true);
  };

  const abrirModalEditar = (conductor: UserData) => {
    setConductorSeleccionado(conductor);
    setNombre(conductor.nombre);
    setUnidad(conductor.unidad || "");
    setModalEditarConductor(true);
  };

  const handleRegistrar = async () => {
    if (!email || !password || !nombre) {
      Alert.alert("Error", "Completa todos los campos obligatorios");
      return;
    }

    const result = await firebaseService.registerConductor(
      email,
      password,
      nombre,
    );

    if (result.success) {
      Alert.alert("Éxito", result.message);
      setModalNuevoConductor(false);
      cargarDatos();
    } else {
      Alert.alert("Error", result.message);
    }
  };

  const handleAsignarRuta = async () => {
    if (!conductorSeleccionado || !rutaIdSeleccionada) {
      Alert.alert("Error", "Selecciona una ruta");
      return;
    }

    try {
      await firebaseService.updateUser(conductorSeleccionado.uid, {
        rutaId: rutaIdSeleccionada,
      });
      Alert.alert("Éxito", "Ruta asignada correctamente");
      setModalAsignarRuta(false);
      cargarDatos();
    } catch (error: any) {
      Alert.alert("Error", "No se pudo asignar la ruta");
    }
  };

  const handleActualizarConductor = async () => {
    if (!conductorSeleccionado || !nombre) {
      Alert.alert("Error", "El nombre es obligatorio");
      return;
    }

    try {
      await firebaseService.updateUser(conductorSeleccionado.uid, {
        nombre,
        unidad: unidad || undefined,
      });
      Alert.alert("Éxito", "Conductor actualizado");
      setModalEditarConductor(false);
      cargarDatos();
    } catch (error: any) {
      Alert.alert("Error", "No se pudo actualizar el conductor");
    }
  };

  const handleEliminarConductor = (conductor: UserData) => {
    Alert.alert(
      "Eliminar Conductor",
      `¿Estás seguro de eliminar a ${conductor.nombre}?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            try {
              await firebaseService.deleteUser(conductor.uid);
              Alert.alert("Éxito", "Conductor eliminado");
              cargarDatos();
            } catch (error: any) {
              Alert.alert("Error", "No se pudo eliminar el conductor");
            }
          },
        },
      ],
    );
  };

  const toggleActivo = async (conductor: UserData) => {
    try {
      const nuevoEstado = !conductor.activo;
      await firebaseService.toggleConductorActivo(conductor.uid, nuevoEstado);
      cargarDatos();
    } catch (error: any) {
      console.error("Error al cambiar estado:", error);
      Alert.alert("Error", "No se pudo cambiar el estado");
    }
  };

  const getNombreRuta = (rutaId: string | undefined) => {
    if (!rutaId) return "Sin asignar";
    const ruta = rutas.find((r) => r.id === rutaId);
    return ruta ? ruta.nombre : "Desconocida";
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
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 16,
          }}
        >
          <View>
            <ThemedText type="title" style={styles.title}>
              Gestión de Conductores
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {conductores.length} conductor
              {conductores.length !== 1 ? "es" : ""} • {rutas.length} ruta
              {rutas.length !== 1 ? "s" : ""}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[
              styles.button,
              { paddingHorizontal: 16, paddingVertical: 10 },
            ]}
            onPress={abrirModalNuevo}
          >
            <Ionicons name="person-add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: isDarkMode
                ? "rgba(76,175,80,0.2)"
                : "rgba(76,175,80,0.1)",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <ThemedText
              style={{ fontSize: 28, fontWeight: "bold", color: "#4CAF50" }}
            >
              {conductores.filter((c) => c.activo !== false).length}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
              Activos
            </ThemedText>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: isDarkMode
                ? "rgba(33,150,243,0.2)"
                : "rgba(33,150,243,0.1)",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <ThemedText
              style={{ fontSize: 28, fontWeight: "bold", color: "#2196F3" }}
            >
              {conductores.filter((c) => c.rutaId).length}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
              Con Ruta
            </ThemedText>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: isDarkMode
                ? "rgba(158,158,158,0.2)"
                : "rgba(158,158,158,0.1)",
              padding: 16,
              borderRadius: 12,
              alignItems: "center",
            }}
          >
            <ThemedText
              style={{ fontSize: 28, fontWeight: "bold", color: "#9E9E9E" }}
            >
              {conductores.filter((c) => c.activo === false).length}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
              Inactivos
            </ThemedText>
          </View>
        </View>

        {/* Lista de conductores */}
        {conductores.length === 0 ? (
          <View style={styles.card}>
            <Ionicons
              name="people-outline"
              size={48}
              color="#999"
              style={{ alignSelf: "center", marginBottom: 8 }}
            />
            <ThemedText style={{ textAlign: "center", opacity: 0.7 }}>
              No hay conductores registrados
            </ThemedText>
          </View>
        ) : (
          conductores.map((conductor) => (
            <View
              key={conductor.uid}
              style={[styles.card, { marginBottom: 12 }]}
            >
              {/* Header del conductor */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "flex-start",
                  justifyContent: "space-between",
                  marginBottom: 12,
                }}
              >
                <View
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <View
                    style={[
                      styles.iconBadge,
                      {
                        backgroundColor:
                          conductor.activo !== false ? "#4CAF50" : "#9E9E9E",
                        marginRight: 12,
                      },
                    ]}
                  >
                    <Ionicons name="person" size={20} color="#FFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={{ fontSize: 16, fontWeight: "600" }}>
                      {conductor.nombre}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                      {conductor.email}
                    </ThemedText>
                  </View>
                </View>
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                    {conductor.activo !== false ? "Activo" : "Inactivo"}
                  </ThemedText>
                  <Switch
                    value={conductor.activo !== false}
                    onValueChange={() => toggleActivo(conductor)}
                    trackColor={{ false: "#767577", true: "#4CAF50" }}
                    thumbColor="#FFF"
                  />
                </View>
              </View>

              {/* Información adicional */}
              <View style={{ flexDirection: "row", gap: 12, marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}
                  >
                    UNIDAD
                  </ThemedText>
                  <ThemedText style={{ fontSize: 14 }}>
                    {conductor.unidad || "Sin asignar"}
                  </ThemedText>
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText
                    style={{ fontSize: 11, opacity: 0.5, marginBottom: 4 }}
                  >
                    RUTA
                  </ThemedText>
                  <ThemedText style={{ fontSize: 14 }}>
                    {getNombreRuta(conductor.rutaId)}
                  </ThemedText>
                </View>
              </View>

              {/* Botones de acción */}
              <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: isDarkMode ? "#2196F3" : "#2196F3",
                    paddingVertical: 10,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => abrirModalAsignar(conductor)}
                >
                  <Ionicons name="map" size={16} color="#FFF" />
                  <ThemedText
                    style={{
                      color: "#FFF",
                      fontSize: 13,
                      marginLeft: 6,
                      fontWeight: "600",
                    }}
                  >
                    Asignar Ruta
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: isDarkMode ? "#333" : "#E0E0E0",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                  onPress={() => abrirModalEditar(conductor)}
                >
                  <Ionicons
                    name="create-outline"
                    size={16}
                    color={isDarkMode ? "#FFF" : "#000"}
                  />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: isDarkMode
                      ? "rgba(244,67,54,0.2)"
                      : "rgba(244,67,54,0.1)",
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                  onPress={() => handleEliminarConductor(conductor)}
                >
                  <Ionicons name="trash-outline" size={16} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal: Nuevo Conductor */}
      <Modal visible={modalNuevoConductor} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: isDarkMode ? "#1A1A1A" : "#FFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              maxHeight: "85%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>
                Nuevo Conductor
              </ThemedText>
              <TouchableOpacity onPress={() => setModalNuevoConductor(false)}>
                <Ionicons
                  name="close"
                  size={28}
                  color={isDarkMode ? "#FFF" : "#000"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View
                style={[
                  styles.card,
                  { backgroundColor: isDarkMode ? "#2A2A2A" : "#F5F5F5" },
                ]}
              >
                <ThemedText style={styles.label}>Nombre Completo *</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Juan Pérez"
                  placeholderTextColor={
                    isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                  }
                  value={nombre}
                  onChangeText={setNombre}
                />

                <ThemedText style={styles.label}>Email *</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="conductor@email.com"
                  placeholderTextColor={
                    isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                  }
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <ThemedText style={styles.label}>Contraseña *</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={
                    isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                  }
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <ThemedText style={styles.label}>Unidad (opcional)</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: A-01, CAM-123"
                  placeholderTextColor={
                    isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                  }
                  value={unidad}
                  onChangeText={setUnidad}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, { marginTop: 16 }]}
                onPress={handleRegistrar}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <ThemedText style={[styles.buttonText, { marginLeft: 8 }]}>
                  Registrar Conductor
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Asignar Ruta */}
      <Modal visible={modalAsignarRuta} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: isDarkMode ? "#1A1A1A" : "#FFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              maxHeight: "70%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>
                Asignar Ruta
              </ThemedText>
              <TouchableOpacity onPress={() => setModalAsignarRuta(false)}>
                <Ionicons
                  name="close"
                  size={28}
                  color={isDarkMode ? "#FFF" : "#000"}
                />
              </TouchableOpacity>
            </View>

            {conductorSeleccionado && (
              <View
                style={[
                  styles.card,
                  {
                    marginBottom: 16,
                    backgroundColor: isDarkMode ? "#2A2A2A" : "#F5F5F5",
                  },
                ]}
              >
                <ThemedText
                  style={{ fontSize: 16, fontWeight: "600", marginBottom: 4 }}
                >
                  {conductorSeleccionado.nombre}
                </ThemedText>
                <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                  {conductorSeleccionado.email}
                </ThemedText>
              </View>
            )}

            <ScrollView>
              <ThemedText style={[styles.label, { marginBottom: 12 }]}>
                Seleccionar Ruta
              </ThemedText>

              {rutas.length === 0 ? (
                <View style={styles.card}>
                  <ThemedText style={{ textAlign: "center", opacity: 0.7 }}>
                    No hay rutas disponibles
                  </ThemedText>
                </View>
              ) : (
                <>
                  <TouchableOpacity
                    style={[
                      styles.card,
                      {
                        marginBottom: 8,
                        borderWidth: 2,
                        borderColor: !rutaIdSeleccionada
                          ? "#4CAF50"
                          : "transparent",
                      },
                    ]}
                    onPress={() => setRutaIdSeleccionada("")}
                  >
                    <ThemedText>Sin asignar</ThemedText>
                  </TouchableOpacity>

                  {rutas.map((ruta) => (
                    <TouchableOpacity
                      key={ruta.id}
                      style={[
                        styles.card,
                        {
                          marginBottom: 8,
                          borderWidth: 2,
                          borderColor:
                            rutaIdSeleccionada === ruta.id
                              ? "#2196F3"
                              : "transparent",
                        },
                      ]}
                      onPress={() => setRutaIdSeleccionada(ruta.id!)}
                    >
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
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
                          <Ionicons name="map" size={16} color="#FFF" />
                        </View>
                        <View style={{ flex: 1 }}>
                          <ThemedText style={{ fontWeight: "600" }}>
                            {ruta.nombre}
                          </ThemedText>
                          <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                            {ruta.direcciones?.length || 0} direcciones
                          </ThemedText>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </>
              )}

              <TouchableOpacity
                style={[
                  styles.button,
                  { marginTop: 16, backgroundColor: "#2196F3" },
                ]}
                onPress={handleAsignarRuta}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <ThemedText style={[styles.buttonText, { marginLeft: 8 }]}>
                  Asignar Ruta
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Editar Conductor */}
      <Modal visible={modalEditarConductor} animationType="slide" transparent>
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: isDarkMode ? "#1A1A1A" : "#FFF",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 20,
              maxHeight: "70%",
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 20,
              }}
            >
              <ThemedText style={{ fontSize: 20, fontWeight: "bold" }}>
                Editar Conductor
              </ThemedText>
              <TouchableOpacity onPress={() => setModalEditarConductor(false)}>
                <Ionicons
                  name="close"
                  size={28}
                  color={isDarkMode ? "#FFF" : "#000"}
                />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View
                style={[
                  styles.card,
                  { backgroundColor: isDarkMode ? "#2A2A2A" : "#F5F5F5" },
                ]}
              >
                <ThemedText style={styles.label}>Nombre Completo</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre del conductor"
                  placeholderTextColor={
                    isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                  }
                  value={nombre}
                  onChangeText={setNombre}
                />

                <ThemedText style={styles.label}>Unidad</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: A-01, CAM-123"
                  placeholderTextColor={
                    isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                  }
                  value={unidad}
                  onChangeText={setUnidad}
                />
              </View>

              <TouchableOpacity
                style={[styles.button, { marginTop: 16 }]}
                onPress={handleActualizarConductor}
              >
                <Ionicons name="save" size={20} color="#FFF" />
                <ThemedText style={[styles.buttonText, { marginLeft: 8 }]}>
                  Guardar Cambios
                </ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
