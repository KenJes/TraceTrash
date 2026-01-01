import { UbicacionData } from '@/services/firebase';
import React, { useEffect, useState } from 'react';

interface AdminMapViewProps {
  ubicaciones: UbicacionData[];
  isDarkMode: boolean;
}

export const AdminMapView = ({ ubicaciones, isDarkMode }: AdminMapViewProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        borderRadius: '8px'
      }}>
        <span style={{ color: isDarkMode ? '#999' : '#666' }}>Cargando mapa...</span>
      </div>
    );
  }

  return <MapContent ubicaciones={ubicaciones} isDarkMode={isDarkMode} />;
};

function MapContent({ ubicaciones, isDarkMode }: AdminMapViewProps) {
  const [MapComponent, setMapComponent] = useState<any>(null);

  useEffect(() => {
    // Solo cargar en el navegador
    if (typeof window === 'undefined') return;

    // Cargar CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

    // Cargar módulos
    Promise.all([
      import('react-leaflet'),
      import('leaflet')
    ]).then(([reactLeaflet, L]) => {
      const { MapContainer, Marker, Popup, TileLayer } = reactLeaflet;
      
      // Fix iconos
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      // Icono de camión
      const truckIcon = L.divIcon({
        className: 'custom-truck-icon',
        html: `
          <div style="
            background-color: #4CAF50;
            padding: 8px;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            justify-content: center;
          ">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
              <path d="M18,18.5A1.5,1.5 0 0,1 16.5,17A1.5,1.5 0 0,1 18,15.5A1.5,1.5 0 0,1 19.5,17A1.5,1.5 0 0,1 18,18.5M19.5,9.5L21.46,12H17V9.5M6,18.5A1.5,1.5 0 0,1 4.5,17A1.5,1.5 0 0,1 6,15.5A1.5,1.5 0 0,1 7.5,17A1.5,1.5 0 0,1 6,18.5M20,8H17V4H3C1.89,4 1,4.89 1,6V17H3A3,3 0 0,0 6,20A3,3 0 0,0 9,17H15A3,3 0 0,0 18,20A3,3 0 0,0 21,17H23V12L20,8Z"/>
            </svg>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const Map = () => {
        if (ubicaciones.length === 0) return null;
        
        const center: [number, number] = [ubicaciones[0].latitude, ubicaciones[0].longitude];

        return (
          <MapContainer
            center={center}
            zoom={13}
            style={{ width: '100%', height: '100%', borderRadius: '8px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {ubicaciones.map((ubicacion, index) => (
              <Marker
                key={index}
                position={[ubicacion.latitude, ubicacion.longitude]}
                icon={truckIcon}
              >
                <Popup>
                  <div style={{ textAlign: 'center' }}>
                    <strong style={{ fontSize: '14px' }}>🚛 Unidad {ubicacion.unidad}</strong>
                    <br />
                    <span style={{ fontSize: '12px' }}>{ubicacion.conductorNombre}</span>
                    <br />
                    <span style={{ fontSize: '11px', color: '#666' }}>
                      {new Date(ubicacion.timestamp?.toDate?.() || Date.now()).toLocaleTimeString('es-MX')}
                    </span>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        );
      };

      setMapComponent(() => Map);
    });

    return () => {
      const links = document.querySelectorAll('link[href*="leaflet"]');
      links.forEach(l => l.remove());
    };
  }, [ubicaciones]);

  if (!MapComponent) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        minHeight: '300px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
        borderRadius: '8px'
      }}>
        <span style={{ color: isDarkMode ? '#999' : '#666' }}>Cargando mapa...</span>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: '100%', minHeight: '300px' }}>
      <MapComponent />
    </div>
  );
}
