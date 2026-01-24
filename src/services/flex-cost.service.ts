import api from './api';
import type { FlexCostSummary, CreateFlexCostDto } from '../types/flex-cost.types';

export const flexCostService = {
  /**
   * Get all monthly Flex costs for a seller
   */
  getAll: async (sellerId: number): Promise<FlexCostSummary[]> => {
    const response = await api.get('/flex-costs', {
      params: { seller_id: sellerId },
    });
    return response.data;
  },

  /**
   * Get Flex cost for a specific month
   */
  getByMonth: async (
    sellerId: number,
    yearMonth: string
  ): Promise<FlexCostSummary | null> => {
    try {
      const response = await api.get(`/flex-costs/${yearMonth}`, {
        params: { seller_id: sellerId },
      });
      // Check if response contains a message (no cost found)
      if (response.data.message) {
        return null;
      }
      return response.data;
    } catch {
      return null;
    }
  },

  /**
   * Create or update monthly Flex cost
   */
  upsert: async (dto: CreateFlexCostDto): Promise<FlexCostSummary> => {
    const response = await api.post('/flex-costs', dto);
    return response.data;
  },

  /**
   * Delete a monthly Flex cost
   */
  delete: async (sellerId: number, yearMonth: string): Promise<void> => {
    await api.delete(`/flex-costs/${yearMonth}`, {
      params: { seller_id: sellerId },
    });
  },
};

export default flexCostService;
