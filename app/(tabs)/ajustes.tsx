import { useAuthContext } from "@/components/auth-context";
import { useThemeContext } from "@/components/theme-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { firebaseService, RutaData } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    ScrollView,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getModernStyles } from "../_styles/modernStyles";

export default function AjustesScreen() {
  const { theme, setTheme } = useThemeContext();
  const { user, logout, updateUser } = useAuthContext();
  const isDarkMode = theme === "dark";
  const styles = getModernStyles(isDarkMode);

  console.log("⚙️ Usuario en Ajustes:", user);
  useEffect(() => {
    cargarRutas();
    cargarRutaActual();
  }, [user?.rutaId]);

  const cargarRutas = async () => {
    try {
      setLoadingRutas(true);
      const rutasData = await firebaseService.getAllRutas();
      setRutas(rutasData);
    } catch (error) {
      console.error("Error al cargar rutas:", error);
    } finally {
      setLoadingRutas(false);
    }
  };

  const cargarRutaActual = async () => {
    if (user?.rutaId) {
      try {
        const ruta = await firebaseService.getRuta(user.rutaId);
        setRutaActual(ruta);
      } catch (error) {
        console.error("Error al cargar ruta actual:", error);
      }
    }
  };

  const handleChangeRoute = async (rutaId: string) => {
    try {
      if (user?.uid) {
        await firebaseService.updateUserProfile(user.uid, { rutaId });
        updateUser({ rutaId });
        await cargarRutaActual();
        setEditingRoute(false);
        Alert.alert("Éxito", "Ruta actualizada correctamente");
      }
    } catch (error) {
      Alert.alert("Error", "No se pudo cambiar la ruta");
      console.error(error);
    }
  };
  const [editingName, setEditingName] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [editingRoute, setEditingRoute] = useState(false);
  const [tempNombre, setTempNombre] = useState("");
  const [tempDireccion, setTempDireccion] = useState("");
  const [rutas, setRutas] = useState<RutaData[]>([]);
  const [loadingRutas, setLoadingRutas] = useState(false);
  const [rutaActual, setRutaActual] = useState<RutaData | null>(null);

  const handleSaveField = async (
    field: "nombre" | "direccion",
    value: string,
  ) => {
    if (!value.trim()) {
      Alert.alert(
        "Error",
        `El ${field === "nombre" ? "nombre" : "dirección"} no puede estar vacío`,
      );
      return;
    }
    try {
      if (user?.uid) {
        await firebaseService.updateUserProfile(user.uid, { [field]: value });
        updateUser({ [field]: value });
        if (field === "nombre") {
          setEditingName(false);
        } else {
          setEditingAddress(false);
        }
        Alert.alert("Éxito", "Actualizado correctamente");
      }
    } catch {
      Alert.alert("Error", "No se pudo actualizar");
    }
  };

  const EditModal = ({ visible, title, value, onSave, onClose }: any) => (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.6)",
        }}
      >
        <View style={[styles.card, { width: "85%", maxWidth: 400 }]}>
          <ThemedText style={styles.sectionTitle}>{title}</ThemedText>
          <TextInput
            style={[styles.input, { marginBottom: 16 }]}
            placeholder={`Nuevo ${title.toLowerCase()}`}
            placeholderTextColor={
              isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
            }
            value={value}
            onChangeText={title === "Nombre" ? setTempNombre : setTempDireccion}
          />
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TouchableOpacity
              style={[styles.buttonSecondary, { flex: 1 }]}
              onPress={onClose}
            >
              <ThemedText style={styles.buttonSecondaryText}>
                Cancelar
              </ThemedText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, { flex: 1 }]}
              onPress={onSave}
            >
              <ThemedText style={styles.buttonText}>Guardar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/trace1_logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <ThemedText type="title" style={styles.title}>
          Configuración
        </ThemedText>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Apariencia</ThemedText>
          <View style={styles.spaceBetween}>
            <ThemedText style={styles.bodyText}>
              {isDarkMode ? "Modo Oscuro" : "Modo Claro"}
            </ThemedText>
            <Switch
              value={isDarkMode}
              onValueChange={(value) => setTheme(value ? "dark" : "light")}
              trackColor={{ false: "#E8F5E9", true: "#1B5E20" }}
              thumbColor={isDarkMode ? "#43A047" : "#FFB300"}
            />
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Perfil</ThemedText>

          <View style={{ marginBottom: 16 }}>
            <View style={[styles.spaceBetween, { marginBottom: 8 }]}>
              <ThemedText style={styles.label}>Nombre</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setTempNombre(user?.nombre || "");
                  setEditingName(true);
                }}
              >
                <Ionicons name="pencil" size={18} color="#43A047" />
              </TouchableOpacity>
            </View>
            <ThemedText
              style={[styles.bodyText, !user?.nombre && { opacity: 0.5 }]}
            >
              {user?.nombre || "No configurado"}
            </ThemedText>
          </View>

          <View style={{ marginBottom: 16 }}>
            <View style={[styles.spaceBetween, { marginBottom: 8 }]}>
              <ThemedText style={styles.label}>Dirección</ThemedText>
              <TouchableOpacity
                onPress={() => {
                  setTempDireccion(user?.direccion || "");
                  setEditingAddress(true);
                }}
              >
                <Ionicons name="pencil" size={18} color="#43A047" />
              </TouchableOpacity>
            </View>
            <ThemedText
              style={[styles.bodyText, !user?.direccion && { opacity: 0.5 }]}
            >
              {user?.direccion || "No configurada"}
            </ThemedText>
          </View>

          <View style={styles.divider} />

          <View style={{ marginTop: 12 }}>
            <ThemedText style={[styles.label, { marginBottom: 4 }]}>
              Email
            </ThemedText>
            <ThemedText
              style={[styles.bodyText, !user?.email && { opacity: 0.5 }]}
            >
              {user?.email || "No configurado"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Ruta Asignada</ThemedText>
          <View style={[styles.spaceBetween, { marginBottom: 8 }]}>
            <ThemedText style={styles.label}>Mi Ruta</ThemedText>
            <TouchableOpacity onPress={() => setEditingRoute(true)}>
              <Ionicons name="swap-horizontal" size={18} color="#43A047" />
            </TouchableOpacity>
          </View>
          <ThemedText
            style={[styles.bodyText, !rutaActual && { opacity: 0.5 }]}
          >
            {rutaActual?.nombre || "Sin ruta asignada"}
          </ThemedText>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Información</ThemedText>
          <ThemedText style={[styles.bodyText, { marginBottom: 8 }]}>
            Versión 1.0.0
          </ThemedText>
          <ThemedText style={styles.bodyText}>
            Tema: {isDarkMode ? "Oscuro" : "Claro"}
          </ThemedText>
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: "#E53935" }]}
          onPress={logout}
        >
          <ThemedText style={styles.buttonText}>Cerrar Sesión</ThemedText>
        </TouchableOpacity>
      </ScrollView>

      <EditModal
        visible={editingName}
        title="Nombre"
        value={tempNombre}
        onSave={() => handleSaveField("nombre", tempNombre)}
        onClose={() => setEditingName(false)}
      />

      <EditModal
        visible={editingAddress}
        title="Dirección"
        value={tempDireccion}
        onSave={() => handleSaveField("direccion", tempDireccion)}
        onClose={() => setEditingAddress(false)}
      />

      <Modal
        visible={editingRoute}
        transparent
        animationType="fade"
        onRequestClose={() => setEditingRoute(false)}
      >
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "rgba(0,0,0,0.6)",
          }}
        >
          <View
            style={[
              styles.card,
              { width: "85%", maxWidth: 400, maxHeight: "70%" },
            ]}
          >
            <ThemedText style={styles.sectionTitle}>Cambiar Ruta</ThemedText>
            <ThemedText
              style={[styles.bodyText, { marginBottom: 16, opacity: 0.7 }]}
            >
              Selecciona una ruta diferente:
            </ThemedText>

            {loadingRutas ? (
              <ActivityIndicator
                size="large"
                color="#43A047"
                style={{ marginVertical: 20 }}
              />
            ) : (
              <ScrollView style={{ maxHeight: 300 }}>
                {rutas.map((ruta) => (
                  <TouchableOpacity
                    key={ruta.id}
                    style={[
                      styles.card,
                      {
                        marginBottom: 12,
                        borderWidth: user?.rutaId === ruta.id ? 2 : 0,
                        borderColor: "#43A047",
                      },
                    ]}
                    onPress={() => ruta.id && handleChangeRoute(ruta.id)}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <View style={{ flex: 1 }}>
                        <ThemedText style={[styles.label, { marginBottom: 4 }]}>
                          {ruta.nombre}
                        </ThemedText>
                        <ThemedText
                          style={[
                            styles.bodyText,
                            { fontSize: 12, opacity: 0.7 },
                          ]}
                        >
                          UBICACIÓN: {ruta.calle}, {ruta.colonia}
                        </ThemedText>
                      </View>
                      {user?.rutaId === ruta.id && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color="#43A047"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}

            <TouchableOpacity
              style={[styles.buttonSecondary, { marginTop: 16 }]}
              onPress={() => setEditingRoute(false)}
            >
              <ThemedText style={styles.buttonSecondaryText}>Cerrar</ThemedText>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
