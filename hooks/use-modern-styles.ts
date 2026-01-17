import { getModernStyles } from "@/app/_styles/modernStyles";
import { useThemeContext } from "@/components/theme-context";
import { useMemo } from "react";

/**
 * Hook personalizado que combina tema y estilos modernos
 * Reduce código repetitivo en cada pantalla
 */
export function useModernStyles() {
  const { theme } = useThemeContext();
  const isDarkMode = theme === "dark";

  const styles = useMemo(() => getModernStyles(isDarkMode), [isDarkMode]);

  return { theme, isDarkMode, styles };
}
