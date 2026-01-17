import { UbicacionData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface AdminMapViewProps {
  ubicaciones: UbicacionData[];
  isDarkMode: boolean;
}

/**
 * Componente de mapa para admin en web - Solo muestra mensaje informativo
 */
export const AdminMapView = ({ ubicaciones, isDarkMode }: AdminMapViewProps) => {
  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5' }]}>
      <Ionicons name="map-outline" size={48} color="#999" style={{ marginBottom: 16 }} />
      <Text style={{ fontSize: 16, fontWeight: '600', color: '#666', marginBottom: 8 }}>Mapa no disponible en web</Text>
      <Text style={{ fontSize: 14, color: '#999', textAlign: 'center', paddingHorizontal: 20 }}>
        La visualización de mapas requiere la app móvil
      </Text>
      {ubicaciones.length > 0 ? (
        <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          {ubicaciones.length} camión(es) en ruta
        </Text>
      ) : (
        <Text style={{ fontSize: 12, color: '#999', marginTop: 8 }}>
          Región: Temascaltepec, México
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
