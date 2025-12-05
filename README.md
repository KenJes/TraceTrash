# 🚛 TraceTrash - Sistema de Rastreo de Recolección de Basura

## 📋 Descripción

TraceTrash es una aplicación móvil desarrollada con **React Native + Expo** que permite a los usuarios rastrear en tiempo real la ubicación de los camiones recolectores de basura, recibir notificaciones cuando el camión está cerca, y reportar incidencias. El sistema incluye paneles administrativos para gestionar rutas, conductores, reportes y métricas operativas.

## 🎯 Características Principales

### Para Usuarios (Residentes)
- ✅ **Rastreo en tiempo real** del camión de basura en su ruta
- ✅ **Notificaciones push** cuando el camión está cerca (<100m)
- ✅ **Reporte de incidencias** con descripción y ubicación GPS
- ✅ **Historial de reportes** con estado y prioridad
- ✅ **Mapa interactivo** con ubicación del camión

### Para Conductores
- ✅ **GPS tracking automático** de su ruta
- ✅ **Inicio/Pausa/Finalización** de ruta con un botón
- ✅ **Notificaciones automáticas** a usuarios cuando inicia/finaliza
- ✅ **Vista de su ruta asignada** con direcciones

### Para Administradores
- ✅ **Dashboard con métricas** (reportes, conductores activos, usuarios)
- ✅ **Mapa en tiempo real** de todos los camiones activos (OpenStreetMaps)
- ✅ **Gestión de conductores** (crear, asignar rutas, activar/desactivar)
- ✅ **Gestión de rutas** con optimización automática de direcciones
- ✅ **Gestión de reportes** (cambiar estado, prioridad)
- ✅ **Métricas operativas** (gráficas, estadísticas)

## 🏗️ Arquitectura Técnica

### Stack Tecnológico
- **Frontend:** React Native + Expo Router 6 + TypeScript
- **Backend:** Firebase (Firestore, Auth) - **Plan Spark (Gratuito)**
- **Notificaciones:** Expo Push Notification API (gratuito)
- **Mapas:** React Native Maps + OpenStreetMaps
- **GPS:** Expo Location API
- **Build:** EAS Build (para generar APK/IPA)

### Estructura del Proyecto

```
TraceTrash/
├── app/                          # Pantallas (Expo Router)
│   ├── _layout.tsx              # Layout principal con navegación
│   ├── login.tsx                # Pantalla de login
│   ├── register.tsx             # Registro de usuarios
│   ├── detalle-reporte.tsx      # Detalle de un reporte
│   ├── (tabs)/                  # Tabs para usuarios/conductores
│   │   ├── index.tsx            # Mapa de rastreo (usuarios)
│   │   ├── conductor-index.tsx  # Panel del conductor
│   │   ├── reportar.tsx         # Formulario de reportes
│   │   ├── reportes.tsx         # Historial de reportes
│   │   └── ajustes.tsx          # Configuración
│   └── (admin)/                 # Tabs para administradores
│       ├── admin-index.tsx      # Dashboard con mapa
│       ├── admin-conductores.tsx # Gestión de conductores
│       ├── admin-rutas.tsx      # Gestión de rutas
│       ├── admin-reportes.tsx   # Gestión de reportes
│       └── admin-metricas.tsx   # Métricas y gráficas
│
├── services/                     # Servicios centralizados
│   ├── firebase.ts              # CRUD Firestore (usuarios, rutas, reportes)
│   ├── firebaseconfig.ts        # Configuración de Firebase
│   ├── location.ts              # Tracking GPS + notificaciones de proximidad
│   ├── notification-service.ts  # Notificaciones push (cliente)
│   └── route-optimizer.ts       # Optimización de rutas
│
├── components/                   # Componentes reutilizables
│   ├── auth-context.tsx         # Context de autenticación
│   ├── theme-context.tsx        # Context de tema (dark/light)
│   ├── map-view.tsx             # Componente de mapa
│   └── ui/                      # Componentes UI
│
├── hooks/                        # Custom hooks
│   ├── use-push-notifications.ts # Registro automático de notificaciones
│   └── use-color-scheme.ts      # Hook de tema
│
├── constants/                    # Constantes globales
│   └── theme.ts                 # Colores y estilos
│
└── assets/                       # Imágenes y recursos estáticos
```

### Base de Datos (Firestore)

#### Colecciones:

**`usuarios`**
```typescript
{
  uid: string,
  nombre: string,
  email: string,
  rol: 'residente' | 'conductor' | 'admin',
  direccion?: string,
  telefono?: string,
  rutaId?: string,        // Ruta asignada
  unidad?: string,        // Unidad del camión (conductores)
  pushToken?: string,     // Token de notificaciones
  activo: boolean,        // Si el conductor está activo
  createdAt: Timestamp
}
```

