import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import pendingSalesService from '../services/pending-sales.service';
import type { ResolvePendingSaleDto } from '../types/product.types';
import { toast } from 'react-hot-toast';

export const usePendingSales = (
  status?: 'pending' | 'mapped' | 'ignored',
  platformId?: number
) => {
  return useQuery({
    queryKey: ['pending-sales', status, platformId],
    queryFn: () => {
      // Solo pasar el objeto si tiene valores
      const filters =
        status || platformId
          ? { status, platformId }
          : undefined;
      return pendingSalesService.getAll(filters);
    },
  });
};

export const usePendingSalesCount = (status: 'pending' | 'mapped' | 'ignored' = 'pending') => {
  return useQuery({
    queryKey: ['pending-sales-count', status],
    queryFn: () => pendingSalesService.getCount(status),
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });
};

export const usePendingSale = (id: number) => {
  return useQuery({
    queryKey: ['pending-sales', id],
    queryFn: () => pendingSalesService.getById(id),
    enabled: !!id,
  });
};

export const useResolvePendingSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pendingSaleId,
      productId,
      createMapping,
      resolvedBy,
    }: {
      pendingSaleId: number;
      productId: number;
      createMapping: boolean;
      resolvedBy: string;
    }) =>
      pendingSalesService.resolve(pendingSaleId, {
        product_id: productId,
        create_mapping: createMapping,
        resolved_by: resolvedBy,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['pending-sales-count'] });
      toast.success('Venta mapeada y stock descontado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al mapear la venta');
    },
  });
};

export const useIgnorePendingSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      pendingSaleId,
      resolvedBy,
    }: {
      pendingSaleId: number;
      resolvedBy: string;
    }) => pendingSalesService.ignore(pendingSaleId, resolvedBy),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pending-sales'] });
      queryClient.invalidateQueries({ queryKey: ['pending-sales-count'] });
      toast.success('Venta ignorada correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al ignorar la venta');
    },
  });
};
