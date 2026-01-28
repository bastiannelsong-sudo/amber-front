import { useQuery, useQueryClient } from '@tanstack/react-query';
import salesService from '../services/sales.service';
import { toast } from 'react-hot-toast';
import type { DateRange, PaginationParams, LogisticType, DateMode } from '../types/sales.types';

// Query Keys
export const salesKeys = {
  all: ['sales'] as const,
  daily: (date: string, sellerId: number) => [...salesKeys.all, 'daily', date, sellerId] as const,
  dateRange: (from: string, to: string, sellerId: number) => [...salesKeys.all, 'range', from, to, sellerId] as const,
  dateRangePaginated: (from: string, to: string, sellerId: number, page: number, limit: number, logisticType?: LogisticType, dateMode?: DateMode) =>
    [...salesKeys.all, 'range', from, to, sellerId, page, limit, logisticType, dateMode] as const,
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
 * Hook to fetch sales for a date range with pagination
 */
export const useDateRangeSales = (
  dateRange: DateRange,
  sellerId: number,
  pagination?: PaginationParams
) => {
  const page = pagination?.page || 1;
  const limit = pagination?.limit || 20;
  const logisticType = pagination?.logistic_type;
  const dateMode = pagination?.date_mode;

  return useQuery({
    queryKey: salesKeys.dateRangePaginated(dateRange.from, dateRange.to, sellerId, page, limit, logisticType, dateMode),
    queryFn: () => salesService.getDateRangeSales(dateRange, sellerId, { page, limit, logistic_type: logisticType, date_mode: dateMode }),
    enabled: !!dateRange.from && !!dateRange.to && !!sellerId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
    placeholderData: (previousData) => previousData, // Keep previous data while fetching new page
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
