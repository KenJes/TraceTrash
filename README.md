# 🚛 TraceTrash - Sistema de Gestión de Residuos

<div align="center">

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Platform](https://img.shields.io/badge/platform-Android%20%7C%20iOS-green.svg)

**Aplicación móvil de rastreo en tiempo real para recolección de residuos**

[Características](#-características) • [Instalación](#-instalación) • [Despliegue](#-despliegue)

</div>

---

## 📱 Sobre TraceTrash

Solución integral para la gestión de recolección de residuos que conecta administradores, conductores y residentes en tiempo real mediante GPS tracking y notificaciones push.

### ✨ Características Principales

#### Para Residentes
- 📍 Ver ubicación del camión en tiempo real
- 🔔 Notificaciones cuando el camión está cerca (< 100m)
- 📸 Reportar incidencias con fotos
- 📅 Ver horarios de recolección

#### Para Conductores
- 🚛 Iniciar/Pausar/Finalizar rutas
- 📍 Compartir ubicación cada 30 segundos
- 👥 Ver usuarios asignados
- 📊 Historial de rutas

#### Para Administradores
- 📊 Panel de control con métricas
- 🗺️ Mapa con todos los camiones activos
- 👨‍💼 Gestión de usuarios y rutas
- 📝 Revisar reportes
- 🛣️ Asignación automática de rutas

---

## 🛠️ Stack Tecnológico

- React Native + Expo Router 6
- Firebase (Auth, Firestore, FCM)
- TypeScript 5.9
- React Native Maps
- expo-location + expo-notifications

---

## 🚀 Instalación Rápida

```bash
# Clonar
git clone https://github.com/TU_USUARIO/TraceTrash.git
cd TraceTrash

# Instalar dependencias
npm install

# Configurar Firebase (.env)
cp .env.example .env
# Edita .env con tus credenciales

# Iniciar
npm start
```

---

## 📱 Generar APK

```bash
# Instalar EAS CLI
npm install -g eas-cli

# Login
eas login

# Build
eas build --profile preview --platform android
```

**Descargar**: https://expo.dev/accounts/TU_CUENTA/projects/tracetrash/builds

---

## 🔔 Sistema de Notificaciones

| Evento | Destinatario | Mensaje |
|--------|-------------|---------|
| Conductor inicia ruta | Usuarios de la ruta | "¡El camión está en camino!" |
| Camión < 100m | Usuario específico | "¡El camión está cerca!" |
| Conductor pausa | Admin + Usuarios | "Ruta pausada" |
| Conductor finaliza | Admin + Usuarios | "Ruta completada" |
| Sin conexión > 2 min | Admin | "Problema de conexión" |

---

## 📂 Estructura

```
TraceTrash/
├── app/                      # Screens
│   ├── (admin)/             # Admin panel
│   ├── (tabs)/              # User/Conductor
│   └── login.tsx
├── services/
│   ├── firebase.ts          # Firebase logic
│   ├── location.ts          # GPS tracking
│   └── notifications.ts     # Push notifications
├── components/
├── app.json
└── eas.json
```

---

## 🧪 Testing

1. **Admin**: Asigna ruta a conductor
2. **Conductor**: Inicia ruta → Notifica usuarios
3. **Usuario**: Ve ubicación del camión
4. **Proximidad**: Camión < 100m → Notificación
5. **Finalizar**: Notifica a todos

---

## 📖 Documentación

- [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) - Guía completa de despliegue
- [Expo Docs](https://docs.expo.dev/)
- [Firebase Docs](https://firebase.google.com/docs)

---

## 👨‍💻 Autor

**TraceTrash Team**

---

**¿Listo para revolucionar la recolección de residuos? 🚛♻️**
