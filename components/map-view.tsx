import {
    CLOSE_ZOOM_DELTA,
    MAP_COLORS,
    TEMASCALTEPEC_COORDS,
} from "@/constants/map-constants";
import { UbicacionData } from "@/services/firebase";
import React, { useEffect, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
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
 * Componente de mapa para visualizar ubicación del camión y ruta
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

  useEffect(() => {
    if (isMapReady && mapRef.current && ubicacionCamion) {
      // Centrar mapa en la ubicación del camión
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

  // Usar ubicación del camión si existe, sino Temascaltepec
  const initialRegion = ubicacionCamion
    ? {
        latitude: ubicacionCamion.latitude,
        longitude: ubicacionCamion.longitude,
        ...CLOSE_ZOOM_DELTA,
      }
    : TEMASCALTEPEC_COORDS;

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_DEFAULT}
        style={styles.map}
        initialRegion={initialRegion}
        onMapReady={() => setIsMapReady(true)}
        showsUserLocation={!!userLocation}
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
