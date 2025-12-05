import { useAuthContext } from '@/components/auth-context';
import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService, IncidenciaData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Modal, RefreshControl, ScrollView, TextInput, TouchableOpacity, View } from 'react-native';
import { getModernStyles } from '../_styles/modernStyles';

export default function AdminReportesScreen() {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const isDarkMode = theme === 'dark';
  const styles = getModernStyles(isDarkMode);

  const [incidencias, setIncidencias] = useState<IncidenciaData[]>([]);
  const [filtradas, setFiltradas] = useState<IncidenciaData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');
  const [busqueda, setBusqueda] = useState('');

  // Modal de detalle
  const [modalVisible, setModalVisible] = useState(false);
  const [incidenciaSeleccionada, setIncidenciaSeleccionada] = useState<IncidenciaData | null>(null);
  const [notas, setNotas] = useState('');

  const cargarIncidencias = useCallback(async () => {
    try {
      const data = await firebaseService.getAllIncidencias();
      setIncidencias(data);
      aplicarFiltros(data, filtroEstado, busqueda);
    } catch (error: any) {
      console.error('Error al cargar reportes:', error);
      Alert.alert('Error', 'No se pudieron cargar los reportes');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [filtroEstado, busqueda]);

  const aplicarFiltros = (data: IncidenciaData[], estado: string, texto: string) => {
    let resultado = data;

    if (estado !== 'todos') {
      resultado = resultado.filter(i => i.estado === estado);
    }

    if (texto.trim()) {
      const textoBusqueda = texto.toLowerCase();
      resultado = resultado.filter(i =>
        i.tipoIncidencia.toLowerCase().includes(textoBusqueda) ||
        i.descripcion.toLowerCase().includes(textoBusqueda) ||
        i.usuarioNombre.toLowerCase().includes(textoBusqueda) ||
        (i.id && i.id.toLowerCase().includes(textoBusqueda))
      );
    }

    setFiltradas(resultado);
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      cargarIncidencias();
    }, [cargarIncidencias])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarIncidencias();
  };

  const handleFiltroEstado = (estado: string) => {
    setFiltroEstado(estado);
    aplicarFiltros(incidencias, estado, busqueda);
  };

  const handleBusqueda = (texto: string) => {
    setBusqueda(texto);
    aplicarFiltros(incidencias, filtroEstado, texto);
  };

  const abrirDetalle = (incidencia: IncidenciaData) => {
    setIncidenciaSeleccionada(incidencia);
    setNotas(incidencia.notas || '');
    setModalVisible(true);
  };

  const cambiarEstado = async (nuevoEstado: 'pendiente' | 'en_proceso' | 'resuelta') => {
    if (!incidenciaSeleccionada || !incidenciaSeleccionada.id) return;

    try {
      await firebaseService.updateIncidencia(incidenciaSeleccionada.id, {
        estado: nuevoEstado,
        atendidoPor: user?.email || '',
        notas,
      });

      Alert.alert('Éxito', 'Estado actualizado correctamente');
      setModalVisible(false);
      cargarIncidencias();
    } catch (error: any) {
      console.error('Error al actualizar estado:', error);
      Alert.alert('Error', 'No se pudo actualizar el estado');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return '#FF9800';
      case 'en_proceso': return '#2196F3';
      case 'resuelta': return '#4CAF50';
      default: return '#9E9E9E';
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_proceso': return 'En Proceso';
      case 'resuelta': return 'Resuelta';
      default: return estado;
    }
  };

  const getTituloIncidencia = (tipo: string) => {
    const titulos: Record<string, string> = {
      falla_motor: 'Falla en el motor',
      llanta_ponchada: 'Llanta ponchada',
      accidente_trafico: 'Accidente de tráfico',
      via_bloqueada: 'Vía bloqueada',
      falla_mecanica: 'Falla mecánica',
      falta_combustible: 'Falta de combustible',
      problema_carga: 'Problema con carga',
      camion_no_paso: 'El camión no pasó',
      acumulacion_basura: 'Acumulación de basura',
      basura_regada: 'Basura regada',
      contenedor_danado: 'Contenedor lleno o dañado',
      otro: 'Otro',
    };
    return titulos[tipo] || tipo;
  };

  const countByEstado = (estado: string) => {
    return incidencias.filter(i => i.estado === estado).length;
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={{ marginTop: 16 }}>Cargando reportes...</ThemedText>
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
        <ThemedText type="title" style={styles.title}>
          Gestión de Reportes
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {incidencias.length} reporte{incidencias.length !== 1 ? 's' : ''} en total
        </ThemedText>

        {/* Estadísticas rápidas */}
        <View style={{ flexDirection: 'row', gap: 12, marginBottom: 16 }}>
          <View style={{ flex: 1, backgroundColor: isDarkMode ? 'rgba(255,152,0,0.2)' : 'rgba(255,152,0,0.1)', padding: 12, borderRadius: 12, alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: '#FF9800' }}>
              {countByEstado('pendiente')}
            </ThemedText>
            <ThemedText style={{ fontSize: 11, opacity: 0.7 }}>Pendientes</ThemedText>
          </View>
          <View style={{ flex: 1, backgroundColor: isDarkMode ? 'rgba(33,150,243,0.2)' : 'rgba(33,150,243,0.1)', padding: 12, borderRadius: 12, alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: '#2196F3' }}>
              {countByEstado('en_proceso')}
            </ThemedText>
            <ThemedText style={{ fontSize: 11, opacity: 0.7 }}>En Proceso</ThemedText>
          </View>
          <View style={{ flex: 1, backgroundColor: isDarkMode ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.1)', padding: 12, borderRadius: 12, alignItems: 'center' }}>
            <ThemedText style={{ fontSize: 24, fontWeight: 'bold', color: '#4CAF50' }}>
              {countByEstado('resuelta')}
            </ThemedText>
            <ThemedText style={{ fontSize: 11, opacity: 0.7 }}>Resueltas</ThemedText>
          </View>
        </View>

        {/* Barra de búsqueda */}
        <View style={[styles.card, { marginBottom: 16 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
            <Ionicons name="search" size={20} color={isDarkMode ? '#FFF' : '#000'} style={{ marginRight: 8 }} />
            <TextInput
              style={[styles.input, { flex: 1, marginBottom: 0 }]}
              placeholder="Buscar por folio, tipo o usuario..."
              placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
              value={busqueda}
              onChangeText={handleBusqueda}
            />
          </View>

          {/* Filtros de estado */}
          <View style={styles.chipContainer}>
            {[
              { value: 'todos', label: 'Todos', color: '#9E9E9E' },
              { value: 'pendiente', label: 'Pendientes', color: '#FF9800' },
              { value: 'en_proceso', label: 'En Proceso', color: '#2196F3' },
              { value: 'resuelta', label: 'Resueltas', color: '#4CAF50' },
            ].map((filtro) => (
              <TouchableOpacity
                key={filtro.value}
                style={[
                  styles.chip,
                  filtroEstado === filtro.value && { backgroundColor: filtro.color, borderColor: filtro.color },
                ]}
                onPress={() => handleFiltroEstado(filtro.value)}
              >
                <ThemedText
                  style={[
                    styles.chipText,
                    filtroEstado === filtro.value && { color: '#FFF', fontWeight: '600' },
                  ]}
                >
                  {filtro.label}
                </ThemedText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Lista de incidencias */}
        {filtradas.length === 0 ? (
          <View style={styles.card}>
            <ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
              No hay reportes que coincidan con los filtros
            </ThemedText>
          </View>
        ) : (
          filtradas.map((incidencia) => (
            <TouchableOpacity
              key={incidencia.id}
              style={[styles.card, { marginBottom: 12 }]}
              onPress={() => abrirDetalle(incidencia)}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <View style={{
                      backgroundColor: isDarkMode ? 'rgba(33,150,243,0.2)' : 'rgba(33,150,243,0.1)',
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 8,
                      marginRight: 8,
                    }}>
                      <ThemedText style={{ fontSize: 12, fontWeight: 'bold', color: '#2196F3' }}>
                        {incidencia.id?.substring(0, 8).toUpperCase()}
                      </ThemedText>
                    </View>
                    <View style={{
                      backgroundColor: getEstadoColor(incidencia.estado) + '33',
                      paddingHorizontal: 8,
                      paddingVertical: 4,
                      borderRadius: 8,
                    }}>
                      <ThemedText style={{ fontSize: 11, fontWeight: '600', color: getEstadoColor(incidencia.estado) }}>
                        {getEstadoTexto(incidencia.estado)}
                      </ThemedText>
                    </View>
                  </View>
                  <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 4 }}>
                    {getTituloIncidencia(incidencia.tipoIncidencia)}
                  </ThemedText>
                  <ThemedText style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }} numberOfLines={2}>
                    {incidencia.descripcion}
                  </ThemedText>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name={incidencia.usuarioRol === 'conductor' ? 'car' : 'person'} size={14} color={isDarkMode ? '#FFF' : '#000'} style={{ opacity: 0.6, marginRight: 4 }} />
                    <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>
                      {incidencia.usuarioNombre} · {incidencia.usuarioRol === 'conductor' ? 'Conductor' : 'Residente'}
                    </ThemedText>
                  </View>
                </View>
                <Ionicons name="chevron-forward" size={20} color={isDarkMode ? '#FFF' : '#000'} style={{ opacity: 0.5 }} />
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal de detalle */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
          <View style={{
            backgroundColor: isDarkMode ? '#1A1A1A' : '#FFF',
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            padding: 20,
            maxHeight: '80%',
          }}>
            <ScrollView showsVerticalScrollIndicator={false}>
              {incidenciaSeleccionada && (
                <>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <ThemedText style={{ fontSize: 20, fontWeight: 'bold' }}>
                      Detalle del Reporte
                    </ThemedText>
                    <TouchableOpacity onPress={() => setModalVisible(false)}>
                      <Ionicons name="close" size={28} color={isDarkMode ? '#FFF' : '#000'} />
                    </TouchableOpacity>
                  </View>

                  <View style={[styles.card, { backgroundColor: isDarkMode ? '#2A2A2A' : '#F5F5F5' }]}>
                    <ThemedText style={styles.label}>Folio</ThemedText>
                    <ThemedText style={{ fontSize: 16, fontWeight: '600', marginBottom: 12 }}>
                      {incidenciaSeleccionada.id?.substring(0, 8).toUpperCase()}
                    </ThemedText>

                    <ThemedText style={styles.label}>Tipo de Incidencia</ThemedText>
                    <ThemedText style={{ fontSize: 16, marginBottom: 12 }}>
                      {getTituloIncidencia(incidenciaSeleccionada.tipoIncidencia)}
                    </ThemedText>

                    <ThemedText style={styles.label}>Descripción</ThemedText>
                    <ThemedText style={{ fontSize: 15, marginBottom: 12 }}>
                      {incidenciaSeleccionada.descripcion}
                    </ThemedText>

                    {incidenciaSeleccionada.ubicacion && (
                      <>
                        <ThemedText style={styles.label}>Ubicación</ThemedText>
                        <ThemedText style={{ fontSize: 14, marginBottom: 12 }}>
                          {incidenciaSeleccionada.ubicacion}
                        </ThemedText>
                      </>
                    )}

                    <ThemedText style={styles.label}>Reportado por</ThemedText>
                    <ThemedText style={{ fontSize: 15, marginBottom: 4 }}>
                      {incidenciaSeleccionada.usuarioNombre}
                    </ThemedText>
                    <ThemedText style={{ fontSize: 13, opacity: 0.7, marginBottom: 12 }}>
                      {incidenciaSeleccionada.usuarioRol === 'conductor' ? 'Conductor' : 'Usuario Residencial'}
                    </ThemedText>

                    <ThemedText style={styles.label}>Estado Actual</ThemedText>
                    <View style={{
                      backgroundColor: getEstadoColor(incidenciaSeleccionada.estado) + '33',
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 10,
                      alignSelf: 'flex-start',
                      marginBottom: 16,
                    }}>
                      <ThemedText style={{ fontWeight: '600', color: getEstadoColor(incidenciaSeleccionada.estado) }}>
                        {getEstadoTexto(incidenciaSeleccionada.estado)}
                      </ThemedText>
                    </View>

                    <ThemedText style={styles.label}>Notas del Administrador</ThemedText>
                    <TextInput
                      style={[styles.input, { height: 80, textAlignVertical: 'top' }]}
                      placeholder="Agrega notas o comentarios..."
                      placeholderTextColor={isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)'}
                      value={notas}
                      onChangeText={setNotas}
                      multiline
                    />
                  </View>

                  <ThemedText style={[styles.label, { marginTop: 16, marginBottom: 12 }]}>
                    Cambiar Estado
                  </ThemedText>
                  <View style={{ gap: 10 }}>
                    {incidenciaSeleccionada.estado !== 'pendiente' && (
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#FF9800' }]}
                        onPress={() => cambiarEstado('pendiente')}
                      >
                        <ThemedText style={styles.buttonText}>Marcar como Pendiente</ThemedText>
                      </TouchableOpacity>
                    )}
                    {incidenciaSeleccionada.estado !== 'en_proceso' && (
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#2196F3' }]}
                        onPress={() => cambiarEstado('en_proceso')}
                      >
                        <ThemedText style={styles.buttonText}>Marcar En Proceso</ThemedText>
                      </TouchableOpacity>
                    )}
                    {incidenciaSeleccionada.estado !== 'resuelta' && (
                      <TouchableOpacity
                        style={[styles.button, { backgroundColor: '#4CAF50' }]}
                        onPress={() => cambiarEstado('resuelta')}
                      >
                        <ThemedText style={styles.buttonText}>Marcar como Resuelta</ThemedText>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ThemedView>
  );
}
