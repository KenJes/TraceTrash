# TraceTrash

Sistema de rastreo en tiempo real de recolección de basura para Temascaltepec, México.

## 📱 Descripción

Aplicación multiplataforma (Android, iOS, Web) que permite rastrear camiones recolectores de basura en tiempo real, gestionar rutas optimizadas, y reportar incidencias. Incluye tres roles de usuario con funcionalidades específicas.

## ✨ Características

### 👤 Residentes

- Rastreo en tiempo real del camión asignado
- Notificaciones push de proximidad del camión
- Reporte de incidencias con foto y ubicación
- Historial personal de reportes

### 🚛 Conductores

- GPS tracking automático durante servicio
- Control de ruta (iniciar/pausar/finalizar)
- Vista de mapa con direcciones asignadas
- Notificación automática a usuarios en ruta

### 👨‍💼 Administradores

- Dashboard con métricas en tiempo real
- Mapa con ubicación de todos los camiones activos
- Gestión completa de conductores y rutas
- Optimización automática de rutas
- Administración y seguimiento de reportes

## 🛠 Stack Tecnológico

- **Frontend**: React Native + Expo SDK 54 + TypeScript
- **Navegación**: Expo Router 6
- **Backend**: Firebase (Firestore + Authentication)
- **Mapas**: react-native-maps (móvil) | react-leaflet (web)
- **Notificaciones**: Expo Push Notifications
- **Build**: EAS Build

## 🚀 Instalación

### Prerrequisitos

- Node.js 20+
- npm o yarn
- Expo CLI

### Pasos

```bash
git clone https://github.com/KenJes/TraceTrash.git
cd Trace
npm install
npm start
```

## 📦 Comandos Disponibles

```bash
npm start          # Iniciar servidor de desarrollo
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm run web        # Ejecutar en navegador
```

## 📁 Estructura del Proyecto

```
app/
  (tabs)/          # Pantallas residentes/conductores
  (admin)/         # Pantallas administrador
  login.tsx        # Autenticación
  register.tsx     # Registro

components/        # Componentes reutilizables
  map-*.tsx        # Componentes de mapas (web/native)
  map-markers.tsx  # Marcadores reutilizables

services/
  firebase.ts      # Operaciones Firestore
  location.ts      # Geolocalización
  notification-*   # Push notifications

hooks/             # Custom hooks
constants/         # Configuración y constantes
utils/             # Utilidades compartidas
```

## ⚙️ Configuración Firebase

1. Crear proyecto en [Firebase Console](https://console.firebase.google.com)
2. Activar Firestore Database
3. Activar Authentication (Email/Password)
4. Descargar `google-services.json` y colocarlo en la raíz
5. Configurar credenciales en `services/firebaseconfig.ts`

## 📄 Build Producción

Guía detallada disponible en [DEPLOY.md](./DEPLOY.md)

Android APK:

````bash

```bash
eas build --platform android
eas build --platform ios
````

**Web**:

```bash
npx expo export --platform web
```

## 🗄️ Estructura de Datos

### Colección: `users`

```typescript
{
  uid: string
  nombre: string
  email: string
  rol: 'usuario' | 'conductor' | 'admin'
  direccion?: string
  rutaId?: string
  pushToken?: string
}
```

### Colección: `rutas`

```typescript
{
  id: string
  nombre: string
  direcciones: string[]
  conductorAsignado?: string
  color?: string
  activa: boolean
}
```

### Colección: `incidencias`

```typescript
{
  id: string
  tipoIncidencia: string
  descripcion: string
  ubicacion: string
  imagenes: string[]
  usuarioId: string
  estado: 'pendiente' | 'en_proceso' | 'resuelta'
  createdAt: timestamp
}
```

### Colección: `ubicaciones`

```typescript
{
  conductorId: string;
  rutaId: string;
  latitude: number;
  longitude: number;
  timestamp: timestamp;
}
```

## 🔒 Seguridad

- Autenticación Firebase obligatoria
- Reglas de Firestore configuradas (ver `firestore.rules`)
- Control de permisos por rol
- Tokens de notificación seguros

## 📝 Licencia

MIT License

## 👨‍💻 Autor

**Kenneth Alcalá**  
GitHub: [@KenJes](https://github.com/KenJes)
