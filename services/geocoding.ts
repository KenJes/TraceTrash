/**
 * GEOCODING SERVICE
 *
 * Servicio para convertir direcciones a coordenadas y viceversa
 * Usa OpenStreetMap Nominatim (gratuito, sin API key requerida)
 */

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
  address?: {
    road?: string;
    suburb?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

/**
 * Convierte una dirección a coordenadas usando OpenStreetMap Nominatim
 *
 * @param address - Dirección completa a geocodificar
 * @returns Promise con coordenadas y detalles de la ubicación
 * @throws Error si falla la geocodificación
 * @example
 * ```typescript
 * const coords = await geocodeAddress('Calle 5, Centro, Temascaltepec, México');
 * // { latitude: 19.0369, longitude: -100.0458, displayName: '...' }
 * ```
 */
export async function geocodeAddress(
  address: string,
): Promise<GeocodingResult | null> {
  try {
    // Agregar "México" si no está en la dirección para mejorar resultados
    const searchAddress = address.includes("México")
      ? address
      : `${address}, México`;

    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&` +
      `q=${encodeURIComponent(searchAddress)}&` +
      `limit=1&` +
      `addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "TraceTrash/1.0", // Requerido por Nominatim
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      console.warn("[GEOCODING] No se encontraron resultados para:", address);
      return null;
    }

    const result = data[0];

    return {
      latitude: parseFloat(result.lat),
      longitude: parseFloat(result.lon),
      displayName: result.display_name,
      address: result.address,
    };
  } catch (error) {
    console.error("[ERROR] Error en geocodificación:", error);
    return null;
  }
}

/**
 * Convierte coordenadas a dirección (geocodificación inversa)
 *
 * @param latitude - Latitud
 * @param longitude - Longitud
 * @returns Promise con dirección formateada
 * @example
 * ```typescript
 * const address = await reverseGeocode(19.0369, -100.0458);
 * // 'Calle Principal, Centro, Temascaltepec, Estado de México, México'
 * ```
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  try {
    const url =
      `https://nominatim.openstreetmap.org/reverse?` +
      `format=json&` +
      `lat=${latitude}&` +
      `lon=${longitude}&` +
      `addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "TraceTrash/1.0",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || !data.display_name) {
      return null;
    }

    return data.display_name;
  } catch (error) {
    console.error("[ERROR] Error en geocodificación inversa:", error);
    return null;
  }
}

/**
 * Calcula la distancia entre dos coordenadas usando la fórmula de Haversine
 *
 * @param lat1 - Latitud del punto 1
 * @param lon1 - Longitud del punto 1
 * @param lat2 - Latitud del punto 2
 * @param lon2 - Longitud del punto 2
 * @returns Distancia en metros
 * @example
 * ```typescript
 * const distance = calculateDistance(19.0369, -100.0458, 19.0400, -100.0500);
 * // 523.4 (metros)
 * ```
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Radio de la Tierra en metros
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distancia en metros
}

/**
 * Encuentra la ruta más cercana a unas coordenadas dadas
 *
 * @param userLat - Latitud del usuario
 * @param userLon - Longitud del usuario
 * @param rutas - Array de rutas disponibles
 * @returns Ruta más cercana o null
 * @example
 * ```typescript
 * const closestRoute = findNearestRoute(19.0369, -100.0458, allRoutes);
 * ```
 */
export function findNearestRoute(
  userLat: number,
  userLon: number,
  rutas: {
    id?: string;
    centerCoords?: { latitude: number; longitude: number };
    [key: string]: any;
  }[],
): (typeof rutas)[0] | null {
  if (!rutas || rutas.length === 0) {
    return null;
  }

  let nearestRoute = null;
  let minDistance = Infinity;

  for (const ruta of rutas) {
    if (!ruta.centerCoords || !ruta.id) continue;

    const distance = calculateDistance(
      userLat,
      userLon,
      ruta.centerCoords.latitude,
      ruta.centerCoords.longitude,
    );

    if (distance < minDistance) {
      minDistance = distance;
      nearestRoute = ruta;
    }
  }

  return nearestRoute;
}

/**
 * Geocodifica múltiples direcciones en lote
 *
 * @param addresses - Array de direcciones
 * @param delayMs - Delay entre requests para evitar rate limiting (default: 1000ms)
 * @returns Promise con array de resultados
 * @remarks Nominatim tiene límite de 1 request por segundo
 * @example
 * ```typescript
 * const results = await batchGeocode(['Calle 1', 'Calle 2']);
 * ```
 */
export async function batchGeocode(
  addresses: string[],
  delayMs: number = 1000,
): Promise<(GeocodingResult | null)[]> {
  const results: (GeocodingResult | null)[] = [];

  for (let i = 0; i < addresses.length; i++) {
    const result = await geocodeAddress(addresses[i]);
    results.push(result);

    // Esperar entre requests (Nominatim rate limit)
    if (i < addresses.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  return results;
}

/**
 * Obtiene sugerencias de autocompletado para direcciones
 *
 * @param query - Texto de búsqueda
 * @param limit - Número máximo de resultados (default: 5)
 * @returns Promise con array de sugerencias
 * @example
 * ```typescript
 * const suggestions = await getAddressSuggestions('Calle 5, Temas');
 * // [{ displayName: 'Calle 5, Centro, Temascaltepec...', ... }]
 * ```
 */
export async function getAddressSuggestions(
  query: string,
  limit: number = 5,
): Promise<GeocodingResult[]> {
  try {
    if (!query || query.length < 3) {
      return [];
    }

    const searchQuery = query.includes("México") ? query : `${query}, México`;

    const url =
      `https://nominatim.openstreetmap.org/search?` +
      `format=json&` +
      `q=${encodeURIComponent(searchQuery)}&` +
      `limit=${limit}&` +
      `addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "TraceTrash/1.0",
      },
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();

    return data.map((item: any) => ({
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
      displayName: item.display_name,
      address: item.address,
    }));
  } catch (error) {
    console.error("[ERROR] Error obteniendo sugerencias:", error);
    return [];
  }
}
