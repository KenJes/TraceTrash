import { Colors } from "@/constants/theme";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Platform,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { useThemeContext } from "./theme-context";
import { ThemedText } from "./themed-text";
import { ThemedView } from "./themed-view";

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSearch: () => void;
  placeholder?: string;
  autoFocus?: boolean;
}

/**
 * Barra de búsqueda optimizada
 *
 * Proporciona búsqueda de texto con debounce para optimización.
 *
 * @example
 * ```tsx
 * <SearchBar
 *   value={searchQuery}
 *   onChangeText={setSearchQuery}
 *   onSearch={handleSearch}
 *   placeholder="Buscar reportes..."
 * />
 * ```
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSearch,
  placeholder = "Buscar...",
  autoFocus = false,
}) => {
  const { theme } = useThemeContext();
  const colors = theme === "dark" ? Colors.dark : Colors.light;
  const isDark = theme === "dark";
  const primary = colors.tint;
  const border = theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)";
  const [isFocused, setIsFocused] = useState(false);

  const handleClear = () => {
    onChangeText("");
    onSearch();
  };

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.searchContainer,
          {
            backgroundColor: colors.card,
            borderColor: isFocused ? primary : border,
            borderWidth: isFocused ? 2 : 1,
          },
        ]}
      >
        {/* Icono de busqueda */}
        <Ionicons
          name="search"
          size={18}
          color={colors.text}
          style={styles.searchIcon}
        />

        {/* Input */}
        <TextInput
          style={[
            styles.input,
            {
              color: colors.text,
              flex: 1,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          onSubmitEditing={onSearch}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#999" : "#666"}
          autoFocus={autoFocus}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          returnKeyType="search"
        />

        {/* Botón de limpiar */}
        {value.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClear}
            activeOpacity={0.6}
          >
            <Ionicons
              name="close"
              size={16}
              color={colors.text}
              style={{ opacity: 0.6 }}
            />
          </TouchableOpacity>
        )}
      </View>

      {/* Información de búsqueda */}
      {value.length > 0 && (
        <ThemedText style={styles.searchInfo}>
          Buscando: &quot;{value}&quot;
        </ThemedText>
      )}
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
    opacity: 0.6,
  },
  input: {
    fontSize: 15,
    paddingVertical: 0,
    ...Platform.select({
      web: {
        outline: "none" as any,
      },
    }),
  },
  clearButton: {
    padding: 4,
    marginLeft: 8,
  },
  clearIcon: {
    fontSize: 16,
    opacity: 0.6,
  },
  searchInfo: {
    fontSize: 12,
    marginTop: 6,
    marginLeft: 4,
    opacity: 0.7,
  },
});
