// Types for Daily Sales Dashboard

export type LogisticType = 'fulfillment' | 'cross_docking' | 'other';

export type DateMode = 'sii' | 'mercado_libre';

export interface OrderItemSummary {
  item_id: string;
  title: string;
  quantity: number;
  unit_price: number;
  seller_sku: string;
  thumbnail: string | null;
}

export interface BuyerInfo {
  id: number;
  nickname: string;
  first_name: string;
  last_name: string;
  // Datos del destinatario del envío
  receiver_name?: string;
  receiver_phone?: string;
  receiver_rut?: string;
}

export interface OrderSummary {
  id: number;
  date_created: string;
  date_approved: string;
  status: string;
  is_cancelled: boolean; // True if order was cancelled/refunded/in_mediation (shown in list but not counted in sums)
  cancellation_type: 'cancelled' | 'in_mediation' | 'refunded' | null; // Specific reason
  total_amount: number;
  paid_amount: number;
  logistic_type: string;
  logistic_type_label: string;
  pack_id: number | null;
  items: OrderItemSummary[];
  shipping_cost: number;
  courier_cost: number; // Costo externo del courier (para envíos gratis >$20k) - NO se muestra en columna Envío
  marketplace_fee: number;
  iva_amount: number;
  shipping_bonus: number; // Bonificación por envío de ML (para envíos gratis >$20k)
  flex_shipping_cost: number; // External flex shipping cost (net, without IVA)
  gross_amount: number;
  total_fees: number;
  net_profit: number;
  profit_margin: number;
  buyer?: BuyerInfo;
}

export interface LogisticTypeSummary {
  logistic_type: string;
  logistic_type_label: string;
  total_orders: number;
  total_items: number;
  gross_amount: number;
  shipping_cost: number;
  marketplace_fee: number;
  iva_amount: number;
  shipping_bonus: number; // Total bonificación por envío de ML for this type
  flex_shipping_cost: number; // Total external flex shipping cost for this type
  courier_cost: number; // Total courier cost for free shipping >$20k orders
  total_fees: number;
  net_profit: number;
  average_order_value: number;
  average_profit_margin: number;
  cancelled_count: number; // Number of pure cancelled orders
  cancelled_amount: number; // Sum of gross_amount of pure cancelled orders
  mediation_count: number; // Number of orders in mediation
  mediation_amount: number; // Sum of gross_amount of orders in mediation
  refunded_count: number; // Number of refunded/returned orders
  refunded_amount: number; // Sum of gross_amount of refunded orders
}

export interface DailySalesSummary {
  total_orders: number;
  total_items: number;
  gross_amount: number;
  shipping_cost: number;
  marketplace_fee: number;
  iva_amount: number;
  shipping_bonus: number; // Total bonificación por envío de ML for the day
  flex_shipping_cost: number; // Total external flex shipping cost for the day
  courier_cost: number; // Total courier cost for free shipping >$20k orders
  total_fees: number;
  net_profit: number;
  average_order_value: number;
  average_profit_margin: number;
  cancelled_count: number; // Number of pure cancelled orders
  cancelled_amount: number; // Sum of gross_amount of pure cancelled orders
  mediation_count: number; // Number of orders in mediation
  mediation_amount: number; // Sum of gross_amount of orders in mediation
  refunded_count: number; // Number of refunded/returned orders
  refunded_amount: number; // Sum of gross_amount of refunded orders
}

export interface DailySalesResponse {
  date: string;
  seller_id: number;
  summary: DailySalesSummary;
  by_logistic_type: {
    fulfillment: LogisticTypeSummary;
    cross_docking: LogisticTypeSummary;
    other: LogisticTypeSummary;
  };
  orders: {
    fulfillment: OrderSummary[];
    cross_docking: OrderSummary[];
    other: OrderSummary[];
  };
}

// Fazt tier info returned from sync recalculation
export interface FaztTierInfo {
  shipments_count: number;
  rate_per_shipment: number;
  total_updated: number;
  year_month: string;
}

