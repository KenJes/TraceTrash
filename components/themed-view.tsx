import { useThemeContext } from "@/components/theme-context";
import { Colors } from "@/constants/theme";
import React from "react";
import { View, type ViewProps } from "react-native";

export type ThemedViewProps = ViewProps & {
  lightColor?: string;
  darkColor?: string;
};

function ThemedViewComponent({
  style,
  lightColor,
  darkColor,
  ...otherProps
}: ThemedViewProps) {
  const { theme } = useThemeContext();

  let backgroundColor: string;
  if (theme === "dark" && darkColor) {
    backgroundColor = darkColor;
  } else if (theme === "light" && lightColor) {
    backgroundColor = lightColor;
  } else {
    backgroundColor = Colors[theme].background;
  }

  return <View style={[{ backgroundColor }, style]} {...otherProps} />;
}

// Optimización: Memoizar para evitar re-renders innecesarios
export const ThemedView = React.memo(ThemedViewComponent);
