import api from './api';
import type { DailySalesResponse } from '../types/sales.types';

export const salesService = {
  /**
   * Get daily sales with metrics grouped by logistic type
   */
  getDailySales: async (date: string, sellerId: number): Promise<DailySalesResponse> => {
    const response = await api.get('/orders/daily-sales', {
      params: { date, seller_id: sellerId },
    });
    return response.data;
  },

  /**
   * Sync orders from Mercado Libre API
   * Uses extended timeout (2 minutes) for large sync operations
   */
  syncFromMercadoLibre: async (
    date: string,
    sellerId: number
  ): Promise<{ synced: number; message: string }> => {
    const response = await api.get('/orders/sync', {
      params: { date, seller_id: sellerId },
      timeout: 120000, // 2 minutes for sync (can have 100+ orders)
    });
    return response.data;
  },

  /**
   * Export daily sales to CSV (future)
   */
  exportToCSV: async (date: string, sellerId: number): Promise<Blob> => {
    const response = await api.get('/orders/daily-sales/export', {
      params: { date, seller_id: sellerId },
      responseType: 'blob',
    });
    return response.data;
  },
};

export default salesService;
