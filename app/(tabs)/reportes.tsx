import { useAuthContext } from '@/components/auth-context';
import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { firebaseService, IncidenciaData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Dimensions, RefreshControl, ScrollView, TouchableOpacity, View } from 'react-native';
import { getModernStyles } from '../_styles/modernStyles';

// Vista de reportes de incidencias 
export default function ReportesScreen() {
	const { theme } = useThemeContext();
	const { user } = useAuthContext();
	const router = useRouter();
	const isDarkMode = theme === 'dark';
	const styles = getModernStyles(isDarkMode);
	const screenWidth = Dimensions.get('window').width;
	const cardWidth = (screenWidth - 48) / 2; // 2 columnas con espaciado
	
	const [incidencias, setIncidencias] = useState<IncidenciaData[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [refreshing, setRefreshing] = useState(false);

	// Función para cargar incidencias
	const cargarIncidencias = async () => {
		if (!user) return;
		
		try {
			const data = await firebaseService.getUserIncidencias(user.email);
			setIncidencias(data);
		} catch (error: any) {
			console.error('Error al cargar incidencias:', error);
			Alert.alert('Error', 'No se pudieron cargar los reportes');
		} finally {
			setIsLoading(false);
			setRefreshing(false);
		}
	};

	// Cargar incidencias cuando la pantalla gana foco
	useFocusEffect(
		useCallback(() => {
			setIsLoading(true);
			cargarIncidencias();
		}, [user])
	);

	// Función para refrescar
	const onRefresh = () => {
		setRefreshing(true);
		cargarIncidencias();
	};

	// Función para obtener el color según el estado
	const getEstadoColor = (estado: string) => {
		switch (estado) {
			case 'pendiente':
				return '#FF9800';
			case 'en_proceso':
				return '#2196F3';
			case 'resuelta':
				return '#4CAF50';
			default:
				return '#9E9E9E';
		}
	};

	// Función para obtener el texto del estado
	const getEstadoTexto = (estado: string) => {
		switch (estado) {
			case 'pendiente':
				return 'En espera';
			case 'en_proceso':
				return 'En proceso';
			case 'resuelta':
				return 'Resuelta';
			default:
				return estado;
		}
	};

	// Función para formatear fecha
	const formatearFecha = (fecha: any) => {
		if (!fecha) return 'Fecha no disponible';
		
		try {
			const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
			const ahora = new Date();
			const diff = ahora.getTime() - date.getTime();
			const dias = Math.floor(diff / (1000 * 60 * 60 * 24));
			
			if (dias === 0) return 'Hoy';
			if (dias === 1) return 'Ayer';
			if (dias < 7) return `Hace ${dias} días`;
			
			return date.toLocaleDateString('es-MX', {
				day: 'numeric',
				month: 'short',
			});
		} catch {
			return 'Fecha no disponible';
		}
	};

	// Función para obtener el título de la incidencia
	const getTituloIncidencia = (tipo: string) => {
		const titulos: Record<string, string> = {
			// Conductor
			falla_motor: 'Falla en el motor',
			llanta_ponchada: 'Llanta ponchada',
			accidente_trafico: 'Accidente de tráfico',
			via_bloqueada: 'Vía bloqueada',
			falla_mecanica: 'Falla mecánica',
			falta_combustible: 'Falta de combustible',
			problema_carga: 'Problema con carga',
			// Residente
			camion_no_paso: 'El camión no pasó',
			acumulacion_basura: 'Acumulación de basura',
			basura_regada: 'Basura regada',
			contenedor_danado: 'Contenedor lleno o dañado',
			otro: 'Otro',
		};
		return titulos[tipo] || tipo;
	};

	// Función para navegar al detalle
	const verDetalle = (incidencia: IncidenciaData) => {
		router.push({
			pathname: '/detalle-reporte',
			params: { data: JSON.stringify(incidencia) },
		});
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
				contentContainerStyle={{ paddingBottom: 40 }} 
				showsVerticalScrollIndicator={false}
				refreshControl={
					<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
				}
			>
				<ThemedText type="title" style={styles.title}>
					Mis Reportes
				</ThemedText>
				<ThemedText type="subtitle" style={styles.subtitulo}>
					{incidencias.length > 0 
						? `${incidencias.length} reporte${incidencias.length !== 1 ? 's' : ''} realizado${incidencias.length !== 1 ? 's' : ''}`
						: 'Aún no has hecho reportes'
					}
				</ThemedText>

				{incidencias.length === 0 ? (
					<View style={styles.card}>
						<ThemedText style={{ fontSize: 16, textAlign: 'center', marginBottom: 8 }}>
							No hay reportes
						</ThemedText>
						<ThemedText style={{ textAlign: 'center', opacity: 0.7 }}>
							Cuando hagas tus primeros reportes aparecerán aquí
						</ThemedText>
					</View>
				) : (
					<View style={styles.grid}>
						{incidencias.map((incidencia) => (
							<TouchableOpacity 
								key={incidencia.id} 
								onPress={() => verDetalle(incidencia)}
								style={[
									styles.card,
									styles.gridItem,
									{ padding: 12 }
								]}
							>
								{/* COMENTADO: Mostrar imagen (requiere Storage) */}
								<View style={{
									width: '100%',
									height: 120,
									borderRadius: 12,
									marginBottom: 12,
									backgroundColor: isDarkMode ? '#333' : '#f0f0f0',
									justifyContent: 'center',
									alignItems: 'center',
								}}>
									<Ionicons 
										name="document-text-outline" 
										size={40} 
										color={isDarkMode ? '#666' : '#ccc'} 
									/>
									<ThemedText style={{ fontSize: 12, marginTop: 8, opacity: 0.6 }}>
										Sin imagen
									</ThemedText>
								</View>

								<View style={{
									backgroundColor: getEstadoColor(incidencia.estado),
									paddingHorizontal: 8,
									paddingVertical: 4,
									borderRadius: 8,
									alignSelf: 'flex-start',
									marginBottom: 8,
								}}>
									<ThemedText style={{ color: '#fff', fontSize: 10, fontWeight: '700' }}>
										{getEstadoTexto(incidencia.estado)}
									</ThemedText>
								</View>

								<ThemedText 
									style={{ fontSize: 14, fontWeight: '700', marginBottom: 6 }}
									numberOfLines={2}
								>
									{getTituloIncidencia(incidencia.tipoIncidencia)}
								</ThemedText>

								<ThemedText 
									style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }} 
									numberOfLines={2}
								>
									{incidencia.descripcion}
								</ThemedText>

								<View style={{ flexDirection: 'row', alignItems: 'center' }}>
									<Ionicons 
										name="time-outline" 
										size={12} 
										color={isDarkMode ? '#999' : '#666'} 
									/>
									<ThemedText style={{ fontSize: 11, opacity: 0.5, marginLeft: 4 }}>
										{formatearFecha(incidencia.createdAt)}
									</ThemedText>
								</View>
							</TouchableOpacity>
						))}
					</View>
				)}
			</ScrollView>
		</ThemedView>
	);
}