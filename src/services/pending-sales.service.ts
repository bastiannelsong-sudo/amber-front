import api from './api';
import type { PendingSale, ResolvePendingSaleDto } from '../types/product.types';

export const pendingSalesService = {
  getAll: async (filters?: {
    status?: 'pending' | 'mapped' | 'ignored';
    platformId?: number;
  }): Promise<PendingSale[]> => {
    // Construir params manualmente para evitar objetos anidados
    const params: any = {};
    if (filters?.status) params.status = filters.status;
    if (filters?.platformId) params.platformId = filters.platformId;

    const response = await api.get('/pending-sales', { params });
    return response.data;
  },

  getCount: async (status: 'pending' | 'mapped' | 'ignored' = 'pending'): Promise<{ count: number }> => {
    const response = await api.get('/pending-sales/count', {
      params: { status },
    });
    return response.data;
  },

  getById: async (id: number): Promise<PendingSale> => {
    const response = await api.get(`/pending-sales/${id}`);
    return response.data;
  },

  resolve: async (id: number, data: ResolvePendingSaleDto): Promise<PendingSale> => {
    const response = await api.post(`/pending-sales/${id}/resolve`, data);
    return response.data;
  },

  ignore: async (id: number, resolvedBy: string): Promise<PendingSale> => {
    const response = await api.post(`/pending-sales/${id}/ignore`, {
      resolved_by: resolvedBy,
    });
    return response.data;
  },

  getByPlatform: async (platformId: number): Promise<PendingSale[]> => {
    const response = await api.get(`/pending-sales/platform/${platformId}`);
    return response.data;
  },
};

export default pendingSalesService;
