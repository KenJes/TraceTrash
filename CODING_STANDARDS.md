# Estándares de Código

Este documento define las prácticas de codificación para el proyecto TraceTrash.

## Comentarios

Mantener comentarios concisos y directos al código.

**NO usar:**
- Emojis en comentarios o console.log
- Comentarios en tercera persona dirigidos al lector
- Comentarios obvios que repiten lo que hace el código

**Usar:**
- Comentarios que explican "por qué", no "qué"
- Documentación técnica necesaria para comprender lógica compleja
- Comentarios JSDoc para funciones públicas cuando sea necesario

### Ejemplos

```typescript
// Incorrecto
// 🔐 Intentando login para el usuario
console.log('🔐 Intentando login para:', email);

// Correcto
console.log('Attempting login for:', email);

// Incorrecto
// Este código guarda el usuario en la base de datos
await saveUser(userData);

// Correcto (solo si es necesario)
// Guardar antes de validación para permitir rollback
await saveUser(userData);

// Mejor (sin comentario si el código es claro)
await saveUser(userData);
```

## Nomenclatura

- **Variables y funciones**: camelCase
- **Componentes React**: PascalCase
- **Constantes**: UPPER_SNAKE_CASE
- **Tipos e interfaces**: PascalCase con sufijo descriptivo

```typescript
// Variables
const userData = getUserData();
const isLoading = false;

// Funciones
function handleSubmit() {}
async function fetchUserData() {}

// Componentes
function LoginScreen() {}
function UserProfile() {}

// Constantes
const MAX_RETRY_COUNT = 3;
const API_BASE_URL = 'https://api.example.com';

// Tipos
interface UserData {}
type RequestStatus = 'pending' | 'success' | 'error';
```

## Imports

Orden de imports:
1. Librerías externas de React/React Native
2. Librerías de terceros
3. Imports de contextos
4. Imports de componentes
5. Imports de servicios
6. Imports de tipos
7. Imports de estilos

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { useAuthContext } from '@/components/auth-context';
import { ThemedView } from '@/components/themed-view';
import { firebaseService } from '@/services/firebase';
import type { UserData } from '@/services/firebase';
import { getModernStyles } from '../_styles/modernStyles';
```

## Manejo de Errores

Validar datos críticos antes de usarlos.

```typescript
// Incorrecto
const userId = user.uid;
await saveData(userId);

// Correcto
if (!user || !user.uid) {
  Alert.alert('Error', 'Usuario no válido');
  return;
}
await saveData(user.uid);
```

## Logging

Usar console.log solo para debugging durante desarrollo. Eliminar o comentar antes de commits a producción.

```typescript
// Desarrollo
console.log('User data:', userData);

// Producción
// console.log('User data:', userData);
```

## Formato

- Usar tabulación (tabs) para indentación
- Máximo 100 caracteres por línea cuando sea posible
- Espacios alrededor de operadores
- Llaves en la misma línea (K&R style)

```typescript
if (condition) {
  doSomething();
}

const result = value1 + value2;
```

## TypeScript

Definir tipos explícitos para parámetros de funciones y valores de retorno.

```typescript
// Incorrecto
function getUser(id) {
  return fetchUser(id);
}

// Correcto
function getUser(id: string): Promise<UserData> {
  return fetchUser(id);
}

// Correcto con async
async function getUser(id: string): Promise<UserData> {
  return await fetchUser(id);
}
```

## React Hooks

- Llamar hooks en el nivel superior del componente
- Usar nombres descriptivos con prefijo "use" para custom hooks
- Incluir dependencias correctas en arrays de dependencias

```typescript
function MyComponent() {
  const [data, setData] = useState<Data[]>([]);
  const { user } = useAuthContext();
  
  useEffect(() => {
    loadData();
  }, []);
  
  return <View />;
}
```

## Validación

Validar entradas del usuario antes de procesarlas.

```typescript
function handleSubmit() {
  if (!email.trim()) {
    Alert.alert('Error', 'Email requerido');
    return;
  }
  
  if (!validateEmail(email)) {
    Alert.alert('Error', 'Email inválido');
    return;
  }
  
  processSubmit(email);
}
```
