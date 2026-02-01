/**
 * SERVICIO DE AUTENTICACIÓN - TraceTrash
 * Funciones de login, registro y gestión de sesión
 */

import { auth, db } from "@/services/firebaseconfig";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User,
} from "firebase/auth";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    setDoc,
    where,
} from "firebase/firestore";
import type { RutaData, UserData } from "./types";

// Helper para detectar bloqueos de extensiones
const isBlockedByClient = (err: any): boolean => {
  if (!err) return false;
  const msg = String(err.message || err);
  return (
    msg.includes("ERR_BLOCKED_BY_CLIENT") ||
    msg.toLowerCase().includes("blocked")
  );
};

// Crear datos mínimos del usuario desde Auth
const createMinimalUserData = (user: User): UserData => ({
  email: user.email || "",
  nombre: user.displayName || "",
  calle: "",
  numero: "",
  colonia: "",
  rol: "usuario",
  createdAt: new Date().toISOString(),
  uid: user.uid,
});

export const authService = {
  /**
   * Registrar nuevo usuario residente
   */
  register: async (
    email: string,
    password: string,
    nombre: string,
    calle: string,
    numero: string,
    colonia: string,
    rutaId?: string,
  ): Promise<UserData> => {
    try {
      // Crear en Firebase Auth
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Buscar ruta apropiada
      let rutaEncontrada: RutaData | null = null;

      if (rutaId) {
        const rutaDoc = await getDoc(doc(db, "rutas", rutaId));
        if (rutaDoc.exists()) {
          rutaEncontrada = { id: rutaDoc.id, ...rutaDoc.data() } as RutaData;
        }
      }

      // Buscar por calle/colonia o ruta default
      if (!rutaEncontrada) {
        rutaEncontrada = await authService.findRutaByCalle(calle, colonia);
      }

      if (!rutaEncontrada) {
        const defaultQuery = query(
          collection(db, "rutas"),
          where("esRutaDefault", "==", true),
          limit(1),
        );
        const defaultSnap = await getDocs(defaultQuery);
        if (!defaultSnap.empty) {
          const doc = defaultSnap.docs[0];
          rutaEncontrada = { id: doc.id, ...doc.data() } as RutaData;
        }
      }

      // Guardar en Firestore
      const userData: UserData = {
        email,
        nombre,
        calle,
        numero,
        colonia,
        direccion: `${calle}, ${numero}, ${colonia}`,
        rol: "usuario",
        createdAt: new Date().toISOString(),
        uid: user.uid,
        rutaId: rutaEncontrada?.id,
      };

      await setDoc(doc(db, "users", user.uid), userData);
      return userData;
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        throw new Error("El email ya está registrado");
      } else if (error.code === "auth/weak-password") {
        throw new Error("La contraseña es muy débil (mínimo 6 caracteres)");
      } else if (error.code === "auth/invalid-email") {
        throw new Error("Email inválido");
      }
      throw new Error(error.message || "Error en el registro");
    }
  },

  /**
   * Iniciar sesión
   */
  login: async (email: string, password: string): Promise<UserData> => {
    try {
      const { user } = await signInWithEmailAndPassword(auth, email, password);

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          return createMinimalUserData(user);
        }
        return userDoc.data() as UserData;
      } catch (fsErr: any) {
        if (isBlockedByClient(fsErr) || fsErr.code === "permission-denied") {
          return createMinimalUserData(user);
        }
        throw fsErr;
      }
    } catch (error: any) {
      if (error.code === "auth/user-not-found") {
        throw new Error("Usuario no encontrado");
      } else if (error.code === "auth/wrong-password") {
        throw new Error("Contraseña incorrecta");
      } else if (error.code === "auth/invalid-credential") {
        throw new Error("Credenciales inválidas");
      }
      throw new Error(error.message || "Error en el login");
    }
  },

  /**
   * Cerrar sesión
   */
  logout: async (): Promise<void> => {
    await signOut(auth);
  },

  /**
   * Obtener usuario actual de Auth
   */
  getCurrentUser: (): User | null => auth.currentUser,

  /**
   * Registrar conductor (solo admin)
   */
  registerConductor: async (
    email: string,
    password: string,
    nombre: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email,
        password,
      );

      // Generar número de unidad
      const usersSnap = await getDocs(collection(db, "users"));
      const conductorCount = usersSnap.docs.filter(
        (d) => d.data().rol === "conductor",
      ).length;
      const unidad = `U-${String(conductorCount + 1).padStart(3, "0")}`;

      await setDoc(doc(db, "users", user.uid), {
        email,
        nombre,
        rol: "conductor",
        unidad,
        activo: true,
        calle: "",
        numero: "",
        colonia: "",
        createdAt: new Date().toISOString(),
        uid: user.uid,
      });

      return {
        success: true,
        message: `Conductor registrado con unidad ${unidad}`,
      };
    } catch (error: any) {
      let message = "Error al registrar conductor";
      if (error.code === "auth/email-already-in-use")
        message = "El email ya está registrado";
      else if (error.code === "auth/weak-password")
        message = "Contraseña muy débil";
      return { success: false, message };
    }
  },

  /**
   * Buscar ruta por calle y colonia
   */
  findRutaByCalle: async (
    calle: string,
    colonia: string,
  ): Promise<RutaData | null> => {
    try {
      const snapshot = await getDocs(collection(db, "rutas"));
      const calleNorm = calle.toLowerCase().trim();
      const coloniaNorm = colonia.toLowerCase().trim();

      for (const docSnap of snapshot.docs) {
        const ruta = { id: docSnap.id, ...docSnap.data() } as RutaData;
        const rutaCalle = ruta.calle?.toLowerCase().trim() || "";
        const rutaColonia = ruta.colonia?.toLowerCase().trim() || "";

        if (rutaCalle === calleNorm && rutaColonia === coloniaNorm) return ruta;
        if (
          (rutaCalle.includes(calleNorm) || calleNorm.includes(rutaCalle)) &&
          rutaColonia === coloniaNorm
        ) {
          return ruta;
        }
      }
      return null;
    } catch {
      return null;
    }
  },
};
