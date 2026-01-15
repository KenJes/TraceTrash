import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export interface User {
  email: string;
  nombre: string;
  password?: string;
  direccion?: string;  // Combinación de calle, numero y colonia
  rol?: string;  // 'residente', 'conductor' o 'admin'
  uid?: string;  // ID del usuario en Firestore
  rutaId?: string;  // ID de la ruta asignada
  unidad?: string;  // Número de unidad (para conductores)
}

interface AuthContextProps {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar sesión guardada al iniciar
  useEffect(() => {
    loadUserSession();
  }, []);

  const loadUserSession = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('userSession');
      if (savedUser) {
        setUser(JSON.parse(savedUser));
      }
    } catch (error) {
      console.error('Error al cargar sesión:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    try {
      setUser(userData);
      await AsyncStorage.setItem('userSession', JSON.stringify(userData));
    } catch (error) {
      console.error('Error al guardar sesión:', error);
      setUser(userData);
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('userSession');
      setUser(null);
    } catch (error) {
      console.error('Error al limpiar sesión:', error);
      setUser(null);
    }
  };

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      try {
        await AsyncStorage.setItem('userSession', JSON.stringify(updatedUser));
      } catch (error) {
        console.error('Error al actualizar sesión:', error);
      }
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoggedIn: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within an AuthProvider');
  return context;
}
