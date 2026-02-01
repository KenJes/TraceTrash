import * as SecureStore from "expo-secure-store";
import {
    createContext,
    ReactNode,
    useContext,
    useEffect,
    useState,
} from "react";
import { Platform } from "react-native";

export interface User {
  email: string;
  nombre: string;
  direccion?: string; // Combinación de calle, numero y colonia
  rol?: string; // 'residente', 'conductor' o 'admin'
  uid?: string; // ID del usuario en Firestore
  rutaId?: string; // ID de la ruta asignada
  unidad?: string; // Número de unidad (para conductores)
}

const SESSION_KEY = "trace_user_session";

interface AuthContextProps {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      let savedUser: string | null = null;

      if (Platform.OS === "web") {
        // En web, usar AsyncStorage como fallback
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        savedUser = await AsyncStorage.getItem(SESSION_KEY);
      } else {
        // En móvil, usar SecureStore
        savedUser = await SecureStore.getItemAsync(SESSION_KEY);
      }

      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error("Error al cargar sesión:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      setUser(userData);
      const userJson = JSON.stringify(userData);

      if (Platform.OS === "web") {
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        await AsyncStorage.setItem(SESSION_KEY, userJson);
      } else {
        await SecureStore.setItemAsync(SESSION_KEY, userJson);
      }
    } catch (error) {
      console.error("Error al guardar sesión:", error);
      setUser(userData);
    }
  };

  const logout = async () => {
    try {
      // Guardar flag de logout manual para prevenir auto-login
      const { addOrUpdateCredential } = await import("@/utils/secure-storage");
      await addOrUpdateCredential("__MANUAL_LOGOUT__", "true");

      // Limpiar sesión
      if (Platform.OS === "web") {
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        await AsyncStorage.removeItem(SESSION_KEY);
      } else {
        await SecureStore.deleteItemAsync(SESSION_KEY);
      }
      setUser(null);
    } catch (error) {
      console.error("[ERROR] Error al limpiar sesión:", error);
      setUser(null);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      try {
        const userJson = JSON.stringify(updatedUser);
        if (Platform.OS === "web") {
          const AsyncStorage =
            require("@react-native-async-storage/async-storage").default;
          await AsyncStorage.setItem(SESSION_KEY, userJson);
        } else {
          await SecureStore.setItemAsync(SESSION_KEY, userJson);
        }
      } catch (error) {
        console.error("Error al actualizar sesión:", error);
      }
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context)
    throw new Error("useAuthContext must be used within an AuthProvider");
  return context;
}
