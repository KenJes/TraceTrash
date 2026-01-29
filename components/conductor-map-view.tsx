import {
    CLOSE_ZOOM_DELTA,
    TEMASCALTEPEC_COORDS,
} from "@/constants/map-constants";
import { RutaData, UbicacionData } from "@/services/firebase";
import { Dimensions, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { TruckMarker } from "./map-markers";

interface ConductorMapViewProps {
  ubicacionActual: UbicacionData | null;
  ruta: RutaData;
  direccionesCompletadas: string[];
  onMarcarDireccion: (direccion: string) => void;
}

/**
 * Componente de mapa para conductor - Versión NATIVA
 * Para web, se usa conductor-map-view.web.tsx automáticamente
 */
export default function ConductorMapView({
  ubicacionActual,
  ruta,
  direccionesCompletadas,
  onMarcarDireccion,
}: ConductorMapViewProps) {
  const { width } = Dimensions.get("window");
  const mapHeight = 300;

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
    </MapView>
  );
}

const styles = StyleSheet.create({});
