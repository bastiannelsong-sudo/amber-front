import * as XLSX from 'xlsx';
import type { OrderSummary } from '../types/sales.types';

interface ExportOptions {
  orders: OrderSummary[];
  fromDate: string;
  toDate: string;
  logisticTypeFilter?: string | null;
}

// Format currency for display
const formatCurrency = (value: number): number => {
  return Math.round(value);
};

// Format percentage
const formatPercentage = (value: number): string => {
  return `${value.toFixed(1)}%`;
};

// Format date for display
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Get items summary (SKU and titles)
const getItemsSummary = (items: OrderSummary['items']): string => {
  return items.map((item) => `${item.quantity}x ${item.title}`).join(' | ');
};

const getItemsSku = (items: OrderSummary['items']): string => {
  return items.map((item) => item.seller_sku || '-').join(', ');
};

// Get logistic type label
const getLogisticTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    fulfillment: 'Full',
    cross_docking: 'Flex',
    self_service: 'Flex',
    cross_docking_cost: 'Flex',
    self_service_cost: 'Flex',
    other: 'Centro Envío',
  };
  return labels[type] || type;
};

export const exportOrdersToExcel = ({
  orders,
  fromDate,
  toDate,
  logisticTypeFilter,
}: ExportOptions): void => {
  // Filter orders if logistic type filter is applied
  let filteredOrders = orders;
  if (logisticTypeFilter && logisticTypeFilter !== 'all') {
    filteredOrders = orders.filter((order) => {
      const type = order.logistic_type;
      if (logisticTypeFilter === 'fulfillment') {
        return type === 'fulfillment';
      }
      if (logisticTypeFilter === 'cross_docking') {
        return ['cross_docking', 'self_service', 'cross_docking_cost', 'self_service_cost'].includes(
          type
        );
      }
      return type === 'other' || type === 'xd_drop_off';
    });
  }

  // Prepare data for Excel
  const data = filteredOrders.map((order) => ({
    'ID Orden': order.id,
    'Pack ID': order.pack_id || '-',
    Fecha: formatDate(order.date_approved),
    Estado: order.cancellation_type
      ? { cancelled: 'Cancelado', in_mediation: 'En Mediación', refunded: 'Devolución' }[order.cancellation_type] || order.status
      : order.status === 'paid' ? 'Pagado' : order.status,
    'Tipo Envío': getLogisticTypeLabel(order.logistic_type),
    Productos: getItemsSummary(order.items),
    SKU: getItemsSku(order.items),
    Venta: formatCurrency(order.gross_amount),
    'Costo Envío': formatCurrency(order.shipping_cost),
    'Costo Fazt': formatCurrency(order.flex_shipping_cost),
    'Comisión ML': formatCurrency(order.marketplace_fee),
    IVA: formatCurrency(order.iva_amount),
    'Bonif. Envío': formatCurrency(order.shipping_bonus),
    'Total Costos': formatCurrency(order.total_fees),
    Ganancia: formatCurrency(order.net_profit),
    'Margen %': formatPercentage(order.profit_margin),
    Comprador: order.buyer
      ? `${order.buyer.first_name} ${order.buyer.last_name}`.trim() || order.buyer.nickname
      : '-',
  }));

  // Create workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Set column widths
  const columnWidths = [
    { wch: 12 }, // ID Orden
    { wch: 12 }, // Pack ID
    { wch: 18 }, // Fecha
    { wch: 10 }, // Estado
    { wch: 10 }, // Cancelado
    { wch: 12 }, // Tipo Envío
    { wch: 50 }, // Productos
    { wch: 20 }, // SKU
    { wch: 12 }, // Venta
    { wch: 12 }, // Costo Envío
    { wch: 12 }, // Costo Fazt
    { wch: 12 }, // Comisión ML
    { wch: 10 }, // IVA
    { wch: 12 }, // Bonif. Envío
    { wch: 12 }, // Total Costos
    { wch: 12 }, // Ganancia
    { wch: 10 }, // Margen %
    { wch: 25 }, // Comprador
  ];
  worksheet['!cols'] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Ventas');

  // Generate filename
  const filterSuffix = logisticTypeFilter && logisticTypeFilter !== 'all' ? `_${logisticTypeFilter}` : '';
  const filename =
    fromDate === toDate
      ? `ventas_${fromDate}${filterSuffix}.xlsx`
      : `ventas_${fromDate}_a_${toDate}${filterSuffix}.xlsx`;

  // Download file
  XLSX.writeFile(workbook, filename);
};

export default exportOrdersToExcel;
