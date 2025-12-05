import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { getModernStyles } from '../_styles/modernStyles';

export default function AdminMetricasScreen() {
  const { theme } = useThemeContext();
  const isDarkMode = theme === 'dark';
  const styles = getModernStyles(isDarkMode);

  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Métricas reales
  const [totalReportes, setTotalReportes] = useState(0);
  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [reportesPorDia, setReportesPorDia] = useState<number[]>([]);

  // Métricas simuladas
  const basuraRecolectadaMes = [980, 1050, 1120, 1250, 1180, 1340, 1420, 1380, 1290, 1460, 1520, 1580];
  const eficienciaRuta = 94;
  const tiempoPromedioRespuesta = 4.5;

  const cargarMetricas = async () => {
    try {
      // Datos reales
      const incidencias = await firebaseService.getAllIncidencias();
      const usuarios = await firebaseService.getAllUsers();
      
      setTotalReportes(incidencias.length);
      setTotalUsuarios(usuarios.length);

      // Reportes por día de la semana (últimos 7 días)
      const hoy = new Date();
      const reportesDia = [0, 0, 0, 0, 0, 0, 0];
      
      incidencias.forEach(inc => {
        const fecha = inc.createdAt.toDate ? inc.createdAt.toDate() : new Date(inc.createdAt);
        const diff = Math.floor((hoy.getTime() - fecha.getTime()) / (1000 * 60 * 60 * 24));
        if (diff < 7) {
          reportesDia[6 - diff]++;
        }
      });
      
      setReportesPorDia(reportesDia);
    } catch (error) {
      console.error('Error al cargar métricas:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      cargarMetricas();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarMetricas();
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
        <ThemedText type="title" style={styles.title}>
          Métricas y Análisis
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          Desempeño y crecimiento del sistema
        </ThemedText>

        {/* Métricas principales (REALES) */}
        <ThemedText style={[styles.sectionTitle, { marginTop: 16, marginBottom: 12 }]}>
          Métricas en Tiempo Real
        </ThemedText>
        
        <View style={styles.grid}>
          <View style={[styles.card, styles.gridItem, { backgroundColor: isDarkMode ? 'rgba(33,150,243,0.2)' : 'rgba(33,150,243,0.1)' }]}>
            <Ionicons name="document-text" size={32} color="#2196F3" style={{ marginBottom: 8 }} />
            <ThemedText style={{ fontSize: 32, fontWeight: 'bold', color: '#2196F3' }}>
              {totalReportes}
            </ThemedText>
            <ThemedText style={{ fontSize: 13, opacity: 0.8 }}>Total Reportes</ThemedText>
            <ThemedText style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>Datos reales</ThemedText>
          </View>

          <View style={[styles.card, styles.gridItem, { backgroundColor: isDarkMode ? 'rgba(156,39,176,0.2)' : 'rgba(156,39,176,0.1)' }]}>
            <Ionicons name="people" size={32} color="#9C27B0" style={{ marginBottom: 8 }} />
            <ThemedText style={{ fontSize: 32, fontWeight: 'bold', color: '#9C27B0' }}>
              {totalUsuarios}
            </ThemedText>
            <ThemedText style={{ fontSize: 13, opacity: 0.8 }}>Usuarios Registrados</ThemedText>
            <ThemedText style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>Datos reales</ThemedText>
          </View>
        </View>

        {/* Gráfica de reportes por día (REAL) */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="bar-chart" size={20} color={isDarkMode ? '#FFF' : '#000'} style={{ marginRight: 8 }} />
            <View>
              <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                Reportes por Día (Última Semana)
              </ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>Datos reales</ThemedText>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 150, gap: 8 }}>
            {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, index) => {
              const valor = reportesPorDia[index] || 0;
              const maxValor = Math.max(...reportesPorDia, 1);
              const altura = (valor / maxValor) * 120;
              
              return (
                <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{
                    width: '100%',
                    height: altura || 10,
                    backgroundColor: '#2196F3',
                    borderRadius: 8,
                    marginBottom: 8,
                    justifyContent: 'flex-end',
                    alignItems: 'center',
                    paddingBottom: 4,
                  }}>
                    {valor > 0 && (
                      <ThemedText style={{ fontSize: 10, fontWeight: 'bold', color: '#FFF' }}>
                        {valor}
                      </ThemedText>
                    )}
                  </View>
                  <ThemedText style={{ fontSize: 11, opacity: 0.7 }}>{dia}</ThemedText>
                </View>
              );
            })}
          </View>
        </View>

        {/* Métricas simuladas */}
        <ThemedText style={[styles.sectionTitle, { marginTop: 24, marginBottom: 12 }]}>
          Métricas del Sistema
        </ThemedText>

        <View style={styles.grid}>
          <View style={[styles.card, styles.gridItem, { backgroundColor: isDarkMode ? 'rgba(255,193,7,0.2)' : 'rgba(255,193,7,0.1)' }]}>
            <Ionicons name="time" size={32} color="#FFC107" style={{ marginBottom: 8 }} />
            <ThemedText style={{ fontSize: 32, fontWeight: 'bold', color: '#FFC107' }}>
              {tiempoPromedioRespuesta} hrs
            </ThemedText>
            <ThemedText style={{ fontSize: 13, opacity: 0.8 }}>Tiempo Promedio</ThemedText>
            <ThemedText style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>Respuesta a reportes</ThemedText>
          </View>

          <View style={[styles.card, styles.gridItem, { backgroundColor: isDarkMode ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.1)' }]}>
            <Ionicons name="checkmark-circle" size={32} color="#4CAF50" style={{ marginBottom: 8 }} />
            <ThemedText style={{ fontSize: 32, fontWeight: 'bold', color: '#4CAF50' }}>
              {eficienciaRuta}%
            </ThemedText>
            <ThemedText style={{ fontSize: 13, opacity: 0.8 }}>Eficiencia de Ruta</ThemedText>
            <ThemedText style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>Promedio del sistema</ThemedText>
          </View>
        </View>

        {/* Gráfica de basura recolectada (SIMULADO) */}
        <View style={[styles.card, { marginTop: 16 }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <Ionicons name="trending-up" size={20} color={isDarkMode ? '#FFF' : '#000'} style={{ marginRight: 8 }} />
            <View>
              <ThemedText style={{ fontSize: 16, fontWeight: '600' }}>
                Basura Recolectada por Mes (Toneladas)
              </ThemedText>
              <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>Datos simulados</ThemedText>
            </View>
          </View>
          
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 150, gap: 4 }}>
            {['E', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'].map((mes, index) => {
              const valor = basuraRecolectadaMes[index];
              const maxValor = Math.max(...basuraRecolectadaMes);
              const altura = (valor / maxValor) * 120;
              
              return (
                <View key={index} style={{ flex: 1, alignItems: 'center' }}>
                  <View style={{
                    width: '100%',
                    height: altura,
                    backgroundColor: '#4CAF50',
                    borderRadius: 4,
                    marginBottom: 8,
                  }} />
                  <ThemedText style={{ fontSize: 9, opacity: 0.7 }}>{mes}</ThemedText>
                </View>
              );
            })}
          </View>
          
          <View style={{ marginTop: 16, flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: isDarkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)' }}>
            <View>
              <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>Promedio Mensual</ThemedText>
              <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: '#4CAF50' }}>
                {Math.round(basuraRecolectadaMes.reduce((a, b) => a + b) / 12)} ton
              </ThemedText>
            </View>
            <View>
              <ThemedText style={{ fontSize: 12, opacity: 0.6 }}>Máximo</ThemedText>
              <ThemedText style={{ fontSize: 18, fontWeight: 'bold', color: '#4CAF50' }}>
                {Math.max(...basuraRecolectadaMes)} ton
              </ThemedText>
            </View>
          </View>
        </View>

        {/* Nota informativa */}
        <View style={[styles.card, { marginTop: 16, backgroundColor: isDarkMode ? 'rgba(33,150,243,0.1)' : 'rgba(33,150,243,0.05)', borderLeftWidth: 4, borderLeftColor: '#2196F3' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <Ionicons name="information-circle" size={20} color="#2196F3" style={{ marginRight: 8, marginTop: 2 }} />
            <View style={{ flex: 1 }}>
              <ThemedText style={{ fontSize: 14, fontWeight: '600', marginBottom: 4, color: '#2196F3' }}>
                Acerca de las Métricas
              </ThemedText>
              <ThemedText style={{ fontSize: 13, opacity: 0.8, lineHeight: 18 }}>
                Los datos de <ThemedText style={{ fontWeight: '600' }}>reportes y usuarios</ThemedText> son en tiempo real desde Firebase.
                Los datos de <ThemedText style={{ fontWeight: '600' }}>basura recolectada</ThemedText> son simulados para demostración.
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
