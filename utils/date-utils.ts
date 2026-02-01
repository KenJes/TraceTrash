/**
 * UTILIDADES DE FECHA Y HORA
 *
 * Funciones para formatear y manipular fechas
 */

/**
 * Formatea una fecha a formato legible en español
 *
 * @param date - Date, timestamp de Firebase, o string ISO
 * @param includeTime - Si incluir la hora (default: true)
 * @returns String formateado "DD/MM/YYYY HH:mm"
 *
 * @example
 * ```typescript
 * formatDate(new Date()) // "28/01/2026 14:30"
 * formatDate(serverTimestamp(), false) // "28/01/2026"
 * ```
 */
export function formatDate(date: any, includeTime: boolean = true): string {
  if (!date) return "Fecha no disponible";

  let jsDate: Date;

  // Manejar diferentes tipos de fecha
  if (date instanceof Date) {
    jsDate = date;
  } else if (date.toDate && typeof date.toDate === "function") {
    // Timestamp de Firebase
    jsDate = date.toDate();
  } else if (typeof date === "string") {
    jsDate = new Date(date);
  } else if (typeof date === "number") {
    jsDate = new Date(date);
  } else {
    return "Fecha inválida";
  }

  const day = jsDate.getDate().toString().padStart(2, "0");
  const month = (jsDate.getMonth() + 1).toString().padStart(2, "0");
  const year = jsDate.getFullYear();

  if (!includeTime) {
    return `${day}/${month}/${year}`;
  }

  const hours = jsDate.getHours().toString().padStart(2, "0");
  const minutes = jsDate.getMinutes().toString().padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Formatea solo la hora
 *
 * @param date - Date, timestamp, o string ISO
 * @returns String formateado "HH:mm"
 */
export function formatTime(date: any): string {
  if (!date) return "--:--";

  let jsDate: Date;

  if (date instanceof Date) {
    jsDate = date;
  } else if (date.toDate && typeof date.toDate === "function") {
    jsDate = date.toDate();
  } else if (typeof date === "string") {
    jsDate = new Date(date);
  } else if (typeof date === "number") {
    jsDate = new Date(date);
  } else {
    return "--:--";
  }

  const hours = jsDate.getHours().toString().padStart(2, "0");
  const minutes = jsDate.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

/**
 * Obtiene el tiempo relativo (ej: "hace 5 minutos")
 *
 * @param date - Fecha a comparar
 * @returns String relativo en español
 */
export function getRelativeTime(date: any): string {
  if (!date) return "Fecha desconocida";

  let jsDate: Date;

  if (date instanceof Date) {
    jsDate = date;
  } else if (date.toDate && typeof date.toDate === "function") {
    jsDate = date.toDate();
  } else if (typeof date === "string") {
    jsDate = new Date(date);
  } else if (typeof date === "number") {
    jsDate = new Date(date);
  } else {
    return "Fecha inválida";
  }

  const now = new Date();
  const diffMs = now.getTime() - jsDate.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) {
    return "Hace un momento";
  } else if (diffMinutes < 60) {
    return `Hace ${diffMinutes} ${diffMinutes === 1 ? "minuto" : "minutos"}`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} ${diffHours === 1 ? "hora" : "horas"}`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} ${diffDays === 1 ? "día" : "días"}`;
  } else {
    return formatDate(jsDate, false);
  }
}

/**
 * Calcula la duración entre dos fechas
 *
 * @param startDate - Fecha inicial
 * @param endDate - Fecha final (default: ahora)
 * @returns String formateado "Xh Ym"
 */
export function getDuration(startDate: any, endDate: any = null): string {
  if (!startDate || !endDate) return "--";

  // Si endDate es null, usar ahora
  if (endDate === null) endDate = new Date();

  let start: Date;
  let end: Date;

  // Convertir startDate
  if (startDate instanceof Date) {
    start = startDate;
  } else if (startDate.toDate && typeof startDate.toDate === "function") {
    start = startDate.toDate();
  } else if (typeof startDate === "string") {
    start = new Date(startDate);
  } else {
    return "N/A";
  }

  // Convertir endDate
  if (endDate instanceof Date) {
    end = endDate;
  } else if (endDate.toDate && typeof endDate.toDate === "function") {
    end = endDate.toDate();
  } else if (typeof endDate === "string") {
    end = new Date(endDate);
  } else {
    return "N/A";
  }

  const diffMs = end.getTime() - start.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const hours = Math.floor(diffMinutes / 60);
  const minutes = diffMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }
  if (minutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${minutes}m`;
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: any): boolean {
  if (!date) return false;

  let jsDate: Date;

  if (date instanceof Date) {
    jsDate = date;
  } else if (date.toDate && typeof date.toDate === "function") {
    jsDate = date.toDate();
  } else if (typeof date === "string") {
    jsDate = new Date(date);
  } else {
    return false;
  }

  const today = new Date();
  return (
    jsDate.getDate() === today.getDate() &&
    jsDate.getMonth() === today.getMonth() &&
    jsDate.getFullYear() === today.getFullYear()
  );
}

/**
 * Formatea un rango de fechas
 */
export function formatDateRange(startDate: any, endDate: any): string {
  if (!startDate || !endDate) return "Rango inválido";

  const start = formatDate(startDate, false);
  const end = formatDate(endDate, false);

  if (start === end) {
    return `${start} ${formatTime(startDate)} - ${formatTime(endDate)}`;
  }

  return `${start} - ${end}`;
}
