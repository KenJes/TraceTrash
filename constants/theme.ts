/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';


// Paleta minimalista: grises neutros + verde como acento único
const palette = {
  green: '#2D7A3E',      // Verde minimalista primario (más profundo)
  gray100: '#F8F9FA',    // Fondo claro muy sutil
  gray200: '#F0F1F3',    // Gris claro
  gray300: '#E8EAED',    // Gris medio-claro
  gray600: '#5F6368',    // Gris oscuro (texto secundario)
  gray800: '#202124',    // Gris oscuro profundo (texto principal)
  gray900: '#0F1419',    // Negro suave
  white: '#FFFFFF',      // Blanco
  error: '#D33B27',      // Rojo profesional
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
    card: '#1C1F24',
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
