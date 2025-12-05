import { useAuthContext } from '@/components/auth-context';
import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { firebaseService } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, TextInput, TouchableOpacity, View } from 'react-native';
import { getModernStyles } from './_styles/modernStyles';

interface RegisterScreenProps {
  onRegisterSuccess: () => void;
  onBackPress: () => void;
}

export default function RegisterScreen({ onRegisterSuccess, onBackPress }: RegisterScreenProps) {
  const { theme } = useThemeContext();
  const { login } = useAuthContext();
  const isDarkMode = theme === 'dark';
  const styles = getModernStyles(isDarkMode);

  const [registerEmail, setRegisterEmail] = useState('');
  const [registerNombre, setRegisterNombre] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [registerConfirmPassword, setRegisterConfirmPassword] = useState('');
  const [registerCalle, setRegisterCalle] = useState('');
  const [registerNumero, setRegisterNumero] = useState('');
  const [registerColonia, setRegisterColonia] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showRegisterConfirmPassword, setShowRegisterConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [registerErrors, setRegisterErrors] = useState<{
    email?: string;
    nombre?: string;
    password?: string;
    confirmPassword?: string;
    calle?: string;
    numero?: string;
    colonia?: string;
  }>({});

  const validateRegister = () => {
    const errors: Record<string, string> = {};
    if (!registerEmail.trim()) errors.email = 'Email requerido';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(registerEmail)) errors.email = 'Email inválido';
    if (!registerNombre.trim()) errors.nombre = 'Nombre requerido';
    if (!registerPassword.trim()) errors.password = 'Contraseña requerida';
    else if (registerPassword.length < 6) errors.password = 'Mínimo 6 caracteres';
    if (registerPassword !== registerConfirmPassword) errors.confirmPassword = 'No coinciden';
    if (!registerCalle.trim()) errors.calle = 'Calle requerida';
    if (!registerNumero.trim()) errors.numero = 'Número requerido';
    if (!registerColonia.trim()) errors.colonia = 'Colonia requerida';
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async () => {
    if (!validateRegister()) return;
    setIsLoading(true);
    try {
      const userData = await firebaseService.register(
        registerEmail, registerPassword, registerNombre,
        registerCalle, registerNumero, registerColonia
      );
      const address = `${userData.calle}, ${userData.numero}, ${userData.colonia}`;
      login(userData.email, userData.nombre, address, userData.rol, userData.uid);
      setRegisterEmail('');
      setRegisterNombre('');
      setRegisterPassword('');
      setRegisterConfirmPassword('');
      setRegisterCalle('');
      setRegisterNumero('');
      setRegisterColonia('');
      onRegisterSuccess();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al registrarse');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ThemedText type="title" style={styles.title}>Crear Cuenta</ThemedText>
      <ThemedText style={styles.subtitle}>Regístrate para comenzar</ThemedText>

      <View style={styles.card}>
        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Email</ThemedText>
          <TextInput
            style={[styles.input, registerErrors.email && { borderColor: '#E53935' }]}
            placeholder="tu@email.com"
            placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
            value={registerEmail}
            onChangeText={setRegisterEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!isLoading}
          />
          {registerErrors.email && (
            <ThemedText style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>
              {registerErrors.email}
            </ThemedText>
          )}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Nombre</ThemedText>
          <TextInput
            style={[styles.input, registerErrors.nombre && { borderColor: '#E53935' }]}
            placeholder="Nombre completo"
            placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
            value={registerNombre}
            onChangeText={setRegisterNombre}
            editable={!isLoading}
          />
          {registerErrors.nombre && (
            <ThemedText style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>
              {registerErrors.nombre}
            </ThemedText>
          )}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Contraseña</ThemedText>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.input, registerErrors.password && { borderColor: '#E53935' }]}
              placeholder="Mínimo 6 caracteres"
              placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
              value={registerPassword}
              onChangeText={setRegisterPassword}
              secureTextEntry={!showRegisterPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={{ position: 'absolute', right: 12, top: 12 }}
              onPress={() => setShowRegisterPassword(!showRegisterPassword)}
            >
              <Ionicons name={showRegisterPassword ? 'eye-off' : 'eye'} size={20} color={isDarkMode ? '#888' : '#666'} />
            </TouchableOpacity>
          </View>
          {registerErrors.password && (
            <ThemedText style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>
              {registerErrors.password}
            </ThemedText>
          )}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Confirmar Contraseña</ThemedText>
          <View style={{ position: 'relative' }}>
            <TextInput
              style={[styles.input, registerErrors.confirmPassword && { borderColor: '#E53935' }]}
              placeholder="Repite tu contraseña"
              placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
              value={registerConfirmPassword}
              onChangeText={setRegisterConfirmPassword}
              secureTextEntry={!showRegisterConfirmPassword}
              editable={!isLoading}
            />
            <TouchableOpacity
              style={{ position: 'absolute', right: 12, top: 12 }}
              onPress={() => setShowRegisterConfirmPassword(!showRegisterConfirmPassword)}
            >
              <Ionicons name={showRegisterConfirmPassword ? 'eye-off' : 'eye'} size={20} color={isDarkMode ? '#888' : '#666'} />
            </TouchableOpacity>
          </View>
          {registerErrors.confirmPassword && (
            <ThemedText style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>
              {registerErrors.confirmPassword}
            </ThemedText>
          )}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Calle</ThemedText>
          <TextInput
            style={[styles.input, registerErrors.calle && { borderColor: '#E53935' }]}
            placeholder="Av. Siempre Viva"
            placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
            value={registerCalle}
            onChangeText={setRegisterCalle}
            editable={!isLoading}
          />
          {registerErrors.calle && (
            <ThemedText style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>
              {registerErrors.calle}
            </ThemedText>
          )}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Número</ThemedText>
          <TextInput
            style={[styles.input, registerErrors.numero && { borderColor: '#E53935' }]}
            placeholder="123"
            placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
            value={registerNumero}
            onChangeText={setRegisterNumero}
            editable={!isLoading}
          />
          {registerErrors.numero && (
            <ThemedText style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>
              {registerErrors.numero}
            </ThemedText>
          )}
        </View>

        <View style={styles.inputGroup}>
          <ThemedText style={styles.label}>Colonia</ThemedText>
          <TextInput
            style={[styles.input, registerErrors.colonia && { borderColor: '#E53935' }]}
            placeholder="Centro"
            placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
            value={registerColonia}
            onChangeText={setRegisterColonia}
            editable={!isLoading}
          />
          {registerErrors.colonia && (
            <ThemedText style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>
              {registerErrors.colonia}
            </ThemedText>
          )}
        </View>

        <TouchableOpacity 
          style={[styles.button, isLoading && { opacity: 0.6 }]} 
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <ThemedText style={styles.buttonText}>Registrarse</ThemedText>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={{ marginTop: 16, padding: 12, alignItems: 'center' }}
          onPress={onBackPress}
          disabled={isLoading}
        >
          <ThemedText style={{ color: '#43A047', fontWeight: '600' }}>Volver</ThemedText>
        </TouchableOpacity>
      </View>
    </>
  );
}
