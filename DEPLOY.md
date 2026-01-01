# 🚀 Guía Rápida de Despliegue

## 📱 App Android

### Opción 1: EAS Build (Recomendado - GRATIS)

```bash
# 1. Instalar EAS CLI
npm install -g eas-cli

# 2. Login
eas login

# 3. Configurar (primera vez)
eas build:configure

# 4. Build para Android
eas build --platform android --profile production

# 5. Descargar APK desde el dashboard
# https://expo.dev/accounts/[tu-cuenta]/projects/trace/builds
```

### Opción 2: Build Local

```bash
# 1. Prebuild
npx expo prebuild

# 2. Build APK
cd android
./gradlew assembleRelease

# 3. APK ubicado en:
# android/app/build/outputs/apk/release/app-release.apk
```

---

## 🌐 Web Deploy

### Netlify (Recomendado)

```bash
# 1. Build
npx expo export --platform web

# 2. Deploy
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir dist
```

### Vercel

```bash
# 1. Build
npx expo export --platform web

# 2. Deploy
npm install -g vercel
vercel
```

---

## 🔥 Firebase Setup

### 1. Crear Proyecto
1. https://console.firebase.google.com/
2. Crear proyecto → Activar Firestore + Auth

### 2. Configurar Reglas

```bash
# Copiar reglas desde firestore.rules
firebase deploy --only firestore:rules
```

### 3. Variables de Entorno

Crea `.env`:
```
EXPO_PUBLIC_FIREBASE_API_KEY=tu_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abc123
```

---

## 📊 Costos Estimados

| Servicio | Costo |
|----------|-------|
| Firebase (Spark) | **$0** (hasta 1GB) |
| EAS Build Android | **$0** |
| EAS Build iOS | $29/mes |
| Netlify/Vercel | **$0** |
| Google Play Store | $25 único |

---

## ✅ Checklist de Producción

- [ ] Variables de entorno configuradas
- [ ] Firebase rules actualizadas
- [ ] Índices de Firestore creados
- [ ] APK testeado en dispositivo real
- [ ] Web testeada en múltiples navegadores
- [ ] Notificaciones push funcionando
- [ ] GPS tracking funcionando
- [ ] Todos los roles probados (residente/conductor/admin)

---

## 🆘 Soporte

Si tienes problemas, revisa:
1. La sección Troubleshooting en README.md
2. Los logs de Firebase Console
3. Los logs de Expo (`npx expo start`)

---

¿Dudas? Abre un issue en GitHub.
