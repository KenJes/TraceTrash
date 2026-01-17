import { UbicacionData } from "@/services/firebase";
import React from "react";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { TruckMarker } from "./map-markers";

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
          <TruckMarker size={20} />
        </Marker>
      ))}
    </MapView>
  );
};
