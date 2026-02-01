/**
 * Servicio de Optimización de Rutas
 * Utiliza algoritmos computacionales para generar rutas eficientes
 */

export interface Direccion {
  calle: string;
  numero: string;
  colonia: string;
  latitude?: number;
  longitude?: number;
}

export interface RutaOptimizada {
  nombre: string;
  calle: string;
  colonia: string;
  usuariosCount: number;
  eficiencia: number; // Score de eficiencia (0-100)
  distanciaEstimada?: number; // En km
  tiempoEstimado?: number; // En minutos
  ahorroCombustible?: number; // En %
  prioridad: 'alta' | 'media' | 'baja';
}

/**
 * Normaliza nombres de calles para detectar duplicados
 * Convierte "av juarez", "avenida benito juarez", "av benito juarez" → "avenida juarez"
 */
export function normalizarCalle(calle: string): string {
  let normalizada = calle.toLowerCase().trim();

  // Diccionario de abreviaturas
  const abreviaturas: { [key: string]: string } = {
    'av': 'avenida',
    'av.': 'avenida',
    'ave': 'avenida',
    'ave.': 'avenida',
    'c': 'calle',
    'c.': 'calle',
    'blvd': 'boulevard',
    'blvd.': 'boulevard',
    'prol': 'prolongacion',
    'prol.': 'prolongacion',
    'priv': 'privada',
    'priv.': 'privada',
    'frac': 'fraccionamiento',
    'frac.': 'fraccionamiento',
    'col': 'colonia',
    'col.': 'colonia',
  };

  // Reemplazar abreviaturas
  const palabras = normalizada.split(/\s+/);
  const palabrasNormalizadas = palabras.map(palabra => {
    const limpia = palabra.replace(/\./g, '');
    return abreviaturas[limpia] || limpia;
  });

  normalizada = palabrasNormalizadas.join(' ');

  // Eliminar nombres repetidos comunes (benito juarez juarez → benito juarez)
  const patronesRepetidos = [
    /\b(\w+)\s+\1\b/g,
  ];

  patronesRepetidos.forEach(patron => {
    normalizada = normalizada.replace(patron, '$1');
  });

  // Eliminar palabras comunes que no aportan valor
  normalizada = normalizada
    .replace(/\b(de|del|la|el|los|las|y|e)\b/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  return normalizada;
}

/**
 * Calcula similitud entre dos calles (0-1, donde 1 es idéntico)
 * Usa algoritmo de Levenshtein modificado
 */
export function calcularSimilitudCalles(calle1: string, calle2: string): number {
  const norm1 = normalizarCalle(calle1);
  const norm2 = normalizarCalle(calle2);

  if (norm1 === norm2) return 1.0;

  // Levenshtein distance
  const distancia = calcularLevenshtein(norm1, norm2);
  const longitudMax = Math.max(norm1.length, norm2.length);
  
  return 1 - (distancia / longitudMax);
}

/**
 * Algoritmo de Levenshtein para calcular distancia entre strings
 */
function calcularLevenshtein(s1: string, s2: string): number {
  const len1 = s1.length;
  const len2 = s2.length;
  const matrix: number[][] = [];

  for (let i = 0; i <= len1; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= len2; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }

  return matrix[len1][len2];
}

/**
 * Agrupa direcciones similares en la misma ruta
 * Threshold: 0.8 = 80% de similitud mínima
 */
export function agruparDireccionesSimilares(
  direcciones: Direccion[],
  threshold: number = 0.8
): Map<string, Direccion[]> {
  const grupos = new Map<string, Direccion[]>();
  const procesadas = new Set<number>();

  direcciones.forEach((dir, i) => {
    if (procesadas.has(i)) return;

    const calleNormalizada = normalizarCalle(dir.calle);
    const grupo: Direccion[] = [dir];
    procesadas.add(i);

    // Buscar direcciones similares
    direcciones.forEach((otraDir, j) => {
      if (i === j || procesadas.has(j)) return;

      const similitud = calcularSimilitudCalles(dir.calle, otraDir.calle);
      
      // Verificar similitud de calle Y misma colonia
      if (similitud >= threshold && dir.colonia.toLowerCase() === otraDir.colonia.toLowerCase()) {
        grupo.push(otraDir);
        procesadas.add(j);
      }
    });

    // Usar calleNormalizada como base para la clave del mapa
    grupos.set(`${calleNormalizada}_${dir.colonia.toLowerCase()}`, grupo);
  });

  return grupos;
}

/**
 * Optimiza rutas usando diferentes algoritmos
 */
export function optimizarRutas(
  direcciones: Direccion[],
  criterio: 'rapida' | 'eficiente' | 'mas_usuarios' | 'ahorro_combustible'
): RutaOptimizada[] {
  const grupos = agruparDireccionesSimilares(direcciones);
  const rutasOptimizadas: RutaOptimizada[] = [];

  grupos.forEach((direccionesGrupo, _claveGrupo) => {
    const usuariosCount = direccionesGrupo.length;
    
    // Calcular métricas
    const eficiencia = calcularEficienciaRuta(direccionesGrupo, criterio);
    const distanciaEstimada = estimarDistancia(direccionesGrupo);
    const tiempoEstimado = estimarTiempo(distanciaEstimada, usuariosCount);
    const ahorroCombustible = calcularAhorroCombustible(distanciaEstimada, usuariosCount);
    const prioridad = determinarPrioridad(usuariosCount, distanciaEstimada);

    // Usar la calle más completa del grupo
    const calleRepresentativa = direccionesGrupo.reduce((prev, curr) => 
      curr.calle.length > prev.calle.length ? curr : prev
    ).calle;

    rutasOptimizadas.push({
      nombre: `Ruta ${calleRepresentativa}`,
      calle: calleRepresentativa,
      colonia: direccionesGrupo[0].colonia,
      usuariosCount,
      eficiencia,
      distanciaEstimada,
      tiempoEstimado,
      ahorroCombustible,
      prioridad,
    });
  });

  // Ordenar según criterio
  return ordenarRutasPorCriterio(rutasOptimizadas, criterio);
}

/**
 * Calcula score de eficiencia basado en el criterio
 */
function calcularEficienciaRuta(
  direcciones: Direccion[],
  criterio: 'rapida' | 'eficiente' | 'mas_usuarios' | 'ahorro_combustible'
): number {
  const usuariosCount = direcciones.length;
  let score = 0;

  switch (criterio) {
    case 'mas_usuarios':
      // Priorizar rutas con más usuarios
      score = Math.min(100, (usuariosCount / 50) * 100);
      break;

    case 'rapida':
      // Priorizar rutas con menos distancia por usuario
      const distancia = estimarDistancia(direcciones);
      const distanciaPorUsuario = distancia / usuariosCount;
      score = Math.max(0, 100 - (distanciaPorUsuario * 10));
      break;

    case 'ahorro_combustible':
      // Priorizar rutas compactas
      const densidad = usuariosCount / estimarDistancia(direcciones);
      score = Math.min(100, densidad * 20);
      break;

    case 'eficiente':
    default:
      // Balance entre todos los factores
      const scoreUsuarios = (usuariosCount / 30) * 30;
      const scoreDistancia = Math.max(0, 40 - (estimarDistancia(direcciones) * 2));
      const scoreDensidad = ((usuariosCount / estimarDistancia(direcciones)) * 10);
      score = scoreUsuarios + scoreDistancia + scoreDensidad;
      break;
  }

  return Math.round(Math.min(100, Math.max(0, score)));
}

/**
 * Estima distancia total de la ruta en km
 */
function estimarDistancia(direcciones: Direccion[]): number {
  // Estimación simple: 0.5 km por usuario + 1 km base
  return 1 + (direcciones.length * 0.5);
}

/**
 * Estima tiempo de recorrido en minutos
 */
function estimarTiempo(distanciaKm: number, usuariosCount: number): number {
  // Tiempo = distancia (a 20 km/h promedio) + tiempo de parada (2 min por usuario)
  const tiempoRecorrido = (distanciaKm / 20) * 60;
  const tiempoParadas = usuariosCount * 2;
  return Math.round(tiempoRecorrido + tiempoParadas);
}

/**
 * Calcula porcentaje de ahorro de combustible vs ruta no optimizada
 */
function calcularAhorroCombustible(distanciaKm: number, usuariosCount: number): number {
  // Asumiendo que sin optimización se recorrería 30% más distancia
  const distanciaSinOptimizar = distanciaKm * 1.3;
  const ahorro = ((distanciaSinOptimizar - distanciaKm) / distanciaSinOptimizar) * 100;
  return Math.round(ahorro);
}

/**
 * Determina prioridad de la ruta
 */
function determinarPrioridad(
  usuariosCount: number,
  distanciaKm: number
): 'alta' | 'media' | 'baja' {
  const densidad = usuariosCount / distanciaKm;

  if (usuariosCount > 20 || densidad > 10) return 'alta';
  if (usuariosCount > 10 || densidad > 5) return 'media';
  return 'baja';
}

/**
 * Ordena rutas según el criterio seleccionado
 */
function ordenarRutasPorCriterio(
  rutas: RutaOptimizada[],
  criterio: 'rapida' | 'eficiente' | 'mas_usuarios' | 'ahorro_combustible'
): RutaOptimizada[] {
  return [...rutas].sort((a, b) => {
    switch (criterio) {
      case 'mas_usuarios':
        return b.usuariosCount - a.usuariosCount;
      
      case 'rapida':
        return (a.tiempoEstimado || 0) - (b.tiempoEstimado || 0);
      
      case 'ahorro_combustible':
        return (b.ahorroCombustible || 0) - (a.ahorroCombustible || 0);
      
      case 'eficiente':
      default:
        return b.eficiencia - a.eficiencia;
    }
  });
}
