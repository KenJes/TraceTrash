import { Colors } from "@/constants/theme";
import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

interface LoadingSpinnerProps {
  size?: "small" | "large";
  color?: string;
  message?: string;
  isDarkMode?: boolean;
}

/**
 * Componente de carga reutilizable
 * Evita repetir código de ActivityIndicator en cada pantalla
 */
export function LoadingSpinner({
  size = "large",
  color,
  message,
  isDarkMode = false,
}: LoadingSpinnerProps) {
  const colors = isDarkMode ? Colors.dark : Colors.light;
  const spinnerColor = color || colors.tint;

  return (
    <View style={styles.container}>
      <ActivityIndicator size={size} color={spinnerColor} />
      {message && (
        <Text style={[styles.message, { color: colors.text }]}>{message}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
  },
});
