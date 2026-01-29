/**
 * FIREBASE SERVICE - TraceTrash
 * 
 * Archivo principal que re-exporta todos los servicios modulares
 * Mantiene compatibilidad con el código existente mediante firebaseService
 * 
 * ARQUITECTURA:
 * - types.ts         → Interfaces compartidas
 * - auth-service.ts  → Login, registro, sesión
 * - user-service.ts  → CRUD de usuarios
 * - ruta-service.ts  → CRUD de rutas
 * - incidencia-service.ts → Reportes
 * - ubicacion-service.ts  → Tracking tiempo real
 */

// Re-exportar tipos
export type { UserData, RutaData, UbicacionData, IncidenciaData } from "./firebase/types";

// Importar servicios
import { authService } from "./firebase/auth-service";
import { userService } from "./firebase/user-service";
import { rutaService } from "./firebase/ruta-service";
import { incidenciaService } from "./firebase/incidencia-service";
import { ubicacionService } from "./firebase/ubicacion-service";

/**
 * Servicio unificado para compatibilidad con código existente
 * 
 * NOTA: Para código nuevo, preferir importar servicios específicos:
 * import { authService } from "@/services/firebase/auth-service";
 */
export const firebaseService = {
  // ═══════════════════════════════════════════
  // AUTENTICACIÓN
  // ═══════════════════════════════════════════
  register: authService.register,
  login: authService.login,
  logout: authService.logout,
  getCurrentUser: authService.getCurrentUser,
  registerConductor: authService.registerConductor,
  findRutaByCalle: authService.findRutaByCalle,

  // ═══════════════════════════════════════════
  // USUARIOS
  // ═══════════════════════════════════════════
  getUserData: userService.getUserData,
  updateUserProfile: userService.updateUserProfile,
  updateUser: userService.updateUser,
  updateUserLocation: userService.updateUserLocation,
  getAllUsers: userService.getAllUsers,
  deleteUser: userService.deleteUser,
  toggleConductorActivo: userService.toggleConductorActivo,
  getUsuariosRuta: userService.getUsuariosRuta,

  // ═══════════════════════════════════════════
  // RUTAS
  // ═══════════════════════════════════════════
  getAllRutas: rutaService.getAllRutas,
  getRutaById: rutaService.getRutaById,
  getRuta: rutaService.getRuta,
  createRuta: rutaService.createRuta,
  updateRuta: rutaService.updateRuta,
  updateRutaCoordinates: rutaService.updateRutaCoordinates,
  deleteRuta: rutaService.deleteRuta,
  actualizarEstadoRuta: rutaService.actualizarEstadoRuta,
  asignarConductorARuta: rutaService.asignarConductorARuta,
  marcarRutaDefault: rutaService.marcarRutaDefault,

  // ═══════════════════════════════════════════
  // INCIDENCIAS
  // ═══════════════════════════════════════════
  createIncidencia: incidenciaService.createIncidencia,
  getUserIncidencias: incidenciaService.getUserIncidencias,
  getAllIncidencias: incidenciaService.getAllIncidencias,
  updateIncidenciaEstado: incidenciaService.updateIncidenciaEstado,
  updateIncidencia: incidenciaService.updateIncidencia,

  // ═══════════════════════════════════════════
  // UBICACIONES / TRACKING
  // ═══════════════════════════════════════════
  guardarUbicacion: ubicacionService.guardarUbicacion,
  getUbicacionConductor: ubicacionService.getUbicacionConductor,
  getUbicacionesActivas: ubicacionService.getUbicacionesActivas,
  subscribeToUbicacionConductor: ubicacionService.subscribeToUbicacionConductor,
  subscribeToUbicacionesRuta: ubicacionService.subscribeToUbicacionesRuta,
};

// Exportar servicios individuales para uso directo
export { authService, userService, rutaService, incidenciaService, ubicacionService };
