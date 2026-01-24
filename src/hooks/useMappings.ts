import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import mappingsService from '../services/mappings.service';
import type { CreateMappingDto } from '../types/product.types';
import { toast } from 'react-hot-toast';

export const useMappings = (platformId?: number) => {
  return useQuery({
    queryKey: ['mappings', platformId],
    queryFn: () =>
      platformId
        ? mappingsService.getByPlatform(platformId)
        : mappingsService.getAll(),
  });
};

export const useMappingsByProduct = (productId: number) => {
  return useQuery({
    queryKey: ['mappings', 'product', productId],
    queryFn: () => mappingsService.getByProduct(productId),
    enabled: !!productId,
  });
};

export const useCreateMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMappingDto) => mappingsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      toast.success('Mapeo creado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al crear el mapeo');
    },
  });
};

export const useDeleteMapping = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => mappingsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      toast.success('Mapeo eliminado correctamente');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al eliminar el mapeo');
    },
  });
};

export const useToggleMappingActive = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => mappingsService.toggleActive(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mappings'] });
      toast.success('Estado del mapeo actualizado');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Error al actualizar el mapeo');
    },
  });
};
