import { api } from './api';
import type {
  FaztConfigSummary,
  CreateFaztConfigDto,
  CurrentRateResult,
  ShipmentsCountResult,
} from '../types/fazt-config.types';

export const faztConfigService = {
  /**
   * Obtener configuración de Fazt para un vendedor
   */
  getConfiguration: async (sellerId: number): Promise<FaztConfigSummary | null> => {
    try {
      const response = await api.get('/fazt-config', {
        params: { seller_id: sellerId },
      });
      // Si no hay configuración, el backend retorna { message: "..." }
      if (response.data.message) {
        return null;
      }
      return response.data;
    } catch (error) {
      console.error('Error fetching Fazt config:', error);
      return null;
    }
  },

  /**
   * Crear o actualizar configuración de Fazt
   */
  upsertConfiguration: async (dto: CreateFaztConfigDto): Promise<FaztConfigSummary> => {
    const response = await api.post('/fazt-config', dto);
    return response.data;
  },

  /**
   * Obtener tarifa actual según volumen del mes
   */
  getCurrentRate: async (sellerId: number): Promise<CurrentRateResult> => {
    const response = await api.get('/fazt-config/current-rate', {
      params: { seller_id: sellerId },
    });
    return response.data;
  },

  /**
   * Obtener conteo de envíos Flex únicos del mes
   */
  getShipmentsCount: async (
    sellerId: number,
    yearMonth?: string
  ): Promise<ShipmentsCountResult> => {
    const response = await api.get('/fazt-config/shipments-count', {
      params: {
        seller_id: sellerId,
        year_month: yearMonth,
      },
    });
    return response.data;
  },
};
