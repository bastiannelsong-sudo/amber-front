/**
 * Tier de tarifas de Fazt según volumen de envíos
 */
export interface FaztRateTier {
  min_shipments: number;
  max_shipments: number | null; // null = sin límite superior
  same_day_rm: number; // Precio Same Day Región Metropolitana (sin IVA)
  next_day_v_region: number; // Precio Next Day a V Región (sin IVA)
}

/**
 * Configuración completa de Fazt
 */
export interface FaztConfigSummary {
  id: number;
  seller_id: number;
  rate_tiers: FaztRateTier[];
  special_zone_surcharge: number;
  xl_package_surcharge: number;
  default_service_type: string;
  special_zone_city_ids: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * DTO para crear/actualizar configuración
 */
export interface CreateFaztConfigDto {
  seller_id: number;
  rate_tiers?: FaztRateTier[];
  special_zone_surcharge?: number;
  xl_package_surcharge?: number;
  default_service_type?: 'same_day_rm' | 'next_day_v_region';
  special_zone_city_ids?: string[];
  is_active?: boolean;
}

/**
 * Resultado del cálculo de tarifa actual
 */
export interface CurrentRateResult {
  shipments_count: number;
  current_tier: FaztRateTier | null;
  same_day_rm_rate: number;
  next_day_v_region_rate: number;
  year_month: string;
}

/**
 * Conteo de envíos
 */
export interface ShipmentsCountResult {
  seller_id: number;
  year_month: string;
  unique_shipments: number;
}

/**
 * Tarifas por defecto de Fazt
 */
export const DEFAULT_FAZT_TIERS: FaztRateTier[] = [
  { min_shipments: 100, max_shipments: 200, same_day_rm: 3290, next_day_v_region: 3990 },
  { min_shipments: 201, max_shipments: 400, same_day_rm: 2790, next_day_v_region: 3290 },
  { min_shipments: 401, max_shipments: 601, same_day_rm: 2590, next_day_v_region: 3090 },
  { min_shipments: 601, max_shipments: 800, same_day_rm: 2490, next_day_v_region: 2990 },
  { min_shipments: 801, max_shipments: 1000, same_day_rm: 2390, next_day_v_region: 2890 },
  { min_shipments: 1001, max_shipments: null, same_day_rm: 2290, next_day_v_region: 2790 },
];

/**
 * Formatear rango de envíos para mostrar
 */
export const formatShipmentRange = (tier: FaztRateTier): string => {
  if (tier.max_shipments === null) {
    return `Más de ${tier.min_shipments - 1}`;
  }
  return `${tier.min_shipments} - ${tier.max_shipments}`;
};
