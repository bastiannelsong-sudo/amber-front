import api from './api';
import type { DailySalesResponse, PaginatedDateRangeSalesResponse, DateRange, PaginationParams, FaztTierInfo } from '../types/sales.types';

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
   * Get sales for a date range with metrics grouped by logistic type
   * Maximum range is 31 days
   * Supports pagination with page and limit params
   */
  getDateRangeSales: async (
    dateRange: DateRange,
    sellerId: number,
    pagination?: PaginationParams
  ): Promise<PaginatedDateRangeSalesResponse> => {
    const response = await api.get('/orders/sales-range', {
      params: {
        from_date: dateRange.from,
        to_date: dateRange.to,
        seller_id: sellerId,
        page: pagination?.page || 1,
        limit: pagination?.limit || 20,
        logistic_type: pagination?.logistic_type,
        date_mode: pagination?.date_mode,
      },
    });
    return response.data;
  },

  /**
   * Sync orders from Mercado Libre API (single day)
   * Uses extended timeout (2 minutes) for large sync operations
   */
  syncFromMercadoLibre: async (
    date: string,
    sellerId: number
  ): Promise<{ synced: number; message: string; fazt_tier?: FaztTierInfo | null }> => {
    const response = await api.get('/orders/sync', {
      params: { date, seller_id: sellerId },
      timeout: 120000, // 2 minutes for sync (can have 100+ orders)
    });
    return response.data;
  },

  /**
   * Sync orders for a date range in PARALLEL (backend handles parallelization)
   * Also checks for status changes (cancellations, returns, etc.)
   * Much faster than syncing day by day from frontend
   * Uses extended timeout (5 minutes) for large range sync
   */
  syncDateRangeParallel: async (
    dateRange: DateRange,
    sellerId: number
  ): Promise<{
    total_synced: number;
    days_processed: number;
    status_changes: number;
    details: { date: string; synced: number }[];
  }> => {
    const response = await api.get('/orders/sync-range', {
      params: {
        from_date: dateRange.from,
        to_date: dateRange.to,
        seller_id: sellerId,
      },
      timeout: 300000, // 5 minutes for range sync
    });
    return response.data;
  },

  /**
   * Sync status changes for orders updated in a date range
   * Catches cancellations, returns, and payment status changes
   */
  syncStatusChanges: async (
    dateRange: DateRange,
    sellerId: number
  ): Promise<{ updated: number; changes: { order_id: number; old_status: string; new_status: string }[] }> => {
    const response = await api.get('/orders/sync-status-changes', {
      params: {
        from_date: dateRange.from,
        to_date: dateRange.to,
        seller_id: sellerId,
      },
      timeout: 120000, // 2 minutes for status change check
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
