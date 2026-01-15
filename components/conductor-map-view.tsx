import { RutaData, UbicacionData } from '@/services/firebase';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';

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
  // En web, no mostramos el mapa (se maneja en el componente padre)
  return (
    <View style={{ height: 300, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
      <ActivityIndicator size="large" color="#4CAF50" />
    </View>
  );
}
