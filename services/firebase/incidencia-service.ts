/**
 * SERVICIO DE INCIDENCIAS - TraceTrash
 * Reportes de residentes y conductores
 */

import { db } from "@/services/firebaseconfig";
import {
    addDoc,
    collection,
    doc,
    getDocs,
    limit,
    orderBy,
    query,
    serverTimestamp,
    updateDoc,
    where,
} from "firebase/firestore";
import type { IncidenciaData } from "./types";

export const incidenciaService = {
  /**
   * Crear nueva incidencia
   */
  createIncidencia: async (
    incidenciaData: Omit<IncidenciaData, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> => {
    const incidencia = {
      ...incidenciaData,
      estado: "pendiente" as const,
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, "incidencias"), incidencia);
    return docRef.id;
  },

  /**
   * Obtener incidencias de un usuario
   */
  getUserIncidencias: async (
    usuarioIdOrEmail: string,
  ): Promise<IncidenciaData[]> => {
    // Intentar por UID primero
    let q = query(
      collection(db, "incidencias"),
      where("usuarioId", "==", usuarioIdOrEmail),
    );
    let snapshot = await getDocs(q);

    // Si no hay resultados, intentar por email
    if (snapshot.empty) {
      q = query(
        collection(db, "incidencias"),
        where("usuarioEmail", "==", usuarioIdOrEmail),
      );
      snapshot = await getDocs(q);
    }

    const incidencias = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as IncidenciaData,
    );

    // Ordenar por fecha (más reciente primero)
    return incidencias.sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateB.getTime() - dateA.getTime();
    });
  },

  /**
   * Obtener todas las incidencias (admin)
   */
  getAllIncidencias: async (
    maxResults: number = 100,
  ): Promise<IncidenciaData[]> => {
    try {
      const q = query(
        collection(db, "incidencias"),
        orderBy("createdAt", "desc"),
        limit(maxResults),
      );
      const snapshot = await getDocs(q);
      return snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as IncidenciaData,
      );
    } catch {
      // Fallback sin orderBy (si no hay índice)
      const snapshot = await getDocs(collection(db, "incidencias"));
      const incidencias = snapshot.docs.map(
        (d) => ({ id: d.id, ...d.data() }) as IncidenciaData,
      );

      return incidencias
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate?.() || new Date(0);
          const dateB = b.createdAt?.toDate?.() || new Date(0);
          return dateB.getTime() - dateA.getTime();
        })
        .slice(0, maxResults);
    }
  },

  /**
   * Actualizar estado de incidencia
   */
  updateIncidenciaEstado: async (
    incidenciaId: string,
    nuevoEstado: "pendiente" | "en_proceso" | "resuelta",
  ): Promise<void> => {
    await updateDoc(doc(db, "incidencias", incidenciaId), {
      estado: nuevoEstado,
      updatedAt: serverTimestamp(),
    });
  },

  /**
   * Actualizar incidencia completa
   */
  updateIncidencia: async (
    incidenciaId: string,
    datos: Partial<IncidenciaData>,
  ): Promise<void> => {
    await updateDoc(doc(db, "incidencias", incidenciaId), {
      ...datos,
      updatedAt: serverTimestamp(),
    });
  },
};
