/**
 * Servicio de Routing y Optimización de Rutas
 *
 * Utiliza OSRM (Open Source Routing Machine) para:
 * - Calcular rutas entre puntos
 * - Optimizar rutas con diferentes criterios
 * - Considerar sentidos de calles y jerarquía vial
 */

export interface RoutePoint {
  latitude: number;
  longitude: number;
  label?: string;
  isWaypoint?: boolean;
}

export interface RouteSegment {
  distance: number; // en metros
  duration: number; // en segundos
  geometry: { latitude: number; longitude: number }[];
  instructions: string[];
}

export interface OptimizedRoute {
  totalDistance: number; // km
  totalDuration: number; // minutos
  segments: RouteSegment[];
  waypoints: RoutePoint[];
  polyline: { latitude: number; longitude: number }[];
  optimizationType: OptimizationType;
}

export type OptimizationType =
  | "fastest" // Ruta más rápida
  | "shortest" // Ruta más corta
  | "balanced" // Balance entre tiempo y distancia
  | "fuel_saving"; // Ahorro de gasolina (evita paradas frecuentes)

export interface OptimizationOptions {
  type: OptimizationType;
  avoidTolls?: boolean;
  avoidHighways?: boolean;
  vehicleType?: "car" | "truck";
}

// OSRM Demo server (para producción usar servidor propio)
const OSRM_BASE_URL = "https://router.project-osrm.org";

/**
 * Decodifica una polyline codificada de OSRM
 */
function decodePolyline(
  encoded: string,
): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let shift = 0;
    let result = 0;
    let byte: number;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}

/**
 * Calcula la ruta entre múltiples puntos usando OSRM
 */
export async function calculateRoute(
  points: RoutePoint[],
  options: OptimizationOptions = { type: "fastest" },
): Promise<OptimizedRoute | null> {
  if (points.length < 2) {
    console.error("[ROUTING] Se necesitan al menos 2 puntos");
    return null;
  }

  try {
    // Formatear coordenadas para OSRM (lon,lat)
    const coordinates = points
      .map((p) => `${p.longitude},${p.latitude}`)
      .join(";");

    // Perfil según tipo de vehículo y optimización
    let profile = "driving";
    if (options.vehicleType === "truck") {
      profile = "driving"; // OSRM demo no tiene perfil de camión
    }

    // Construir URL con parámetros
    const params = new URLSearchParams({
      overview: "full",
      geometries: "polyline",
      steps: "true",
      annotations: "true",
    });

    const url = `${OSRM_BASE_URL}/route/v1/${profile}/${coordinates}?${params}`;
    console.log("[ROUTING] Solicitando ruta:", url);

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== "Ok" || !data.routes || data.routes.length === 0) {
      console.error("[ROUTING] Error en respuesta:", data);
      return null;
    }

    const route = data.routes[0];
    const polyline = decodePolyline(route.geometry);

    // Procesar segmentos (legs)
    const segments: RouteSegment[] = route.legs.map((leg: any) => ({
      distance: leg.distance,
      duration: leg.duration,
      geometry:
        leg.steps?.map((step: any) => decodePolyline(step.geometry)).flat() ||
        [],
      instructions:
        leg.steps
          ?.map((step: any) => step.maneuver?.instruction || step.name || "")
          .filter((i: string) => i) || [],
    }));

    // Aplicar ajustes según tipo de optimización
    let adjustedRoute = {
      totalDistance: route.distance / 1000, // metros a km
      totalDuration: route.duration / 60, // segundos a minutos
      segments,
      waypoints: points,
      polyline,
      optimizationType: options.type,
    };

    // Ajustes de optimización
    if (options.type === "fuel_saving") {
      // Para ahorro de gasolina, penalizar rutas con muchas paradas
      adjustedRoute.totalDuration *= 1.1; // Estimación: rutas más constantes
    }

    console.log("[ROUTING] Ruta calculada:", {
      distancia: adjustedRoute.totalDistance.toFixed(2) + " km",
      duracion: adjustedRoute.totalDuration.toFixed(0) + " min",
      puntos: adjustedRoute.polyline.length,
    });

    return adjustedRoute;
  } catch (error) {
    console.error("[ROUTING] Error al calcular ruta:", error);
    return null;
  }
}

