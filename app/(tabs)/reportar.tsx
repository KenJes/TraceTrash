import { useAuthContext } from "@/components/auth-context";
import { useThemeContext } from "@/components/theme-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { firebaseService } from "@/services/firebase";
import {
    sanitizeText,
    validateReportDescription
} from "@/utils/input-validator";
import { canPerformAction, RATE_LIMITS } from "@/utils/rate-limiter";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Modal,
    ScrollView,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getModernStyles } from "../_styles/modernStyles";

export default function ReportarScreen() {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const router = useRouter();
  const isDarkMode = theme === "dark";
  const styles = getModernStyles(isDarkMode);
  const isConductor = user?.rol === "conductor";

  const [tipoIncidencia, setTipoIncidencia] = useState<string>(
    isConductor ? "falla_motor" : "camion_no_paso",
  );
  const [descripcion, setDescripcion] = useState("");
  const [ubicacion, setUbicacion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("");
  const [ubicacionManual, setUbicacionManual] = useState("");
  const [mostrarInputUbicacion, setMostrarInputUbicacion] = useState(false);

  // Opciones de incidencia según el rol
  const opcionesConductor = [
    { label: "Falla en el motor", value: "falla_motor" },
    { label: "Llanta ponchada", value: "llanta_ponchada" },
    { label: "Accidente de tráfico", value: "accidente_trafico" },
    { label: "Vía bloqueada", value: "via_bloqueada" },
    { label: "Falla mecánica", value: "falla_mecanica" },
    { label: "Falta de combustible", value: "falta_combustible" },
    { label: "Problema con carga", value: "problema_carga" },
    { label: "Otro", value: "otro" },
  ];

  const opcionesResidente = [
    { label: "El camión no pasó", value: "camion_no_paso" },
    { label: "Acumulación de basura", value: "acumulacion_basura" },
    { label: "Basura regada", value: "basura_regada" },
    { label: "Contenedor lleno o dañado", value: "contenedor_danado" },
    { label: "Otro", value: "otro" },
  ];

  const opcionesIncidencia = isConductor
    ? opcionesConductor
    : opcionesResidente;

  // Sincronizar el tipo de incidencia cuando cambia el rol
  React.useEffect(() => {
    const valorInicial = isConductor ? "falla_motor" : "camion_no_paso";
    setTipoIncidencia(valorInicial);
  }, [isConductor]);

  // Usar dirección del usuario
  const usarDireccionUsuario = () => {
    if (user?.direccion) {
      setUbicacion(user.direccion);
      Alert.alert("Ubicación agregada", "Se usará tu dirección registrada");
    } else {
      Alert.alert(
        "Sin dirección",
        "No tienes una dirección registrada en tu perfil",
      );
    }
  };

  // Escribir ubicación manualmente
  const abrirInputUbicacion = () => {
    setMostrarInputUbicacion(true);
  };

  const guardarUbicacionManual = () => {
    if (ubicacionManual.trim()) {
      setUbicacion(ubicacionManual.trim());
      setMostrarInputUbicacion(false);
      Alert.alert("Ubicación agregada", "Ubicación guardada correctamente");
    } else {
      Alert.alert("Error", "Escribe una ubicación válida");
    }
  };

  // Obtener ubicación GPS actual
  const handleObtenerUbicacionGPS = async () => {
    try {
      setLoadingMessage("Obteniendo ubicación GPS...");

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Se necesita acceso a la ubicación");
        setLoadingMessage("");
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;

      setUbicacion(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);

      Alert.alert("Ubicación obtenida", "Tu ubicación GPS ha sido registrada");
    } catch (error: any) {
      console.error("Error al obtener ubicación:", error);
      Alert.alert("Error", "No se pudo obtener la ubicación GPS");
    } finally {
      setLoadingMessage("");
    }
  };

  /* COMENTADO: Funcionalidad de imágenes (requiere Firebase Storage Blaze o AWS)
	// Tomar foto con cámara
	const tomarFoto = async () => {
		try {
			console.log('Iniciando captura de foto...');
			
			// En web, usar el input nativo de HTML para captura
			if (Platform.OS === 'web') {
				console.log('Modo WEB: usando input HTML para cámara');
				
				// Crear input temporal para captura de cámara
				const input = document.createElement('input');
				input.type = 'file';
				input.accept = 'image/*';
				input.capture = 'environment'; // Usar cámara trasera
				
				input.onchange = async (e: any) => {
					const file = e.target.files?.[0];
					if (file) {
						const reader = new FileReader();
						reader.onloadend = () => {
							const uri = reader.result as string;
							setImagenes([...imagenes, uri]);
							Alert.alert('Foto agregada', 'La foto se agregó correctamente');
							console.log('Foto capturada en web');
						};
						reader.readAsDataURL(file);
					}
				};
				
				input.click();
				return;
			}
			
			// En móvil, usar la cámara nativa de Expo
			console.log('Modo MÓVIL: solicitando permiso de cámara...');
			const { status } = await ImagePicker.requestCameraPermissionsAsync();
			
			if (status !== 'granted') {
				Alert.alert('Permiso denegado', 'Necesitas habilitar el permiso de cámara para tomar fotos');
				return;
			}

			console.log('Abriendo cámara nativa...');
			const result = await ImagePicker.launchCameraAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.7,
				cameraType: ImagePicker.CameraType.back,
			});

			console.log('Resultado de cámara:', result);

			if (!result.canceled && result.assets && result.assets[0]) {
				const newImageUri = result.assets[0].uri;
				console.log('Foto agregada:', newImageUri);
				setImagenes([...imagenes, newImageUri]);
				Alert.alert('Foto agregada', 'La foto se agregó correctamente');
			}
		} catch (error: any) {
			console.error('Error al tomar foto:', error);
			Alert.alert('Error', `No se pudo acceder a la cámara: ${error.message}`);
		}
	};

	// Seleccionar foto de galería
	const seleccionarDeGaleria = async () => {
		try {
			const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
			if (status !== 'granted') {
				Alert.alert('Permiso denegado', 'Se necesita acceso a la galería');
				return;
			}

			const result = await ImagePicker.launchImageLibraryAsync({
				mediaTypes: ImagePicker.MediaTypeOptions.Images,
				allowsEditing: true,
				aspect: [4, 3],
				quality: 0.7,
			});

			if (!result.canceled && result.assets && result.assets[0]) {
				const newImageUri = result.assets[0].uri;
				console.log('Imagen de galería:', newImageUri);
				setImagenes([...imagenes, newImageUri]);
			}
		} catch (error: any) {
			console.error('Error al seleccionar imagen:', error);
			Alert.alert('Error', 'No se pudo acceder a la galería');
		}
	};

	// Eliminar una imagen
	const handleEliminarImagen = (index: number) => {
		const nuevasImagenes = imagenes.filter((_, i) => i !== index);
		setImagenes(nuevasImagenes);
	};
	*/

  const handleEnviar = async () => {
    if (!user || !user.uid) {
      Alert.alert("Error", "Debes iniciar sesión para reportar una incidencia");
      return;
    }

    // Validar descripción
    const descValidation = validateReportDescription(descripcion);
    if (!descValidation.valid) {
      Alert.alert("Error", descValidation.error);
      return;
    }

    // Verificar rate limit (5 reportes por hora)
    const canReport = canPerformAction(
      user.uid,
      "create_report",
      RATE_LIMITS.CREATE_REPORT.maxActions,
      RATE_LIMITS.CREATE_REPORT.timeWindowMs,
    );

    if (!canReport) {
      Alert.alert(
        "Límite excedido",
        "Has alcanzado el límite de reportes por hora. Intenta más tarde.",
      );
      return;
    }

    setIsLoading(true);
    setLoadingMessage("Enviando reporte...");

    try {
      // Sanitizar descripción
      const descripcionSanitizada = sanitizeText(descripcion);
      const ubicacionSanitizada = ubicacion
        ? sanitizeText(ubicacion)
        : "No especificada";

      setLoadingMessage("Guardando reporte...");
      await firebaseService.createIncidencia({
        tipoIncidencia,
        descripcion: descripcionSanitizada,
        ubicacion: ubicacionSanitizada,
        imagenes: [],
        usuarioId: user.uid!,
        usuarioEmail: user.email,
        usuarioNombre: user.nombre,
        usuarioRol: user.rol || "residente",
        estado: "pendiente",
      });

      console.log("Incidencia enviada con éxito");
      setLoadingMessage("Reporte enviado exitosamente");

      setTimeout(() => {
        setDescripcion("");
        setUbicacion(null);
        setTipoIncidencia(isConductor ? "falla_motor" : "camion_no_paso");
        setIsLoading(false);
        setLoadingMessage("");
        router.push("/(tabs)/reportes");
      }, 1500);
    } catch (error: any) {
      setIsLoading(false);
      setLoadingMessage("");
      Alert.alert(
        "Error",
        error.message ||
          "No se pudo enviar el reporte. Verifica tu conexión a internet.",
      );
    }
  };

  return (
    <ThemedView style={styles.container}>
      {/* Modal de carga */}
      <Modal transparent visible={isLoading} animationType="fade">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.7)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: isDarkMode ? "#1a1a1a" : "#fff",
              padding: 30,
              borderRadius: 16,
              alignItems: "center",
              minWidth: 200,
            }}
          >
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText
              style={{ marginTop: 16, fontSize: 16, fontWeight: "600" }}
            >
              {loadingMessage}
            </ThemedText>
          </View>
        </View>
      </Modal>

      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <ThemedText type="title" style={styles.title}>
          Reportar incidencia
        </ThemedText>
        <ThemedText type="subtitle" style={styles.subtitulo}>
          {isConductor
            ? "Reporta problemas durante tu ruta de recolección"
            : "Ayúdanos a mejorar el servicio de recolección de basura"}
        </ThemedText>

        <View style={styles.card}>
          <ThemedText style={styles.label}>Tipo de Incidencia</ThemedText>
          <View style={styles.chipContainer}>
            {opcionesIncidencia.map((opcion) => (
              <TouchableOpacity
                key={opcion.value}
                style={[
                  styles.chip,
                  { minWidth: "45%" },
                  tipoIncidencia === opcion.value && styles.chipSelected,
                ]}
                onPress={() => {
                  console.log("Seleccionando:", opcion.value);
                  setTipoIncidencia(opcion.value);
                }}
              >
                <ThemedText
                  style={[
                    styles.chipText,
                    tipoIncidencia === opcion.value && styles.chipTextSelected,
                  ]}
                >
                  {opcion.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.inputLabel}>
            Descripción del problema
          </ThemedText>
          <TextInput
            style={styles.input}
            placeholder="Describe la incidencia..."
            placeholderTextColor={
              isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
            }
            value={descripcion}
            onChangeText={setDescripcion}
            multiline
            numberOfLines={4}
            maxLength={500}
            accessibilityLabel="Descripción de la incidencia"
          />
        </View>

        <View style={styles.card}>
          <ThemedText style={styles.label}>Ubicación</ThemedText>

          {ubicacion && (
            <View
              style={{
                backgroundColor: isDarkMode
                  ? "rgba(76, 175, 80, 0.2)"
                  : "rgba(76, 175, 80, 0.1)",
                padding: 12,
                borderRadius: 12,
                marginBottom: 12,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <ThemedText style={{ flex: 1, fontSize: 14 }}>
                {ubicacion}
              </ThemedText>
              <TouchableOpacity onPress={() => setUbicacion(null)}>
                <ThemedText style={{ color: "#E53935", fontWeight: "600" }}>
                  Borrar
                </ThemedText>
              </TouchableOpacity>
            </View>
          )}

          {mostrarInputUbicacion ? (
            <View>
              <TextInput
                style={[styles.input, { marginBottom: 8 }]}
                placeholder="Escribe la ubicación..."
                placeholderTextColor={
                  isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                }
                value={ubicacionManual}
                onChangeText={setUbicacionManual}
              />
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={[
                    styles.boton,
                    { flex: 1, backgroundColor: "#4CAF50" },
                  ]}
                  onPress={guardarUbicacionManual}
                >
                  <ThemedText style={styles.botonTexto}>Guardar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.boton,
                    { flex: 1, backgroundColor: "#9E9E9E" },
                  ]}
                  onPress={() => {
                    setMostrarInputUbicacion(false);
                    setUbicacionManual("");
                  }}
                >
                  <ThemedText style={styles.botonTexto}>Cancelar</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                flexWrap: "wrap",
              }}
            >
              <ThemedText style={{ flex: 1, fontSize: 14, opacity: 0.7 }}>
                Selecciona cómo agregar ubicación:
              </ThemedText>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: "#2196F3",
                    padding: 10,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={abrirInputUbicacion}
                >
                  <Ionicons name="create-outline" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#FF9800",
                    padding: 10,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={usarDireccionUsuario}
                >
                  <Ionicons name="home-outline" size={24} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: "#4CAF50",
                    padding: 10,
                    borderRadius: 12,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={handleObtenerUbicacionGPS}
                  disabled={!!loadingMessage}
                >
                  <Ionicons name="location-outline" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.boton,
            (isLoading || !descripcion.trim()) && { opacity: 0.6 },
          ]}
          onPress={handleEnviar}
          disabled={isLoading || !descripcion.trim()}
        >
          <ThemedText style={styles.botonTexto}>Enviar Reporte</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}