// Date Range types
export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

// Pagination types
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  logistic_type?: LogisticType;
  date_mode?: DateMode;
}

// Pack group - orders grouped by pack_id
export interface PackGroup {
  pack_id: number | null; // null for single orders without pack

  // Pack-level aggregated values (sum of all orders in pack)
  pack_total_amount: number;
  pack_shipping_cost: number; // Shipping cost/income (once per pack, NOT summed)
  pack_marketplace_fee: number;
  pack_iva_amount: number;
  pack_shipping_bonus: number;
  pack_flex_shipping_cost: number; // Fazt cost (once per pack)
  pack_courier_cost: number; // Courier cost for free shipping (once per pack)
  pack_net_profit: number;
  pack_profit_margin: number;

  // Logistic type (same for all orders in pack)
  logistic_type: string;
  logistic_type_label: string;

  // Date (from first order)
  date_approved: string;

  // Status (combined)
  status: string;
  is_cancelled: boolean;
  cancellation_type: 'cancelled' | 'in_mediation' | 'refunded' | null;

  // Buyer info (same for all orders in pack)
  buyer?: BuyerInfo;

  // All orders in this pack
  orders: OrderSummary[];

  // All items across all orders in pack (flattened)
  all_items: OrderItemSummary[];
}

export interface DateRangeSalesResponse {
  from_date: string;
  to_date: string;
  seller_id: number;
  days_count: number;
  summary: DailySalesSummary;
  by_logistic_type: {
    fulfillment: LogisticTypeSummary;
    cross_docking: LogisticTypeSummary;
    other: LogisticTypeSummary;
  };
  orders: {
    fulfillment: OrderSummary[];
    cross_docking: OrderSummary[];
    other: OrderSummary[];
  };
}

// Paginated response (new format from backend)
export interface PaginatedDateRangeSalesResponse {
  from_date: string;
  to_date: string;
  seller_id: number;
  days_count: number;
  summary: DailySalesSummary;
  by_logistic_type: {
    fulfillment: LogisticTypeSummary;
    cross_docking: LogisticTypeSummary;
    other: LogisticTypeSummary;
  };
  orders: OrderSummary[]; // Flat array of orders for current page
  packs: PackGroup[]; // Orders grouped by pack_id for proper display
  pagination: PaginationMeta;
}

// UI Helper functions
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    in_mediation: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    refunded: 'bg-violet-500/20 text-violet-400 border-violet-500/30',
    shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return colors[status] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    paid: 'Pagado',
    pending: 'Pendiente',
    cancelled: 'Cancelado',
    in_mediation: 'En Mediación',
    refunded: 'Devolución',
    shipped: 'Enviado',
  };
  return labels[status] || status;
};

export const getLogisticTypeConfig = (type: string) => {
  const flexConfig = {
    color: 'text-sky-400',
    bg: 'bg-sky-500/10 border-sky-500/20',
    icon: '⚡',
    label: 'Flex',
  };

  const configs: Record<string, { color: string; bg: string; icon: string; label: string }> = {
    fulfillment: {
      color: 'text-emerald-400',
      bg: 'bg-emerald-500/10 border-emerald-500/20',
      icon: '📦',
      label: 'Full',
    },
    cross_docking: flexConfig,
    self_service: flexConfig, // self_service = Flex (seller uses own courier, buyer pays shipping)
    cross_docking_cost: flexConfig, // Free shipping >$20k, seller pays shipping (cost, not income)
    self_service_cost: flexConfig, // Free shipping >$20k, seller pays shipping (cost, not income)
    // xd_drop_off = Centro de Envío (seller drops at ML point, ML charges)
    other: {
      color: 'text-zinc-400',
      bg: 'bg-zinc-500/10 border-zinc-500/20',
      icon: '🏢',
      label: 'Centro de Envío',
    },
  };
  return configs[type] || configs.other;
};
