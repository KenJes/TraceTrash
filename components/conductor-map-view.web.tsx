import { RutaData, UbicacionData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface ConductorMapViewProps {
  ubicacionActual: UbicacionData | null;
  ruta?: RutaData | null;
  direccionesCompletadas?: string[];
  onMarcarDireccion?: (direccion: string) => void;
}

/**
 * Componente de mapa para conductor en web - Solo muestra mensaje informativo
 */
export function ConductorMapView({
  ubicacionActual,
}: ConductorMapViewProps) {
  return (
    <View style={[styles.container, { height: 300, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }]}>
      <Ionicons name="map-outline" size={48} color="#999" style={{ marginBottom: 16 }} />
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 8 }}>Mapa no disponible en web</Text>
      <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: 20 }}>
        La visualización de mapas requiere la app móvil
      </Text>
      {ubicacionActual ? (
        <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          Ubicación: {ubicacionActual.latitude.toFixed(4)}, {ubicacionActual.longitude.toFixed(4)}
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