**`rutas`**
```typescript
{
  id: string,
  nombre: string,
  direcciones: string[],   // Array de direcciones
  conductorId?: string,    // Conductor asignado
  estado: 'activa' | 'pausada' | 'finalizada' | 'inactiva',
  createdAt: Timestamp
}
```

**`ubicaciones`**
```typescript
{
  conductorId: string,
  conductorNombre: string,
  rutaId: string,
  latitude: number,
  longitude: number,
  heading?: number,        // Dirección del camión
  unidad: string,
  timestamp: Timestamp
}
```

**`incidencias`**
```typescript
{
  id: string,
  usuarioId: string,
  usuarioNombre: string,
  tipo: 'falta_recoleccion' | 'acumulacion' | 'dano_contenedor' | 'otro',
  descripcion: string,
  direccion: string,
  latitude: number,
  longitude: number,
  prioridad: 'baja' | 'media' | 'alta',
  estado: 'pendiente' | 'en_proceso' | 'resuelto',
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ instalado
- Cuenta de Expo (gratuita): https://expo.dev/
- Proyecto de Firebase creado (plan Spark gratuito)
- Android Studio (para emulador) o dispositivo físico

### 1. Clonar el repositorio
```bash
git clone https://github.com/KenJes/TraceTrash.git
cd TraceTrash
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar Firebase

#### a) Crear proyecto en Firebase Console
1. Ve a https://console.firebase.google.com/
2. Crea un nuevo proyecto (usar plan Spark - gratuito)
3. Habilita **Authentication** → Método de Email/Password
4. Habilita **Firestore Database** → Modo de prueba

#### b) Obtener credenciales
1. En Firebase Console → ⚙️ Configuración del proyecto
2. Agrega una app Web (icono </> )
3. Copia las credenciales (apiKey, authDomain, etc.)

#### c) Configurar en el proyecto
Edita `services/firebaseconfig.ts` con tus credenciales:

```typescript
const firebaseConfig = {
  apiKey: "TU_API_KEY",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto-id",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

#### d) Configurar Google Services (Android)
1. Descarga `google-services.json` desde Firebase Console
2. Colócalo en la raíz del proyecto: `TraceTrash/google-services.json`

### 4. Configurar EAS (para builds)

```bash
npm install -g eas-cli
eas login
eas build:configure
```

Esto creará `eas.json` con la configuración de builds.

### 5. Iniciar en desarrollo

**⚠️ IMPORTANTE: Notificaciones Push en SDK 53+**

Las notificaciones push ya no funcionan en **Expo Go** desde el SDK 53. Tienes dos opciones:

#### Opción A: Desarrollo sin notificaciones (Expo Go)
```bash
npx expo start

# Luego:
# - Presiona 'a' para Android
# - Escanea QR con Expo Go
# ⚠️ Las notificaciones NO funcionarán, pero todo lo demás sí
```

#### Opción B: Build de desarrollo con notificaciones (Recomendado)
```bash
# 1. Crear build de desarrollo
eas build --profile development --platform android

# 2. Instalar APK en tu dispositivo físico
# 3. Iniciar con:
npx expo start --dev-client

# ✅ Las notificaciones SÍ funcionarán
```

Para más info: https://docs.expo.dev/develop/development-builds/introduction/

### 6. Crear usuario administrador inicial

Ejecuta el script para crear el primer admin:

```bash
npx ts-node scripts/registrarAdmin.ts
```

Credenciales del admin creado:
- **Email:** admin@tracetrash.com
- **Contraseña:** Admin123!

## 📱 Generar APK para Android

### Build de Desarrollo (APK)
```bash
eas build --profile development --platform android
```

### Build de Producción (AAB para Google Play)
```bash
eas build --profile production --platform android
```

El APK se descarga desde https://expo.dev/accounts/[tu-cuenta]/projects/tracetrash/builds

## 🔔 Sistema de Notificaciones

### Arquitectura (Sin Cloud Functions)

El sistema usa **notificaciones del lado del cliente** para evitar el plan Blaze de Firebase:

1. **Registro de tokens:**
   - Hook `use-push-notifications.ts` se ejecuta al login
   - Obtiene token de Expo Push API
   - Guarda `pushToken` en Firestore (colección `usuarios`)

2. **Envío de notificaciones:**
   - `notification-service.ts` llama directamente a Expo Push API
   - No requiere Cloud Functions (ahorro de costos)
   - Se ejecuta desde el dispositivo del conductor

3. **Tipos de notificaciones:**
   - **Ruta iniciada:** Cuando conductor presiona "Iniciar Ruta"
   - **Camión cerca:** Cuando camión está a <100m del usuario
   - **Ruta finalizada:** Cuando conductor termina el servicio

### Flujo de notificaciones:

```
Conductor inicia ruta
    ↓
