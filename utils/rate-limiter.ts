/**
 * RATE LIMITER
 *
 * Sistema básico de rate limiting para prevenir spam y abuso
 * Almacena contadores en memoria (se reinicia con cada deploy)
 */

interface ActionRecord {
  count: number;
  firstAttempt: number; // timestamp
  lastAttempt: number; // timestamp
}

// Almacenamiento en memoria de acciones por usuario
const actionRecords = new Map<string, ActionRecord>();

/**
 * Verifica si un usuario puede realizar una acción según límites de rate
 *
 * @param userId - ID del usuario
 * @param action - Tipo de acción (ej: 'create_report', 'login_attempt')
 * @param maxActions - Número máximo de acciones permitidas
 * @param timeWindowMs - Ventana de tiempo en milisegundos
 * @returns true si la acción está permitida
 *
 * @example
 * ```typescript
 * // Limitar a 5 reportes por hora
 * const canReport = canPerformAction(userId, 'create_report', 5, 60 * 60 * 1000);
 * if (!canReport) {
 *   alert('Has excedido el límite de reportes por hora');
 * }
 * ```
 */
export function canPerformAction(
  userId: string,
  action: string,
  maxActions: number,
  timeWindowMs: number,
): boolean {
  const key = `${userId}:${action}`;
  const now = Date.now();
  const record = actionRecords.get(key);

  // Si no hay registro previo, permitir acción
  if (!record) {
    actionRecords.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return true;
  }

  // Si la ventana de tiempo expiró, resetear contador
  if (now - record.firstAttempt > timeWindowMs) {
    actionRecords.set(key, {
      count: 1,
      firstAttempt: now,
      lastAttempt: now,
    });
    return true;
  }

  // Si se alcanzó el límite, denegar
  if (record.count >= maxActions) {
    return false;
  }

  // Incrementar contador
  record.count++;
  record.lastAttempt = now;
  actionRecords.set(key, record);

  return true;
}

/**
 * Obtiene el tiempo restante hasta que se permita la siguiente acción
 *
 * @param userId - ID del usuario
 * @param action - Tipo de acción
 * @param timeWindowMs - Ventana de tiempo en milisegundos
 * @returns Milisegundos hasta que se resetee el límite, o 0 si no hay límite activo
 */
export function getTimeUntilReset(
  userId: string,
  action: string,
  timeWindowMs: number,
): number {
  const key = `${userId}:${action}`;
  const record = actionRecords.get(key);

  if (!record) return 0;

  const now = Date.now();
  const timeElapsed = now - record.firstAttempt;

  if (timeElapsed >= timeWindowMs) return 0;

  return timeWindowMs - timeElapsed;
}

/**
 * Resetea manualmente el contador para un usuario y acción específica
 *
 * @param userId - ID del usuario
 * @param action - Tipo de acción
 */
export function resetActionLimit(userId: string, action: string): void {
  const key = `${userId}:${action}`;
  actionRecords.delete(key);
}

/**
 * Limpia registros antiguos para liberar memoria
 * Debe llamarse periódicamente (ej: cada hora)
 */
export function cleanupOldRecords(
  olderThanMs: number = 24 * 60 * 60 * 1000,
): void {
  const now = Date.now();
  const keysToDelete: string[] = [];

  actionRecords.forEach((record, key) => {
    if (now - record.lastAttempt > olderThanMs) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => actionRecords.delete(key));
}

// Límites preconfigurados comunes
export const RATE_LIMITS = {
  CREATE_REPORT: { maxActions: 5, timeWindowMs: 60 * 60 * 1000 }, // 5 reportes por hora
  LOGIN_ATTEMPT: { maxActions: 10, timeWindowMs: 60 * 60 * 1000 }, // 10 intentos por hora
  UPDATE_LOCATION: { maxActions: 120, timeWindowMs: 60 * 1000 }, // 120 actualizaciones por minuto (cada 0.5s)
  CREATE_ROUTE: { maxActions: 10, timeWindowMs: 24 * 60 * 60 * 1000 }, // 10 rutas por día
} as const;
