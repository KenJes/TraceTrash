import { UbicacionData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Platform, StyleSheet, Text, View } from 'react-native';

// Coordenadas de Temascaltepec, México
const TEMASCALTEPEC_COORDS = {
  latitude: 19.0442,
  longitude: -100.1512,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

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
        1000
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

  // En web, mostrar mensaje informativo
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.container, { height, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }]}>
        <Ionicons name="map-outline" size={48} color="#999" style={{ marginBottom: 16 }} />
        <Text style={{ fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 8 }}>Mapa no disponible en web</Text>
        <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: 20 }}>
          La visualización de mapas requiere la app móvil
        </Text>
        {ubicacionCamion ? (
          <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            Camión: {ubicacionCamion.conductorNombre} - Unidad {ubicacionCamion.unidad}
          </Text>
        ) : (
          <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
            Región: Temascaltepec, México
          </Text>
        )}
      </View>
    );
  }

  // Usar ubicación del camión si existe, sino Temascaltepec
  const initialRegion = ubicacionCamion ? {
    latitude: ubicacionCamion.latitude,
    longitude: ubicacionCamion.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  } : TEMASCALTEPEC_COORDS;

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
            <View style={styles.truckMarker}>
              <Ionicons name="car" size={32} color="#4CAF50" />
            </View>
          </Marker>
        )}

        {/* Marcador del usuario si está disponible */}
        {userLocation && (
          <Marker
            coordinate={userLocation}
            title="Tu ubicación"
            pinColor="#2196F3"
          >
            <View style={styles.userMarker}>
              <Ionicons name="person" size={24} color="#2196F3" />
            </View>
          </Marker>
        )}

        {/* Línea de la ruta si está disponible */}
        {rutaPolyline.length > 0 && (
          <Polyline
            coordinates={rutaPolyline}
            strokeColor="#4CAF50"
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
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  map: {
    width: '100%',
    height: '100%',
  },
  truckMarker: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#4CAF50',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  userMarker: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 6,
    borderWidth: 2,
    borderColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