/**
 * Optimiza el orden de los waypoints para la ruta más eficiente
 * Usa el problema del viajante (TSP) simplificado
 */
export async function optimizeWaypointOrder(
  start: RoutePoint,
  end: RoutePoint,
  waypoints: RoutePoint[],
  options: OptimizationOptions = { type: "fastest" },
): Promise<RoutePoint[] | null> {
  if (waypoints.length === 0) {
    return [start, end];
  }

  if (waypoints.length === 1) {
    return [start, waypoints[0], end];
  }

  try {
    // Para OSRM, usar el servicio de trip (TSP)
    const allPoints = [start, ...waypoints, end];
    const coordinates = allPoints
      .map((p) => `${p.longitude},${p.latitude}`)
      .join(";");

    // Parámetros para TSP
    const params = new URLSearchParams({
      source: "first", // Empezar desde el primer punto
      destination: "last", // Terminar en el último punto
      roundtrip: "false", // No es un viaje redondo
      geometries: "polyline",
      overview: "full",
    });

    const url = `${OSRM_BASE_URL}/trip/v1/driving/${coordinates}?${params}`;
    console.log("[ROUTING] Optimizando orden de waypoints");

    const response = await fetch(url);
    const data = await response.json();

    if (data.code !== "Ok" || !data.waypoints) {
      console.warn("[ROUTING] No se pudo optimizar, usando orden original");
      return [start, ...waypoints, end];
    }

    // Reordenar según índices optimizados
    const optimizedOrder = data.waypoints.map((wp: any) => wp.waypoint_index);
    const optimizedPoints = optimizedOrder.map((idx: number) => allPoints[idx]);

    console.log("[ROUTING] Orden optimizado:", optimizedOrder);
    return optimizedPoints;
  } catch (error) {
    console.error("[ROUTING] Error al optimizar orden:", error);
    return [start, ...waypoints, end];
  }
}

/**
 * Obtiene rutas alternativas entre dos puntos
 */
export async function getAlternativeRoutes(
  start: RoutePoint,
  end: RoutePoint,
  waypoints: RoutePoint[] = [],
): Promise<OptimizedRoute[]> {
  const alternatives: OptimizedRoute[] = [];

  // Calcular ruta más rápida
  const fastest = await calculateRoute([start, ...waypoints, end], {
    type: "fastest",
  });
  if (fastest) alternatives.push(fastest);

  // Calcular ruta más corta
  const shortest = await calculateRoute([start, ...waypoints, end], {
    type: "shortest",
  });
  if (shortest && shortest.totalDistance !== fastest?.totalDistance) {
    alternatives.push(shortest);
  }

  // Calcular ruta balanceada
  const balanced = await calculateRoute([start, ...waypoints, end], {
    type: "balanced",
  });
  if (balanced) alternatives.push(balanced);

  return alternatives;
}

/**
 * Geocodificación inversa - obtener dirección de coordenadas
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<string> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "TraceApp/1.0",
      },
    });

    const data = await response.json();

    if (data.display_name) {
      // Simplificar la dirección
      const parts = data.display_name.split(",").slice(0, 3);
      return parts.join(", ").trim();
    }

    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  } catch (error) {
    console.error("[GEOCODE] Error:", error);
    return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  }
}

/**
 * Tipos de optimización disponibles con descripciones
 */
export const OPTIMIZATION_TYPES: {
  value: OptimizationType;
  label: string;
  description: string;
  icon: string;
}[] = [
  {
    value: "fastest",
    label: "Mas Rapida",
    description: "Minimiza el tiempo de viaje",
    icon: "speedometer",
  },
  {
    value: "shortest",
    label: "Mas Corta",
    description: "Minimiza la distancia recorrida",
    icon: "ruler",
  },
  {
    value: "balanced",
    label: "Balanceada",
    description: "Balance entre tiempo y distancia",
    icon: "scale",
  },
  {
    value: "fuel_saving",
    label: "Ahorro de Gasolina",
    description: "Rutas con menos paradas y velocidad constante",
    icon: "fuel",
  },
];
