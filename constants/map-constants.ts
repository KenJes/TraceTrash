/**
 * Constantes compartidas para mapas
 */

import { APP_COLORS } from "./colors";

// Coordenadas de Temascaltepec, México (ubicación por defecto)
export const TEMASCALTEPEC_COORDS = {
  latitude: 19.0442,
  longitude: -100.1512,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

// Configuración de delta para zoom cercano
export const CLOSE_ZOOM_DELTA = {
  latitudeDelta: 0.01,
  longitudeDelta: 0.01,
};

// Estilos comunes para marcadores
export const MARKER_STYLES = {
  truck: {
    backgroundColor: APP_COLORS.primary,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: APP_COLORS.white,
    shadowColor: APP_COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  user: {
    backgroundColor: APP_COLORS.info,
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: APP_COLORS.white,
    shadowColor: APP_COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
};

// Colores para mapas
export const MAP_COLORS = {
  truck: APP_COLORS.primary,
  user: APP_COLORS.info,
  route: APP_COLORS.primary,
  error: APP_COLORS.error,
};

// Configuración de mapa por defecto
export const DEFAULT_MAP_CONFIG = {
  showsUserLocation: false,
  showsMyLocationButton: true,
  showsCompass: true,
  showsScale: true,
  loadingEnabled: true,
};
