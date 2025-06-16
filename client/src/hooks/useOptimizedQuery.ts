import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { useMemo } from 'react';
import { memoryCache } from '@/utils/performance';

interface OptimizedQueryOptions<T> extends Omit<UseQueryOptions<T>, 'queryKey' | 'queryFn'> {
  queryKey: string[];
  enableMemoryCache?: boolean;
  memoryCacheTTL?: number;
}

export function useOptimizedQuery<T = unknown>(
  options: OptimizedQueryOptions<T>
) {
  const {
    queryKey,
    enableMemoryCache = true,
    memoryCacheTTL = 300000, // 5 minutes
    ...queryOptions
  } = options;

  // Optimisation de la clé de cache
  const optimizedQueryKey = useMemo(() => queryKey, [JSON.stringify(queryKey)]);

  // Vérification du cache mémoire en premier
  const cachedData = useMemo(() => {
    if (!enableMemoryCache) return null;
    return memoryCache.get(optimizedQueryKey.join(':'));
  }, [optimizedQueryKey, enableMemoryCache]);

  const query = useQuery({
    queryKey: optimizedQueryKey,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (remplace cacheTime)
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    ...queryOptions,
    queryFn: async () => {
      // Si on a des données en cache mémoire, les utiliser
      if (cachedData) {
        return cachedData;
      }

      // Sinon, faire l'appel réseau
      const response = await fetch(optimizedQueryKey[0]);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Sauvegarder en cache mémoire
      if (enableMemoryCache) {
        memoryCache.set(optimizedQueryKey.join(':'), data, memoryCacheTTL);
      }
      
      return data;
    }
  });

  return query;
}