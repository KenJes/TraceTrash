# 🚀 Guía para Crear Build de Desarrollo (Opción 2)

## Prerrequisitos

Antes de comenzar, asegúrate de tener:

1. ✅ Cuenta de Expo creada en https://expo.dev/
2. ✅ EAS CLI instalado globalmente
3. ✅ Sesión iniciada en EAS

## Paso 1: Instalar EAS CLI (si no lo tienes)

```powershell
npm install -g eas-cli
```

Verifica la instalación:
```powershell
eas --version
```

## Paso 2: Iniciar Sesión en EAS

```powershell
eas login
```

Ingresa tus credenciales de Expo.

## Paso 3: Configurar el Proyecto (si es primera vez)

```powershell
eas build:configure
```

Esto creará/actualizará el archivo `eas.json` con los perfiles de build.

## Paso 4: Crear Build de Desarrollo para Android

```powershell
eas build --profile development --platform android
```

### Durante el proceso te preguntará:

1. **¿Generar nuevo Keystore?** → Presiona `Y` (Yes)
2. **¿Configurar notificaciones push?** → Presiona `Y` (Yes)
3. **Espera de 10-20 minutos** mientras se compila en los servidores de Expo

## Paso 5: Descargar el APK

Cuando termine, recibirás:
- Un link para descargar el APK
- También lo verás en: https://expo.dev/accounts/[tu-usuario]/projects/trace/builds

Descarga el APK a tu computadora.

## Paso 6: Instalar en tu Dispositivo Android

### Opción A: Transferencia directa
1. Conecta tu celular por USB
2. Copia el APK a tu celular
3. Abre el APK desde el explorador de archivos
4. Permite "Instalar desde fuentes desconocidas" si te lo pide
5. Instala la app

### Opción B: Compartir por link
1. En expo.dev, comparte el link del build
2. Abre el link en tu celular
3. Descarga e instala el APK

## Paso 7: Iniciar Servidor de Desarrollo

Una vez instalada la app, inicia el servidor:

```powershell
npx expo start --dev-client
```

### Luego:
1. Abre la app "Trace" en tu celular (la que acabas de instalar)
2. Escanea el QR code que aparece en la terminal
3. La app se conectará al servidor de desarrollo

## ✅ Verificar que las Notificaciones Funcionan

1. **Inicia sesión** como usuario residente
2. **Verifica en la consola** que aparezca:
   ```
   📱 Registrando notificaciones push...
   ✅ Push token obtenido: ExponentPushToken[...]
   ✅ Push token guardado en Firestore
   ```
3. **Prueba:** Que un conductor inicie una ruta → deberías recibir notificación

## 🔄 Desarrollo Continuo

Una vez que tengas el build instalado:

```powershell
# Cada vez que desarrolles, solo ejecuta:
npx expo start --dev-client

# La app se actualizará automáticamente con tus cambios
# NO necesitas recompilar el APK cada vez
```

## 🐛 Solución de Problemas

### Error: "eas: command not found"
```powershell
npm install -g eas-cli
```

### Error: "Not logged in"
```powershell
eas login
```

### Error: "Build failed"
- Revisa los logs en expo.dev
- Verifica que `google-services.json` esté en la raíz
- Asegúrate de que `eas.json` esté configurado correctamente

### La app no se conecta al servidor
- Asegúrate de que tu celular y PC estén en la misma red WiFi
- Verifica que no haya firewall bloqueando el puerto de Expo

## 📊 Diferencias: Development vs Production Build

| Característica | Development Build | Production Build |
|---|---|---|
| Actualización en vivo | ✅ Sí (Hot Reload) | ❌ No |
| Debug tools | ✅ Habilitado | ❌ Deshabilitado |
| Tamaño del APK | ~80-100 MB | ~30-50 MB |
| Velocidad | Más lento | Optimizado |
| Para subir a Play Store | ❌ No | ✅ Sí |

## 🚀 Cuando quieras crear el APK de Producción

Para subir a Google Play Store:

```powershell
eas build --profile production --platform android
```

Esto generará un archivo `.aab` (Android App Bundle) listo para publicar.

---

**¿Necesitas ayuda?** Revisa los logs en https://expo.dev/accounts/[tu-usuario]/projects/trace/builds
