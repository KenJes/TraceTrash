import { useAuthContext } from "@/components/auth-context";
import { useThemeContext } from "@/components/theme-context";
import { ThemedText } from "@/components/themed-text";
import { firebaseService } from "@/services/firebase";
import { findNearestRoute } from "@/services/geocoding";
import {
    sanitizeUserData,
    validateRegistrationForm,
} from "@/utils/input-sanitizer";
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getModernStyles } from "./_styles/modernStyles";

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onBackPress: () => void;
}

export default function RegisterScreen({
  onRegisterSuccess,
  onBackPress,
}: RegisterScreenProps) {
  const { theme } = useThemeContext();
  const { login } = useAuthContext();
  const isDarkMode = theme === "dark";
  const styles = getModernStyles(isDarkMode);

  const [registerEmail, setRegisterEmail] = useState("");
  const [registerNombre, setRegisterNombre] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState("");
  const [registerCalle, setRegisterCalle] = useState("");
  const [registerNumero, setRegisterNumero] = useState("");
  const [registerColonia, setRegisterColonia] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] =
    useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<{
    email?: string;
    nombre?: string;
    password?: string;
    confirmPassword?: string;
    calle?: string;
    numero?: string;
    colonia?: string;
  }>({});

  const validateRegister = () => {
    const validation = validateRegistrationForm({
      email: registerEmail,
      password: registerPassword,
      confirmPassword: registerConfirmPassword,
      nombre: registerNombre,
    });

    // Validaciones adicionales para dirección
    const addressErrors: Record<string, string> = {};
    if (!registerCalle.trim()) addressErrors.calle = "Calle requerida";
    if (!registerNumero.trim()) addressErrors.numero = "Número requerido";
    if (!registerColonia.trim()) addressErrors.colonia = "Colonia requerida";

    const allErrors = { ...validation.errors, ...addressErrors };
    setRegisterErrors(allErrors);
    return Object.keys(allErrors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateRegister()) return;
    setIsLoading(true);
    try {
      // 1. Solicitar permisos de ubicación
      console.log("[REGISTER] Solicitando permisos de ubicación...");
      const { status } = await Location.requestForegroundPermissionsAsync();

      let userLat: number | undefined;
      let userLon: number | undefined;
      let nearestRouteId: string | undefined;

      if (status === "granted") {
        try {
          // 2. Obtener ubicación actual
          console.log("[REGISTER] Obteniendo ubicación actual...");
          const location = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.High,
          });
          userLat = location.coords.latitude;
          userLon = location.coords.longitude;
          console.log(`[REGISTER] Ubicación obtenida: ${userLat}, ${userLon}`);

          // 3. Buscar ruta más cercana
          console.log("[REGISTER] Buscando ruta más cercana...");
          const allRutas = await firebaseService.getAllRutas();
          const nearestRoute = findNearestRoute(userLat, userLon, allRutas);

          if (nearestRoute) {
            nearestRouteId = nearestRoute.id;
            console.log(`[REGISTER] Ruta asignada: ${nearestRoute.nombre}`);
          } else {
            console.warn("[REGISTER] No se encontró ruta cercana");
          }
        } catch (locError) {
          console.warn("[REGISTER] Error obteniendo ubicación:", locError);
          // Continuar sin ubicación
        }
      } else {
        console.warn("[REGISTER] Permisos de ubicación denegados");
      }

      // 4. Sanitizar datos antes de enviar
      const sanitizedData = sanitizeUserData({
        email: registerEmail,
        nombre: registerNombre,
        calle: registerCalle,
        numero: registerNumero,
        colonia: registerColonia,
      });

      // 5. Registrar usuario
      const userData = await firebaseService.register(
        sanitizedData.email!,
        registerPassword,
        sanitizedData.nombre!,
        sanitizedData.calle!,
        sanitizedData.numero!,
        sanitizedData.colonia!,
        nearestRouteId, // Pasar rutaId asignada automáticamente
      );

      // 6. Guardar ubicación si se obtuvo
      if (userLat && userLon && userData.uid) {
        await firebaseService.updateUserLocation(
          userData.uid,
          userLat,
          userLon,
        );
        console.log("[SUCCESS] Ubicación guardada para nuevo usuario");
      }

      // 7. Construir dirección completa
      const direccion = `${userData.calle}, ${userData.numero}, ${userData.colonia}`;

      // 8. Login automático
      const userToLogin = {
        email: userData.email,
        nombre: userData.nombre,
        direccion: direccion,
        rol: userData.rol,
        uid: userData.uid,
        rutaId: userData.rutaId,
      };
      console.log(
        "[REGISTER] Registrando usuario en AuthContext:",
        userToLogin,
      );
      await login(userToLogin);
      setRegisterEmail("");
      setRegisterNombre("");
      setRegisterPassword("");
      setRegisterConfirmPassword("");
      setRegisterCalle("");
      setRegisterNumero("");
      setRegisterColonia("");
      onRegisterSuccess();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Error al registrarse");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
    >
      <>
        <ThemedText type="title" style={styles.title}>
          Crear Cuenta
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Regístrate para comenzar
        </ThemedText>

        <View style={styles.card}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Email</ThemedText>
            <TextInput
              style={[
                styles.input,
                registerErrors.email && { borderColor: "#E53935" },
              ]}
              placeholder="tu@email.com"
              placeholderTextColor={
                isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
              }
              value={registerEmail}
              onChangeText={setRegisterEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!isLoading}
            />
            {registerErrors.email && (
              <ThemedText
                style={{ color: "#E53935", fontSize: 12, marginTop: 4 }}
              >
                {registerErrors.email}
              </ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Nombre</ThemedText>
            <TextInput
              style={[
                styles.input,
                registerErrors.nombre && { borderColor: "#E53935" },
              ]}
              placeholder="Nombre completo"
              placeholderTextColor={
                isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
              }
              value={registerNombre}
              onChangeText={setRegisterNombre}
              editable={!isLoading}
            />
            {registerErrors.nombre && (
              <ThemedText
                style={{ color: "#E53935", fontSize: 12, marginTop: 4 }}
              >
                {registerErrors.nombre}
              </ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Contraseña</ThemedText>
            <View style={{ position: "relative" }}>
              <TextInput
                style={[
                  styles.input,
                  registerErrors.password && { borderColor: "#E53935" },
                ]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor={
                  isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                }
                value={registerPassword}
                onChangeText={setRegisterPassword}
                secureTextEntry={!showRegisterPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={{ position: "absolute", right: 12, top: 12 }}
                onPress={() => setShowRegisterPassword(!showRegisterPassword)}
              >
                <Ionicons
                  name={showRegisterPassword ? "eye-off" : "eye"}
                  size={20}
                  color={isDarkMode ? "#888" : "#666"}
                />
              </TouchableOpacity>
            </View>
            {registerErrors.password && (
              <ThemedText
                style={{ color: "#E53935", fontSize: 12, marginTop: 4 }}
              >
                {registerErrors.password}
              </ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Confirmar Contraseña</ThemedText>
            <View style={{ position: "relative" }}>
              <TextInput
                style={[
                  styles.input,
                  registerErrors.confirmPassword && { borderColor: "#E53935" },
                ]}
                placeholder="Repite tu contraseña"
                placeholderTextColor={
                  isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                }
                value={registerConfirmPassword}
                onChangeText={setRegisterConfirmPassword}
                secureTextEntry={!showRegisterConfirmPassword}
                editable={!isLoading}
              />
              <TouchableOpacity
                style={{ position: "absolute", right: 12, top: 12 }}
                onPress={() =>
                  setShowRegisterConfirmPassword(!showRegisterConfirmPassword)
                }
              >
                <Ionicons
                  name={showRegisterConfirmPassword ? "eye-off" : "eye"}
                  size={20}
                  color={isDarkMode ? "#888" : "#666"}
                />
              </TouchableOpacity>
            </View>
            {registerErrors.confirmPassword && (
              <ThemedText
                style={{ color: "#E53935", fontSize: 12, marginTop: 4 }}
              >
                {registerErrors.confirmPassword}
              </ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Calle</ThemedText>
            <TextInput
              style={[
                styles.input,
                registerErrors.calle && { borderColor: "#E53935" },
              ]}
              placeholder="Av. Siempre Viva"
              placeholderTextColor={
                isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
              }
              value={registerCalle}
              onChangeText={setRegisterCalle}
              editable={!isLoading}
            />
            {registerErrors.calle && (
              <ThemedText
                style={{ color: "#E53935", fontSize: 12, marginTop: 4 }}
              >
                {registerErrors.calle}
              </ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Número</ThemedText>
            <TextInput
              style={[
                styles.input,
                registerErrors.numero && { borderColor: "#E53935" },
              ]}
              placeholder="123"
              placeholderTextColor={
                isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
              }
              value={registerNumero}
              onChangeText={setRegisterNumero}
              editable={!isLoading}
            />
            {registerErrors.numero && (
              <ThemedText
                style={{ color: "#E53935", fontSize: 12, marginTop: 4 }}
              >
                {registerErrors.numero}
              </ThemedText>
            )}
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Colonia</ThemedText>
            <TextInput
              style={[
                styles.input,
                registerErrors.colonia && { borderColor: "#E53935" },
              ]}
              placeholder="Centro"
              placeholderTextColor={
                isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
              }
              value={registerColonia}
              onChangeText={setRegisterColonia}
              editable={!isLoading}
            />
            {registerErrors.colonia && (
              <ThemedText
                style={{ color: "#E53935", fontSize: 12, marginTop: 4 }}
              >
                {registerErrors.colonia}
              </ThemedText>
            )}
          </View>

          <TouchableOpacity
            style={[styles.button, isLoading && { opacity: 0.6 }]}
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText style={styles.buttonText}>Registrarse</ThemedText>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={{ marginTop: 16, padding: 12, alignItems: "center" }}
            onPress={onBackPress}
            disabled={isLoading}
          >
            <ThemedText style={{ color: "#43A047", fontWeight: "600" }}>
              Volver
            </ThemedText>
          </TouchableOpacity>
        </View>
      </>
    </KeyboardAvoidingView>
  );
}
