import api from './api';
import type { ProductMapping, CreateMappingDto } from '../types/product.types';

export const mappingsService = {
  getAll: async (): Promise<ProductMapping[]> => {
    const response = await api.get('/product-mappings');
    return response.data;
  },

  getByPlatform: async (platformId: number): Promise<ProductMapping[]> => {
    const response = await api.get(`/product-mappings/platform/${platformId}`);
    return response.data;
  },

  getByProduct: async (productId: number): Promise<ProductMapping[]> => {
    const response = await api.get(`/product-mappings/product/${productId}`);
    return response.data;
  },

  create: async (data: CreateMappingDto): Promise<ProductMapping> => {
    const response = await api.post('/product-mappings', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/product-mappings/${id}`);
  },

  toggleActive: async (id: number): Promise<ProductMapping> => {
    const response = await api.patch(`/product-mappings/${id}/toggle-active`);
    return response.data;
  },
};

export default mappingsService;
