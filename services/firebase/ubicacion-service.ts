/**
 * SERVICIO DE UBICACIONES - TraceTrash
 * Tracking en tiempo real de conductores
 */

import { db } from "@/services/firebaseconfig";
import {
    addDoc,
    collection,
    getDocs,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    where,
} from "firebase/firestore";
import type { UbicacionData } from "./types";

export const ubicacionService = {
  /**
   * Guardar ubicación del conductor
   */
  guardarUbicacion: async (
    ubicacionData: Omit<UbicacionData, "id">,
  ): Promise<void> => {
    await addDoc(collection(db, "ubicaciones"), {
      ...ubicacionData,
      timestamp: serverTimestamp(),
    });
  },

  /**
   * Obtener ubicación actual de un conductor
   */
  getUbicacionConductor: async (
    conductorId: string,
  ): Promise<UbicacionData | null> => {
    try {
      const q = query(
        collection(db, "ubicaciones"),
        where("conductorId", "==", conductorId),
        orderBy("timestamp", "desc"),
      );
      const snapshot = await getDocs(q);

      if (snapshot.empty) return null;
      const docData = snapshot.docs[0];
      return { id: docData.id, ...docData.data() } as UbicacionData;
    } catch {
      return null;
    }
  },

  /**
   * Obtener ubicaciones activas (últimos 10 min)
   */
  getUbicacionesActivas: async (): Promise<UbicacionData[]> => {
    try {
      const hace10Min = new Date(Date.now() - 10 * 60 * 1000);
      const q = query(
        collection(db, "ubicaciones"),
        where("timestamp", ">=", hace10Min),
        orderBy("timestamp", "desc"),
      );
      const snapshot = await getDocs(q);

      // Agrupar por conductor (más reciente)
      const porConductor = new Map<string, UbicacionData>();
      snapshot.docs.forEach((d) => {
        const data = d.data();
        if (data.conductorId && !porConductor.has(data.conductorId)) {
          porConductor.set(data.conductorId, {
            id: d.id,
            ...data,
          } as UbicacionData);
        }
      });

      return Array.from(porConductor.values());
    } catch {
      return [];
    }
  },

  /**
   * Suscribirse a ubicación de un conductor
   */
  subscribeToUbicacionConductor: (
    conductorId: string,
    callback: (ubicacion: UbicacionData) => void,
  ): (() => void) => {
    const q = query(
      collection(db, "ubicaciones"),
      where("conductorId", "==", conductorId),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) return;

        // Ordenar y tomar más reciente
        const ubicaciones = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }) as UbicacionData)
          .sort((a, b) => {
            const timeA = a.timestamp?.toMillis?.() || 0;
            const timeB = b.timestamp?.toMillis?.() || 0;
            return timeB - timeA;
          });

        if (ubicaciones.length > 0) {
          callback(ubicaciones[0]);
        }
      },
      (error) => console.error("Error en snapshot de ubicación:", error),
    );
  },

  /**
   * Suscribirse a ubicaciones de una ruta
   */
  subscribeToUbicacionesRuta: (
    rutaId: string,
    callback: (ubicaciones: UbicacionData[]) => void,
  ): (() => void) => {
    const q = query(
      collection(db, "ubicaciones"),
      where("rutaId", "==", rutaId),
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const ahora = Date.now();
        const ubicaciones = snapshot.docs
          .map((d) => ({ id: d.id, ...d.data() }) as UbicacionData)
          .filter((u) => {
            const timestamp = u.timestamp?.toMillis?.() || 0;
            return ahora - timestamp < 5 * 60 * 1000; // últimos 5 min
          });

        callback(ubicaciones);
      },
      (error) => console.error("Error en snapshot de ruta:", error),
    );
  },
};
