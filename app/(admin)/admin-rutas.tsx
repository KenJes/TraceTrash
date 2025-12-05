import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService, RutaData, UserData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { getModernStyles } from '../_styles/modernStyles';

export default function AdminRutasScreen() {
  const { theme } = useThemeContext();
  const isDarkMode = theme === 'dark';
  const styles = getModernStyles(isDarkMode);

  const [rutas, setRutas] = useState<RutaData[]>([]);
  const [conductores, setConductores] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalAsignar, setModalAsignar] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaData | null>(null);
  const [conductorSeleccionado, setConductorSeleccionado] = useState('');
  const [horario, setHorario] = useState('');
  const [asignandoAutomatico, setAsignandoAutomatico] = useState(false);

  const cargarDatos = async () => {
    try {
      const [rutasData, usuariosData] = await Promise.all([
        firebaseService.getAllRutas(),
        firebaseService.getAllUsers(),
      ]);

      setRutas(rutasData);
      setConductores(usuariosData.filter(u => u.rol === 'conductor' && u.activo));
    } catch (error: any) {
      console.error('Error al cargar datos:', error);
      Alert.alert('Error', 'No se pudieron cargar los datos');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      cargarDatos();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  const handleAsignarAutomaticamente = async () => {
    Alert.alert(
      'Asignación Automática',
      '¿Deseas asignar rutas automáticamente basándote en calle y colonia de los usuarios?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Asignar',
          onPress: async () => {
            setAsignandoAutomatico(true);
            const resultado = await firebaseService.asignarRutasAutomaticamente();
            setAsignandoAutomatico(false);

            if (resultado.success) {
              Alert.alert('Éxito', resultado.message);
              cargarDatos();
            } else {
              Alert.alert('Error', resultado.message);
            }
          },
        },
      ]
    );
  };

  const abrirModalAsignar = (ruta: RutaData) => {
    setRutaSeleccionada(ruta);
    setConductorSeleccionado(ruta.conductorAsignado || '');
    setHorario(ruta.horario || '');
    setModalAsignar(true);
  };

  const handleAsignarConductor = async () => {
    if (!conductorSeleccionado || !horario) {
      Alert.alert('Error', 'Selecciona un conductor y horario');
      return;
    }

    if (!rutaSeleccionada?.id) return;

    const resultado = await firebaseService.asignarConductorARuta(
      rutaSeleccionada.id,
      conductorSeleccionado,
      horario
    );

    if (resultado.success) {
      Alert.alert('Éxito', resultado.message);
      setModalAsignar(false);
      cargarDatos();
    } else {
      Alert.alert('Error', resultado.message);
    }
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2196F3" />
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
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <View>
            <ThemedText type="title" style={styles.title}>
              Gestión de Rutas
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {rutas.length} ruta{rutas.length !== 1 ? 's' : ''} registrada{rutas.length !== 1 ? 's' : ''}
            </ThemedText>
          </View>
        </View>

        {/* Botón asignación automática */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#2196F3', marginBottom: 16 }]}
          onPress={handleAsignarAutomaticamente}
          disabled={asignandoAutomatico}
        >
          {asignandoAutomatico ? (
            <ActivityIndicator size="small" color="#FFF" />
          ) : (
            <>
              <Ionicons name="git-network" size={20} color="#FFF" />
              <ThemedText style={[styles.buttonText, { marginLeft: 8 }]}>
                Asignar Rutas Automáticamente
              </ThemedText>
            </>
          )}
        </TouchableOpacity>

        {/* Stats */}
        <View style={styles.grid}>
          <View style={[styles.card, styles.gridItem]}>
            <View style={[styles.iconBadge, { backgroundColor: '#2196F3' }]}>
              <Ionicons name="map" size={24} color="#FFF" />
            </View>
            <ThemedText style={styles.metricValue}>{rutas.length}</ThemedText>
            <ThemedText style={styles.metricLabel}>Total Rutas</ThemedText>
          </View>

          <View style={[styles.card, styles.gridItem]}>
            <View style={[styles.iconBadge, { backgroundColor: '#4CAF50' }]}>
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            </View>
            <ThemedText style={styles.metricValue}>
              {rutas.filter(r => r.conductorAsignado).length}
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Con Conductor</ThemedText>
          </View>
        </View>

        {/* Lista de rutas */}
        <ThemedText style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
          Rutas Registradas
        </ThemedText>

        {rutas.length === 0 ? (
          <View style={styles.card}>
            <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
              No hay rutas registradas
            </ThemedText>
            <ThemedText style={{ textAlign: 'center', opacity: 0.5, fontSize: 12, marginTop: 8 }}>
              Usa la asignación automática para crear rutas
            </ThemedText>
          </View>
        ) : (
          rutas.map((ruta) => (
            <View key={ruta.id} style={[styles.card, { marginBottom: 12 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <View
                  style={{
                    width: 4,
                    height: '100%',
                    backgroundColor: ruta.color || '#2196F3',
                    borderRadius: 2,
                    marginRight: 12,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                    {ruta.nombre}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
                    📍 {ruta.calle}, {ruta.colonia}
                  </ThemedText>

                  {/* Info del conductor */}
                  {ruta.conductorAsignado ? (
                    <View
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.1)',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Ionicons name="person" size={16} color="#4CAF50" />
                        <ThemedText style={{ fontSize: 13, fontWeight: '600', marginLeft: 6 }}>
                          {ruta.conductorNombre}
                        </ThemedText>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                        <Ionicons name="car" size={16} color="#4CAF50" />
                        <ThemedText style={{ fontSize: 12, opacity: 0.7, marginLeft: 6 }}>
                          Unidad {ruta.unidad}
                        </ThemedText>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="time" size={16} color="#4CAF50" />
                        <ThemedText style={{ fontSize: 12, opacity: 0.7, marginLeft: 6 }}>
                          {ruta.horario}
                        </ThemedText>
                      </View>
                    </View>
                  ) : (
                    <View
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(255,152,0,0.2)' : 'rgba(255,152,0,0.1)',
                        padding: 12,
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    >
                      <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
                        Sin conductor asignado
                      </ThemedText>
                    </View>
                  )}

                  {/* Info de usuarios */}
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="people" size={16} color={isDarkMode ? '#AAA' : '#666'} />
                    <ThemedText style={{ fontSize: 12, opacity: 0.7, marginLeft: 6 }}>
                      {ruta.usuariosCount || 0} usuario{ruta.usuariosCount !== 1 ? 's' : ''}
                    </ThemedText>
                  </View>
                </View>
              </View>

              {/* Botón asignar conductor */}
              <TouchableOpacity
                style={[styles.button, { backgroundColor: '#2196F3' }]}
                onPress={() => abrirModalAsignar(ruta)}
              >
                <Ionicons name="person-add" size={16} color="#FFF" />
                <ThemedText style={[styles.buttonText, { fontSize: 13, marginLeft: 6 }]}>
                  {ruta.conductorAsignado ? 'Cambiar Conductor' : 'Asignar Conductor'}
                </ThemedText>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal de asignación de conductor */}
      <Modal
        visible={modalAsignar}
        transparent
        animationType="slide"
        onRequestClose={() => setModalAsignar(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { maxHeight: '80%' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <ThemedText style={[styles.sectionTitle, { margin: 0 }]}>Asignar Conductor</ThemedText>
              <TouchableOpacity onPress={() => setModalAsignar(false)}>
                <Ionicons name="close" size={24} color={isDarkMode ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 8 }}>
                Ruta: {rutaSeleccionada?.nombre}
              </ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.7, marginBottom: 16 }}>
                {rutaSeleccionada?.calle}, {rutaSeleccionada?.colonia}
              </ThemedText>

              <ThemedText style={styles.label}>Conductor</ThemedText>
              <View style={{ marginBottom: 16 }}>
                {conductores.map((conductor) => (
                  <TouchableOpacity
                    key={conductor.uid}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      padding: 12,
                      backgroundColor:
                        conductorSeleccionado === conductor.uid
                          ? isDarkMode
                            ? 'rgba(33,150,243,0.3)'
                            : 'rgba(33,150,243,0.1)'
                          : isDarkMode
                          ? '#2a2a2a'
                          : '#f5f5f5',
                      borderRadius: 8,
                      marginBottom: 8,
                      borderWidth: conductorSeleccionado === conductor.uid ? 2 : 0,
                      borderColor: '#2196F3',
                    }}
                    onPress={() => setConductorSeleccionado(conductor.uid)}
                  >
                    <View style={[styles.iconBadge, { backgroundColor: '#4CAF50', marginRight: 12, width: 36, height: 36 }]}>
                      <Ionicons name="person" size={18} color="#FFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <ThemedText style={{ fontSize: 14, fontWeight: '600' }}>
                        {conductor.nombre}
                      </ThemedText>
                      <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>
                        Unidad {conductor.unidad}
                      </ThemedText>
                    </View>
                    {conductorSeleccionado === conductor.uid && (
                      <Ionicons name="checkmark-circle" size={24} color="#2196F3" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>

              <ThemedText style={styles.label}>Horario</ThemedText>
              <TextInput
                style={styles.input}
                placeholder="Ej: 08:00 - 12:00"
                placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                value={horario}
                onChangeText={setHorario}
              />

              <TouchableOpacity
                style={[styles.button, { marginTop: 16 }]}
                onPress={handleAsignarConductor}
              >
                <ThemedText style={styles.buttonText}>Asignar Conductor</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
