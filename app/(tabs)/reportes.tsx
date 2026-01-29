import { useAuthContext } from "@/components/auth-context";
import { SearchBar } from "@/components/search-bar";
import { useThemeContext } from "@/components/theme-context";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { firebaseService, IncidenciaData } from "@/services/firebase";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useEffect, useState } from "react";
import {
	ActivityIndicator,
	Alert,
	RefreshControl,
	ScrollView,
	TouchableOpacity,
	View,
} from "react-native";
import { getModernStyles } from "../_styles/modernStyles";

type EstadoFiltro = "todos" | "pendiente" | "en_proceso" | "resuelta";

export default function ReportesScreen() {
  const { theme } = useThemeContext();
  const { user } = useAuthContext();
  const router = useRouter();
  const isDarkMode = theme === "dark";
  const styles = getModernStyles(isDarkMode);

  const [incidencias, setIncidencias] = useState<IncidenciaData[]>([]);
  const [filteredIncidencias, setFilteredIncidencias] = useState<
    IncidenciaData[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("todos");

  // Cargar incidencias del usuario
  const cargarIncidencias = useCallback(async () => {
    if (!user?.uid) return;

    try {
      const data = await firebaseService.getUserIncidencias(user.uid);
      setIncidencias(data);
      setFilteredIncidencias(data);
    } catch (error: any) {
      console.error("Error al cargar incidencias:", error);
      Alert.alert("Error", "No se pudieron cargar los reportes");
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.uid]);

  // Aplicar filtros simples
  const aplicarFiltros = useCallback(() => {
    let resultado = [...incidencias];

    // Filtro por búsqueda
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      resultado = resultado.filter((inc) => {
        const descripcion = inc.descripcion?.toLowerCase() || "";
        const tipo = inc.tipoIncidencia?.toLowerCase() || "";
        const ubicacion = inc.ubicacion?.toLowerCase() || "";
        return (
          descripcion.includes(query) ||
          tipo.includes(query) ||
          ubicacion.includes(query)
        );
      });
    }

    // Filtro por estado
    if (estadoFiltro !== "todos") {
      resultado = resultado.filter((inc) => inc.estado === estadoFiltro);
    }

    setFilteredIncidencias(resultado);
  }, [incidencias, searchQuery, estadoFiltro]);

  useEffect(() => {
    aplicarFiltros();
  }, [aplicarFiltros]);

  useFocusEffect(
    useCallback(() => {
      setIsLoading(true);
      cargarIncidencias();
    }, [cargarIncidencias]),
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarIncidencias();
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "#FF9800";
      case "en_proceso":
        return "#2196F3";
      case "resuelta":
        return "#4CAF50";
      default:
        return "#9E9E9E";
    }
  };

  const getEstadoTexto = (estado: string) => {
    switch (estado) {
      case "pendiente":
        return "En espera";
      case "en_proceso":
        return "En proceso";
      case "resuelta":
        return "Resuelta";
      default:
        return estado;
    }
  };

  const formatearFecha = (fecha: any) => {
    if (!fecha) return "Fecha no disponible";
    try {
      const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
      const ahora = new Date();
      const diff = ahora.getTime() - date.getTime();
      const dias = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (dias === 0) return "Hoy";
      if (dias === 1) return "Ayer";
      if (dias < 7) return `Hace ${dias} días`;

      return date.toLocaleDateString("es-MX", {
        day: "numeric",
        month: "short",
      });
    } catch {
      return "Fecha no disponible";
    }
  };

  const getTituloIncidencia = (tipo: string) => {
    const titulos: Record<string, string> = {
      falla_motor: "Falla en el motor",
      llanta_ponchada: "Llanta ponchada",
      accidente_trafico: "Accidente de tráfico",
      via_bloqueada: "Vía bloqueada",
      falla_mecanica: "Falla mecánica",
      falta_combustible: "Falta de combustible",
      problema_carga: "Problema con carga",
      camion_no_paso: "El camión no pasó",
      acumulacion_basura: "Acumulación de basura",
      basura_regada: "Basura regada",
      contenedor_danado: "Contenedor lleno o dañado",
      otro: "Otro",
    };
    return titulos[tipo] || tipo;
  };

  const verDetalle = (incidencia: IncidenciaData) => {
    router.push({
      pathname: "/detalle-reporte",
      params: { data: JSON.stringify(incidencia) },
    });
  };

  if (isLoading) {
    return (
      <ThemedView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#4CAF50" />
        <ThemedText style={{ marginTop: 16 }}>Cargando reportes...</ThemedText>
      </ThemedView>
    );
  }

  const filtroEstados: { key: EstadoFiltro; label: string }[] = [
    { key: "todos", label: "Todos" },
    { key: "pendiente", label: "Pendientes" },
    { key: "en_proceso", label: "En proceso" },
    { key: "resuelta", label: "Resueltos" },
  ];

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
          {filteredIncidencias.length > 0
            ? `${filteredIncidencias.length} reporte${filteredIncidencias.length !== 1 ? "s" : ""}`
            : "Aún no has hecho reportes"}
        </ThemedText>

        {/* Barra de búsqueda */}
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={aplicarFiltros}
          placeholder="Buscar en mis reportes..."
        />

        {/* Filtros por estado - chips simples */}
        <View
          style={{
            flexDirection: "row",
            flexWrap: "wrap",
            gap: 8,
            marginVertical: 12,
          }}
        >
          {filtroEstados.map(({ key, label }) => (
            <TouchableOpacity
              key={key}
              onPress={() => setEstadoFiltro(key)}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor:
                  estadoFiltro === key
                    ? "#4CAF50"
                    : isDarkMode
                      ? "#333"
                      : "#f0f0f0",
              }}
            >
              <ThemedText
                style={{
                  fontSize: 13,
                  fontWeight: estadoFiltro === key ? "700" : "500",
                  color:
                    estadoFiltro === key
                      ? "#fff"
                      : isDarkMode
                        ? "#ccc"
                        : "#666",
                }}
              >
                {label}
              </ThemedText>
            </TouchableOpacity>
          ))}
        </View>

        {filteredIncidencias.length === 0 ? (
          <View style={styles.card}>
            <ThemedText
              style={{ fontSize: 16, textAlign: "center", marginBottom: 8 }}
            >
              {incidencias.length === 0
                ? "No hay reportes"
                : "No se encontraron reportes"}
            </ThemedText>
            <ThemedText style={{ textAlign: "center", opacity: 0.7 }}>
              {incidencias.length === 0
                ? "Cuando hagas tus primeros reportes aparecerán aquí"
                : "Intenta ajustar los filtros de búsqueda"}
            </ThemedText>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredIncidencias.map((incidencia) => (
              <TouchableOpacity
                key={incidencia.id}
                onPress={() => verDetalle(incidencia)}
                style={[styles.card, styles.gridItem, { padding: 12 }]}
              >
                <View
                  style={{
                    backgroundColor: getEstadoColor(incidencia.estado),
                    paddingHorizontal: 8,
                    paddingVertical: 4,
                    borderRadius: 8,
                    alignSelf: "flex-start",
                    marginBottom: 8,
                  }}
                >
                  <ThemedText
                    style={{ color: "#fff", fontSize: 10, fontWeight: "700" }}
                  >
                    {getEstadoTexto(incidencia.estado)}
                  </ThemedText>
                </View>
                <ThemedText
                  style={{ fontSize: 14, fontWeight: "700", marginBottom: 6 }}
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
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Ionicons
                    name="time-outline"
                    size={12}
                    color={isDarkMode ? "#999" : "#666"}
                  />
                  <ThemedText
                    style={{ fontSize: 11, opacity: 0.5, marginLeft: 4 }}
                  >
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
