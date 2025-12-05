import { auth, db } from '@/services/firebaseconfig'; // storage comentado
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    User,
} from 'firebase/auth';
import {
    addDoc,
    collection,
    doc,
    getDoc,
    getDocs,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    updateDoc,
    where
} from 'firebase/firestore';
// import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'; // Comentado

export interface UserData {
  email: string;
  nombre: string;
  password: string;
  calle: string;
  numero: string;
  colonia: string;
  direccion?: string;  // Dirección completa
  rol: string;
  createdAt: string;
  uid: string;
  activo?: boolean;  // Para conductores activos/inactivos
  unidad?: string;  // Número de unidad para conductores
  rutaId?: string;  // ID de la ruta asignada
  horarioRuta?: string;  // Horario de la ruta (para conductores)
}

export interface RutaData {
  id?: string;
  nombre: string;  // Ej: "Ruta Centro 1"
  calle: string;
  colonia: string;
  conductorAsignado?: string;  // UID del conductor
  conductorNombre?: string;
  unidad?: string;
  horario?: string;  // Ej: "08:00 - 12:00"
  activa: boolean;
  usuariosCount: number;  // Cantidad de usuarios en la ruta
  createdAt: string;
  color?: string;  // Color para visualización en mapa
}

export interface UbicacionData {
  id?: string;
  conductorId: string;
  conductorNombre: string;
  rutaId: string;
  unidad: string;
  latitude: number;
  longitude: number;
  timestamp?: any;
  velocidad?: number;  // km/h
  heading?: number;  // Dirección en grados (0-360)
}

export interface IncidenciaData {
  id?: string;
  tipoIncidencia: string;
  descripcion: string;
  ubicacion: string | null;
  imagenes: string[];
  usuarioId: string;
  usuarioNombre: string;
  usuarioRol: string;
  estado: 'pendiente' | 'en_proceso' | 'resuelta';
  prioridad?: 'baja' | 'media' | 'alta';  // Prioridad de incidencia
  createdAt: any;
  updatedAt?: any;
  atendidoPor?: string;  // Email del admin que atendió
  notas?: string;  // Notas del administrador
}

