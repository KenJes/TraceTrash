import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService, RutaData } from '@/services/firebase';
import { optimizeRoute } from '@/services/route-optimizer';
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
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [asignandoAutomatico, setAsignandoAutomatico] = useState(false);
  
  // Modals
  const [modalNuevaRuta, setModalNuevaRuta] = useState(false);
  const [modalEditarRuta, setModalEditarRuta] = useState(false);
  const [rutaSeleccionada, setRutaSeleccionada] = useState<RutaData | null>(null);

  // Form states
  const [nombre, setNombre] = useState('');
  const [calle, setCalle] = useState('');
  const [colonia, setColonia] = useState('');
  const [direccionesTexto, setDireccionesTexto] = useState('');
  const [color, setColor] = useState('#2196F3');

  const coloresDisponibles = ['#2196F3', '#4CAF50', '#FF9800', '#9C27B0', '#F44336', '#00BCD4'];

  const cargarRutas = async () => {
    try {
      const rutasData = await firebaseService.getAllRutas();
      setRutas(rutasData);
    } catch (error: any) {
      console.error('Error al cargar rutas:', error);
      Alert.alert('Error', 'No se pudieron cargar las rutas');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      cargarRutas();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarRutas();
  };

  const handleAsignarAutomaticamente = async () => {
    Alert.alert(
      'Crear Rutas Automáticamente',
      '¿Deseas crear rutas automáticamente basándote en calle y colonia de los usuarios?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Crear Rutas',
          onPress: async () => {
            setAsignandoAutomatico(true);
            const resultado = await firebaseService.asignarRutasAutomaticamente();
            setAsignandoAutomatico(false);

            if (resultado.success) {
              Alert.alert('Éxito', resultado.message);
              cargarRutas();
            } else {
              Alert.alert('Error', resultado.message);
            }
          },
        },
      ]
    );
  };

  const abrirModalNueva = () => {
    setNombre('');
    setCalle('');
    setColonia('');
    setDireccionesTexto('');
    setColor('#2196F3');
    setModalNuevaRuta(true);
  };

  const abrirModalEditar = (ruta: RutaData) => {
    setRutaSeleccionada(ruta);
    setNombre(ruta.nombre);
    setCalle(ruta.calle || '');
    setColonia(ruta.colonia || '');
    setDireccionesTexto(ruta.direcciones?.join('\n') || '');
    setColor(ruta.color || '#2196F3');
    setModalEditarRuta(true);
  };

  const handleCrearRuta = async () => {
    if (!nombre || !calle || !colonia) {
      Alert.alert('Error', 'Completa todos los campos obligatorios');
      return;
    }

    const direcciones = direccionesTexto
      .split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    try {
      await firebaseService.createRuta({
        nombre,
        calle,
        colonia,
        direcciones: direcciones.length > 0 ? direcciones : [calle + ', ' + colonia],
        color,
        estado: 'inactiva',
      });
      
      Alert.alert('Éxito', 'Ruta creada correctamente');
      setModalNuevaRuta(false);
      cargarRutas();
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo crear la ruta');
    }
  };

  const handleActualizarRuta = async () => {
    if (!rutaSeleccionada || !nombre || !calle || !colonia) {
      Alert.alert('Error', 'Completa todos los campos obligatorios');
      return;
    }

    const direcciones = direccionesTexto
      .split('\n')
      .map(d => d.trim())
      .filter(d => d.length > 0);

    try {
      await firebaseService.updateRuta(rutaSeleccionada.id!, {
        nombre,
        calle,
        colonia,
        direcciones: direcciones.length > 0 ? direcciones : [calle + ', ' + colonia],
        color,
      });
      
      Alert.alert('Éxito', 'Ruta actualizada correctamente');
      setModalEditarRuta(false);
      cargarRutas();
    } catch (error: any) {
      Alert.alert('Error', 'No se pudo actualizar la ruta');
    }
  };

  const handleEliminarRuta = (ruta: RutaData) => {
    Alert.alert(
      'Eliminar Ruta',
      `¿Estás seguro de eliminar la ruta "${ruta.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              await firebaseService.deleteRuta(ruta.id!);
              Alert.alert('Éxito', 'Ruta eliminada');
              cargarRutas();
            } catch (error: any) {
              Alert.alert('Error', 'No se pudo eliminar la ruta');
            }
          },
        },
      ]
    );
  };

  const handleOptimizarRuta = async (ruta: RutaData) => {
    if (!ruta.direcciones || ruta.direcciones.length < 2) {
      Alert.alert('Error', 'La ruta debe tener al menos 2 direcciones');
      return;
    }

    Alert.alert(
      'Optimizar Ruta',
      `¿Deseas optimizar la ruta "${ruta.nombre}" para reducir distancias?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Optimizar',
          onPress: async () => {
            try {
              const rutaOptimizada = await optimizeRoute(ruta.direcciones!);
              
              await firebaseService.updateRuta(ruta.id!, {
                direcciones: rutaOptimizada,
              });
              
              Alert.alert('Éxito', 'Ruta optimizada correctamente');
              cargarRutas();
            } catch (error: any) {
              Alert.alert('Error', 'No se pudo optimizar la ruta');
            }
          },
        },
      ]
    );
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
          <TouchableOpacity
            style={[styles.button, { paddingHorizontal: 16, paddingVertical: 10 }]}
            onPress={abrirModalNueva}
          >
            <Ionicons name="add" size={20} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Botón crear rutas automáticamente */}
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
                Crear Rutas Automáticamente
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
              <Ionicons name="people" size={24} color="#FFF" />
            </View>
            <ThemedText style={styles.metricValue}>
              {rutas.reduce((sum, r) => sum + (r.usuariosCount || 0), 0)}
            </ThemedText>
            <ThemedText style={styles.metricLabel}>Total Usuarios</ThemedText>
          </View>
        </View>

        {/* Lista de rutas */}
        <ThemedText style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
          Rutas Registradas
        </ThemedText>

        {rutas.length === 0 ? (
          <View style={styles.card}>
            <Ionicons name="map-outline" size={48} color="#999" style={{ alignSelf: 'center', marginBottom: 8 }} />
            <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
              No hay rutas registradas
            </ThemedText>
            <ThemedText style={{ textAlign: 'center', opacity: 0.5, fontSize: 12, marginTop: 8 }}>
              Usa la creación automática o crea una manualmente
            </ThemedText>
          </View>
        ) : (
          rutas.map((ruta) => (
            <View key={ruta.id} style={[styles.card, { marginBottom: 12 }]}>
              {/* Header de la ruta */}
              <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 }}>
                <View
                  style={{
                    width: 4,
                    backgroundColor: ruta.color || '#2196F3',
                    borderRadius: 2,
                    marginRight: 12,
                    alignSelf: 'stretch',
                  }}
                />
                <View style={{ flex: 1 }}>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                    {ruta.nombre}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>
                    📍 {ruta.calle}, {ruta.colonia}
                  </ThemedText>

                  {/* Información de la ruta */}
                  <View style={{ flexDirection: 'row', gap: 16, marginBottom: 8 }}>
                    <View>
                      <ThemedText style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>DIRECCIONES</ThemedText>
                      <ThemedText style={{ fontSize: 14 }}>
                        {ruta.direcciones?.length || 0}
                      </ThemedText>
                    </View>
                    <View>
                      <ThemedText style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>USUARIOS</ThemedText>
                      <ThemedText style={{ fontSize: 14 }}>
                        {ruta.usuariosCount || 0}
                      </ThemedText>
                    </View>
                    <View>
                      <ThemedText style={{ fontSize: 11, opacity: 0.5, marginBottom: 2 }}>ESTADO</ThemedText>
                      <ThemedText style={{ fontSize: 14 }}>
                        {ruta.estado || 'inactiva'}
                      </ThemedText>
                    </View>
                  </View>

                  {/* Conductor asignado */}
                  {ruta.conductorNombre && (
                    <View
                      style={{
                        backgroundColor: isDarkMode ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.1)',
                        padding: 8,
                        borderRadius: 8,
                        marginBottom: 8,
                      }}
                    >
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name="person" size={14} color="#4CAF50" />
                        <ThemedText style={{ fontSize: 12, marginLeft: 6 }}>
                          Conductor: {ruta.conductorNombre}
                        </ThemedText>
                      </View>
                    </View>
                  )}
                </View>
              </View>

              {/* Botones de acción */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    backgroundColor: isDarkMode ? '#2196F3' : '#2196F3',
                    paddingVertical: 10,
                    borderRadius: 8,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                  onPress={() => handleOptimizarRuta(ruta)}
                >
                  <Ionicons name="git-compare" size={16} color="#FFF" />
                  <ThemedText style={{ color: '#FFF', fontSize: 13, marginLeft: 6, fontWeight: '600' }}>
                    Optimizar
                  </ThemedText>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: isDarkMode ? '#333' : '#E0E0E0',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                  onPress={() => abrirModalEditar(ruta)}
                >
                  <Ionicons name="create-outline" size={16} color={isDarkMode ? '#FFF' : '#000'} />
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    backgroundColor: isDarkMode ? 'rgba(244,67,54,0.2)' : 'rgba(244,67,54,0.1)',
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 8,
                  }}
                  onPress={() => handleEliminarRuta(ruta)}
                >
                  <Ionicons name="trash-outline" size={16} color="#F44336" />
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Modal: Nueva Ruta */}
      <Modal visible={modalNuevaRuta} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            maxHeight: '85%',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>
                Nueva Ruta
              </ThemedText>
              <TouchableOpacity onPress={() => setModalNuevaRuta(false)}>
                <Ionicons name="close" size={28} color={isDarkMode ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={[styles.card, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F5F5F5' }]}>
                <ThemedText style={styles.label}>Nombre de la Ruta *</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Ruta Centro, Ruta Norte"
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={nombre}
                  onChangeText={setNombre}
                />

                <ThemedText style={styles.label}>Calle Principal *</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Av. Principal"
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={calle}
                  onChangeText={setCalle}
                />

                <ThemedText style={styles.label}>Colonia *</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Ej: Centro"
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={colonia}
                  onChangeText={setColonia}
                />

                <ThemedText style={styles.label}>Direcciones (una por línea)</ThemedText>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Calle 1&#10;Calle 2&#10;Calle 3"
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={direccionesTexto}
                  onChangeText={setDireccionesTexto}
                  multiline
                />

                <ThemedText style={styles.label}>Color</ThemedText>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  {coloresDisponibles.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: c,
                        borderWidth: color === c ? 3 : 0,
                        borderColor: '#FFF',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 3,
                        elevation: 3,
                      }}
                      onPress={() => setColor(c)}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, { marginTop: 16, backgroundColor: '#2196F3' }]}
                onPress={handleCrearRuta}
              >
                <Ionicons name="checkmark-circle" size={20} color="#FFF" />
                <ThemedText style={[styles.buttonText, { marginLeft: 8 }]}>Crear Ruta</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal: Editar Ruta */}
      <Modal visible={modalEditarRuta} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            maxHeight: '85%',
          }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>
                Editar Ruta
              </ThemedText>
              <TouchableOpacity onPress={() => setModalEditarRuta(false)}>
                <Ionicons name="close" size={28} color={isDarkMode ? '#FFF' : '#000'} />
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={[styles.card, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F5F5F5' }]}>
                <ThemedText style={styles.label}>Nombre de la Ruta</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Nombre de la ruta"
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={nombre}
                  onChangeText={setNombre}
                />

                <ThemedText style={styles.label}>Calle Principal</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Calle principal"
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={calle}
                  onChangeText={setCalle}
                />

                <ThemedText style={styles.label}>Colonia</ThemedText>
                <TextInput
                  style={styles.input}
                  placeholder="Colonia"
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={colonia}
                  onChangeText={setColonia}
                />

                <ThemedText style={styles.label}>Direcciones (una por línea)</ThemedText>
                <TextInput
                  style={[styles.input, { height: 100, textAlignVertical: 'top' }]}
                  placeholder="Una dirección por línea"
                  placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                  value={direccionesTexto}
                  onChangeText={setDireccionesTexto}
                  multiline
                />

                <ThemedText style={styles.label}>Color</ThemedText>
                <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
                  {coloresDisponibles.map((c) => (
                    <TouchableOpacity
                      key={c}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: c,
                        borderWidth: color === c ? 3 : 0,
                        borderColor: '#FFF',
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 3,
                        elevation: 3,
                      }}
                      onPress={() => setColor(c)}
                    />
                  ))}
                </View>
              </View>

              <TouchableOpacity
                style={[styles.button, { marginTop: 16 }]}
                onPress={handleActualizarRuta}
              >
                <Ionicons name="save" size={20} color="#FFF" />
                <ThemedText style={[styles.buttonText, { marginLeft: 8 }]}>Guardar Cambios</ThemedText>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
