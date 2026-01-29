/**
 * TIPOS DE DATOS - TraceTrash
 * Interfaces compartidas para toda la aplicación
 */

export interface UserData {
  uid: string;
  email: string;
  nombre: string;
  calle: string;
  numero: string;
  colonia: string;
  direccion?: string;
  rol: "usuario" | "conductor" | "admin";
  createdAt: string;
  activo?: boolean;
  unidad?: string;
  rutaId?: string;
  horarioRuta?: string;
  pushToken?: string;
  lastTokenUpdate?: string;
  latitude?: number;
  longitude?: number;
  coordsUpdatedAt?: string;
}

export interface RutaData {
  id?: string;
  nombre: string;
  calle: string;
  colonia: string;
  direcciones?: string[];
  coordenadas?: { latitude: number; longitude: number }[];
  centerCoords?: { latitude: number; longitude: number };
  polyline?: { latitude: number; longitude: number }[];
  distanciaKm?: number;
  duracionMin?: number;
  conductorAsignado?: string;
  conductorNombre?: string;
  unidad?: string;
  horario?: string;
  activa?: boolean;
  estado?: "activa" | "inactiva" | "en_progreso";
  usuariosCount?: number;
  createdAt?: string;
  color?: string;
  esRutaDefault?: boolean;
}

export interface UbicacionData {
  id?: string;
  conductorId: string;
  conductorNombre: string;
  rutaId: string;
  unidad: string;
  latitude: number;
  longitude: number;
  timestamp?: any;
  velocidad?: number;
  heading?: number;
}

export interface IncidenciaData {
  id?: string;
  tipoIncidencia: string;
  descripcion: string;
  ubicacion: string | null;
  imagenes: string[];
  usuarioId: string;
  usuarioEmail?: string;
  usuarioNombre: string;
  usuarioRol: string;
  estado: "pendiente" | "en_proceso" | "resuelta";
  prioridad?: "baja" | "media" | "alta";
  createdAt: any;
  updatedAt?: any;
  atendidoPor?: string;
  notas?: string;
}
