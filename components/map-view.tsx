import { UbicacionData } from "@/services/firebase";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { LeafletMap } from "./leaflet-map";

interface TruckMapViewProps {
  ubicacionCamion: UbicacionData | null;
  rutaPolyline?: { latitude: number; longitude: number }[];
  userLocation?: { latitude: number; longitude: number } | null;
  isLoading?: boolean;
  height?: number;
}

/**
 * Componente de mapa unificado usando OpenStreetMap + Leaflet (100% gratuito)
 */
export function TruckMapView({
  ubicacionCamion,
  rutaPolyline = [],
  userLocation,
  isLoading = false,
  height = 300,
}: TruckMapViewProps) {
  // Debug logs
  console.log("[MAP-VIEW] Renderizando con:");
  console.log("  - ubicacionCamion:", ubicacionCamion ? "SÍ" : "NO");
  console.log(
    "  - userLocation:",
    userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : "NO",
  );
  console.log("  - rutaPolyline:", rutaPolyline.length, "puntos");

  if (isLoading) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // Usar Leaflet Map con OpenStreetMap (gratuito)
  return (
    <LeafletMap
      ubicacionCamion={ubicacionCamion}
      rutaPolyline={rutaPolyline}
      userLocation={userLocation}
      height={height}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
