/**
 * SERVICIO DE RUTAS - TraceTrash
 * CRUD de rutas y asignaciones
 */

import { db } from "@/services/firebaseconfig";
import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
} from "firebase/firestore";
import type { RutaData, UserData } from "./types";

export const rutaService = {
  /**
   * Obtener todas las rutas
   */
  getAllRutas: async (): Promise<RutaData[]> => {
    try {
      const snapshot = await getDocs(collection(db, "rutas"));
      return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as RutaData);
    } catch {
      return [];
    }
  },

  /**
   * Obtener ruta por ID
   */
  getRutaById: async (rutaId: string): Promise<RutaData | null> => {
    try {
      const rutaDoc = await getDoc(doc(db, "rutas", rutaId));
      if (!rutaDoc.exists()) return null;
      return { id: rutaDoc.id, ...rutaDoc.data() } as RutaData;
    } catch {
      return null;
    }
  },

  /**
   * Alias para compatibilidad
   */
  getRuta: async (rutaId: string): Promise<RutaData | null> => {
    return rutaService.getRutaById(rutaId);
  },

  /**
   * Crear nueva ruta
   */
  createRuta: async (rutaData: Omit<RutaData, "id">): Promise<string> => {
    const nuevaRuta = {
      ...rutaData,
      activa: false,
      usuariosCount: 0,
      createdAt: new Date().toISOString(),
    };
    const docRef = await addDoc(collection(db, "rutas"), nuevaRuta);
    return docRef.id;
  },

  /**
   * Actualizar ruta
   */
  updateRuta: async (
    rutaId: string,
    updates: Partial<RutaData>,
  ): Promise<void> => {
    await updateDoc(doc(db, "rutas", rutaId), updates as any);
  },

  /**
   * Actualizar coordenadas de ruta
   */
  updateRutaCoordinates: async (
    rutaId: string,
    coordenadas: { latitude: number; longitude: number }[],
    centerCoords: { latitude: number; longitude: number },
  ): Promise<void> => {
    await updateDoc(doc(db, "rutas", rutaId), { coordenadas, centerCoords });
  },

  /**
   * Eliminar ruta
   */
  deleteRuta: async (rutaId: string): Promise<void> => {
    // Desasignar usuarios primero
    const usersQuery = query(
      collection(db, "users"),
      where("rutaId", "==", rutaId),
    );
    const usersSnap = await getDocs(usersQuery);

    await Promise.all(
      usersSnap.docs.map((userDoc) =>
        updateDoc(doc(db, "users", userDoc.id), {
          rutaId: null,
          horarioRuta: null,
        }),
      ),
    );

    await deleteDoc(doc(db, "rutas", rutaId));
  },

  /**
   * Actualizar estado de ruta
   */
  actualizarEstadoRuta: async (
    rutaId: string,
    estado: "activa" | "pausada" | "finalizada" | "inactiva",
  ): Promise<void> => {
    await updateDoc(doc(db, "rutas", rutaId), {
      estado,
      updatedAt: new Date().toISOString(),
    });
  },

  /**
   * Asignar conductor a ruta
   */
  asignarConductorARuta: async (
    rutaId: string,
    conductorId: string,
    horario: string,
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const conductorDoc = await getDoc(doc(db, "users", conductorId));
      if (!conductorDoc.exists()) {
        return { success: false, message: "Conductor no encontrado" };
      }

      const conductor = conductorDoc.data() as UserData;

      // Actualizar ruta
      await updateDoc(doc(db, "rutas", rutaId), {
        conductorAsignado: conductorId,
        conductorNombre: conductor.nombre,
        unidad: conductor.unidad,
        horario,
      });

      // Actualizar conductor
      await updateDoc(doc(db, "users", conductorId), {
        rutaId,
        horarioRuta: horario,
      });

      return { success: true, message: "Conductor asignado correctamente" };
    } catch (error: any) {
      return { success: false, message: error.message || "Error al asignar" };
    }
  },

  /**
   * Marcar ruta como default
   */
  marcarRutaDefault: async (rutaId: string): Promise<void> => {
    const snapshot = await getDocs(collection(db, "rutas"));

    // Quitar default de otras rutas
    await Promise.all(
      snapshot.docs
        .filter((d) => d.id !== rutaId && d.data().esRutaDefault)
        .map((d) =>
          updateDoc(doc(db, "rutas", d.id), { esRutaDefault: false }),
        ),
    );

    // Marcar la seleccionada
    await updateDoc(doc(db, "rutas", rutaId), { esRutaDefault: true });
  },
};
