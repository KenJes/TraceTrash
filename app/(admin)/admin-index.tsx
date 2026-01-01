import { AdminMapView } from '@/components/admin-map-view';
import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService, UbicacionData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { getModernStyles } from '../_styles/modernStyles';

interface DashboardStats {
  totalReportes: number;
  reportesPendientes: number;
  reportesUrgentes: number;
  totalUsuarios: number;
  totalConductores: number;
  conductoresActivos: number;
}

export default function AdminIndexScreen() {
  const { theme } = useThemeContext();
  const isDarkMode = theme === 'dark';
  const styles = getModernStyles(isDarkMode);

  const [stats, setStats] = useState<DashboardStats>({
    totalReportes: 0,
    reportesPendientes: 0,
    reportesUrgentes: 0,
    totalUsuarios: 0,
    totalConductores: 0,
    conductoresActivos: 0,
  });
  const [ubicaciones, setUbicaciones] = useState<UbicacionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const cargarEstadisticas = async () => {
    try {
      // Cargar todas las incidencias
      const todasIncidencias = await firebaseService.getAllIncidencias();
      const pendientes = todasIncidencias.filter(i => i.estado === 'pendiente').length;
      const urgentes = todasIncidencias.filter(i => i.prioridad === 'alta').length;

      // Cargar todos los usuarios
      const usuarios = await firebaseService.getAllUsers();
      const conductores = usuarios.filter(u => u.rol === 'conductor');
      const conductoresActivos = conductores.filter(c => c.activo !== false).length;

      // Cargar ubicaciones activas
      const ubicacionesActivas = await firebaseService.getUbicacionesActivas();
      setUbicaciones(ubicacionesActivas);

      setStats({
        totalReportes: todasIncidencias.length,
        reportesPendientes: pendientes,
        reportesUrgentes: urgentes,
        totalUsuarios: usuarios.length,
        totalConductores: conductores.length,
        conductoresActivos: conductoresActivos,
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      cargarEstadisticas();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarEstadisticas();
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={{ marginTop: 16 }}>Cargando panel...</ThemedText>
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
        <View style={{ marginBottom: 24 }}>
          <ThemedText type="title" style={styles.title}>
            Panel de Control
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Gestión Operativa del Sistema
          </ThemedText>
        </View>

        {/* Métricas principales */}
        <View style={styles.grid}>
          {/* Total Reportes */}
          <View style={[styles.card, styles.gridItem]}>
            <View style={[styles.iconBadge, { backgroundColor: '#2196F3' }]}>
              <Ionicons name="document-text" size={24} color="#FFF" />
            </View>
            <ThemedText style={styles.metricValue}>{stats.totalReportes}</ThemedText>
            <ThemedText style={styles.metricLabel}>Total Reportes</ThemedText>
          </View>

          {/* Pendientes */}
          <View style={[styles.card, styles.gridItem]}>
            <View style={[styles.iconBadge, { backgroundColor: '#FF9800' }]}>
              <Ionicons name="time" size={24} color="#FFF" />
            </View>
            <ThemedText style={styles.metricValue}>{stats.reportesPendientes}</ThemedText>
            <ThemedText style={styles.metricLabel}>Pendientes</ThemedText>
          </View>

          {/* Urgentes */}
          <View style={[styles.card, styles.gridItem]}>
            <View style={[styles.iconBadge, { backgroundColor: '#E53935' }]}>
              <Ionicons name="alert-circle" size={24} color="#FFF" />
            </View>
            <ThemedText style={styles.metricValue}>{stats.reportesUrgentes}</ThemedText>
            <ThemedText style={styles.metricLabel}>Urgentes</ThemedText>
          </View>

          {/* Usuarios */}
          <View style={[styles.card, styles.gridItem]}>
            <View style={[styles.iconBadge, { backgroundColor: '#9C27B0' }]}>
              <Ionicons name="people" size={24} color="#FFF" />
            </View>
            <ThemedText style={styles.metricValue}>{stats.totalUsuarios}</ThemedText>
            <ThemedText style={styles.metricLabel}>Usuarios</ThemedText>
          </View>
        </View>

        {/* Mapa de Camiones en Ruta */}
        <View style={[styles.card, { marginTop: 16, height: 400, padding: 0, overflow: 'hidden' }]}>
          <View style={{ padding: 16, paddingBottom: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.iconBadge, { backgroundColor: '#4CAF50', marginRight: 12 }]}>
                <Ionicons name="map" size={20} color="#FFF" />
              </View>
              <View style={{ flex: 1 }}>
                <ThemedText style={styles.sectionTitle}>Camiones en Ruta</ThemedText>
                <ThemedText style={[styles.bodyText, { opacity: 0.7, fontSize: 13 }]}>
                  {ubicaciones.length} unidad{ubicaciones.length !== 1 ? 'es' : ''} en tiempo real
                </ThemedText>
              </View>
            </View>
          </View>

          {ubicaciones.length > 0 ? (
            <AdminMapView ubicaciones={ubicaciones} isDarkMode={isDarkMode} />
          ) : (
            <View style={{ 
              flex: 1, 
              backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
              justifyContent: 'center',
              alignItems: 'center',
              borderWidth: 1,
              borderColor: isDarkMode ? '#333' : '#e0e0e0'
            }}>
              <Ionicons name="map-outline" size={48} color={isDarkMode ? '#666' : '#999'} />
              <ThemedText style={{ marginTop: 12, opacity: 0.6 }}>Sin camiones activos</ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.4, marginTop: 4 }}>Los camiones aparecerán cuando inicien ruta</ThemedText>
            </View>
          )}
        </View>
      </ScrollView>
    </ThemedView>
  );
}
