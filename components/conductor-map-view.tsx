import { RutaData, UbicacionData } from "@/services/firebase";
import { StyleSheet, View } from "react-native";
import { LeafletMap } from "./leaflet-map";

interface ConductorMapViewProps {
  ubicacionActual: UbicacionData | null;
  ruta: RutaData;
  direccionesCompletadas: string[];
  onMarcarDireccion: (direccion: string) => void;
}

/**
 * Componente de mapa para conductor usando OpenStreetMap + Leaflet (gratuito)
 */
export default function ConductorMapView({
  ubicacionActual,
  ruta,
  direccionesCompletadas,
  onMarcarDireccion,
}: ConductorMapViewProps) {
  const mapHeight = 300;

  // Convertir coordenadas de ruta para Leaflet
  const rutaPolyline = ruta.coordenadas || [];

  return (
    <View style={styles.container}>
      <LeafletMap
        ubicacionCamion={ubicacionActual}
        rutaPolyline={rutaPolyline}
        height={mapHeight}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
});
