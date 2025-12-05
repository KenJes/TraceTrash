import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService, UserData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, Switch, TextInput, TouchableOpacity, View } from 'react-native';
import { getModernStyles } from '../_styles/modernStyles';

export default function AdminConductoresScreen() {
  const { theme } = useThemeContext();
  const isDarkMode = theme === 'dark';
  const styles = getModernStyles(isDarkMode);

  const [conductores, setConductores] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');

  const cargarConductores = async () => {
    try {
      const usuarios = await firebaseService.getAllUsers();
      const conductoresData = usuarios.filter(u => u.rol === 'conductor');
      setConductores(conductoresData);
    } catch (error: any) {
      console.error('Error al cargar conductores:', error);
      Alert.alert('Error', 'No se pudieron cargar los conductores');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      cargarConductores();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarConductores();
  };

  const abrirModalNuevo = () => {
    setEmail('');
    setPassword('');
    setNombre('');
    setModalVisible(true);
  };

  const handleRegistrar = async () => {
    if (!email || !password || !nombre) {
      Alert.alert('Error', 'Completa todos los campos');
      return;
    }

    const result = await firebaseService.registerConductor(email, password, nombre);
    
    if (result.success) {
      Alert.alert('Éxito', result.message);
      setModalVisible(false);
      cargarConductores();
    } else {
      Alert.alert('Error', result.message);
    }
  };

  const toggleActivo = async (conductor: UserData) => {
    try {
      const nuevoEstado = !conductor.activo;
      await firebaseService.toggleConductorActivo(conductor.uid, nuevoEstado);
      cargarConductores();
    } catch (error: any) {
      console.error('Error al cambiar estado:', error);
      Alert.alert('Error', 'No se pudo cambiar el estado');
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <ThemedText type="title" style={styles.title}>
              Conductores
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {conductores.length} conductor{conductores.length !== 1 ? 'es' : ''} registrado{conductores.length !== 1 ? 's' : ''}
            </ThemedText>
          </View>
          <TouchableOpacity
            style={[styles.button, { paddingHorizontal: 16, paddingVertical: 10 }]}
            onPress={abrirModalNuevo}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Stats rápidas */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: isDarkMode ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.1)', padding: 16, borderRadius: 12, alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 28, fontWeight: 'bold', color: '#4CAF50' }}>
              {conductores.filter(c => c.activo !== false).length}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Activos</ThemedText>
          </View>
          <View style={{ flex: 1, backgroundColor: isDarkMode ? 'rgba(158,158,158,0.2)' : 'rgba(158,158,158,0.1)', padding: 16, borderRadius: 12, alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 28, fontWeight: 'bold', color: '#9E9E9E' }}>
              {conductores.filter(c => c.activo === false).length}
            </ThemedText>
            <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Inactivos</ThemedText>
          </View>
        </View>

        {/* Lista de conductores */}
        {conductores.length === 0 ? (
          <View style={styles.card}>
            <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
              No hay conductores registrados
            </ThemedText>
          </View>
        ) : (
          conductores.map((conductor, index) => (
            <View key={index} style={[styles.card, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                    <View style={[styles.iconBadge, { backgroundColor: conductor.activo !== false ? '#4CAF50' : '#9E9E9E', marginRight: 12 }]}>
                      <Ionicons name="car" size={20} color="#FFF" />
                    </View>
                    <View>
                      <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                        {conductor.nombre}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                        Unidad {conductor.unidad || 'N/A'}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
                    {conductor.email}
                  </ThemedText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <ThemedText style={{ fontSize: 12, marginRight: 8, opacity: 0.7 }}>
                      {conductor.activo !== false ? 'Activo' : 'Inactivo'}
                    </ThemedText>
                    <Switch
                      value={conductor.activo !== false}
                      onValueChange={() => toggleActivo(conductor)}
                      trackColor={{ false: '#767577', true: '#4CAF50' }}
                      thumbColor="#FFF"
                    />
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de nuevo conductor */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            maxHeight: '80%',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>
                Nuevo Conductor
              </ThemedText>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={isDarkMode ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={[styles.card, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F5F5F5' }]}>
                <ThemedText style={styles.label}>Nombre Completo</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Juan Pérez"
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={nombre}
                  onChangeText={setNombre}
                />

                <ThemedText style={styles.label}>Email</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="conductor@email.com"
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />

                <ThemedText style={styles.label}>Contraseña</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Mínimo 6 caracteres"
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry
                />

                <ThemedText style={[styles.label, { opacity: 0.6, fontSize: 12, marginTop: 8 }]}>
                  * La unidad se asignará automáticamente
                </ThemedText>
              </View>

              <TouchableOpacity
                style={[styles.button, { marginTop: 16 }]}
                onPress={handleRegistrar}
              >
                <ThemedText style={styles.buttonText}>Registrar Conductor</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
