import { UbicacionData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

interface TruckMapViewProps {
  ubicacionCamion: UbicacionData | null;
  rutaPolyline?: { latitude: number; longitude: number }[];
  userLocation?: { latitude: number; longitude: number } | null;
  isLoading?: boolean;
  height?: number;
}

/**
 * Componente de mapa para web - Solo muestra mensaje informativo
 */
export function TruckMapView({
  ubicacionCamion,
  isLoading = false,
  height = 300,
}: TruckMapViewProps) {
  if (isLoading) {
    return (
      <View style={[styles.container, { height }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </View>
    );
  }

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

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
