import { useAuthContext } from '@/components/auth-context';
import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService, RutaData, UbicacionData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, View } from 'react-native';
import { getModernStyles } from '../_styles/modernStyles';

export default function IndexScreen() {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const [ruta, setRuta] = useState<RutaData | null>(null);
  const [ubicacionCamion, setUbicacionCamion] = useState<UbicacionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const isDarkMode = theme === 'dark';
  const styles = getModernStyles(isDarkMode);

  const cargarDatos = useCallback(async () => {
    try {
      if (!user?.rutaId) {
        setRuta(null);
        setUbicacionCamion(null);
        return;
      }

      const rutaData = await firebaseService.getRutaById(user.rutaId);
      setRuta(rutaData);

      if (rutaData?.conductorAsignado) {
        const ubicacion = await firebaseService.getUbicacionConductor(rutaData.conductorAsignado);
        setUbicacionCamion(ubicacion);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.rutaId]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      cargarDatos();

      const interval = setInterval(() => {
        if (user?.rutaId && ruta?.conductorAsignado) {
          cargarDatos();
        }
      }, 10000);

      return () => clearInterval(interval);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [cargarDatos])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarDatos();
  };

  if (isLoading) {
    return (
      <ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={{ marginTop: 16 }}>Cargando información...</ThemedText>
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
        <View style={{ marginBottom: 24 }}>
          <ThemedText type="title" style={styles.title}>
            Bienvenido, {user?.nombre || 'Usuario'}
          </ThemedText>
          <ThemedText style={styles.subtitle}>
            Sistema de Gestión de Residuos
          </ThemedText>
        </View>

        {!ruta ? (
          <View style={styles.card}>
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="home-outline" size={64} color={isDarkMode ? '#666' : '#999'} />
              <ThemedText style={{ marginTop: 16, fontSize: 16, textAlign: 'center' }}>
                No tienes una ruta asignada
              </ThemedText>
              <ThemedText style={{ marginTop: 8, fontSize: 14, opacity: 0.6, textAlign: 'center' }}>
                Contacta al administrador para que te asigne una ruta de recolección
              </ThemedText>
            </View>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                <View style={[styles.iconBadge, { backgroundColor: '#2196F3', marginRight: 12 }]}>
                  <Ionicons name="map" size={20} color="#FFF" />
                </View>
                <ThemedText style={styles.sectionTitle}>Tu Ruta Asignada</ThemedText>
              </View>

              <View style={{ marginBottom: 12 }}>
                <ThemedText style={{ fontSize: 18, fontWeight: '600', marginBottom: 8 }}>
                  {ruta.nombre}
                </ThemedText>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Ionicons name="location" size={16} color="#4CAF50" style={{ marginRight: 6 }} />
                  <ThemedText style={styles.bodyText}>
                    {ruta.calle}, {ruta.colonia}
                  </ThemedText>
                </View>
                {ruta.horario && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Ionicons name="time" size={16} color="#FF9800" style={{ marginRight: 6 }} />
                    <ThemedText style={styles.bodyText}>
                      Horario: {ruta.horario}
                    </ThemedText>
                  </View>
                )}
              </View>

              {ruta.conductorNombre && (
                <View style={{
                  marginTop: 12,
                  padding: 12,
                  backgroundColor: isDarkMode ? '#2a2a2a' : '#f5f5f5',
                  borderRadius: 12
                }}>
                  <ThemedText style={{ fontSize: 13, opacity: 0.7, marginBottom: 4 }}>
                    Conductor asignado:
                  </ThemedText>
                  <ThemedText style={{ fontSize: 15, fontWeight: '600' }}>
                    {ruta.conductorNombre}
                    {ruta.unidad && ` - Unidad ${ruta.unidad}`}
                  </ThemedText>
                </View>
              )}
            </View>

            {ubicacionCamion ? (
              <View style={styles.card}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                  <View style={[styles.iconBadge, { backgroundColor: '#4CAF50', marginRight: 12 }]}>
                    <Ionicons name="car" size={20} color="#FFF" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <ThemedText style={styles.sectionTitle}>Camión en Ruta</ThemedText>
                    <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
                      Ubicación en tiempo real
                    </ThemedText>
                  </View>
                  <View style={{
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: '#4CAF50'
                  }} />
                </View>

                <View style={{
                  padding: 16,
                  backgroundColor: isDarkMode ? '#1a1a1a' : '#f9f9f9',
                  borderRadius: 12,
                  borderLeftWidth: 4,
                  borderLeftColor: '#4CAF50'
                }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>Latitud:</ThemedText>
                    <ThemedText style={{ fontSize: 13, fontWeight: '600' }}>
                      {ubicacionCamion.latitude.toFixed(6)}
                    </ThemedText>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>Longitud:</ThemedText>
                    <ThemedText style={{ fontSize: 13, fontWeight: '600' }}>
                      {ubicacionCamion.longitude.toFixed(6)}
                    </ThemedText>
                  </View>
                  {ubicacionCamion.velocidad && (
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                      <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>Velocidad:</ThemedText>
                      <ThemedText style={{ fontSize: 13, fontWeight: '600' }}>
                        {ubicacionCamion.velocidad} km/h
                      </ThemedText>
                    </View>
                  )}
                </View>

                <ThemedText style={{ fontSize: 12, opacity: 0.5, marginTop: 12, textAlign: 'center' }}>
                  💡 Usa la app móvil para ver el mapa interactivo
                </ThemedText>
              </View>
            ) : (
              <View style={styles.card}>
                <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                  <Ionicons name="location-outline" size={48} color={isDarkMode ? '#666' : '#999'} />
                  <ThemedText style={{ marginTop: 12, textAlign: 'center', opacity: 0.7 }}>
                    El camión aún no ha iniciado su ruta
                  </ThemedText>
                </View>
              </View>
            )}
          </>
        )}

        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={[styles.iconBadge, { backgroundColor: '#9C27B0', marginRight: 12 }]}>
              <Ionicons name="information-circle" size={20} color="#FFF" />
            </View>
            <ThemedText style={styles.sectionTitle}>Información</ThemedText>
          </View>

          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="leaf" size={20} color="#4CAF50" style={{ marginRight: 12 }} />
              <ThemedText style={[styles.bodyText, { flex: 1 }]}>
                Recuerda separar tus residuos correctamente
              </ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time" size={20} color="#FF9800" style={{ marginRight: 12 }} />
              <ThemedText style={[styles.bodyText, { flex: 1 }]}>
                Saca tu basura en el horario establecido
              </ThemedText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="alert-circle" size={20} color="#E53935" style={{ marginRight: 12 }} />
              <ThemedText style={[styles.bodyText, { flex: 1 }]}>
                Reporta cualquier incidencia desde la pestaña de Reportar
              </ThemedText>
            </View>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
