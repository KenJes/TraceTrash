/**
 * Constantes de colores de la aplicación
 * Evita duplicación de valores hex en todo el código
 */

export const APP_COLORS = {
  // Colores principales
  primary: "#4CAF50",
  primaryDark: "#2D7A3E",

  // Estados
  success: "#4CAF50",
  error: "#D33B27",
  warning: "#FF9800",
  info: "#2196F3",

  // Neutros
  white: "#FFFFFF",
  black: "#000000",
  gray: {
    100: "#F8F9FA",
    200: "#F0F1F3",
    300: "#E8EAED",
    600: "#5F6368",
    800: "#202124",
    900: "#0F1419",
  },

  // Transparencias comunes
  transparent: "transparent",
  overlay: "rgba(0, 0, 0, 0.5)",
} as const;
