import api from './api';
import type {
  Product,
  CreateProductDto,
  UpdateProductDto,
  AdjustStockDto,
  ProductHistory,
} from '../types/product.types';

export const productsService = {
  // Obtener todos los productos
  getAll: async (): Promise<Product[]> => {
    const response = await api.get('/products');
    return response.data;
  },

  // Obtener un producto por ID
  getById: async (id: number): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // Crear un nuevo producto
  create: async (data: CreateProductDto): Promise<Product> => {
    const response = await api.post('/products', data);
    return response.data;
  },

  // Actualizar un producto
  update: async (id: number, data: UpdateProductDto): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Eliminar un producto
  delete: async (id: number, reason: string, changed_by: string): Promise<void> => {
    await api.delete(`/products/${id}`, {
      params: { reason, changed_by },
    });
  },

  // Ajustar stock manualmente
  adjustStock: async (id: number, data: AdjustStockDto): Promise<Product> => {
    const response = await api.post(`/products/${id}/adjust-stock`, data);
    return response.data;
  },

  // Obtener historial de cambios de un producto
  getHistory: async (id: number, limit: number = 50): Promise<ProductHistory[]> => {
    const response = await api.get(`/products/${id}/history`, {
      params: { limit },
    });
    return response.data;
  },

  // Obtener productos con stock bajo
  getLowStock: async (threshold: number = 10): Promise<Product[]> => {
    const response = await api.get('/products/low-stock', {
      params: { threshold },
    });
    return response.data;
  },

  // Obtener categorías
  getCategories: async () => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Obtener plataformas
  getPlatforms: async () => {
    const response = await api.get('/platforms');
    return response.data;
  },
};

export default productsService;
