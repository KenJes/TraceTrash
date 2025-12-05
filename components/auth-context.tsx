import React, { createContext, ReactNode, useContext, useState } from 'react';

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

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

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
