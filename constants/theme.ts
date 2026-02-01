/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";
import { APP_COLORS } from "./colors";

// Paleta minimalista: grises neutros + verde como acento único
const palette = {
  green: APP_COLORS.primaryDark, // Verde minimalista primario
  gray100: APP_COLORS.gray[100], // Fondo claro muy sutil
  gray200: APP_COLORS.gray[200], // Gris claro
  gray300: APP_COLORS.gray[300], // Gris medio-claro
  gray600: APP_COLORS.gray[600], // Gris oscuro (texto secundario)
  gray800: APP_COLORS.gray[800], // Gris oscuro profundo (texto principal)
  gray900: APP_COLORS.gray[900], // Negro suave
  white: APP_COLORS.white, // Blanco
  error: APP_COLORS.error, // Rojo profesional
};

const tintColorLight = palette.green;
const tintColorDark = palette.white;

export const Colors = {
  light: {
    text: palette.gray800,
    background: palette.gray100,
    tint: palette.green,
    icon: palette.gray600,
    tabIconDefault: palette.gray600,
    tabIconSelected: palette.green,
    accent: palette.green,
    error: palette.error,
    card: palette.white,
  },
  dark: {
    text: palette.gray100,
    background: palette.gray900,
    tint: palette.green,
    icon: palette.gray300,
    tabIconDefault: palette.gray600,
    tabIconSelected: palette.green,
    accent: palette.green,
    error: palette.error,
    card: "#1C1F24",
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
