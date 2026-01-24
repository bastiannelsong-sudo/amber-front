// Types for Daily Sales Dashboard

export type LogisticType = 'fulfillment' | 'cross_docking' | 'other';

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
  is_cancelled: boolean; // True if order was cancelled/refunded (shown in list but not counted in sums)
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
  total_fees: number;
  net_profit: number;
  average_order_value: number;
  average_profit_margin: number;
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
  total_fees: number;
  net_profit: number;
  average_order_value: number;
  average_profit_margin: number;
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

// UI Helper functions
export const getStatusColor = (status: string): string => {
  const colors: Record<string, string> = {
    paid: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    pending: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    shipped: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  };
  return colors[status] || 'bg-zinc-500/20 text-zinc-400 border-zinc-500/30';
};

export const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    paid: 'Pagado',
    pending: 'Pendiente',
    cancelled: 'Cancelado',
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
