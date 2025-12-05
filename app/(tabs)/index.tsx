import { useAuthContext } from '@/components/auth-context';
import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService, RutaData, UbicacionData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Image, RefreshControl, ScrollView, View } from 'react-native';
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

      // Cargar información de la ruta
      const rutaData = await firebaseService.getRutaById(user.rutaId);
      setRuta(rutaData);

      // Si la ruta tiene conductor asignado, buscar su ubicación
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

      // Actualizar ubicación cada 10 segundos
      const interval = setInterval(cargarDatos, 10000);
      
      return () => clearInterval(interval);
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
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/images/trace1_logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        
        <ThemedText type="title" style={styles.title}>
          Recolección de Residuos
        </ThemedText>

        {/* Información de ruta */}
        {ruta ? (
          <>
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.iconBadge, { backgroundColor: ruta.color || '#4CAF50', marginRight: 12 }]}>
                  <Ionicons name="map" size={20} color="#FFF" />
                </View>
                <View>
                  <ThemedText style={styles.label}>Tu Ruta</ThemedText>
                  <ThemedText style={styles.sectionTitle}>{ruta.nombre}</ThemedText>
                </View>
              </View>
              {ruta.horario && (
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="time" size={16} color={isDarkMode ? '#AAA' : '#666'} />
                  <ThemedText style={{ fontSize: 13, opacity: 0.7, marginLeft: 6 }}>
                    Horario: {ruta.horario}
                  </ThemedText>
                </View>
              )}
            </View>

            {/* Estado del camión */}
            <View style={[
              styles.card,
              { backgroundColor: ubicacionCamion ? (isDarkMode ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.1)') : undefined }
            ]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View style={[styles.iconBadge, { backgroundColor: ubicacionCamion ? '#4CAF50' : '#9E9E9E', marginRight: 12 }]}>
                  <Ionicons name="car" size={20} color="#FFF" />
                </View>
                <View>
                  <ThemedText style={styles.label}>Estado del Camión</ThemedText>
                  <ThemedText style={[styles.valor, { color: ubicacionCamion ? '#4CAF50' : undefined }]}>
                    {ubicacionCamion ? '🟢 En Ruta' : '⚪ Detenido'}
                  </ThemedText>
                  {ruta.conductorNombre && (
                    <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                      Conductor: {ruta.conductorNombre} • Unidad {ruta.unidad}
                    </ThemedText>
                  )}
                </View>
              </View>
            </View>

            {/* Información del camión */}
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
                  <ThemedText style={{ marginTop: 4, fontSize: 12, textAlign: 'center', opacity: 0.5 }}>
                    La ubicación aparecerá cuando el conductor inicie la recolección
                  </ThemedText>
                </View>
              </View>
            )}
          </>
        ) : (
          <View style={styles.card}>
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="alert-circle-outline" size={48} color={isDarkMode ? '#666' : '#999'} />
              <ThemedText style={{ marginTop: 12, textAlign: 'center', opacity: 0.7 }}>
                No tienes una ruta asignada
              </ThemedText>
              <ThemedText style={{ marginTop: 4, fontSize: 12, textAlign: 'center', opacity: 0.5 }}>
                Contacta al administrador
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

