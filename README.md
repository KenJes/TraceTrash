# TraceTrash

Sistema de rastreo en tiempo real de recolección de basura con gestión de rutas, conductores y reportes de incidencias.

## Descripción

Aplicación multiplataforma (Android, iOS, Web) que permite rastrear camiones recolectores en tiempo real, gestionar rutas y conductores, y reportar incidencias. Incluye tres roles de usuario: residentes, conductores y administradores.

## Características

**Residentes**
- Rastreo en tiempo real del camión asignado
- Notificaciones push de proximidad
- Reporte de incidencias con ubicación
- Historial de reportes personales

**Conductores**
- GPS tracking automático durante servicio
- Control de ruta (iniciar/pausar/finalizar)
- Notificación automática a usuarios en ruta

**Administradores**
- Dashboard con métricas en tiempo real
- Mapa con ubicación de todos los camiones
- Gestión completa de conductores y rutas
- Administración de reportes e incidencias

## Stack Tecnológico

- Frontend: React Native 0.81 + Expo SDK 54 + Expo Router 6 + TypeScript 5.3
- Backend: Firebase (Firestore + Authentication)
- Mapas: react-native-maps (móvil), react-leaflet + OpenStreetMap (web)
- Notificaciones: Expo Push Notifications API
- Build: EAS Build

## Instalación

### Prerrequisitos
```bash
Node.js 20+
npm o yarn
Expo CLI
```

Requisitos previos:
- Node.js 20 o superior
- npm o yarn
- Expo CLI

```bash
git clone https://github.com/KenJes/TraceTrash.git
cd Trace
npm install
npm start
```

## Comandos

```bash
npm start          # Iniciar servidor de desarrollo
npm run android    # Ejecutar en Android
npm run ios        # Ejecutar en iOS
npm run web        # Ejecutar en navegador web
```

## Estructura del Proyecto

```
app/                        Pantallas y navegación (Expo Router)
  (tabs)/                   Pantallas de usuario y conductor
  (admin)/                  Pantallas de administrador
  login.tsx, register.tsx   Autenticación

services/                   Lógica de negocio
  firebase.ts               Operaciones CRUD con Firestore
  location.ts               Servicio de geolocalización
  notification-service.*    Notificaciones push (separado por plataforma)

components/                 Componentes reutilizables
hooks/                      Custom hooks de React
constants/                  Constantes y configuración global
```

## Configuración Firebase

1. Crear proyecto en Firebase Console
2. Activar Firestore Database en modo producción
3. Activar Authentication con Email/Password
4. Copiar credenciales al archivo de configuración

Reglas de seguridad Firestore:

```bash
firebase deploy --only firestore:rules
```

Índices compuestos se crean automáticamente al hacer clic en el enlace del error de Firebase.

## Build para Producción

Guía detallada disponible en [DEPLOY.md](./DEPLOY.md)

Android APK:
```bash
eas build --platform android
```

Web:
```bash
npx expo export --platform web
```

## Estructura de Datos Firebase

**Colección users**
```typescript
{
  uid: string
  nombre: string
  email: string
  rol: 'residente' | 'conductor' | 'admin'
  direccion?: string
  rutaId?: string
  pushToken?: string
}
```

**Colección rutas**
```typescript
{
  id: string
  nombre: string
  direcciones: string[]
  color: string
  conductorAsignado?: string
}
```

**Colección incidencias**
```typescript
{
  id: string
  tipoIncidencia: string
  descripcion: string
  ubicacion: string
  usuarioId: string
  estado: 'pendiente' | 'en_proceso' | 'resuelta'
  createdAt: timestamp
}
```

## Seguridad

- Autenticación Firebase obligatoria
- Reglas de Firestore en firestore.rules
- Control de permisos por rol a nivel de aplicación
- Sin credenciales hardcodeadas en código

## Solución de Problemas

**Error: Missing or insufficient permissions**
Actualizar reglas de Firestore desde firestore.rules

**Error: Requires index**
Hacer clic en el enlace del error para crear el índice automáticamente

**Web: window is not defined**
Componentes que usan window/localStorage están separados por plataforma (.tsx para web, .native.tsx para móvil)

## Licencia

MIT License

## Autor

Kenneth Alcalá
GitHub: @KenJes

