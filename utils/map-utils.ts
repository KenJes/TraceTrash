/**
 * UTILIDADES DE MAPAS
 *
 * Funciones comunes para cálculos geográficos y operaciones de mapas
 */

/**
 * Calcula la distancia entre dos puntos GPS usando fórmula Haversine
 *
 * @param lat1 - Latitud del primer punto
 * @param lon1 - Longitud del primer punto
 * @param lat2 - Latitud del segundo punto
 * @param lon2 - Longitud del segundo punto
 * @returns Distancia en kilómetros
 *
 * @example
 * ```typescript
 * const distance = calculateDistance(19.4326, -99.1332, 19.4285, -99.1277);
 * console.log(`${distance.toFixed(2)} km`);
 * ```
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Radio de la Tierra en km
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

/**
 * Convierte grados a radianes
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Calcula los límites (bounds) para un conjunto de coordenadas
 * Útil para ajustar la vista del mapa a múltiples puntos
 *
 * @param coordinates - Array de coordenadas {latitude, longitude}
 * @returns Objeto con latitud y longitud mínimas y máximas
 *
 * @example
 * ```typescript
 * const bounds = getBounds([
 *   { latitude: 19.4326, longitude: -99.1332 },
 *   { latitude: 19.4285, longitude: -99.1277 }
 * ]);
 * ```
 */
export function getBounds(
  coordinates: { latitude: number; longitude: number }[],
): {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
  centerLat: number;
  centerLon: number;
} {
  if (coordinates.length === 0) {
    return {
      minLat: 0,
      maxLat: 0,
      minLon: 0,
      maxLon: 0,
      centerLat: 0,
      centerLon: 0,
    };
  }

  let minLat = coordinates[0].latitude;
  let maxLat = coordinates[0].latitude;
  let minLon = coordinates[0].longitude;
  let maxLon = coordinates[0].longitude;

  coordinates.forEach((coord) => {
    if (coord.latitude < minLat) minLat = coord.latitude;
    if (coord.latitude > maxLat) maxLat = coord.latitude;
    if (coord.longitude < minLon) minLon = coord.longitude;
    if (coord.longitude > maxLon) maxLon = coord.longitude;
  });

  return {
    minLat,
    maxLat,
    minLon,
    maxLon,
    centerLat: (minLat + maxLat) / 2,
    centerLon: (minLon + maxLon) / 2,
  };
}

/**
 * Calcula el punto central entre múltiples coordenadas
 *
 * @param coordinates - Array de coordenadas
 * @returns Coordenada central
 */
export function getCenterPoint(
  coordinates: { latitude: number; longitude: number }[],
): { latitude: number; longitude: number } {
  if (coordinates.length === 0) {
    return { latitude: 0, longitude: 0 };
  }

  const bounds = getBounds(coordinates);
  return {
    latitude: bounds.centerLat,
    longitude: bounds.centerLon,
  };
}

/**
 * Formatea coordenadas para display
 *
 * @param lat - Latitud
 * @param lon - Longitud
 * @param decimals - Número de decimales (default: 6)
 * @returns String formateado "lat, lon"
 */
export function formatCoordinates(
  lat: number,
  lon: number,
  decimals: number = 6,
): string {
  return `${lat.toFixed(decimals)}, ${lon.toFixed(decimals)}`;
}

/**
 * Calcula el zoom apropiado para un conjunto de coordenadas
 * Basado en la distancia máxima entre puntos
 *
 * @param coord - Array de coordenadas[]
 * @returns Nivel de zoom (1-20)
 */
export function calculateZoomLevel(
  coordinates: Array<{ latitude: number; longitude: number }>,
): number {
  if (coordinates.length === 0) return 13;
  if (coordinates.length === 1) return 15;

  const bounds = getBounds(coordinates);
  const latDelta = bounds.maxLat - bounds.minLat;
  const lonDelta = bounds.maxLon - bounds.minLon;
  const maxDelta = Math.max(latDelta, lonDelta);

  // Escala aproximada: mayor delta = menor zoom
  if (maxDelta > 1) return 10;
  if (maxDelta > 0.5) return 11;
  if (maxDelta > 0.1) return 13;
  if (maxDelta > 0.05) return 14;
  if (maxDelta > 0.01) return 15;
  return 16;
}

/**
 * Verifica si un punto está dentro de un radio desde otro punto
 *
 * @param point - Punto a verificar
 * @param center - Punto central
 * @param radiusKm - Radio en kilómetros
 * @returns true si el punto está dentro del radio
 */
export function isPointInRadius(
  point: { latitude: number; longitude: number },
  center: { latitude: number; longitude: number },
  radiusKm: number,
): boolean {
  const distance = calculateDistance(
    point.latitude,
    point.longitude,
    center.latitude,
    center.longitude,
  );
  return distance <= radiusKm;
}
