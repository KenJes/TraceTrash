# ✅ Checklist para Build de Desarrollo

## Estado de Configuración

### ✅ Archivos Verificados
- ✅ `eas.json` - Configurado correctamente con profile "development"
- ✅ `app.json` - ProjectId configurado: `27afb16e-113f-4b10-80b6-ce9eb0205596`
- ✅ `google-services.json` - Presente en la raíz del proyecto
- ✅ Permisos de Android configurados (Location, Notificaciones)
- ✅ Plugins configurados (expo-location, expo-image-picker)

### 📋 Pasos para Crear el Build

Ejecuta estos comandos EN ORDEN desde PowerShell:

#### 1. Verificar que EAS CLI esté instalado
```powershell
eas --version
```
**Resultado esperado:** Debe mostrar una versión (ej: `eas-cli/13.x.x`)

**Si da error "command not found":**
```powershell
npm install -g eas-cli
```

---

#### 2. Iniciar sesión en EAS (si no lo has hecho)
```powershell
eas login
```
**Credenciales:** Usa tu cuenta de expo.dev

---

#### 3. CREAR EL BUILD DE DESARROLLO ⭐
```powershell
eas build --profile development --platform android
```

**Esto iniciará el proceso de compilación:**
- ✅ Subirá tu código a los servidores de Expo
- ✅ Compilará el APK con soporte de notificaciones
- ✅ Generará el keystore para firmar la app
- ⏱️ Tiempo estimado: 10-20 minutos

---

#### 4. Preguntas Durante el Build

**Pregunta 1:** "Would you like to automatically create an EAS project for @kenjes/tracetrash?"
- **Respuesta:** `Y` (Yes)

**Pregunta 2:** "Generate a new Android Keystore?"
- **Respuesta:** `Y` (Yes) - La primera vez

**Pregunta 3:** "Set up Push Notifications?"
- **Respuesta:** `Y` (Yes) - Importante para notificaciones

---

#### 5. Esperar y Monitorear

Verás algo como:
```
✔ Build started, it may take a few minutes to complete.
🔗 https://expo.dev/accounts/kenjes/projects/tracetrash/builds/xxxx

You can monitor the build at the above URL.
```

**Opciones:**
- Presiona `Enter` para monitorear en la terminal
- O abre el link en tu navegador para ver el progreso

---

#### 6. Descargar el APK

Cuando termine (verás "✔ Build finished"):

**Opción A: Desde el link**
1. Abre: https://expo.dev/accounts/kenjes/projects/tracetrash/builds
2. Busca el build más reciente (development)
3. Click en "Download" → Se descargará el APK

**Opción B: Desde la terminal**
- Si usaste `--wait`, el link de descarga aparecerá en la terminal

---

#### 7. Instalar en tu Dispositivo Android

**Paso A: Transferir el APK**
1. Conecta tu celular por USB a la PC
2. Copia el archivo `.apk` a tu celular (carpeta Downloads)

**Paso B: Instalar**
1. En tu celular, abre la app "Archivos" o "Mis Archivos"
2. Ve a la carpeta "Descargas"
3. Toca el archivo APK
4. Si aparece "Instalar desde fuentes desconocidas" → **Permitir**
5. Toca "Instalar"
6. Espera a que se instale
7. Toca "Abrir" o busca la app "TraceTrash" en tu menú

---

#### 8. Iniciar el Servidor de Desarrollo

En PowerShell:
```powershell
npx expo start --dev-client
```

**Verás:**
```
› Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with your device camera

Development build running
```

---

#### 9. Conectar la App al Servidor

1. **Abre la app TraceTrash** en tu celular (la que instalaste)
2. **Escanea el QR code** que aparece en la terminal
3. La app se conectará y cargará

**¡Listo!** Ahora tienes la app funcionando con:
- ✅ Hot Reload (cambios en tiempo real)
- ✅ Notificaciones Push funcionando
- ✅ GPS y mapas
- ✅ Todo el sistema completo

---

## 🔄 Desarrollo Diario

Una vez instalado el build, cada día solo necesitas:

```powershell
npx expo start --dev-client
```

Y abrir la app en tu celular. **NO necesitas recompilar el APK** cada vez.

---

## 🐛 Problemas Comunes

### "eas: command not found"
```powershell
npm install -g eas-cli
```

### "Not logged in"
```powershell
eas login
```

### El build falla
- Revisa los logs en expo.dev
- Verifica que `google-services.json` exista
- Verifica tu internet (debe subir ~50MB de código)

### La app no se conecta
- Verifica que PC y celular estén en la misma red WiFi
- Desactiva VPN si tienes activa
- Revisa que no haya firewall bloqueando

### "No push token" en consola
- Esto es normal la primera vez
- Cierra y vuelve a abrir la app
- Verifica que diste permisos de notificaciones

---

## 📝 Resumen de Comandos

```powershell
# 1. Instalar EAS CLI (solo primera vez)
npm install -g eas-cli

# 2. Login (solo primera vez)
eas login

# 3. Crear build de desarrollo (10-20 min)
eas build --profile development --platform android

# 4. Instalar APK en el celular (manual)

# 5. Iniciar servidor (cada vez que desarrolles)
npx expo start --dev-client
```

---

## 🎯 Próximos Pasos

Cuando quieras publicar en Google Play Store:

```powershell
# Build de producción (genera .aab)
eas build --profile production --platform android

# Submit a Play Store
eas submit --platform android
```

---

**¿Listo para empezar?** Ejecuta el primer comando del checklist. 🚀
