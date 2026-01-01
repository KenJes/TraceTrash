import { UbicacionData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { View } from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

interface AdminMapViewProps {
  ubicaciones: UbicacionData[];
  isDarkMode: boolean;
}

export const AdminMapView = ({ ubicaciones }: AdminMapViewProps) => {
  if (ubicaciones.length === 0) return null;

  return (
    <MapView
      style={{ flex: 1 }}
      provider={PROVIDER_DEFAULT}
      initialRegion={{
        latitude: ubicaciones[0].latitude,
        longitude: ubicaciones[0].longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }}
    >
      {ubicaciones.map((ubicacion, index) => (
        <Marker
          key={index}
          coordinate={{
            latitude: ubicacion.latitude,
            longitude: ubicacion.longitude,
          }}
          title={`Unidad ${ubicacion.unidad}`}
          description={ubicacion.conductorNombre}
        >
          <View style={{
            backgroundColor: '#4CAF50',
            padding: 8,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: '#FFF',
          }}>
            <Ionicons name="car" size={20} color="#FFF" />
          </View>
        </Marker>
      ))}
    </MapView>
  );
};
