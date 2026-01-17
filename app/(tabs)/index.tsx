import { useAuthContext } from '@/components/auth-context';
import { TruckMapView } from '@/components/map-view';
import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService, RutaData, UbicacionData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
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
    }, [cargarDatos])
  );

  // Suscripción en tiempo real a ubicaciones de la ruta
  useEffect(() => {
    if (!user?.rutaId || !ruta) {
      return;
    }

    const unsubscribe = firebaseService.subscribeToUbicacionesRuta(
      user.rutaId,
      (ubicaciones) => {
        if (ubicaciones.length > 0) {
          // Tomar la ubicación más reciente
          setUbicacionCamion(ubicaciones[0]);
        } else {
          setUbicacionCamion(null);
        }
      }
    );

    return () => unsubscribe();
  }, [user?.rutaId, ruta]);

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

        {/* MAPA SIEMPRE VISIBLE PARA USUARIOS RESIDENCIALES */}
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
            <View style={[styles.iconBadge, { backgroundColor: '#2196F3', marginRight: 12 }]}>
              <Ionicons name="map" size={20} color="#FFF" />
            </View>
            <View style={{ flex: 1 }}>
              <ThemedText style={styles.sectionTitle}>
                {ruta ? 'Ubicación en Tiempo Real' : 'Mapa de la Zona'}
              </ThemedText>
              <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
                {ruta ? 'Rastrea el camión en el mapa' : 'Temascaltepec, México'}
              </ThemedText>
            </View>
          </View>

          <TruckMapView
            ubicacionCamion={ubicacionCamion}
            height={250}
          />

          {ubicacionCamion?.velocidad !== undefined && (
            <View style={{
              marginTop: 12,
              padding: 12,
              backgroundColor: isDarkMode ? '#1a1a1a' : '#f9f9f9',
              borderRadius: 8,
              flexDirection: 'row',
              justifyContent: 'space-between'
            }}>
              <View>
                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Velocidad</ThemedText>
                <ThemedText style={{ fontSize: 16, fontWeight: '600', marginTop: 2 }}>
                  {ubicacionCamion.velocidad} km/h
                </ThemedText>
              </View>
              <View>
                <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Unidad</ThemedText>
                <ThemedText style={{ fontSize: 16, fontWeight: '600', marginTop: 2 }}>
                  {ubicacionCamion.unidad}
                </ThemedText>
              </View>
            </View>
          )}
        </View>

        {/* Información de ruta cuando existe */}
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
          </>
        ) : (
            // USUARIO SIN RUTA: SERVICIO NO DISPONIBLE
            <View style={styles.card}>
            <View style={{ alignItems: 'center', paddingVertical: 24 }}>
              <View style={[styles.iconBadge, { backgroundColor: '#FF9800', width: 70, height: 70, marginBottom: 16 }]}>
                <Ionicons name="location-outline" size={36} color="#FFF" />
              </View>
              <ThemedText style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 10 }}>
                Servicio no disponible
              </ThemedText>
              <ThemedText style={{ fontSize: 14, textAlign: 'center', opacity: 0.8, paddingHorizontal: 20, lineHeight: 21 }}>
                Aún no hay una ruta de recolección para tu zona
              </ThemedText>
                      {ruta ? (
                        <>
                          {/* STATUS: ¿HOY PASA EL CAMIÓN? */}
                          <View style={[
                            styles.card,
                            { backgroundColor: ubicacionCamion ? (isDarkMode ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.1)') : (isDarkMode ? 'rgba(244,67,54,0.2)' : 'rgba(244,67,54,0.1)') }
                          ]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                              <View style={[styles.iconBadge, { backgroundColor: ubicacionCamion ? '#4CAF50' : '#F44336', marginRight: 12 }]}>
                                <Ionicons name={ubicacionCamion ? "checkmark-circle" : "close-circle"} size={24} color="#FFF" />
                              </View>
                              <View>
                                <ThemedText style={styles.label}>Recolección Hoy</ThemedText>
                                <ThemedText style={[styles.valor, { color: ubicacionCamion ? '#4CAF50' : '#F44336', fontSize: 16, fontWeight: '700' }]}>
                                  {ubicacionCamion ? '✅ Sí pasa' : '❌ No pasa hoy'}
                                </ThemedText>
                                {ruta.conductorNombre && ubicacionCamion && (
                                  <ThemedText style={{ fontSize: 12, opacity: 0.7, marginTop: 4 }}>
                                    Conductor: {ruta.conductorNombre} • Unidad {ruta.unidad}
                                  </ThemedText>
                                )}
                              </View>
                            </View>
                          </View>

                          {/* INFORMACIÓN DE RUTA */}
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

                          {/* MAPA SIEMPRE VISIBLE */}
                          <View style={styles.card}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}>
                              <View style={[styles.iconBadge, { backgroundColor: '#2196F3', marginRight: 12 }]}>
                                <Ionicons name="map" size={20} color="#FFF" />
                              </View>
                              <View style={{ flex: 1 }}>
                                <ThemedText style={styles.sectionTitle}>
                                  {ubicacionCamion ? 'Ubicación en Tiempo Real' : 'Mapa de la Zona'}
                                </ThemedText>
                                <ThemedText style={{ fontSize: 13, opacity: 0.7 }}>
                                  {ubicacionCamion ? 'Rastrea el camión en el mapa' : 'Esperando que inicie el camión'}
                                </ThemedText>
                              </View>
                            </View>

                            <TruckMapView
                              ubicacionCamion={ubicacionCamion}
                              height={250}
                            />

                            {ubicacionCamion?.velocidad !== undefined && (
                              <View style={{
                                marginTop: 12,
                                padding: 12,
                                backgroundColor: isDarkMode ? '#1a1a1a' : '#f9f9f9',
                                borderRadius: 8,
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                              }}>
                                <View>
                                  <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Velocidad</ThemedText>
                                  <ThemedText style={{ fontSize: 16, fontWeight: '600', marginTop: 2 }}>
                                    {ubicacionCamion.velocidad} km/h
                                  </ThemedText>
                                </View>
                                <View>
                                  <ThemedText style={{ fontSize: 12, opacity: 0.7 }}>Unidad</ThemedText>
                                  <ThemedText style={{ fontSize: 16, fontWeight: '600', marginTop: 2 }}>
                                    {ubicacionCamion.unidad}
                                  </ThemedText>
                                </View>
                              </View>
                            )}
                          </View>
                        </>
                      ) : (
                        // USUARIO SIN RUTA: SERVICIO NO DISPONIBLE
                        <View style={styles.card}>
                          <View style={{ alignItems: 'center', paddingVertical: 24 }}>
                            <View style={[styles.iconBadge, { backgroundColor: '#FF9800', width: 70, height: 70, marginBottom: 16 }]}>
                              <Ionicons name="location-outline" size={36} color="#FFF" />
                            </View>
                            <ThemedText style={{ fontSize: 18, fontWeight: '700', textAlign: 'center', marginBottom: 10 }}>
                              Servicio no disponible
                            </ThemedText>
                            <ThemedText style={{ fontSize: 14, textAlign: 'center', opacity: 0.8, paddingHorizontal: 20, lineHeight: 21 }}>
                              Aún no hay una ruta de recolección para tu zona
                            </ThemedText>
                            {user?.direccion && (
                              <View style={{ 
                                marginTop: 16, 
                                padding: 12, 
                                backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)',
                                borderRadius: 10,
                                borderLeftWidth: 4,
                                borderLeftColor: '#2196F3',
                                width: '95%'
                              }}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                  <Ionicons name="home" size={16} color="#2196F3" />
                                  <ThemedText style={{ fontSize: 12, marginLeft: 6, fontWeight: '600', color: '#2196F3' }}>
                                    Tu dirección
                                  </ThemedText>
                                </View>
                                <ThemedText style={{ fontSize: 13, opacity: 0.9 }}>
                                  {user.direccion}
                                </ThemedText>
                              </View>
                            )}
                            <ThemedText style={{ marginTop: 16, fontSize: 12, textAlign: 'center', opacity: 0.7 }}>
                              El servicio se asignará cuando el administrador configure una ruta para tu calle.
                            </ThemedText>
                          </View>
                        </View>
                      )}
              {user?.direccion && (
                <View style={{ 
                  marginTop: 16, 
                  padding: 12, 
                  backgroundColor: isDarkMode ? 'rgba(33, 150, 243, 0.15)' : 'rgba(33, 150, 243, 0.08)',
                  borderRadius: 10,
                  borderLeftWidth: 4,
                  borderLeftColor: '#2196F3',
                  width: '95%'
                }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="home" size={16} color="#2196F3" />
                    <ThemedText style={{ fontSize: 12, marginLeft: 6, fontWeight: '600', color: '#2196F3' }}>
                      Tu dirección
                    </ThemedText>
                  </View>
                  <ThemedText style={{ fontSize: 13, opacity: 0.9 }}>
                    {user.direccion}
                  </ThemedText>
                </View>
              )}
              <ThemedText style={{ marginTop: 16, fontSize: 12, textAlign: 'center', opacity: 0.7 }}>
                El servicio se asignará cuando el administrador configure una ruta para tu calle.
              </ThemedText>
            </View>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}