conductor-index.tsx → notifyRutaIniciada()
    ↓
notification-service.ts → consulta Firestore (usuarios con rutaId)
    ↓
Expo Push API → envía notificaciones
    ↓
Usuarios reciben: "🚛 Camión en camino"
```

## 🗺️ Sistema de Tracking GPS

### Funcionamiento:

1. **Conductor inicia ruta** → `location.ts` activa GPS
2. **Cada 10 segundos** → guarda ubicación en Firestore (`ubicaciones`)
3. **Usuarios ven mapa** → lee ubicaciones en tiempo real
4. **Proximidad** → calcula distancia, si <100m → notifica

### Configuración de precisión:

```typescript
// services/location.ts
{
  accuracy: Location.Accuracy.High,       // GPS de alta precisión
  timeInterval: 10000,                    // 10 segundos
  distanceInterval: 20,                   // O 20 metros de movimiento
}
```

## 🔐 Roles y Permisos

### Residente (`rol: 'residente'`)
- Ver mapa de camión
- Recibir notificaciones
- Reportar incidencias
- Ver historial de reportes propios

### Conductor (`rol: 'conductor'`)
- Iniciar/pausar/finalizar ruta
- Compartir ubicación GPS
- Ver ruta asignada
- Enviar notificaciones automáticas

### Administrador (`rol: 'admin'`)
- Dashboard completo
- Gestionar conductores
- Gestionar rutas
- Gestionar reportes
- Ver métricas operativas
- Mapa de todos los camiones

## 📊 Métricas y Reportes

### Dashboard Admin incluye:
- Total de reportes
- Reportes pendientes
- Reportes urgentes
- Total de usuarios
- Conductores activos
- Mapa en tiempo real de camiones

### Gráficas disponibles:
- Reportes por estado (pendiente, en proceso, resuelto)
- Reportes por tipo (falta recolección, acumulación, etc.)
- Reportes por prioridad (baja, media, alta)
- Tendencia de reportes en el tiempo

## 🛠️ Comandos Útiles

```bash
# Desarrollo
npx expo start                    # Iniciar servidor dev
npx expo start --clear            # Limpiar cache

# Builds
eas build --platform android      # Build Android
eas build --platform ios          # Build iOS
eas build --profile production    # Build de producción

# Linting
npm run lint                      # Verificar código

# Actualizar dependencias
npx expo install --fix            # Actualizar a versiones compatibles
```

## 🐛 Solución de Problemas

### Error: "expo-notifications was removed from Expo Go"
**Causa:** Desde SDK 53, las notificaciones requieren un build de desarrollo.

**Solución:**
```bash
# Opción 1: Usar sin notificaciones en Expo Go (para testing rápido)
npx expo start
# Las notificaciones no funcionarán pero el resto de la app sí

# Opción 2: Crear build de desarrollo (RECOMENDADO)
eas build --profile development --platform android
# Instalar el APK generado
npx expo start --dev-client
```

### Error: "No push token"
**Solución:** Las notificaciones solo funcionan:
- En dispositivos físicos (no emuladores)
- Con un build de desarrollo (no Expo Go en SDK 53+)

### Error: "Firebase not initialized"
**Solución:** Verifica que `google-services.json` esté en la raíz del proyecto.

### Error: "Location permission denied"
**Solución:** Ve a Ajustes del dispositivo → Permisos → Ubicación → Permitir siempre.

### El mapa no carga
**Solución:** En web no funciona react-native-maps. Usa dispositivo móvil o emulador.

### No recibe notificaciones
**Solución:**
1. Verifica que el usuario tenga `pushToken` en Firestore
2. Revisa que el `projectId` en `app.json` sea correcto
3. Asegúrate de tener `google-services.json` configurado

## 💰 Costos y Limitaciones

### Plan Spark de Firebase (Gratuito):
- ✅ **Firestore:** 50K lecturas/día, 20K escrituras/día
- ✅ **Authentication:** Ilimitado
- ✅ **Hosting:** 10 GB almacenamiento
- ❌ **Storage:** Deshabilitado (requiere plan Blaze)
- ❌ **Cloud Functions:** Deshabilitado (requiere plan Blaze)

### Expo Push Notifications:
- ✅ **Gratis:** Sin límite de notificaciones
- ✅ **API directa:** No requiere backend

### Nota importante:
Este proyecto fue optimizado para funcionar **100% en el plan gratuito** de Firebase. Las funcionalidades que requerían plan Blaze (Storage, Cloud Functions) fueron reemplazadas por alternativas gratuitas.

## 📞 Soporte

Para reportar bugs o sugerencias:
- GitHub Issues: https://github.com/KenJes/TraceTrash/issues

## 📄 Licencia

Este proyecto es privado y propietario. Todos los derechos reservados.

---

**Desarrollado con ❤️ usando React Native + Expo + Firebase**
