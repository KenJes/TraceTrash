import { useAuthContext } from '@/components/auth-context';
import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Image, KeyboardAvoidingView, Platform, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { getModernStyles } from './_styles/modernStyles';
import RegisterScreen from './register';

export default function LoginScreen() {
  const { theme } = useThemeContext();
  const { login } = useAuthContext();
  const isDarkMode = theme === 'dark';
  const styles = getModernStyles(isDarkMode);

  const [screen, setScreen] = useState<'welcome' | 'login' | 'register'>('welcome');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginErrors, setLoginErrors] = useState<{ email?: string; password?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validateLogin = () => {
    const errors: { email?: string; password?: string } = {};
    if (!loginEmail.trim()) errors.email = 'Email requerido';
    if (!loginPassword.trim()) errors.password = 'Contraseña requerida';
    else if (loginPassword.length < 6) errors.password = 'Mínimo 6 caracteres';
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleLogin = async () => {
    if (!validateLogin()) return;
    setIsLoading(true);
    try {
      const userData = await firebaseService.login(loginEmail, loginPassword);
      login({
        email: userData.email,
        nombre: userData.nombre,
        direccion: userData.direccion || `${userData.calle}, ${userData.numero}, ${userData.colonia}`,
        rol: userData.rol,
        uid: userData.uid,
        rutaId: userData.rutaId,
        unidad: userData.unidad,
      });
      setLoginEmail('');
      setLoginPassword('');
    } catch (error: any) {
      const errorMessages: Record<string, string> = {
        'auth/invalid-credential': 'Contraseña incorrecta',
        'auth/wrong-password': 'Contraseña incorrecta',
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/invalid-email': 'Email inválido',
        'auth/too-many-requests': 'Demasiados intentos. Intenta más tarde',
      };
      Alert.alert('Error', errorMessages[error.code] || error.message || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ThemedView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={{ paddingBottom: 40, flexGrow: 1 }} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          {screen === 'welcome' && (
            <>
              <View style={styles.logoContainer}>
                <Image source={require('../assets/images/trace1_logo.png')} style={styles.logo} resizeMode="contain" />
              </View>
              <ThemedText type="title" style={[styles.title, { textAlign: 'center', marginTop: 8, marginBottom: 8 }]}>
                TraceTrash
              </ThemedText>
              <ThemedText style={[styles.subtitle, { textAlign: 'center' }]}>
                Sistema de Rastreo de Recolección de Residuos
              </ThemedText>

              <View style={styles.card}>
                <TouchableOpacity style={styles.button} onPress={() => setScreen('login')}>
                  <ThemedText style={styles.buttonText}>Iniciar Sesión</ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.buttonSecondary, { marginTop: 12 }]}
                  onPress={() => setScreen('register')}
                >
                  <ThemedText style={styles.buttonSecondaryText}>Crear Cuenta</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}

          {screen === 'login' && (
            <>
              <ThemedText type="title" style={styles.title}>Iniciar Sesión</ThemedText>
              <ThemedText style={styles.subtitle}>Accede a tu cuenta</ThemedText>

              <View style={styles.card}>
                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Email</ThemedText>
                  <TextInput
                    style={[styles.input, loginErrors.email && { borderColor: '#E53935' }]}
                    placeholder="tu@email.com"
                    placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                    value={loginEmail}
                    onChangeText={setLoginEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />
                  {loginErrors.email && (
                    <ThemedText style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>
                      {loginErrors.email}
                    </ThemedText>
                  )}
                </View>

                <View style={styles.inputGroup}>
                  <ThemedText style={styles.label}>Contraseña</ThemedText>
                  <View style={{ position: 'relative' }}>
                    <TextInput
                      style={[styles.input, loginErrors.password && { borderColor: '#E53935' }]}
                      placeholder="Ingresa tu contraseña"
                      placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity
                      style={{ position: 'absolute', right: 12, top: 12 }}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={isDarkMode ? '#888' : '#666'} />
                    </TouchableOpacity>
                  </View>
                  {loginErrors.password && (
                    <ThemedText style={{ color: '#E53935', fontSize: 12, marginTop: 4 }}>
                      {loginErrors.password}
                    </ThemedText>
                  )}
                </View>

                <TouchableOpacity 
                  style={[styles.button, isLoading && { opacity: 0.6 }]} 
                  onPress={handleLogin}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <ThemedText style={styles.buttonText}>Entrar</ThemedText>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={{ marginTop: 16, padding: 12, alignItems: 'center' }}
                  onPress={() => setScreen('welcome')}
                >
                  <ThemedText style={{ color: '#43A047', fontWeight: '600' }}>Volver</ThemedText>
                </TouchableOpacity>
              </View>
            </>
          )}

          {screen === 'register' && (
            <RegisterScreen
              onRegisterSuccess={() => setScreen('welcome')}
              onBackPress={() => setScreen('welcome')}
            />
          )}
        </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ThemedView>
  );
}
