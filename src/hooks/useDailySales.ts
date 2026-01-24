import { useQuery, useQueryClient } from '@tanstack/react-query';
import salesService from '../services/sales.service';
import { toast } from 'react-hot-toast';

// Query Keys
export const salesKeys = {
  all: ['sales'] as const,
  daily: (date: string, sellerId: number) => [...salesKeys.all, 'daily', date, sellerId] as const,
};

/**
 * Hook to fetch daily sales with metrics
 */
export const useDailySales = (date: string, sellerId: number) => {
  return useQuery({
    queryKey: salesKeys.daily(date, sellerId),
    queryFn: () => salesService.getDailySales(date, sellerId),
    enabled: !!date && !!sellerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
};

/**
 * Hook to refresh/sync daily sales
 */
export const useRefreshDailySales = () => {
  const queryClient = useQueryClient();

  const refresh = async (date: string, sellerId: number) => {
    try {
      await salesService.syncFromMercadoLibre(date, sellerId);
      await queryClient.invalidateQueries({ queryKey: salesKeys.daily(date, sellerId) });
      toast.success('Datos actualizados correctamente');
    } catch {
      toast.error('Error al sincronizar datos');
    }
  };

  return { refresh };
};

export default useDailySales;
