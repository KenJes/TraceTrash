/**
 * SERVICIO DE USUARIOS - TraceTrash
 * CRUD de usuarios y perfiles
 */

import { db } from "@/services/firebaseconfig";
import {
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import type { UserData } from "./types";

export const userService = {
  /**
   * Obtener datos de usuario por UID
   */
  getUserData: async (uid: string): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      return userDoc.exists() ? (userDoc.data() as UserData) : null;
    } catch {
      return null;
    }
  },

  /**
   * Actualizar perfil del usuario
   */
  updateUserProfile: async (
    uid: string,
    updates: Partial<UserData>,
  ): Promise<void> => {
    await updateDoc(doc(db, "users", uid), updates);
  },

  /**
   * Actualizar usuario (genérico)
   */
  updateUser: async (
    userId: string,
    updates: Partial<UserData>,
  ): Promise<void> => {
    await updateDoc(doc(db, "users", userId), updates as any);
  },

  /**
   * Actualizar ubicación del usuario
   */
  updateUserLocation: async (
    uid: string,
    latitude: number,
    longitude: number,
  ): Promise<void> => {
    await updateDoc(doc(db, "users", uid), {
      latitude,
      longitude,
      coordsUpdatedAt: new Date().toISOString(),
    });
  },

  /**
   * Obtener todos los usuarios
   */
  getAllUsers: async (limitCount: number = 500): Promise<UserData[]> => {
    const q = query(collection(db, "users"), limit(limitCount));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((d) => ({ uid: d.id, ...d.data() }) as UserData);
  },

  /**
   * Eliminar usuario
   */
  deleteUser: async (userId: string): Promise<void> => {
    // Desasignar de rutas primero
    const rutasQuery = query(
      collection(db, "rutas"),
      where("conductorAsignado", "==", userId),
    );
    const rutasSnap = await getDocs(rutasQuery);

    await Promise.all(
      rutasSnap.docs.map((rutaDoc) =>
        updateDoc(doc(db, "rutas", rutaDoc.id), {
          conductorAsignado: null,
          conductorNombre: null,
          unidad: null,
          horario: null,
        }),
      ),
    );

    await deleteDoc(doc(db, "users", userId));
  },

  /**
   * Toggle estado activo del conductor
   */
  toggleConductorActivo: async (
    conductorId: string,
    nuevoEstado: boolean,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      await updateDoc(doc(db, "users", conductorId), { activo: nuevoEstado });
      return {
        success: true,
        message: `Conductor ${nuevoEstado ? "activado" : "desactivado"} correctamente`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Error al cambiar estado",
      };
    }
  },

  /**
   * Obtener usuarios de una ruta (con pushToken)
   */
  getUsuariosRuta: async (rutaId: string): Promise<UserData[]> => {
    const q = query(
      collection(db, "users"),
      where("rutaId", "==", rutaId),
      where("rol", "==", "usuario"),
    );
    const snapshot = await getDocs(q);
    return snapshot.docs
      .map((d) => ({ uid: d.id, ...d.data() }) as UserData)
      .filter((u) => u.pushToken);
  },
};
