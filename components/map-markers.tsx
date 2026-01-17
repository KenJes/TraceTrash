import { MARKER_STYLES } from "@/constants/map-constants";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { View, ViewStyle } from "react-native";

interface TruckMarkerProps {
  size?: number;
  style?: ViewStyle;
}

interface UserMarkerProps {
  size?: number;
  style?: ViewStyle;
}

/**
 * Marcador reutilizable para camiones
 */
export const TruckMarker = ({ size = 24, style }: TruckMarkerProps) => (
  <View style={[MARKER_STYLES.truck, style]}>
    <Ionicons name="car" size={size} color="#FFF" />
  </View>
);

/**
 * Marcador reutilizable para usuarios
 */
export const UserMarker = ({ size = 24, style }: UserMarkerProps) => (
  <View style={[MARKER_STYLES.user, style]}>
    <Ionicons name="person" size={size} color="#FFF" />
  </View>
);
