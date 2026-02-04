import { UbicacionData } from "@/services/firebase";
import { useEffect, useRef } from "react";
import { Platform, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface LeafletMapProps {
  ubicacionCamion: UbicacionData | null;
  rutaPolyline?: { latitude: number; longitude: number }[];
  userLocation?: { latitude: number; longitude: number } | null;
  height?: number;
  initialCenter?: { latitude: number; longitude: number };
  onMarkerClick?: (index: number) => void;
}

/**
 * Componente de mapa usando Leaflet + OpenStreetMap (100% gratuito)
 * Compatible con Android/iOS via WebView
 */
export function LeafletMap({
  ubicacionCamion,
  rutaPolyline = [],
  userLocation,
  height = 300,
  initialCenter,
  onMarkerClick,
}: LeafletMapProps) {
  const webViewRef = useRef<WebView>(null);

  // Calcular centro inicial
  const center = initialCenter
    ? { lat: initialCenter.latitude, lng: initialCenter.longitude }
    : ubicacionCamion
      ? { lat: ubicacionCamion.latitude, lng: ubicacionCamion.longitude }
      : userLocation
        ? { lat: userLocation.latitude, lng: userLocation.longitude }
        : { lat: 19.0442, lng: -100.1512 }; // Temascaltepec por defecto

  // Actualizar mapa cuando cambien las ubicaciones
  useEffect(() => {
    if (webViewRef.current && ubicacionCamion) {
      const updateScript = `
        if (window.updateTruckLocation) {
          window.updateTruckLocation(${ubicacionCamion.latitude}, ${ubicacionCamion.longitude});
        }
        true;
      `;
      webViewRef.current.injectJavaScript(updateScript);
    }
  }, [ubicacionCamion]);

  useEffect(() => {
    if (webViewRef.current && rutaPolyline.length > 0) {
      const coords = JSON.stringify(
        rutaPolyline.map((p) => [p.latitude, p.longitude]),
      );
      const updateScript = `
        if (window.updateRoute) {
          window.updateRoute(${coords});
        }
        true;
      `;
      webViewRef.current.injectJavaScript(updateScript);
    }
  }, [rutaPolyline]);

  // HTML con Leaflet embebido
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>Mapa TraceTrash</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" 
    integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" 
    crossorigin=""/>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" 
    integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" 
    crossorigin=""></script>
  <style>
    body { margin: 0; padding: 0; }
    #map { height: 100vh; width: 100vw; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    // Inicializar mapa
    const map = L.map('map').setView([${center.lat}, ${center.lng}], 14);
    
    // Usar OpenStreetMap (gratuito)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Marcadores
    let truckMarker = null;
    let userMarker = null;
    let routePolyline = null;

    // Icono personalizado para camión
    const truckIcon = L.divIcon({
      className: 'truck-marker',
      html: '<div style="background:#4CAF50;width:30px;height:30px;border-radius:50%;border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;"><span style="color:white;font-size:18px;">🚛</span></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });

    // Icono para usuario
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: '<div style="background:#2196F3;width:20px;height:20px;border-radius:50%;border:2px solid white;box-shadow:0 2px 5px rgba(0,0,0,0.3);"></div>',
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    // Funciones globales para actualizar desde React Native
    window.updateTruckLocation = function(lat, lng) {
      if (truckMarker) {
        truckMarker.setLatLng([lat, lng]);
      } else {
        truckMarker = L.marker([lat, lng], { icon: truckIcon }).addTo(map);
      }
      map.setView([lat, lng], 15, { animate: true });
    };

    window.updateUserLocation = function(lat, lng) {
      if (userMarker) {
        userMarker.setLatLng([lat, lng]);
      } else {
        userMarker = L.marker([lat, lng], { icon: userIcon }).addTo(map);
      }
    };

    window.updateRoute = function(coordinates) {
      if (routePolyline) {
        map.removeLayer(routePolyline);
      }
      if (coordinates && coordinates.length > 0) {
        routePolyline = L.polyline(coordinates, {
          color: '#4CAF50',
          weight: 4,
          opacity: 0.7
        }).addTo(map);
        map.fitBounds(routePolyline.getBounds());
      }
    };

    // Inicializar con datos actuales
    ${ubicacionCamion ? `window.updateTruckLocation(${ubicacionCamion.latitude}, ${ubicacionCamion.longitude});` : ""}
    ${userLocation ? `window.updateUserLocation(${userLocation.latitude}, ${userLocation.longitude});` : ""}
    ${rutaPolyline.length > 0 ? `window.updateRoute(${JSON.stringify(rutaPolyline.map((p) => [p.latitude, p.longitude]))});` : ""}
  </script>
</body>
</html>
  `;

  if (Platform.OS === "web") {
    // En web, renderizar directamente el HTML
    return (
      <View style={[styles.container, { height }]}>
        <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
      </View>
    );
  }

  // En móvil, usar WebView
  return (
    <View style={[styles.container, { height }]}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html: htmlContent }}
        style={styles.webview}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    overflow: "hidden",
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
  },
});
