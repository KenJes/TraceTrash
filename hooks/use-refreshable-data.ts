import { useCallback, useState } from "react";

/**
 * Hook personalizado para manejar estados de carga y refresco
 * Reduce código repetitivo en pantallas con RefreshControl
 */
export function useRefreshableData<T>(
  loadDataFn: () => Promise<T>,
  initialData: T,
) {
  const [data, setData] = useState<T>(initialData);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadData = useCallback(async () => {
    try {
      setError(null);
      const result = await loadDataFn();
      setData(result);
    } catch (err) {
      setError(err as Error);
      console.error("Error al cargar datos:", err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [loadDataFn]);

  const refresh = useCallback(() => {
    setRefreshing(true);
    loadData();
  }, [loadData]);

  const reload = useCallback(() => {
    setIsLoading(true);
    loadData();
  }, [loadData]);

  return {
    data,
    setData,
    isLoading,
    refreshing,
    error,
    loadData,
    refresh,
    reload,
  };
}
