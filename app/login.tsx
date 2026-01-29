import { useAuthContext } from "@/components/auth-context";
import { useThemeContext } from "@/components/theme-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { firebaseService } from "@/services/firebase";
import { validateEmail, validatePassword } from "@/utils/input-sanitizer";
import {
    canPerformAction,
    getTimeUntilReset,
    RATE_LIMITS,
} from "@/utils/rate-limiter";
import {
    addOrUpdateCredential,
    deleteCredential,
    getCredentialsSecurely,
    migrateOldCredentials,
} from "@/utils/secure-storage";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Switch,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { getModernStyles } from "./_styles/modernStyles";
import RegisterScreen from "./register";

export default function LoginScreen() {
  const { theme } = useThemeContext();
  const { login } = useAuthContext();
  const isDarkMode = theme === "dark";
  const styles = getModernStyles(isDarkMode);

  const [screen, setScreen] = useState<"welcome" | "login" | "register">(
    "welcome",
  );
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrors, setLoginErrors] = useState<{
    email?: string;
    password?: string;
  }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [savedUsers, setSavedUsers] = useState<
    Array<{ email: string; password: string }>
  >([]);
  const [showSavedUsers, setShowSavedUsers] = useState(false);

  useEffect(() => {
    cargarCredenciales();
  }, []);

  const cargarCredenciales = async () => {
    try {
      // Migrar credenciales antiguas de AsyncStorage si existen
      await migrateOldCredentials();

      const credentials = await getCredentialsSecurely();
      const manualLogout = credentials.find(
        (c) => c.email === "__MANUAL_LOGOUT__",
      );

      if (credentials.length > 0) {
        // Filtrar el flag de manual logout
        const validCredentials = credentials.filter(
          (c) => c.email !== "__MANUAL_LOGOUT__",
        );
        setSavedUsers(validCredentials);

        // Auto-login con el último usuario si NO fue logout manual
        if (validCredentials.length > 0 && !manualLogout) {
          const lastUser = validCredentials[validCredentials.length - 1];
          setLoginEmail(lastUser.email);
          setLoginPassword(lastUser.password);
          setRememberMe(true);
          autoLogin(lastUser.email, lastUser.password);
        } else if (validCredentials.length > 0) {
          // Solo prellenar campos sin auto-login
          const lastUser = validCredentials[validCredentials.length - 1];
          setLoginEmail(lastUser.email);
          setLoginPassword(lastUser.password);
          setRememberMe(true);
          // Eliminar flag de manual logout
          if (manualLogout) {
            await deleteCredential("__MANUAL_LOGOUT__");
          }
        }
      }
    } catch (error) {
      console.error("[ERROR] Error al cargar credenciales:", error);
    }
  };

  const autoLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const userData = await firebaseService.login(email, password);
      login({
        email: userData.email,
        nombre: userData.nombre,
        direccion:
          userData.direccion ||
          `${userData.calle}, ${userData.numero}, ${userData.colonia}`,
        rol: userData.rol,
        uid: userData.uid,
        rutaId: userData.rutaId,
        unidad: userData.unidad,
      });
    } catch (error) {
      console.log("Auto-login falló, solicitar credenciales");
    } finally {
      setIsLoading(false);
    }
  };

  const validateLogin = () => {
    const errors: { email?: string; password?: string } = {};

    if (!loginEmail.trim()) {
      errors.email = "Email requerido";
    } else if (!validateEmail(loginEmail)) {
      errors.email = "Formato de email inválido";
    }

    const passwordValidation = validatePassword(loginPassword);
    if (!passwordValidation.valid) {
      errors.password = passwordValidation.error;
    }

    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;

    // Verificar rate limit para login (10 intentos por hora)
    const deviceId = loginEmail || "unknown";
    const canAttempt = canPerformAction(
      deviceId,
      "login_attempt",
      RATE_LIMITS.LOGIN_ATTEMPT.maxActions,
      RATE_LIMITS.LOGIN_ATTEMPT.timeWindowMs,
    );

    if (!canAttempt) {
      const timeUntilReset = getTimeUntilReset(
        deviceId,
        "login_attempt",
        RATE_LIMITS.LOGIN_ATTEMPT.timeWindowMs,
      );
      const minutesRemaining = Math.ceil(timeUntilReset / (60 * 1000));
      Alert.alert(
        "Demasiados intentos",
        `Has excedido el límite de intentos de login. Intenta nuevamente en ${minutesRemaining} minutos.`,
      );
      return;
    }

    setIsLoading(true);
    try {
      const userData = await firebaseService.login(loginEmail, loginPassword);

      // Guardar credenciales si "Recordarme" está activado
      if (rememberMe) {
        await addOrUpdateCredential(loginEmail, loginPassword);
        const updatedCredentials = await getCredentialsSecurely();
        setSavedUsers(
          updatedCredentials.filter((c) => c.email !== "__MANUAL_LOGOUT__"),
        );
      }

      login({
        email: userData.email,
        nombre: userData.nombre,
        direccion:
          userData.direccion ||
          `${userData.calle}, ${userData.numero}, ${userData.colonia}`,
        rol: userData.rol,
        uid: userData.uid,
        rutaId: userData.rutaId,
        unidad: userData.unidad,
      });
      setLoginEmail("");
      setLoginPassword("");
    } catch (error: any) {
      const errorMessages: Record<string, string> = {
        "auth/invalid-credential": "Contraseña incorrecta",
        "auth/wrong-password": "Contraseña incorrecta",
        "auth/user-not-found": "Usuario no encontrado",
        "auth/invalid-email": "Email inválido",
        "auth/too-many-requests": "Demasiados intentos. Intenta más tarde",
      };
      Alert.alert(
        "Error",
        errorMessages[error.code] || error.message || "Error al iniciar sesión",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const selectSavedUser = (email: string, password: string) => {
    setLoginEmail(email);
    setLoginPassword(password);
    setRememberMe(true);
    setShowSavedUsers(false);
  };

  const deleteSavedUser = async (email: string) => {
    try {
      await deleteCredential(email);
      const updatedCredentials = await getCredentialsSecurely();
      setSavedUsers(
        updatedCredentials.filter((c) => c.email !== "__MANUAL_LOGOUT__"),
      );

      // Si se elimina el usuario actual, limpiar campos
      if (email === loginEmail) {
        setLoginEmail("");
        setLoginPassword("");
        setRememberMe(false);
      }
    } catch (error) {
      console.error("[ERROR] Error al eliminar usuario:", error);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={{ flex: 1, justifyContent: "center" }}>
            {screen === "welcome" && (
              <>
                <View style={styles.logoContainer}>
                  <Image
                    source={require("../assets/images/trace1_logo.png")}
                    style={styles.logo}
                    resizeMode="contain"
                  />
                </View>
                <ThemedText
                  type="title"
                  style={[
                    styles.title,
                    { textAlign: "center", marginTop: 8, marginBottom: 8 },
                  ]}
                >
                  TraceTrash
                </ThemedText>
                <ThemedText style={[styles.subtitle, { textAlign: "center" }]}>
                  Sistema de Rastreo de Recolección de Residuos
                </ThemedText>

                <View style={styles.card}>
                  <TouchableOpacity
                    style={styles.button}
                    onPress={() => setScreen("login")}
                  >
                    <ThemedText style={styles.buttonText}>
                      Iniciar Sesión
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.buttonSecondary, { marginTop: 12 }]}
                    onPress={() => setScreen("register")}
                  >
                    <ThemedText style={styles.buttonSecondaryText}>
                      Crear Cuenta
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {screen === "login" && (
              <>
                <ThemedText type="title" style={styles.title}>
                  Iniciar Sesión
                </ThemedText>
                <ThemedText style={styles.subtitle}>
                  Accede a tu cuenta
                </ThemedText>

                <View style={styles.card}>
                  <View style={styles.inputGroup}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <ThemedText style={styles.label}>Email</ThemedText>
                      {savedUsers.length > 0 && (
                        <TouchableOpacity
                          onPress={() => setShowSavedUsers(!showSavedUsers)}
                        >
                          <Ionicons name="people" size={20} color="#43A047" />
                        </TouchableOpacity>
                      )}
                    </View>
                    <TextInput
                      style={[
                        styles.input,
                        loginErrors.email && { borderColor: "#E53935" },
                      ]}
                      placeholder="tu@email.com"
                      placeholderTextColor={
                        isDarkMode ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.4)"
                      }
                      value={loginEmail}
                      onChangeText={setLoginEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                    {loginErrors.email && (
                      <ThemedText
                        style={{ color: "#E53935", fontSize: 12, marginTop: 4 }}
                      >
                        {loginErrors.email}
                      </ThemedText>
                    )}

                    {/* Lista de usuarios guardados */}
                    {showSavedUsers && savedUsers.length > 0 && (
                      <View
                        style={{
                          marginTop: 8,
                          backgroundColor: isDarkMode ? "#1a1a1a" : "#f5f5f5",
                          borderRadius: 8,
                          padding: 8,
                          maxHeight: 200,
                        }}
                      >
                        <ThemedText
                          style={{
                            fontSize: 12,
                            opacity: 0.7,
                            marginBottom: 8,
                            paddingHorizontal: 8,
                          }}
                        >
                          Usuarios guardados:
                        </ThemedText>
                        <ScrollView>
                          {savedUsers.map((user, index) => (
                            <View
                              key={index}
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: 10,
                                marginBottom: 4,
                                backgroundColor: isDarkMode
                                  ? "#2a2a2a"
                                  : "#fff",
                                borderRadius: 6,
                              }}
                            >
                              <TouchableOpacity
                                style={{ flex: 1 }}
                                onPress={() =>
                                  selectSavedUser(user.email, user.password)
                                }
                              >
                                <ThemedText style={{ fontSize: 14 }}>
                                  {user.email}
                                </ThemedText>
                              </TouchableOpacity>
                              <TouchableOpacity
                                onPress={() => deleteSavedUser(user.email)}
                                style={{ padding: 4 }}
                              >
                                <Ionicons
                                  name="close-circle"
                                  size={20}
                                  color="#F44336"
                                />
                              </TouchableOpacity>
                            </View>
                          ))}
                        </ScrollView>
                      </View>
                    )}
                  </View>

                  <View style={styles.inputGroup}>
                    <ThemedText style={styles.label}>Contraseña</ThemedText>
                    <View style={{ position: "relative" }}>
                      <TextInput
                        style={[
                          styles.input,
                          loginErrors.password && { borderColor: "#E53935" },
                        ]}
                        placeholder="Ingresa tu contraseña"
                        placeholderTextColor={
                          isDarkMode
                            ? "rgba(255,255,255,0.5)"
                            : "rgba(0,0,0,0.4)"
                        }
                        value={loginPassword}
                        onChangeText={setLoginPassword}
                        secureTextEntry={!showPassword}
                      />
                      <TouchableOpacity
                        style={{ position: "absolute", right: 12, top: 12 }}
                        onPress={() => setShowPassword(!showPassword)}
                      >
                        <Ionicons
                          name={showPassword ? "eye-off" : "eye"}
                          size={20}
                          color={isDarkMode ? "#888" : "#666"}
                        />
                      </TouchableOpacity>
                    </View>
                    {loginErrors.password && (
                      <ThemedText
                        style={{ color: "#E53935", fontSize: 12, marginTop: 4 }}
                      >
                        {loginErrors.password}
                      </ThemedText>
                    )}
                  </View>

                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                    onPress={() => setRememberMe(!rememberMe)}
                  >
                    <Switch
                      value={rememberMe}
                      onValueChange={setRememberMe}
                      trackColor={{ false: "#E0E0E0", true: "#81C784" }}
                      thumbColor={rememberMe ? "#43A047" : "#F5F5F5"}
                    />
                    <ThemedText style={{ marginLeft: 8, fontSize: 14 }}>
                      Recordar mis credenciales
                    </ThemedText>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.button, isLoading && { opacity: 0.6 }]}
                    onPress={handleLogin}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <ThemedText style={styles.buttonText}>Entrar</ThemedText>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={{ marginTop: 16, padding: 12, alignItems: "center" }}
                    onPress={() => setScreen("welcome")}
                  >
                    <ThemedText style={{ color: "#43A047", fontWeight: "600" }}>
                      Volver
                    </ThemedText>
                  </TouchableOpacity>
                </View>
              </>
            )}

            {screen === "register" && (
              <RegisterScreen
                onRegisterSuccess={() => setScreen("welcome")}
                onBackPress={() => setScreen("welcome")}
              />
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
