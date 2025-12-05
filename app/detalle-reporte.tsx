import { useThemeContext } from '@/components/theme-context';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IncidenciaData } from '@/services/firebase';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, TouchableOpacity, View } from 'react-native';
import { getModernStyles } from './_styles/modernStyles';

// Vista detallada de un reporte
export default function DetalleReporteScreen() {
	const { theme } = useThemeContext();
	const router = useRouter();
	const params = useLocalSearchParams();
	const isDarkMode = theme === 'dark';
	const styles = getModernStyles(isDarkMode);

	// Parsear datos del reporte
	const incidencia: IncidenciaData = params.data ? JSON.parse(params.data as string) : null;

	if (!incidencia) {
		return (
			<ThemedView style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
				<ThemedText>No se encontró el reporte</ThemedText>
			</ThemedView>
		);
	}

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
			let date: Date;
			
			if (fecha.toDate) {
				// Firebase Timestamp
				date = fecha.toDate();
			} else if (fecha.seconds) {
				// Timestamp object with seconds
				date = new Date(fecha.seconds * 1000);
			} else if (typeof fecha === 'string' || typeof fecha === 'number') {
				// String or number timestamp
				date = new Date(fecha);
			} else {
				return 'Fecha no disponible';
			}
			
			// Formatear fecha con hora
			const opciones: Intl.DateTimeFormatOptions = {
				day: '2-digit',
				month: 'long',
				year: 'numeric',
				hour: 'numeric',
				minute: '2-digit',
				hour12: true,
			};
			
			return date.toLocaleDateString('es-MX', opciones);
		} catch (error) {
			console.error('Error formateando fecha:', error);
			return 'Fecha no disponible';
		}
	};

	// Función para obtener el título de la incidencia
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

	return (
		<ThemedView style={styles.container}>
			<ScrollView contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
				{/* Botón volver */}
				<TouchableOpacity 
					onPress={() => router.push('/(tabs)/reportes')}
					style={{
						flexDirection: 'row',
						alignItems: 'center',
						marginBottom: 16,
						paddingVertical: 8,
					}}
				>
					<Ionicons name="arrow-back" size={24} color={isDarkMode ? '#fff' : '#000'} />
					<ThemedText style={{ marginLeft: 8, fontSize: 16 }}>Volver</ThemedText>
				</TouchableOpacity>

				{/* Título y Estado */}
				<View style={styles.card}>
					<ThemedText type="title" style={{ fontSize: 24, marginBottom: 12 }}>
						{getTituloIncidencia(incidencia.tipoIncidencia)}
					</ThemedText>
					
					<View style={{
						backgroundColor: getEstadoColor(incidencia.estado),
						paddingHorizontal: 16,
						paddingVertical: 8,
						borderRadius: 16,
						alignSelf: 'flex-start',
					}}>
						<ThemedText style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>
							{getEstadoTexto(incidencia.estado)}
						</ThemedText>
					</View>
				</View>

				{/* Descripción */}
				<View style={styles.card}>
					<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
						<Ionicons name="document-text" size={20} color={isDarkMode ? '#fff' : '#000'} />
						<ThemedText style={{ fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
							Descripción
						</ThemedText>
					</View>
					<ThemedText style={{ fontSize: 15, lineHeight: 22, opacity: 0.85 }}>
						{incidencia.descripcion}
					</ThemedText>
				</View>

				{/* Ubicación */}
				{incidencia.ubicacion && incidencia.ubicacion !== 'No especificada' && (
					<View style={styles.card}>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
							<Ionicons name="location" size={20} color="#4CAF50" />
							<ThemedText style={{ fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
								Ubicación
							</ThemedText>
						</View>
						<ThemedText style={{ fontSize: 15, opacity: 0.85 }}>
							{incidencia.ubicacion}
						</ThemedText>
					</View>
				)}

				{/* COMENTADO: Fotos (requiere Firebase Storage Blaze o AWS)
				{incidencia.imagenes && incidencia.imagenes.length > 0 && (
					<View style={styles.card}>
						<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
							<Ionicons name="images" size={20} color="#2196F3" />
							<ThemedText style={{ fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
								Fotos adjuntas ({incidencia.imagenes.length})
							</ThemedText>
						</View>
						<View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
							{incidencia.imagenes.map((uri, idx) => (
								<Image key={idx} source={{ uri }} ... />
							))}
						</View>
					</View>
				)}
				*/}

				{/* Información adicional */}
				<View style={styles.card}>
					<View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
						<Ionicons name="information-circle" size={20} color="#FF9800" />
						<ThemedText style={{ fontSize: 16, fontWeight: '700', marginLeft: 8 }}>
							Información del reporte
						</ThemedText>
					</View>
					
					<View style={{ gap: 8 }}>
						<View style={{ flexDirection: 'row' }}>
							<ThemedText style={{ fontWeight: '600', opacity: 0.7, width: 120 }}>
								Reportado por:
							</ThemedText>
							<ThemedText style={{ flex: 1 }}>
								{incidencia.usuarioNombre}
							</ThemedText>
						</View>

						<View style={{ flexDirection: 'row' }}>
							<ThemedText style={{ fontWeight: '600', opacity: 0.7, width: 120 }}>
								Tipo de usuario:
							</ThemedText>
							<ThemedText style={{ flex: 1 }}>
								{incidencia.usuarioRol === 'conductor' ? 'Conductor' : 'Residente'}
							</ThemedText>
						</View>

						<View style={{ flexDirection: 'row' }}>
							<ThemedText style={{ fontWeight: '600', opacity: 0.7, width: 120 }}>
								Fecha:
							</ThemedText>
							<ThemedText style={{ flex: 1 }}>
								{formatearFecha(incidencia.createdAt)}
							</ThemedText>
						</View>

						{incidencia.updatedAt && incidencia.updatedAt !== incidencia.createdAt && (
							<View style={{ flexDirection: 'row' }}>
								<ThemedText style={{ fontWeight: '600', opacity: 0.7, width: 120 }}>
									Actualizado:
								</ThemedText>
								<ThemedText style={{ flex: 1 }}>
									{formatearFecha(incidencia.updatedAt)}
								</ThemedText>
							</View>
						)}
					</View>
				</View>
			</ScrollView>
		</ThemedView>
	);
}