export const firebaseService = {
  // Actualizar perfil de usuario
  updateUserProfile: async (userId: string, updates: { nombre?: string; direccion?: string }) => {
    try {
      const userRef = doc(db, 'users', userId);
      const updateData: any = {};
      
      if (updates.nombre !== undefined) {
        updateData.nombre = updates.nombre;
      }
      
      if (updates.direccion !== undefined) {
        updateData.direccion = updates.direccion;
        // También actualizar los campos separados si la dirección contiene comas
        const parts = updates.direccion.split(',').map(p => p.trim());
        if (parts.length >= 3) {
          updateData.calle = parts[0];
          updateData.numero = parts[1];
          updateData.colonia = parts[2];
        }
      }
      
      await updateDoc(userRef, updateData);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  },

  // Helper para detectar bloqueo por extensiones del navegador
  _isBlockedByClient: (err: any) => {
    if (!err) return false;
    const msg = String(err.message || err);
    return msg.includes('ERR_BLOCKED_BY_CLIENT') || msg.toLowerCase().includes('blocked') || msg.toLowerCase().includes('blocked_by_client');
  },
  // Registrar nuevo usuario
  register: async (
    email: string,
    password: string,
    nombre: string,
    calle: string,
    numero: string,
    colonia: string
  ): Promise<UserData> => {
    try {
      console.log('📝 Iniciando registro para:', email);
      
      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Usuario creado en Auth:', user.uid);

      // Construir datos del usuario que guardaremos en Firestore
      const userData: UserData = {
        email,
        nombre,
        password,
        calle,
        numero,
        colonia,
        rol: 'residente', // Todos los usuarios son residentes
        createdAt: new Date().toISOString(),
        uid: user.uid,
      };

      // Asegurarnos de que el token de auth esté disponible antes de escribir en Firestore
      try {
        await user.getIdToken();
        console.log('🔑 Token obtenido, escribiendo en Firestore...');
      } catch (tokErr) {
        console.warn('⚠️ No se pudo obtener token inmediatamente después del registro:', tokErr);
      }

      try {
        console.log('💾 Guardando en Firestore:', userData);
        await setDoc(doc(db, 'users', user.uid), userData);
        console.log('✅ Datos guardados correctamente');
      } catch (fsErr: any) {
        console.error('❌ Error al guardar en Firestore:', fsErr.code, fsErr.message);
        // Detectar bloqueo por extensión y aconsejar al usuario
        if ((firebaseService as any)._isBlockedByClient(fsErr)) {
          console.error('❌ La petición fue bloqueada por una extensión del navegador (p. ej. AdBlock). Desactiva extensiones o permite los dominios de Firebase.');
        }
        // Si falla por permisos, aún devolvemos el objeto de usuario creado en Auth
        if (fsErr.code === 'permission-denied') {
          console.warn('⚠️ Permisos insuficientes para escribir en Firestore. Revisa las reglas de seguridad.');
        }
      }

      return userData;
    } catch (error: any) {
      console.error('❌ Error en registro:', error.code, error.message);

      // Traduce errores de Firebase
      if (error.code === 'auth/email-already-in-use') {
        throw new Error('El email ya está registrado');
      } else if (error.code === 'auth/weak-password') {
        throw new Error('La contraseña es muy débil (mínimo 6 caracteres)');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      } else if (error.code === 'auth/operation-not-allowed') {
        throw new Error('El registro está deshabilitado. Revisa Firebase Console > Authentication > Email/Password');
      }
      throw new Error(error.message || 'Error desconocido en el registro');
    }
  },

  // Iniciar sesión
  login: async (email: string, password: string): Promise<UserData> => {
    try {
      console.log('🔐 Intentando login para:', email);
      
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log('✅ Autenticación exitosa, UID:', user.uid);

      // Obtener datos del usuario de Firestore
      console.log('📖 Buscando datos en Firestore para UID:', user.uid);
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
          console.warn('⚠️ Documento no encontrado en collection users, devolviendo datos mínimos del Auth');
          return {
            email: user.email || '',
            nombre: user.displayName || '',
            password: '',
            calle: '',
            numero: '',
            colonia: '',
            rol: 'residente',
            createdAt: new Date().toISOString(),
            uid: user.uid,
          } as UserData;
        }

        const data = userDoc.data() as UserData;
        console.log('✅ Usuario encontrado:', data);
        return data;
      } catch (fsErr: any) {
        console.error('❌ Error al leer Firestore:', fsErr.code, fsErr.message);
        if ((firebaseService as any)._isBlockedByClient(fsErr)) {
          console.error('❌ La petición a Firestore fue bloqueada por una extensión del navegador (p. ej. AdBlock). Prueba en una ventana de incógnito sin extensiones o desactiva temporalmente las extensiones.');
          return {
            email: user.email || '',
            nombre: user.displayName || '',
            password: '',
            calle: '',
            numero: '',
            colonia: '',
            rol: 'residente',
            createdAt: new Date().toISOString(),
            uid: user.uid,
          } as UserData;
        }
        if (fsErr.code === 'permission-denied') {
          console.warn('⚠️ Permisos insuficientes para leer datos del usuario. Revisa las reglas de Firestore. Devolviendo datos mínimos del Auth');
          return {
            email: user.email || '',
            nombre: user.displayName || '',
            password: '',
            calle: '',
            numero: '',
            colonia: '',
            rol: 'residente',
            createdAt: new Date().toISOString(),
            uid: user.uid,
          } as UserData;
        }
        throw fsErr;
      }
    } catch (error: any) {
      console.error('❌ Error en login:', error.code, error.message);

      // Mensaje más claro para credenciales inválidas y errores de configuración
      if (error.code === 'auth/user-not-found') {
        throw new Error('Usuario no encontrado en Firebase Auth');
      } else if (error.code === 'auth/wrong-password') {
        throw new Error('Contraseña incorrecta');
      } else if (error.code === 'auth/invalid-email') {
        throw new Error('Email inválido');
      } else if (error.code === 'auth/invalid-credential' || error.code === 'auth/invalid_auth') {
        throw new Error('Credenciales inválidas o configuración de Auth incorrecta. Revisa tu API key y que Email/Password esté habilitado en Firebase Console');
      } else if (error.message && error.message.includes('400')) {
        throw new Error('Error 400 de Identity Toolkit. Verifica tu API Key y restricciones en Google Cloud Console');
      }

      throw new Error(error.message || 'Error desconocido en el login');
    }
  },

  // Cerrar sesión
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      throw error;
    }
  },

  // Obtener usuario actual
  getCurrentUser: (): User | null => {
    return auth.currentUser;
  },

  // Obtener datos del usuario
  getUserData: async (uid: string): Promise<UserData | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? (userDoc.data() as UserData) : null;
    } catch (error) {
      console.error('Error al obtener datos del usuario:', error);
      return null;
    }
  },

  // Actualizar perfil del usuario
  updateUserProfile: async (
    uid: string,
    updates: Partial<UserData>
  ): Promise<void> => {
    try {
      await updateDoc(doc(db, 'users', uid), updates);
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      throw error;
    }
  },

  // ========== FUNCIONES DE INCIDENCIAS ==========

  /* COMENTADO: Funciones de Storage (requiere Firebase Blaze o AWS)
  // Para el futuro cuando se implemente almacenamiento de imágenes
  
  // Subir una imagen a Firebase Storage
  uploadImage: async (uri: string, usuarioId: string): Promise<string> => {
    try {
      console.log('📤 Subiendo imagen:', uri);
      console.log('📤 Usuario ID:', usuarioId);
      
      let blob: Blob;
      
      // Detectar si es data URL (web) o file URI (móvil)
      if (uri.startsWith('data:')) {
        // Web: convertir data URL a blob
        console.log('🌐 Procesando data URL (web)...');
        const response = await fetch(uri);
        blob = await response.blob();
      } else {
        // Móvil: usar XMLHttpRequest para URIs locales
        console.log('📱 Procesando URI local (móvil)...');
        blob = await new Promise<Blob>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.onload = function() {
            resolve(xhr.response as Blob);
          };
          xhr.onerror = function(e) {
            console.error('❌ Error en XMLHttpRequest:', e);
            reject(new TypeError('Error de red'));
          };
          xhr.responseType = 'blob';
          xhr.open('GET', uri, true);
          xhr.send(null);
        });
      }
      
      console.log('✅ Blob creado, tamaño:', blob.size, 'bytes');
      
      // Crear referencia única para la imagen
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(7);
      const filename = `incidencias/${usuarioId}/${timestamp}_${randomId}.jpg`;
      const storageRef = ref(storage, filename);
      
      console.log('📤 Subiendo a Storage:', filename);
      
      // Subir imagen
      await uploadBytes(storageRef, blob);
      
      // Obtener URL de descarga
      const downloadURL = await getDownloadURL(storageRef);
      console.log('✅ Imagen subida exitosamente:', downloadURL);
      
      return downloadURL;
    } catch (error: any) {
      console.error('❌ Error al subir imagen:', error);
      console.error('❌ Detalles del error:', error.message, error.stack);
      throw new Error(`Error al subir imagen: ${error.message}`);
    }
  },

  // Subir múltiples imágenes
  uploadImages: async (uris: string[], usuarioId: string): Promise<string[]> => {
    try {
      console.log('📤 Subiendo', uris.length, 'imágenes...');
      
      const uploadPromises = uris.map(uri => firebaseService.uploadImage(uri, usuarioId));
      const downloadURLs = await Promise.all(uploadPromises);
      
      console.log('✅ Todas las imágenes subidas');
      return downloadURLs;
    } catch (error: any) {
      console.error('❌ Error al subir imágenes:', error);
      throw new Error(`Error al subir imágenes: ${error.message}`);
    }
  },
  */

  // Crear una nueva incidencia
  createIncidencia: async (
    incidenciaData: Omit<IncidenciaData, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<string> => {
    try {
      console.log('📝 Creando incidencia:', incidenciaData);
      
      const incidencia = {
        ...incidenciaData,
        estado: 'pendiente' as const,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'incidencias'), incidencia);
      console.log('✅ Incidencia creada con ID:', docRef.id);
      
      return docRef.id;
    } catch (error: any) {
      console.error('❌ Error al crear incidencia:', error);
      throw new Error(error.message || 'Error al crear la incidencia');
    }
  },

  // Obtener incidencias de un usuario
  getUserIncidencias: async (usuarioId: string): Promise<IncidenciaData[]> => {
    try {
      console.log('📖 Obteniendo incidencias del usuario:', usuarioId);
      
      const q = query(
        collection(db, 'incidencias'),
        where('usuarioId', '==', usuarioId),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const incidencias: IncidenciaData[] = [];

      querySnapshot.forEach((doc) => {
        incidencias.push({
          id: doc.id,
          ...doc.data(),
        } as IncidenciaData);
      });

      console.log('✅ Incidencias encontradas:', incidencias.length);
      return incidencias;
    } catch (error: any) {
      console.error('❌ Error al obtener incidencias:', error);
      throw new Error(error.message || 'Error al obtener las incidencias');
    }
  },

  // Obtener todas las incidencias (para administradores)
  getAllIncidencias: async (): Promise<IncidenciaData[]> => {
    try {
      console.log('📖 Obteniendo todas las incidencias');
      
      const q = query(
        collection(db, 'incidencias'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const incidencias: IncidenciaData[] = [];

      querySnapshot.forEach((doc) => {
        incidencias.push({
          id: doc.id,
          ...doc.data(),
        } as IncidenciaData);
      });

      console.log('✅ Total de incidencias:', incidencias.length);
      return incidencias;
    } catch (error: any) {
      console.error('❌ Error al obtener incidencias:', error);
      throw new Error(error.message || 'Error al obtener las incidencias');
    }
  },

  // Actualizar estado de una incidencia
  updateIncidenciaEstado: async (
    incidenciaId: string,
    nuevoEstado: 'pendiente' | 'en_proceso' | 'resuelta'
  ): Promise<void> => {
    try {
      console.log('Actualizando estado de incidencia:', incidenciaId, 'a', nuevoEstado);
      
      await updateDoc(doc(db, 'incidencias', incidenciaId), {
        estado: nuevoEstado,
        updatedAt: serverTimestamp(),
      });

      console.log('Estado actualizado correctamente');
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      throw new Error(error.message || 'Error al actualizar el estado');
    }
  },

  // Actualizar incidencia completa (para admin)
  updateIncidencia: async (
    incidenciaId: string,
    datos: Partial<IncidenciaData>
  ): Promise<void> => {
    try {
      await updateDoc(doc(db, 'incidencias', incidenciaId), {
        ...datos,
        updatedAt: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error al actualizar incidencia:', error);
      throw new Error(error.message || 'Error al actualizar la incidencia');
    }
  },

  // Obtener todos los usuarios
  getAllUsers: async (): Promise<UserData[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'users'));
      const usuarios: UserData[] = [];

      querySnapshot.forEach((doc) => {
        usuarios.push(doc.data() as UserData);
      });

      return usuarios;
    } catch (error: any) {
      console.error('Error al obtener usuarios:', error);
      throw new Error(error.message || 'Error al obtener usuarios');
    }
  },

  // Registrar conductor (solo admin)
  registerConductor: async (
    email: string,
    password: string,
    nombre: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      // Crear usuario en Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Auto-generar número de unidad
      const usuarios = await getDocs(collection(db, 'users'));
      const conductores = usuarios.docs.filter(doc => doc.data().rol === 'conductor');
      const numeroUnidad = `U-${String(conductores.length + 1).padStart(3, '0')}`;

      // Crear documento en Firestore con UID como document ID
      await setDoc(doc(db, 'users', user.uid), {
        email,
        nombre,
        password,
        rol: 'conductor',
        unidad: numeroUnidad,
        activo: true,
        calle: '',
        numero: '',
        colonia: '',
        createdAt: new Date().toISOString(),
        uid: user.uid,
      });

      return { success: true, message: `Conductor registrado correctamente con unidad ${numeroUnidad}` };
    } catch (error: any) {
      console.error('Error al registrar conductor:', error);
      
      let message = 'Error al registrar conductor';
      if (error.code === 'auth/email-already-in-use') {
        message = 'El email ya está registrado';
      } else if (error.code === 'auth/weak-password') {
        message = 'La contraseña debe tener al menos 6 caracteres';
      }
      
      return { success: false, message };
    }
  },

  // Actualizar conductor
  updateConductor: async (
    uid: string,
    datos: Partial<UserData>
  ): Promise<void> => {
    try {
      await updateDoc(doc(db, 'users', uid), datos);
    } catch (error: any) {
      console.error('Error al actualizar conductor:', error);
      throw new Error(error.message || 'Error al actualizar conductor');
    }
  },

  // Activar/Desactivar conductor
  toggleConductorActivo: async (uid: string, activo: boolean): Promise<void> => {
    try {
      await updateDoc(doc(db, 'users', uid), { activo });
    } catch (error: any) {
      console.error('Error al cambiar estado del conductor:', error);
      throw new Error(error.message || 'Error al cambiar estado');
    }
  },

  // ============ GESTIÓN DE RUTAS ============

  // Crear nueva ruta
  crearRuta: async (
    nombre: string,
    calle: string,
    colonia: string,
    color?: string
  ): Promise<{ success: boolean; rutaId?: string; message: string }> => {
    try {
      const rutaData: RutaData = {
        nombre,
        calle,
        colonia,
        activa: true,
        usuariosCount: 0,
        createdAt: new Date().toISOString(),
        color: color || `#${Math.floor(Math.random()*16777215).toString(16)}`,
      };

      const rutaRef = await addDoc(collection(db, 'rutas'), rutaData);
      
      return { 
        success: true, 
        rutaId: rutaRef.id,
        message: 'Ruta creada correctamente' 
      };
    } catch (error: any) {
      console.error('Error al crear ruta:', error);
      return { 
        success: false, 
        message: error.message || 'Error al crear la ruta' 
      };
    }
  },

  // Asignar rutas automáticamente por calle y colonia
  asignarRutasAutomaticamente: async (): Promise<{ 
    success: boolean; 
    rutasCreadas: number; 
    usuariosAsignados: number;
    message: string 
  }> => {
    try {
      console.log('🚛 Iniciando asignación automática de rutas...');
      
      // Obtener todos los usuarios residentes
      const usuarios = await firebaseService.getAllUsers();
      const residentes = usuarios.filter(u => u.rol === 'residente');

      // Agrupar por calle y colonia
      const gruposPorRuta = new Map<string, UserData[]>();
      
      residentes.forEach(residente => {
        const clave = `${residente.calle.trim().toLowerCase()}|${residente.colonia.trim().toLowerCase()}`;
        if (!gruposPorRuta.has(clave)) {
          gruposPorRuta.set(clave, []);
        }
        gruposPorRuta.get(clave)!.push(residente);
      });

      console.log(`📍 Encontrados ${gruposPorRuta.size} grupos de rutas`);

      let rutasCreadas = 0;
      let usuariosAsignados = 0;

      // Crear/actualizar rutas para cada grupo
      for (const [clave, usuarios] of gruposPorRuta.entries()) {
        const [calle, colonia] = clave.split('|');
        
        // Verificar si ya existe una ruta para esta calle/colonia
        const qRutas = query(
          collection(db, 'rutas'),
          where('calle', '==', calle),
          where('colonia', '==', colonia)
        );
        const rutasExistentes = await getDocs(qRutas);

        let rutaId: string;

        if (rutasExistentes.empty) {
          // Crear nueva ruta
          const nombreRuta = `Ruta ${colonia.charAt(0).toUpperCase() + colonia.slice(1)} - ${calle.charAt(0).toUpperCase() + calle.slice(1)}`;
          const resultado = await firebaseService.crearRuta(nombreRuta, calle, colonia);
          
          if (!resultado.success || !resultado.rutaId) {
            console.error(`Error al crear ruta para ${clave}`);
            continue;
          }
          
          rutaId = resultado.rutaId;
          rutasCreadas++;
        } else {
          rutaId = rutasExistentes.docs[0].id;
        }

        // Asignar ruta a todos los usuarios de este grupo
        for (const usuario of usuarios) {
          await updateDoc(doc(db, 'users', usuario.uid), {
            rutaId: rutaId,
          });
          usuariosAsignados++;
        }

        // Actualizar contador de usuarios en la ruta
        await updateDoc(doc(db, 'rutas', rutaId), {
          usuariosCount: usuarios.length,
        });

        console.log(`✅ Ruta ${rutaId}: ${usuarios.length} usuarios asignados`);
      }

      return {
        success: true,
        rutasCreadas,
        usuariosAsignados,
        message: `${rutasCreadas} rutas creadas, ${usuariosAsignados} usuarios asignados`
      };
    } catch (error: any) {
      console.error('Error en asignación automática:', error);
      return {
        success: false,
        rutasCreadas: 0,
        usuariosAsignados: 0,
        message: error.message || 'Error al asignar rutas'
      };
    }
  },

  // Obtener todas las rutas
  getAllRutas: async (): Promise<RutaData[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, 'rutas'));
      const rutas: RutaData[] = [];

      querySnapshot.forEach((doc) => {
        rutas.push({
          id: doc.id,
          ...doc.data(),
        } as RutaData);
      });

      return rutas;
    } catch (error: any) {
      console.error('Error al obtener rutas:', error);
      throw new Error(error.message || 'Error al obtener rutas');
    }
  },

  // Asignar conductor a ruta
  asignarConductorARuta: async (
    rutaId: string,
    conductorId: string,
    horario: string
  ): Promise<{ success: boolean; message: string }> => {
    try {
      const conductor = await getDoc(doc(db, 'users', conductorId));
      if (!conductor.exists()) {
        return { success: false, message: 'Conductor no encontrado' };
      }

      const conductorData = conductor.data() as UserData;

      // Actualizar ruta con conductor
      await updateDoc(doc(db, 'rutas', rutaId), {
        conductorAsignado: conductorId,
        conductorNombre: conductorData.nombre,
        unidad: conductorData.unidad,
        horario: horario,
      });

      // Actualizar conductor con ruta
      await updateDoc(doc(db, 'users', conductorId), {
        rutaId: rutaId,
        horarioRuta: horario,
      });

      return { success: true, message: 'Conductor asignado correctamente' };
    } catch (error: any) {
      console.error('Error al asignar conductor:', error);
      return { 
        success: false, 
        message: error.message || 'Error al asignar conductor' 
      };
    }
  },

  // Obtener ruta por ID
  getRutaById: async (rutaId: string): Promise<RutaData | null> => {
    try {
      const rutaDoc = await getDoc(doc(db, 'rutas', rutaId));
      if (!rutaDoc.exists()) return null;
      
      return {
        id: rutaDoc.id,
        ...rutaDoc.data(),
      } as RutaData;
    } catch (error: any) {
      console.error('Error al obtener ruta:', error);
      return null;
    }
  },

  // ============ TRACKING DE UBICACIÓN ============

  // Guardar ubicación del conductor
  guardarUbicacion: async (ubicacionData: Omit<UbicacionData, 'id'>): Promise<void> => {
    try {
      await addDoc(collection(db, 'ubicaciones'), {
        ...ubicacionData,
        timestamp: serverTimestamp(),
      });
    } catch (error: any) {
      console.error('Error al guardar ubicación:', error);
      throw new Error(error.message || 'Error al guardar ubicación');
    }
  },

  // Obtener ubicación actual de un conductor
  getUbicacionConductor: async (conductorId: string): Promise<UbicacionData | null> => {
    try {
      const q = query(
        collection(db, 'ubicaciones'),
        where('conductorId', '==', conductorId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) return null;

      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      } as UbicacionData;
    } catch (error: any) {
      console.error('Error al obtener ubicación:', error);
      return null;
    }
  },

  // Obtener todas las ubicaciones activas (últimas posiciones de todos los conductores)
  getUbicacionesActivas: async (): Promise<UbicacionData[]> => {
    try {
      const ubicaciones: UbicacionData[] = [];
      const conductores = await firebaseService.getAllUsers();
      const conductoresActivos = conductores.filter(u => u.rol === 'conductor' && u.activo);

      for (const conductor of conductoresActivos) {
        const ubicacion = await firebaseService.getUbicacionConductor(conductor.uid);
        if (ubicacion) {
          // Solo incluir si la ubicación es reciente (últimos 5 minutos)
          const ahora = Date.now();
          const timestamp = ubicacion.timestamp?.toDate?.() || new Date(ubicacion.timestamp);
          const diff = ahora - timestamp.getTime();
          
          if (diff < 5 * 60 * 1000) { // 5 minutos
            ubicaciones.push(ubicacion);
          }
        }
      }

      return ubicaciones;
    } catch (error: any) {
      console.error('Error al obtener ubicaciones activas:', error);
      return [];
    }
  },

  // Obtener historial de ubicaciones de una ruta
  getHistorialUbicacionesRuta: async (rutaId: string, limit: number = 50): Promise<UbicacionData[]> => {
    try {
      const q = query(
        collection(db, 'ubicaciones'),
        where('rutaId', '==', rutaId),
        orderBy('timestamp', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const ubicaciones: UbicacionData[] = [];

      querySnapshot.forEach((doc) => {
        if (ubicaciones.length < limit) {
          ubicaciones.push({
            id: doc.id,
            ...doc.data(),
          } as UbicacionData);
        }
      });

      return ubicaciones;
    } catch (error: any) {
      console.error('Error al obtener historial de ubicaciones:', error);
      return [];
    }
  },
};

