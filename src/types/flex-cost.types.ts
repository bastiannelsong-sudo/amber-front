// Types for Monthly Flex Cost management

export interface FlexCostSummary {
  id: number;
  year_month: string; // YYYY-MM
  net_cost: number; // Cost without IVA
  iva_amount: number; // IVA (19%)
  total_cost: number; // net_cost + iva_amount
  flex_orders_count: number; // Number of Flex orders in that month
  cost_per_order: number; // net_cost / flex_orders_count
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateFlexCostDto {
  seller_id: number;
  year_month: string; // YYYY-MM
  total_with_iva: number;
  notes?: string;
}

// Helper to format year_month to display
export const formatYearMonth = (yearMonth: string): string => {
  const [year, month] = yearMonth.split('-');
  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
  ];
  const monthIndex = parseInt(month, 10) - 1;
  return `${months[monthIndex]} ${year}`;
};

// Helper to get year_month from Date
export const getYearMonth = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

// Get list of months for the last N months
export const getLastMonths = (count: number): string[] => {
  const months: string[] = [];
  const today = new Date();

  for (let i = 0; i < count; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
    months.push(getYearMonth(date));
  }

  return months;
};
