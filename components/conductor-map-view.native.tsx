import { RutaData, UbicacionData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Dimensions, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface ConductorMapViewProps {
  ubicacionActual: UbicacionData;
  ruta: RutaData;
  direccionesCompletadas: string[];
  onMarcarDireccion: (direccion: string) => void;
}

export function ConductorMapView({
  ubicacionActual,
  ruta,
  direccionesCompletadas,
  onMarcarDireccion,
}: ConductorMapViewProps) {
  const { width } = Dimensions.get('window');
  const mapHeight = 300;

  return (
    <MapView
      style={{ width, height: mapHeight }}
      initialRegion={{
        latitude: ubicacionActual.latitude,
        longitude: ubicacionActual.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={true}
      loadingEnabled={true}
    >
      {/* Marcador del camión */}
      <Marker
        coordinate={{
          latitude: ubicacionActual.latitude,
          longitude: ubicacionActual.longitude,
        }}
        title={`Unidad ${ubicacionActual.unidad}`}
        rotation={ubicacionActual.heading || 0}
        anchor={{ x: 0.5, y: 0.5 }}
      >
        <View style={{
          backgroundColor: '#4CAF50',
          borderRadius: 20,
          padding: 8,
          borderWidth: 2,
          borderColor: '#FFF',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 3,
          elevation: 5,
        }}>
          <Ionicons name="car" size={24} color="#FFF" />
        </View>
      </Marker>

      {/* Marcadores de direcciones si hay coordenadas */}
      {ruta.direcciones?.map((dir, index) => {
        // TODO: Agregar coordenadas reales a las direcciones
        // Por ahora solo mostramos el camión
        return null;
      })}
    </MapView>
  );
}
