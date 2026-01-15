# Guía de Pruebas - TraceTrash

## Preparación de Pruebas

### 1. Crear Ruta de Prueba

Ejecuta el script para crear la ruta Abasolo - Toluca:

```bash
npx ts-node scripts/crearRutaPrueba.ts
```

Guarda el ID de ruta que se genera.

### 2. Registrar Usuario de Prueba (Residente)

**Desde la App:**
1. Abre la app en el dispositivo del usuario
2. Click en "Registrarse"
3. Completa los datos:
   - Nombre: [Nombre del tester]
   - Email: [email del tester]
   - Contraseña: [contraseña]
   - Calle: **Calle Abasolo**
   - Número: [número]
   - Colonia: **Barrio de Cantarranas**
4. Click en "Registrarse"

**Asignar Ruta Manualmente (Firebase Console):**
1. Ve a Firebase Console → Firestore Database
2. Busca la colección `users`
3. Encuentra el usuario recién creado
4. Agrega/actualiza el campo `rutaId` con el ID de la ruta creada

### 3. Configurar Conductor

**Opción A: Desde Firebase Console (Recomendado)**
1. Ve a Firestore → `users`
2. Crea/edita un usuario conductor con:
   ```json
   {
     "email": "conductor@test.com",
     "nombre": "Conductor Prueba",
     "rol": "conductor",
     "unidad": "101",
     "rutaId": "[ID de la ruta]",
     "activo": true
   }
   ```

**Opción B: Desde la App Admin**
1. Inicia sesión como admin
2. Ve a "Conductores"
3. Agrega nuevo conductor
4. Asigna la ruta creada

### 4. Realizar Prueba

#### En Dispositivo del Conductor:
1. Inicia sesión con cuenta de conductor
2. Asegúrate de tener GPS activado
3. Ve a la pantalla principal (Conductor)
4. Click en "Iniciar Ruta"
5. Comienza a moverte por la ruta (o simula con GPS fake)

#### En Dispositivo del Residente:
1. Inicia sesión con cuenta de residente
2. Mantén la app abierta (o en segundo plano)
3. Espera notificaciones

### 5. Qué Esperar

**Sistema de Notificaciones:**
- Cuando el conductor esté a **menos de 100 metros** del residente
- Se enviará notificación automática: "El camión está a [distancia]m"
- El residente solo será notificado una vez por pasada
- Si el camión se aleja más de 200m, se puede volver a notificar

**En el Mapa (Residente):**
- Verá la ubicación en tiempo real del camión
- El ícono del camión se actualiza cada ~5 segundos

**En el Panel (Conductor):**
- Verá el estado de la ruta (Activa/Pausada)
- Puede pausar/reanudar/finalizar la ruta

## Resolución de Problemas

### El residente no recibe notificaciones

**Verifica:**
1. El usuario tiene `rutaId` asignado en Firestore
2. El usuario dio permisos de notificaciones
3. El usuario tiene `pushToken` registrado (check en Firestore)
4. GPS del conductor está activado
5. La ruta del conductor está "Activa" (no pausada)

**Solución:**
```bash
# Verificar en Firebase Console
users/[usuario_id] → pushToken debe existir
users/[usuario_id] → rutaId debe coincidir con la ruta del conductor
```

### El conductor no puede iniciar ruta

**Verifica:**
1. El conductor tiene `rutaId` asignado
2. El conductor tiene rol `"conductor"`
3. El conductor está `activo: true`
4. Permisos de ubicación están activados

### Las ubicaciones no se actualizan

**Verifica:**
1. GPS activado en el dispositivo
2. Permisos de ubicación en segundo plano (Android)
3. Firestore rules permiten escribir en `ubicaciones`
4. Network del dispositivo funcional

## Comandos Útiles

### Limpiar datos de prueba
```javascript
// En Firebase Console → Firestore
// Eliminar documentos de prueba en:
// - rutas/[ruta_test_id]
// - ubicaciones/* (donde rutaId == ruta_test_id)
```

### Verificar estado en consola
```javascript
// En el navegador, consola del desarrollador:
// Ver logs de proximidad
console.log('[Distancia calculada]')
console.log('[Notificando usuario]')
```

## Flujo Completo de Prueba

```
1. Admin crea ruta → Abasolo - Toluca
2. Usuario se registra → con dirección en Calle Abasolo
3. Admin asigna ruta al usuario (Firebase o app)
4. Conductor inicia sesión
5. Conductor "Inicia Ruta"
6. Conductor se mueve físicamente
7. Cuando < 100m → Usuario recibe notificación ✅
8. Usuario abre app → ve camión en mapa en tiempo real ✅
9. Conductor finaliza ruta
```

## Datos de la Ruta de Prueba

**Ruta:** Abasolo - Toluca
- **Inicio:** Calle Abasolo, Barrio de Cantarranas
- **Fin:** Carretera Toluca - Ciudad Altamirano (MEX 134)
- **Distancia:** ~760 metros
- **Color:** Naranja (#FF9800)

**Coordenadas aproximadas:**
- Inicio: 19.044439, -100.151187
- Fin: 19.038143, -100.145433

## Notas Importantes

1. **Permisos Críticos:**
   - Ubicación (Always/Siempre) para conductor
   - Notificaciones para residente
   
2. **Consumo de Batería:**
   - El tracking GPS consume batería
   - Pausar ruta cuando no esté en uso

3. **Precisión GPS:**
   - En exteriores: ±5-10 metros
   - En interiores: puede ser imprecisa
   - Requiere cielo despejado para mejor precisión

4. **Límites Firebase (Plan Spark):**
   - 50K lecturas/día
   - 20K escrituras/día
   - Suficiente para ~100 pruebas/día
