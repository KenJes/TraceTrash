import {
    CLOSE_ZOOM_DELTA,
    MAP_COLORS,
    TEMASCALTEPEC_COORDS,
} from "@/constants/map-constants";
import { UbicacionData } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Platform,
    StyleSheet,
    Text,
    View,
} from "react-native";
import MapView, { Marker, Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { TruckMarker, UserMarker } from "./map-markers";

interface TruckMapViewProps {
  ubicacionCamion: UbicacionData | null;
  rutaPolyline?: { latitude: number; longitude: number }[];
  userLocation?: { latitude: number; longitude: number } | null;
  isLoading?: boolean;
  height?: number;
}

/**
 * Componente de mapa unificado para web y móvil
 * - Web: Muestra mensaje informativo (mapas no soportados)
 * - Móvil: Muestra mapa completo con react-native-maps
 */
export function TruckMapView({
  ubicacionCamion,
  rutaPolyline = [],
  userLocation,
  isLoading = false,
  height = 300,
}: TruckMapViewProps) {
  const mapRef = useRef<any>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Debug logs
  console.log(`[MAP-VIEW-${Platform.OS.toUpperCase()}] Renderizando con:`);
  console.log("  - ubicacionCamion:", ubicacionCamion ? "SÍ" : "NO");
  console.log(
    "  - userLocation:",
    userLocation ? `${userLocation.latitude}, ${userLocation.longitude}` : "NO",
  );
  console.log("  - rutaPolyline:", rutaPolyline.length, "puntos");

  useEffect(() => {
    if (isMapReady && mapRef.current && ubicacionCamion) {
      mapRef.current.animateToRegion(
        {
          latitude: ubicacionCamion.latitude,
          longitude: ubicacionCamion.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        1000,
      );
    }
  }, [ubicacionCamion, isMapReady]);

  if (isLoading) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

  // VERSIÓN WEB: Solo mensaje informativo
  if (Platform.OS === "web") {
    return (
      <View
        style={[
          styles.container,
          {
            height,
            justifyContent: "center",
            alignItems: "center",
            backgroundColor: "#f5f5f5",
          },
        ]}
      >
        <Ionicons
          name="map-outline"
          size={48}
          color="#999"
          style={{ marginBottom: 16 }}
        />
        <Text
          style={{
            fontSize: 16,
            fontWeight: "600",
            color: "#666",
            marginBottom: 8,
          }}
        >
          Mapa disponible en app móvil
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "#999",
            textAlign: "center",
            paddingHorizontal: 20,
          }}
        >
          Descarga la aplicación para ver el mapa en tiempo real
        </Text>
        {ubicacionCamion && (
          <Text style={{ fontSize: 12, color: "#4CAF50", marginTop: 12 }}>
            📍 Camión activo: {ubicacionCamion.conductorNombre} (Unidad{" "}
            {ubicacionCamion.unidad})
          </Text>
        )}
        {userLocation && (
          <Text style={{ fontSize: 12, color: "#2196F3", marginTop: 4 }}>
            📍 Tu ubicación: {userLocation.latitude.toFixed(5)},{" "}
            {userLocation.longitude.toFixed(5)}
          </Text>
        )}
      </View>
    );
  }

  // VERSIÓN NATIVE: Mapa completo con react-native-maps
  const initialRegion = ubicacionCamion
    ? {
        latitude: ubicacionCamion.latitude,
        longitude: ubicacionCamion.longitude,
        ...CLOSE_ZOOM_DELTA,
      }
    : userLocation
      ? {
          latitude: userLocation.latitude,
          longitude: userLocation.longitude,
          ...CLOSE_ZOOM_DELTA,
        }
      : TEMASCALTEPEC_COORDS;

  console.log("[MAP-VIEW] Region inicial:", initialRegion);

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        onMapReady={() => {
          console.log("[MAP-VIEW] Mapa listo");
          setIsMapReady(true);
        }}
        showsUserLocation={false}
        showsMyLocationButton={true}
        showsCompass={true}
        showsScale={true}
        loadingEnabled={true}
      >
        {/* Marcador del camión si existe */}
        {ubicacionCamion && (
          <Marker
            coordinate={{
              latitude: ubicacionCamion.latitude,
              longitude: ubicacionCamion.longitude,
            }}
            title={`Unidad ${ubicacionCamion.unidad}`}
            description={ubicacionCamion.conductorNombre}
            rotation={ubicacionCamion.heading || 0}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <TruckMarker size={32} />
          </Marker>
        )}

        {/* Marcador del usuario si está disponible */}
        {userLocation && (
          <Marker coordinate={userLocation} title="Tu ubicación">
            <UserMarker />
          </Marker>
        )}

        {/* Línea de la ruta si está disponible */}
        {rutaPolyline.length > 0 && (
          <Polyline
            coordinates={rutaPolyline}
            strokeColor={MAP_COLORS.route}
            strokeWidth={3}
            lineDashPattern={[10, 5]}
          />
        )}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    justifyContent: "center",
    alignItems: "center",
  },
  map: {
    width: "100%",
    height: "100%",
  },
});
