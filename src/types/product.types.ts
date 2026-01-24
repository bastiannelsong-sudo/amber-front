// Tipos de entidades base
export interface SecondarySku {
  secondary_sku_id: number;
  secondary_sku: string;
  stock_quantity: number;
  publication_link: string;
  platform?: Platform;
}

export interface Category {
  platform_id: number;
  platform_name: string;
}

export interface Platform {
  platform_id: number;
  platform_name: string;
}

export interface Product {
  product_id: number;
  internal_sku: string;
  name: string;
  stock: number;
  to_repair?: number;
  total?: number;
  secondarySkus: SecondarySku[];
  category: Category;
  created_at?: string;
  updated_at?: string;
}

// DTOs para crear/actualizar productos
export interface CreateProductDto {
  internal_sku: string;
  name: string;
  stock: number;
  category_id: number;
  secondarySkus: {
    secondary_sku: string;
    stock_quantity: number;
    publication_link?: string;
    platform_id: number;
  }[];
}

export interface UpdateProductDto {
  internal_sku?: string;
  name?: string;
  stock?: number;
  category_id?: number;
  secondarySkus?: {
    secondary_sku: string;
    stock_quantity: number;
    publication_link?: string;
    platform_id: number;
  }[];
  change_reason: string; // OBLIGATORIO
  changed_by?: string;
}

export interface AdjustStockDto {
  adjustment: number; // +10 o -5
  reason: string; // OBLIGATORIO
  changed_by: string; // OBLIGATORIO
}

// Historial de cambios extendido
export interface ProductHistory {
  history_id: number;
  product_id: number;
  field_name: string;
  old_value: string | null;
  new_value: string | null;
  changed_by: string;
  change_type: 'manual' | 'order' | 'adjustment' | 'import';
  change_reason: string;
  created_at: string;
  platform_id?: number;
  platform?: Platform;
  platform_order_id?: string;
  adjustment_amount?: number;
  metadata?: any;
}

// Mapeo de productos
export interface ProductMapping {
  mapping_id: number;
  platform_id: number;
  platform_sku: string;
  product_id: number;
  product?: Product;
  platform?: Platform;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// Venta pendiente de mapeo
export interface PendingSale {
  pending_sale_id: number;
  platform_id: number;
  platform_order_id: string;
  platform_sku: string;
  quantity: number;
  sale_date: string;
  raw_data: any;
  status: 'pending' | 'mapped' | 'ignored';
  mapped_to_product_id?: number;
  product?: Product;
  platform?: Platform;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

// Filtros de historial
export interface HistoryFilters {
  product_id?: number;
  change_type?: 'manual' | 'order' | 'adjustment' | 'import';
  platform_id?: number;
  changed_by?: string;
  date_from?: string;
  date_to?: string;
  limit?: number;
}

// Estadísticas de producto
export interface ProductStats {
  total_changes: number;
  manual_changes: number;
  automatic_changes: number;
  platforms_count: number;
  last_change_date: string;
  stock_trend: 'increasing' | 'decreasing' | 'stable';
}

// DTOs para crear mapeos
export interface CreateMappingDto {
  platform_id: number;
  platform_sku: string;
  product_id: number;
  created_by?: string;
}

// DTOs para resolver ventas pendientes
export interface ResolvePendingSaleDto {
  product_id: number;
  create_mapping?: boolean;
  resolved_by: string;
}

// Filtros para productos
export interface ProductFilters {
  search?: string;
  category_id?: number;
  platform_id?: number;
  stock_level?: 'all' | 'low' | 'medium' | 'high';
  sort_by?: 'name' | 'stock' | 'internal_sku' | 'updated_at';
  sort_order?: 'asc' | 'desc';
}

// Estado de stock para badges
export type StockLevel = 'low' | 'medium' | 'high';

export const getStockLevel = (stock: number): StockLevel => {
  if (stock <= 10) return 'low';
  if (stock <= 30) return 'medium';
  return 'high';
};

export const getStockColor = (level: StockLevel): string => {
  switch (level) {
    case 'low':
      return 'failure'; // rojo
    case 'medium':
      return 'warning'; // amarillo
    case 'high':
      return 'success'; // verde
  }
};
