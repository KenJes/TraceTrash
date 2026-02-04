# 🔄 Plan de Rotación de Credenciales Firebase

**Fecha:** 4 de febrero de 2026  
**Estado:** ⚠️ ACCIÓN REQUERIDA  
**Prioridad:** ALTA

---

## 📋 Resumen Ejecutivo

La API Key de Firebase (`AIzaSyDpZ98...`) fue expuesta en el historial del repositorio GitHub. Aunque el historial ha sido **reescrito completamente** y la key eliminada, es **altamente recomendado** rotar las credenciales como medida de seguridad preventiva.

### ¿Por qué rotar si ya eliminamos el historial?

1. **Exposición previa:** La key estuvo pública desde el commit `be03158` (2 feb 2026) hasta la limpieza (4 feb 2026)
2. **Caches externos:** Motores de búsqueda, GitHub caches, clones locales de terceros pueden tener la key
3. **Mejores prácticas:** OWASP recomienda rotar cualquier secreto expuesto, incluso brevemente

---

## 🔑 Credenciales Expuestas (YA REMOVIDAS DEL REPO)

```json
{
  "firebaseApiKey": "AIzaSyDpZ98-fdoAgUW7w2DyQgT8YpJ7VIqe038",
  "firebaseAuthDomain": "trace-cf294.firebaseapp.com",
  "firebaseProjectId": "trace-cf294",
  "firebaseStorageBucket": "trace-cf294.firebasestorage.app",
  "firebaseMessagingSenderId": "684690769958",
  "firebaseAppId": "1:684690769958:web:665682f8ff8157345cfee7"
}
```

**⚠️ NOTA:** Estos valores son identificadores públicos (Project ID, Sender ID) que NO comprometen seguridad por sí solos. La seguridad depende de:
- **Firestore Security Rules** (configuradas correctamente)
- **Firebase API Key Restrictions** (ver abajo)
- **Firebase App Check** (recomendado habilitar)

---

## 🛡️ Acciones Inmediatas (Sin Rotar Credenciales)

Si decides **NO rotar** las credenciales (opción válida para Firebase), implementa estas mitigaciones:

### 1. Configurar Restricciones de API Key

**Firebase Console → Project Settings → API Keys:**

```
API Key: AIzaSyDpZ98-fdoAgUW7w2DyQgT8YpJ7VIqe038

Restricciones de aplicación:
☑ Aplicaciones Android
  - Nombre del paquete: com.axoloit.trace (o tu package)
  - Huella SHA-1: [Tu certificado de firma]

☑ Aplicaciones iOS
  - ID del paquete: com.axoloit.trace

☑ Sitios web (si usas web)
  - http://localhost:*
  - https://tu-dominio-produccion.com

Restricciones de API:
☑ Maps SDK for Android (si usaras Google Maps)
☑ Identity Toolkit API
☑ Cloud Firestore API
```

**Comando para obtener SHA-1 (Android):**
```bash
# Keystore de desarrollo
keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android

# Keystore de producción
keytool -list -v -keystore tu-keystore.jks -alias tu-alias
```

### 2. Revisar Firestore Security Rules

**Verificar que las reglas NO permitan acceso público no autenticado:**

```javascript
// firestore.rules - CORRECTO ✅
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Usuarios solo pueden leer/escribir sus propios datos
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Rutas solo lectura para usuarios autenticados
    match /rutas/{rutaId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'admin';
    }
    
    // Default: denegar todo
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

**Desplegar reglas:**
```bash
firebase deploy --only firestore:rules
```

### 3. Habilitar Firebase App Check (Recomendado)

**Protección contra abuso de API:**

1. **Firebase Console → Build → App Check**
2. Habilitar para tu app Android/iOS
3. Configurar providers:
   - **Android:** Play Integrity API o reCAPTCHA
   - **iOS:** DeviceCheck o App Attest
   - **Web:** reCAPTCHA v3

**Documentación:** https://firebase.google.com/docs/app-check

### 4. Monitorear Uso de Firebase

**Firebase Console → Analytics → Usage:**
- Revisa picos anómalos de requests
- Configura alertas de uso inusual
- Revisa logs de autenticación

---

## 🔄 Opción B: Rotación Completa (Si Prefieres Máxima Seguridad)

### Paso 1: Crear Nuevo Proyecto Firebase

```bash
# Opción 1: Nuevo proyecto desde cero
1. Firebase Console → Add Project
2. Nombre: trace-cf294-v2 (o nuevo nombre)
3. Habilitar Auth, Firestore, Storage
4. Copiar nuevas credenciales
```

### Paso 2: Migrar Datos (Si Aplica)

```bash
# Exportar Firestore del proyecto antiguo
npm install -g node-firestore-backup-restore
firestore-backup -a firebase-service-account-OLD.json -b backup-$(date +%Y%m%d)

# Importar a nuevo proyecto
firestore-restore -a firebase-service-account-NEW.json -b backup-YYYYMMDD
```

### Paso 3: Actualizar Aplicaciones

```bash
# 1. Actualizar .env con nuevas credenciales
cp .env .env.backup
vim .env  # Copiar nuevas keys de Firebase Console

# 2. Actualizar google-services.json (Android)
# Descargar desde Firebase Console → Project Settings → Download google-services.json

# 3. Rebuild y redistribuir APK
eas build --profile production --platform android
```

### Paso 4: Deshabilitar Proyecto Antiguo

**Después de confirmar que todo funciona:**

1. Firebase Console → Project OLD → Settings → General
2. Scroll → "Delete project"
3. Confirmar después de período de prueba (7-14 días)

---

## 📊 Evaluación de Riesgo

### Riesgo BAJO si:
✅ Firestore Security Rules están configuradas correctamente  
✅ Firebase API Key tiene restricciones (App IDs, SHA-1, dominios)  
✅ Firebase App Check está habilitado  
✅ No hay patrones de uso anómalo en Analytics  

### Riesgo MEDIO si:
⚠️ Rules permiten lectura pública sin auth  
⚠️ API Key sin restricciones configuradas  
⚠️ Exposición fue de >7 días  

### Riesgo ALTO si:
🚨 Rules permiten escritura pública (`allow write: if true`)  
🚨 Detectas uso anómalo en Analytics  
🚨 Aplicación maneja datos financieros/salud  

---

## ✅ Checklist Post-Limpieza

- [x] Historial de Git reescrito (API key eliminada)
- [x] app.json actualizado (usa variables de entorno)
- [x] .env.example sin credenciales reales
- [x] SECURITY.md público agregado
- [x] Documentación interna removida del repo
- [x] Ramas obsoletas eliminadas (docs, copilot)
- [ ] **Restricciones de API Key configuradas en Firebase Console**
- [ ] **Firestore Security Rules revisadas y desplegadas**
- [ ] **Firebase App Check habilitado (recomendado)**
- [ ] **Monitoreo de uso activo por 30 días**
- [ ] **(Opcional) Rotación completa si se detecta uso no autorizado**

---

## 📞 Soporte

**Si detectas actividad sospechosa:**
1. Deshabilita la API Key inmediatamente en Firebase Console
2. Revisa logs de Authentication y Firestore
3. Contacta: contacto@axoloit.com

**Última actualización:** 2026-02-04  
**Próxima revisión:** 2026-03-04 (30 días)
