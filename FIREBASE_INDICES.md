# Configuración de Firebase - Índices y Reglas

## 🔥 IMPORTANTE: Actualizar Reglas de Firestore

Las reglas actuales tienen un error crítico - están buscando la colección `usuarios` pero la app usa `users`.

### Pasos para actualizar las reglas:

1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto **TraceTrash**
3. Ve a **Firestore Database** → **Rules**
4. Copia y pega las siguientes reglas:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Función helper para verificar autenticación
    function isSignedIn() {
      return request.auth != null;
    }
    
    // Función helper para verificar si es admin
    function isAdmin() {
      return isSignedIn() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'admin';
    }
    
    // Función helper para verificar si es conductor
    function isConductor() {
      return isSignedIn() && 
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'conductor';
    }
    
    // COLECCIÓN: users (no usuarios)
    match /users/{userId} {
      // Cualquiera autenticado puede leer usuarios (necesario para asignaciones)
      allow read: if isSignedIn();
      // Cualquiera puede crear (registro)
      allow create: if true;
      // Solo el mismo usuario o admin puede actualizar
      allow update: if isSignedIn() && (request.auth.uid == userId || isAdmin());
      // Solo admin puede eliminar
      allow delete: if isAdmin();
    }
    
    // COLECCIÓN: rutas
    match /rutas/{rutaId} {
      // Todos los autenticados pueden leer rutas
      allow read: if isSignedIn();
      // Solo admin puede crear/actualizar/eliminar rutas
      allow write: if isAdmin();
    }
    
    // COLECCIÓN: ubicaciones
    match /ubicaciones/{ubicacionId} {
      // Todos pueden leer ubicaciones
      allow read: if isSignedIn();
      // Conductores y admin pueden crear/actualizar
      allow create, update: if isConductor() || isAdmin();
      // Solo admin puede eliminar
      allow delete: if isAdmin();
    }
    
    // COLECCIÓN: incidencias
    match /incidencias/{incidenciaId} {
      // Todos los autenticados pueden leer sus incidencias o todas si son admin/conductor
      allow read: if isSignedIn() && 
        (isAdmin() || 
         isConductor() || 
         resource.data.usuarioId == request.auth.uid);
      
      // Cualquier usuario autenticado puede crear incidencias
      allow create: if isSignedIn();
      
      // El usuario puede actualizar sus propias incidencias, admin puede actualizar todas
      allow update: if isSignedIn() && 
        (isAdmin() || resource.data.usuarioId == request.auth.uid);
      
      // Solo admin puede eliminar
      allow delete: if isAdmin();
    }
    
    // COLECCIÓN: historial
    match /historial/{historialId} {
      allow read: if isSignedIn();
      allow write: if isConductor() || isAdmin();
    }
  }
}
```

5. Click en **Publicar**
6. Espera unos segundos a que se propaguen los cambios

---

## 📊 Índices Requeridos en Firebase

Si ves el error: **"The query requires an index"**, necesitas crear los siguientes índices compuestos en Firebase:

### 1. Índice para `getUserIncidencias`
- **Colección**: `incidencias`
- **Campos**:
  - `usuarioId` (Ascending)
  - `createdAt` (Descending)

### 2. Índice para `getAllIncidencias`  
- **Colección**: `incidencias`
- **Campos**:
  - `createdAt` (Descending)

## Cómo crear los índices:

### Opción 1: Desde la Consola de Firebase
1. Ve a [Firebase Console](https://console.firebase.google.com/)
2. Selecciona tu proyecto
3. Ve a **Firestore Database** → **Indexes**
4. Click en **Create Index**
5. Agrega los campos según la tabla de arriba
6. Espera 2-5 minutos a que se construya el índice

### Opción 2: Desde la URL del Error
Cuando veas el error en la consola, copia la URL que aparece y ábrela en el navegador. Firebase te creará el índice automáticamente.

### Opción 3: Usar Firebase CLI
Crea un archivo `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "incidencias",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "usuarioId",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "incidencias",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "createdAt",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Luego ejecuta:
```bash
firebase deploy --only firestore:indexes
```

## Reglas de Seguridad

Asegúrate de tener las siguientes reglas en Firestore:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir lectura/escritura de usuarios autenticados
    match /users/{userId} {
      allow read, write: if request.auth != null;
    }
    
    // Incidencias - usuario puede crear y ver las suyas
    match /incidencias/{incidenciaId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && 
                     (request.auth.uid == resource.data.usuarioId || 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'admin');
      allow update, delete: if request.auth != null && 
                              get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'admin';
    }
    
    // Rutas - solo admins
    match /rutas/{rutaId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
                      get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'admin';
    }
    
    // Ubicaciones - conductores pueden escribir, todos pueden leer
    match /ubicaciones/{ubicacionId} {
      allow read: if request.auth != null;
      allow create, update: if request.auth != null && 
                               get(/databases/$(database)/documents/users/$(request.auth.uid)).data.rol == 'conductor';
    }
  }
}
```

## Notas Importantes

- Los índices pueden tardar entre 2-5 minutos en crearse
- Una vez creados, las consultas funcionarán sin problemas
- Si cambias las queries, necesitarás crear nuevos índices
- Firebase te mostrará la URL exacta para crear el índice cuando ocurra el error
