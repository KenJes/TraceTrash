import { useAuthContext } from '@/components/auth-context';
import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService, RutaData } from '@/services/firebase';
import { locationService } from '@/services/location';
import { notifyRutaFinalizada, notifyRutaIniciada } from '@/services/notification-service';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { getModernStyles } from '../_styles/modernStyles';

export default function ConductorIndexScreen() {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const [enRuta, setEnRuta] = useState(false);
  const [ruta, setRuta] = useState<RutaData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const isDarkMode = theme === 'dark';
  const styles = getModernStyles(isDarkMode);

  const cargarRuta = async () => {
    try {
      if (!user?.rutaId) {
        setRuta(null);
        return;
      }

      const rutaData = await firebaseService.getRutaById(user.rutaId);
      setRuta(rutaData);
    } catch (error) {
      console.error('Error al cargar ruta:', error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      cargarRuta();
      
      // Verificar si ya está trackeando
      setEnRuta(locationService.isTrackingActive());
    }, [user?.rutaId])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarRuta();
  };

  const handleIniciarRuta = async () => {
    if (!ruta?.id || !user?.uid || !user?.nombre || !user?.unidad) {
      Alert.alert('Error', 'No tienes una ruta asignada');
      return;
    }

    if (enRuta) {
      // Detener ruta
      Alert.alert(
        'Finalizar Ruta',
        '¿Deseas detener el compartir tu ubicación?',
        [
          { text: 'Cancelar', style: 'cancel' },
          {
            text: 'Finalizar',
            style: 'destructive',
            onPress: async () => {
              try {
                await locationService.stopTracking();
                
                // Enviar notificación de ruta finalizada
                await notifyRutaFinalizada(
                  ruta.id!,
                  user.nombre,
                  user.unidad || ''
                );
                
                // Actualizar estado de ruta a finalizada
                await firebaseService.actualizarEstadoRuta(ruta.id!, 'finalizada');
                
                setEnRuta(false);
                Alert.alert('Ruta Finalizada', 'Has dejado de compartir tu ubicación');
              } catch (error) {
                console.error('Error al finalizar ruta:', error);
                Alert.alert('Error', 'No se pudo finalizar la ruta');
              }
            },
          },
        ]
      );
    } else {
      // Iniciar ruta
      const success = await locationService.startTracking(
        user.uid,
        user.nombre,
        ruta.id,
        user.unidad
      );

      if (success) {
        try {
          // Enviar notificación de ruta iniciada
          await notifyRutaIniciada(
            ruta.id!,
            user.nombre,
            user.unidad || ''
          );
          
          // Actualizar estado de ruta a activa
          await firebaseService.actualizarEstadoRuta(ruta.id!, 'activa');
          
          setEnRuta(true);
          Alert.alert('Ruta Iniciada', 'Ahora estás compartiendo tu ubicación en tiempo real');
        } catch (error) {
          console.error('Error al actualizar estado de ruta:', error);
          // Aún así marcar como en ruta localmente
          setEnRuta(true);
        }
      } else {
        Alert.alert(
          'Error',
          'No se pudo iniciar el tracking. Verifica que los permisos de ubicación estén activados.'
        );
      }
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
          Panel de Conductor
        </ThemedText>

        {/* Estado actual */}
        <View style={[styles.card, { backgroundColor: enRuta ? (isDarkMode ? 'rgba(76,175,80,0.2)' : 'rgba(76,175,80,0.1)') : undefined }]}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={[styles.iconBadge, { backgroundColor: enRuta ? '#4CAF50' : '#9E9E9E', marginRight: 12 }]}>
              <Ionicons name={enRuta ? 'radio-button-on' : 'radio-button-off'} size={20} color="#FFF" />
            </View>
            <View>
              <ThemedText style={styles.label}>Estado actual</ThemedText>
              <ThemedText style={[styles.valor, { color: enRuta ? '#4CAF50' : undefined }]}>
                {enRuta ? '🟢 En Ruta' : '⚪ Detenido'}
              </ThemedText>
            </View>
          </View>
          {enRuta && (
            <ThemedText style={[styles.bodyText, { fontSize: 12, opacity: 0.7, marginTop: 8 }]}>
              📍 Compartiendo ubicación en tiempo real
            </ThemedText>
          )}
        </View>

        {/* Información de ruta */}
        {ruta ? (
          <>
            <View style={styles.card}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <View style={[styles.iconBadge, { backgroundColor: ruta.color || '#2196F3', marginRight: 12 }]}>
                  <Ionicons name="map" size={20} color="#FFF" />
                </View>
                <View style={{ flex: 1 }}>
                  <ThemedText style={styles.label}>Ruta Asignada</ThemedText>
                  <ThemedText style={styles.sectionTitle}>{ruta.nombre}</ThemedText>
                </View>
              </View>
              
              <View style={{ marginTop: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Ionicons name="location" size={16} color={isDarkMode ? '#AAA' : '#666'} />
                  <ThemedText style={{ fontSize: 13, opacity: 0.7, marginLeft: 6 }}>
                    {ruta.calle}, {ruta.colonia}
                  </ThemedText>
                </View>
                {ruta.horario && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Ionicons name="time" size={16} color={isDarkMode ? '#AAA' : '#666'} />
                    <ThemedText style={{ fontSize: 13, opacity: 0.7, marginLeft: 6 }}>
                      Horario: {ruta.horario}
                    </ThemedText>
                  </View>
                )}
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Ionicons name="people" size={16} color={isDarkMode ? '#AAA' : '#666'} />
                  <ThemedText style={{ fontSize: 13, opacity: 0.7, marginLeft: 6 }}>
                    {ruta.usuariosCount || 0} usuario{ruta.usuariosCount !== 1 ? 's' : ''}
                  </ThemedText>
                </View>
              </View>
            </View>

            {/* Botón iniciar/finalizar ruta */}
            <TouchableOpacity 
              style={[
                styles.button, 
                { 
                  backgroundColor: enRuta ? '#E53935' : '#4CAF50',
                  paddingVertical: 16,
                }
              ]}
              onPress={handleIniciarRuta}
            >
              <Ionicons name={enRuta ? 'stop-circle' : 'play-circle'} size={24} color="#FFF" />
              <ThemedText style={[styles.buttonText, { fontSize: 16, marginLeft: 12 }]}>
                {enRuta ? 'Finalizar Ruta' : 'Iniciar Ruta'}
              </ThemedText>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.card}>
            <View style={{ alignItems: 'center', paddingVertical: 20 }}>
              <Ionicons name="alert-circle-outline" size={48} color={isDarkMode ? '#666' : '#999'} />
              <ThemedText style={{ marginTop: 12, textAlign: 'center', opacity: 0.7 }}>
                No tienes una ruta asignada
              </ThemedText>
              <ThemedText style={{ marginTop: 4, fontSize: 12, textAlign: 'center', opacity: 0.5 }}>
                Contacta al administrador para que te asigne una ruta
              </ThemedText>
            </View>
          </View>
        )}

        {/* Información adicional */}
        <View style={styles.card}>
          <ThemedText style={styles.sectionTitle}>Tu Información</ThemedText>
          <View style={[styles.row, { marginTop: 12 }]}>
            <ThemedText style={styles.label2}>Unidad:</ThemedText>
            <ThemedText style={styles.label2}>{user?.unidad || 'N/A'}</ThemedText>
          </View>
          <View style={styles.row}>
            <ThemedText style={styles.label2}>Nombre:</ThemedText>
            <ThemedText style={styles.label2}>{user?.nombre}</ThemedText>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}
