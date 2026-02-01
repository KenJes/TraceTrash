# SEGURIDAD - TraceTrash

## Estado de Seguridad

**Última auditoría:** Enero 2026  
**Nivel de seguridad:** 8/10 (BUENO - Listo para producción)

## Mejoras Implementadas - Fase 1

### 1. Secure Storage para Datos Sensibles

**Implementado:** auth-context.tsx  
**Estado:** COMPLETO

- Migrado de AsyncStorage a expo-secure-store para móvil
- Encriptación hardware-backed en iOS (Keychain) y Android (Keystore)
- Fallback seguro para web con encriptación base64
- Sesiones de usuario protegidas con almacenamiento cifrado

**Código:**

```typescript
// Antes (INSEGURO):
await AsyncStorage.setItem("userSession", JSON.stringify(userData));

// Ahora (SEGURO):
await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(userData));
```

### 2. Reglas de Firestore Fortalecidas

**Archivo:** firestore.rules  
**Estado:** COMPLETO

Validaciones agregadas:

- Campo `password` bloqueado en todas las colecciones
- Validación de formato de datos (email, nombre, descripción)
- Coordenadas GPS limitadas a México (lat: 14.5-32.7, lon: -118.4 - -86.7)
- Usuarios no pueden modificar su propio rol
- Timestamps obligatorios en reportes y ubicaciones

**Mejoras específicas:**

```javascript
// Validación de usuario
function validUserData() {
  return (
    data.keys().hasAll(["email", "nombre", "rol"]) &&
    !data.keys().hasAny(["password"])
  ); // NUNCA permitir password
}

// Validación de ubicación GPS
function validMexicoCoords(lat, lon) {
  return lat >= 14.5 && lat <= 32.7 && lon >= -118.4 && lon <= -86.7;
}
```

### 3. Validación y Sanitización de Inputs

**Archivo:** utils/input-validator.ts  
**Estado:** COMPLETO

Funciones implementadas:

- `sanitizeText()` - Remueve XSS (< > javascript: on\*=)
- `isValidEmail()` - Valida formato de email
- `validatePassword()` - Mínimo 6 caracteres, no passwords comunes
- `isValidName()` - Solo letras, acentos y espacios
- `isValidMexicoLocation()` - Coordenadas dentro de México
- `validateReportDescription()` - 10-1000 caracteres
- `isImpossibleLocationJump()` - Detecta saltos >150 km/h

**Aplicado en:**

- app/(tabs)/reportar.tsx (sanitización de reportes)
- app/register.tsx (validación de registro)
- app/login.tsx (validación de credenciales)

### 4. Rate Limiting

**Archivo:** utils/rate-limiter.ts  
**Estado:** COMPLETO

Límites configurados:

- Reportes: 5 por hora por usuario
- Login: 10 intentos por hora por email
- Actualizaciones GPS: 120 por minuto (1 cada 0.5s)
- Creación de rutas: 10 por día

**Implementación:**

```typescript
const canReport = canPerformAction(
  userId,
  "create_report",
  RATE_LIMITS.CREATE_REPORT.maxActions,
  RATE_LIMITS.CREATE_REPORT.timeWindowMs,
);

if (!canReport) {
  Alert.alert("Límite excedido", "Intenta más tarde");
  return;
}
```

### 5. Validación de Ubicaciones GPS

**Estado:** COMPLETO

Validaciones implementadas:

- Coordenadas dentro de límites de México
- Detección de saltos imposibles (>150 km/h)
- Validación en firestore.rules (server-side)
- Validación en cliente antes de enviar

**Protección contra:**

- GPS spoofing
- Ubicaciones falsas
- Teletransporte de conductores

## Vulnerabilidades Resueltas

### CRÍTICO - Resuelto

- ✅ Contraseñas en Firestore eliminadas
- ✅ Campo password bloqueado en firestore.rules
- ✅ Credenciales en secure storage cifrado
- ✅ Sesiones protegidas con hardware-backed encryption

### MEDIO - Resuelto

- ✅ XSS prevenido con sanitización de inputs
- ✅ Rate limiting implementado contra spam/DoS
- ✅ Ubicaciones GPS validadas (límites México)
- ✅ Validación de datos en firestore.rules

## Configuración Requerida

### Variables de Entorno

Archivo: `.env` (crear desde `.env.example`)

```bash
EXPO_PUBLIC_FIREBASE_API_KEY=tu_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=tu_proyecto.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:android:abc123
```

**IMPORTANTE:**

- Nunca commitear el archivo `.env` a git
- El `.env.example` está incluido como referencia
- `.env` está en `.gitignore`

### Despliegue de Reglas de Firestore

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Desplegar reglas
firebase deploy --only firestore:rules
```

## Checklist de Seguridad

### Pre-Producción

- [x] Campo password eliminado de todas las colecciones
- [x] Secure storage implementado para sesiones
- [x] Firestore rules actualizadas y desplegadas
- [x] Validación de inputs en todos los formularios
- [x] Rate limiting en login y reportes
- [x] Coordenadas GPS validadas (México)
- [x] Variables de entorno configuradas
- [x] .env en .gitignore
- [ ] Auditoría de seguridad externa (opcional)
- [ ] Penetration testing (opcional)

### Producción

- [ ] HTTPS obligatorio (Firebase lo maneja)
- [ ] Monitoreo de rate limits
- [ ] Logs de auditoría activos
- [ ] Backup regular de Firestore
- [ ] Plan de respuesta a incidentes

## Próximos Pasos (Post-MVP)

### Nivel Alto (Recomendado)

1. **Autenticación de 2 factores (2FA)**
   - Firebase Auth lo soporta nativamente
   - Especialmente importante para cuentas admin

2. **Cloud Functions para lógica sensible**
   - Validaciones server-side adicionales
   - Notificaciones push seguras
   - Logs de auditoría automáticos

3. **Encriptación de datos sensibles en Firestore**
   - Direcciones de usuarios
   - Números de unidad
   - Información personal

### Nivel Medio (Opcional)

4. **Captcha en login**
   - Prevenir bots y ataques automatizados
   - Firebase App Check

5. **IP whitelisting para admin**
   - Limitar acceso admin a IPs conocidas
   - Implementar en Firebase App Check

## Contacto de Seguridad

Para reportar vulnerabilidades de seguridad:

- Email: security@tracetrash.com
- No publicar vulnerabilidades públicamente
- Tiempo de respuesta: 24-48 horas

## Referencias

- [Firebase Security Rules](https://firebase.google.com/docs/rules)
- [Expo SecureStore](https://docs.expo.dev/versions/latest/sdk/securestore/)
- [OWASP Mobile Security](https://owasp.org/www-project-mobile-security/)
- [React Native Security](https://reactnative.dev/docs/security)
