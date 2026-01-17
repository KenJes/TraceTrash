import {
    CLOSE_ZOOM_DELTA,
    TEMASCALTEPEC_COORDS,
} from "@/constants/map-constants";
import { RutaData, UbicacionData } from "@/services/firebase";
import React from "react";
import { Dimensions } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { TruckMarker } from "./map-markers";

interface ConductorMapViewProps {
  ubicacionActual: UbicacionData | null;
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
  const { width } = Dimensions.get("window");
  const mapHeight = 300;

  // Usar ubicación del camión si existe, sino Temascaltepec
  const initialRegion = ubicacionActual
    ? {
        latitude: ubicacionActual.latitude,
        longitude: ubicacionActual.longitude,
        ...CLOSE_ZOOM_DELTA,
      }
    : TEMASCALTEPEC_COORDS;

  return (
    <MapView
      style={{ width, height: mapHeight }}
      initialRegion={initialRegion}
      showsUserLocation={false}
      showsMyLocationButton={false}
      showsCompass={true}
      loadingEnabled={true}
    >
      {/* Marcador del camión si hay ubicación */}
      {ubicacionActual && (
        <Marker
          coordinate={{
            latitude: ubicacionActual.latitude,
            longitude: ubicacionActual.longitude,
          }}
          title={`Unidad ${ubicacionActual.unidad}`}
          rotation={ubicacionActual.heading || 0}
          anchor={{ x: 0.5, y: 0.5 }}
        >
          <TruckMarker />
        </Marker>
      )}

      {/* Marcadores de direcciones si hay coordenadas */}
      {ruta.direcciones?.map((dir, index) => {
        // TODO: Agregar coordenadas reales a las direcciones
        // Por ahora solo mostramos el camión
        return null;
      })}
    </MapView>
  );
}
