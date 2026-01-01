# 🚛 TraceTrash - Sistema de Rastreo de Recolección de Basura

[![Expo](https://img.shields.io/badge/Expo-~54.0-blue.svg)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.81-61DAFB.svg)](https://reactnative.dev/)
[![Firebase](https://img.shields.io/badge/Firebase-12.6-orange.svg)](https://firebase.google.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

## 📋 Descripción

Aplicación móvil y web para rastreo en tiempo real de camiones recolectores de basura, gestión de rutas, conductores, y reportes de incidencias. Construida con React Native + Expo y Firebase.

## 🎯 Características

### 👥 Usuarios (Residentes)
- 🗺️ Rastreo en tiempo real del camión
- 🔔 Notificaciones push cuando el camión está cerca
- 📝 Reportar incidencias
- 📊 Historial de reportes

### 🚛 Conductores
- 📍 GPS tracking automático
- ▶️ Control de ruta (iniciar/pausar/finalizar)
- 🔔 Notificaciones automáticas a usuarios

### 👨‍💼 Administradores
- 📈 Dashboard con métricas
- 🗺️ Mapa con todos los camiones (OpenStreetMap)
- 👥 Gestión de conductores y rutas
- 📊 Gestión de reportes y métricas

## 🏗️ Stack Tecnológico

- **Frontend:** React Native + Expo Router 6 + TypeScript
- **Backend:** Firebase (Firestore + Auth) - Plan Gratuito
- **Mapas:** React Native Maps + OpenStreetMap + Leaflet (web)
- **Notificaciones:** Expo Push Notifications
- **Build:** EAS Build

## 🚀 Inicio Rápido

### Prerrequisitos
```bash
Node.js 20+
npm o yarn
Expo CLI
```

### Instalación

```bash
# 1. Clonar repositorio
git clone https://github.com/KenJes/TraceTrash.git
cd Trace

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales de Firebase

# 4. Iniciar desarrollo
npm start
```

### Comandos Disponibles

```bash
npm start          # Iniciar dev server
npm run android    # Correr en Android
npm run ios        # Correr en iOS
npm run web        # Correr en navegador
```

## 📂 Estructura del Proyecto

```
TraceTrash/
├── app/                      # Pantallas (Expo Router)
│   ├── (tabs)/              # Usuario/Conductor
│   ├── (admin)/             # Administrador
│   ├── login.tsx
│   └── register.tsx
├── services/                 # Servicios
│   ├── firebase.ts          # CRUD Firestore
│   ├── location.ts          # GPS tracking
│   └── notification-service.* # Notificaciones
├── components/               # Componentes reutilizables
├── hooks/                    # Custom hooks
└── constants/                # Constantes globales
```

## 🔥 Firebase Setup

### 1. Crear Proyecto Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Crea un proyecto nuevo
3. Activa **Firestore Database** (modo producción)
4. Activa **Authentication** → Email/Password

### 2. Configurar Reglas de Firestore

Copia las reglas de [`firestore.rules`](./firestore.rules) a tu proyecto Firebase:

```bash
firebase deploy --only firestore:rules
```

### 3. Índices de Firestore

Si ves errores de índices, copia el enlace del error en tu navegador y Firebase creará el índice automáticamente.

## 📱 Build para Producción

Ver guía completa en [DEPLOY.md](./DEPLOY.md)

### Android APK (Rápido)

```bash
npm install -g eas-cli
eas login
eas build --platform android
```

### Web Deploy (Rápido)

```bash
npx expo export --platform web
vercel  # o netlify deploy
```

## 🔐 Seguridad

- ✅ Variables de entorno para credenciales
- ✅ Reglas de Firestore estrictas
- ✅ Autenticación Firebase requerida
- ✅ No hay API keys hardcodeadas

## 📊 Colecciones Firebase

### `users`
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

### `rutas`
```typescript
{
  id: string
  nombre: string
  direcciones: string[]
  color: string
  conductorAsignado?: string
}
```

### `incidencias`
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

## 🐛 Troubleshooting

### "Missing or insufficient permissions"
→ Actualiza las reglas de Firestore desde `firestore.rules`

### "The query requires an index"
→ Copia el enlace del error y ábrelo en el navegador para crear el índice

### "localStorage is not a function"
→ Ya resuelto con archivos `.web.ts` y `.native.ts` separados

## 📝 Roadmap

- [ ] Subida de imágenes en reportes (requiere Storage)
- [ ] Gráficas avanzadas con estadísticas
- [ ] Exportación de reportes a PDF
- [ ] Integración con Google Maps (alternativa)
- [ ] App iOS

## 📄 Licencia

MIT License - Ver [LICENSE](LICENSE) para más detalles

## 👨‍💻 Autor

**Kenneth Alcalá**
- GitHub: [@KenJes](https://github.com/KenJes)
- Email: kenneth.alcala@gmail.com

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add: AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

⭐ Si te gusta el proyecto, dale una estrella en GitHub!
