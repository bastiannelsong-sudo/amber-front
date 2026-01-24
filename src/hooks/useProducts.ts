import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import productsService from '../services/products.service';
import type {
  CreateProductDto,
  UpdateProductDto,
  AdjustStockDto,
} from '../types/product.types';
import toast from 'react-hot-toast';

// Query Keys
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters?: unknown) => [...productKeys.lists(), { filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: number) => [...productKeys.details(), id] as const,
  history: (id: number) => [...productKeys.all, 'history', id] as const,
  lowStock: () => [...productKeys.all, 'low-stock'] as const,
  categories: ['categories'] as const,
  platforms: ['platforms'] as const,
};

/**
 * Hook para obtener todos los productos
 */
export const useProducts = () => {
  return useQuery({
    queryKey: productKeys.lists(),
    queryFn: productsService.getAll,
  });
};

/**
 * Hook para obtener un producto por ID
 */
export const useProduct = (id: number) => {
  return useQuery({
    queryKey: productKeys.detail(id),
    queryFn: () => productsService.getById(id),
    enabled: !!id, // Solo ejecutar si hay ID
  });
};

/**
 * Hook para crear un producto
 */
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProductDto) => productsService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Producto creado exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al crear el producto';
      toast.error(message);
    },
  });
};

/**
 * Hook para actualizar un producto
 */
export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateProductDto }) =>
      productsService.update(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: productKeys.history(variables.id) });
      toast.success('Producto actualizado exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al actualizar el producto';
      toast.error(message);
    },
  });
};

/**
 * Hook para eliminar un producto
 */
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason, changed_by }: { id: number; reason: string; changed_by: string }) =>
      productsService.delete(id, reason, changed_by),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      toast.success('Producto eliminado exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al eliminar el producto';
      toast.error(message);
    },
  });
};

/**
 * Hook para ajustar stock
 */
export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      productId,
      adjustment,
      reason,
      description,
      changedBy,
    }: {
      productId: number;
      adjustment: number;
      reason: string;
      description: string;
      changedBy: string;
    }) =>
      productsService.adjustStock(productId, {
        adjustment,
        reason,
        description,
        changed_by: changedBy,
      }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() });
      queryClient.invalidateQueries({ queryKey: productKeys.detail(variables.productId) });
      queryClient.invalidateQueries({ queryKey: productKeys.history(variables.productId) });
      toast.success('Stock ajustado exitosamente');
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || 'Error al ajustar el stock';
      toast.error(message);
    },
  });
};

/**
 * Hook para obtener historial de un producto
 */
export const useProductHistory = (id: number, limit: number = 50) => {
  return useQuery({
    queryKey: productKeys.history(id),
    queryFn: () => productsService.getHistory(id, limit),
    enabled: !!id,
  });
};

/**
 * Hook para obtener productos con stock bajo
 */
export const useLowStockProducts = (threshold: number = 10) => {
  return useQuery({
    queryKey: productKeys.lowStock(),
    queryFn: () => productsService.getLowStock(threshold),
  });
};

/**
 * Hook para obtener categorías
 */
export const useCategories = () => {
  return useQuery({
    queryKey: productKeys.categories,
    queryFn: productsService.getCategories,
    staleTime: 10 * 60 * 1000, // 10 minutos (las categorías no cambian mucho)
  });
};

/**
 * Hook para obtener plataformas
 */
export const usePlatforms = () => {
  return useQuery({
    queryKey: productKeys.platforms,
    queryFn: productsService.getPlatforms,
    staleTime: 10 * 60 * 1000, // 10 minutos (las plataformas no cambian mucho)
  });
};

export default useProducts;
