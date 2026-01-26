# TraceTrash

Sistema de rastreo en tiempo real de recolección de basura

##  Descripción

Aplicación multiplataforma (Android, iOS, Web) que permite rastrear camiones recolectores de basura en tiempo real, gestionar rutas optimizadas, y reportar incidencias. Incluye tres roles de usuario con funcionalidades específicas.

##  Características

###  Residentes
- Rastreo en tiempo real del camión asignado
- Notificaciones push de proximidad del camión
- Reporte de incidencias con foto y ubicación
- Historial personal de reportes

###  Conductores
- GPS tracking automático durante servicio
- Control de ruta (iniciar/pausar/finalizar)
- Vista de mapa con direcciones asignadas
- Notificación automática a usuarios en ruta

###  Administradores
- Dashboard con métricas en tiempo real
- Mapa con ubicación de todos los camiones activos
- Gestión completa de conductores y rutas
- Optimización automática de rutas
- Administración y seguimiento de reportes

##  Stack Tecnológico

- **Frontend**: React Native + Expo SDK 54 + TypeScript
- **Navegación**: Expo Router 6
- **Backend**: Firebase (Firestore + Authentication)
- **Mapas**: react-native-maps (móvil) | react-leaflet (web)
- **Notificaciones**: Expo Push Notifications
- **Build**: EAS Build


##  Licencia

MIT License

##  Autor

**Kenneth Alcalá**  
GitHub: [@KenJes](https://github.com/KenJes)

