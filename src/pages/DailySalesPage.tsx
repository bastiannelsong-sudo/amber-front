import { FC, useState, useMemo, useCallback, memo, Suspense, lazy } from 'react';
import { HiRefresh, HiDownload, HiSparkles } from 'react-icons/hi';
import { useDateRangeSales } from '../hooks/useDailySales';
import { useSyncDateRange } from '../hooks/useSyncDateRange';
import { useAuthStore } from '../store/authStore';
import { useApplyTheme } from '../store/themeStore';
import AppHeader from '../components/layout/AppHeader';
import DateRangeSelector from '../components/sales/DateRangeSelector';
import SyncProgressModal from '../components/sales/SyncProgressModal';
import DailySalesStats from '../components/sales/DailySalesStats';
import LogisticTypeTabs from '../components/sales/LogisticTypeTabs';
import SalesTable from '../components/sales/SalesTable';
import { exportOrdersToExcel } from '../utils/excelExport';
import salesService from '../services/sales.service';
import type { OrderSummary, LogisticType, DailySalesSummary, LogisticTypeSummary, DateRange, PaginationParams, DateMode } from '../types/sales.types';
import '../styles/dashboard.css';

// Lazy load modal for better initial bundle
const OrderDetailModal = lazy(() => import('../components/sales/OrderDetailModal'));

// Loading skeleton for stats
const StatsSkeleton: FC = memo(() => (
  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px', marginBottom: '32px' }}>
    {[...Array(5)].map((_, i) => (
      <div
        key={i}
        className="skeleton"
        style={{ height: '140px', opacity: 1 - i * 0.1 }}
      />
    ))}
  </div>
));

// Format date for display
const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-CL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
};

// Format date range for display
const formatDateRangeDisplay = (range: DateRange): string => {
  if (range.from === range.to) {
    return formatDisplayDate(range.from);
  }
  const fromDate = new Date(range.from + 'T12:00:00');
  const toDate = new Date(range.to + 'T12:00:00');
  const fromStr = fromDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  const toStr = toDate.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
  return `${fromStr} - ${toStr}`;
};

// Get initial date range (today only)
const getInitialDateRange = (): DateRange => {
  const iso = new Date().toISOString();
  const today = iso.split('T')[0] as string;
  return { from: today, to: today };
};

// Default selection: all types selected
const getInitialSelection = (): Set<LogisticType> => new Set(['fulfillment', 'cross_docking', 'other']);

// Empty summary for calculations
const emptySummary: DailySalesSummary = {
  total_orders: 0,
  total_items: 0,
  gross_amount: 0,
  shipping_cost: 0,
  marketplace_fee: 0,
  iva_amount: 0,
  flex_shipping_cost: 0,
  shipping_bonus: 0,
  courier_cost: 0,
  total_fees: 0,
  net_profit: 0,
  average_order_value: 0,
  average_profit_margin: 0,
  cancelled_count: 0,
  cancelled_amount: 0,
  mediation_count: 0,
  mediation_amount: 0,
  refunded_count: 0,
  refunded_amount: 0,
};

// Empty logistic type summary
const emptyLogisticSummary: LogisticTypeSummary = {
  logistic_type: '',
  logistic_type_label: '',
  total_orders: 0,
  total_items: 0,
  gross_amount: 0,
  shipping_cost: 0,
  marketplace_fee: 0,
  iva_amount: 0,
  flex_shipping_cost: 0,
  shipping_bonus: 0,
  courier_cost: 0,
  total_fees: 0,
  net_profit: 0,
  average_order_value: 0,
  average_profit_margin: 0,
  cancelled_count: 0,
  cancelled_amount: 0,
  mediation_count: 0,
  mediation_amount: 0,
  refunded_count: 0,
  refunded_amount: 0,
};

// Map raw logistic_type values to their filter category
// Must match backend classification in order.service.ts
const getLogisticCategory = (logisticType: string): LogisticType => {
  if (logisticType === 'fulfillment') return 'fulfillment';
  if (logisticType === 'self_service' || logisticType === 'self_service_cost') return 'cross_docking';
  return 'other';
};

// Page size for pagination
const PAGE_SIZE = 20;

const DailySalesPage: FC = () => {
  // Apply theme to document
  useApplyTheme();

  // State with lazy initialization
  const [dateRange, setDateRange] = useState<DateRange>(getInitialDateRange);
  const [selectedTypes, setSelectedTypes] = useState<Set<LogisticType>>(getInitialSelection);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [dateMode, setDateMode] = useState<DateMode>('sii');

  // Auth - Get seller ID from session
  const user = useAuthStore((state) => state.user);
  const sellerId = user?.userId ? parseInt(user.userId) : 0;

  // Calculate the logistic_type filter for the API
  const logisticTypeFilter = useMemo((): LogisticType | undefined => {
    const selected = Array.from(selectedTypes);
    // If all types are selected, don't filter
    if (selected.length === 3) return undefined;
    // If only one type is selected, use it as filter
    if (selected.length === 1) return selected[0];
    // If multiple but not all, return undefined (will filter client-side)
    return undefined;
  }, [selectedTypes]);

  // When 2 types selected, client-side filtering needs ALL orders (not just one page)
  // because backend can only filter by 1 type. Fetch all so filtering is complete.
  const isClientSideFiltering = selectedTypes.size === 2;

  // Pagination params for the API
  const paginationParams: PaginationParams = useMemo(() => ({
    page: isClientSideFiltering ? 1 : currentPage,
    limit: isClientSideFiltering ? 10000 : PAGE_SIZE,
    logistic_type: logisticTypeFilter,
    date_mode: dateMode,
  }), [currentPage, logisticTypeFilter, isClientSideFiltering, dateMode]);

  // Data fetching with date range and pagination
  const { data, isLoading, isFetching, error, refetch } = useDateRangeSales(dateRange, sellerId, paginationParams);

  // Sync with progress
  const { progress: syncProgress, syncDateRange, cancelSync, resetProgress } = useSyncDateRange();

  // Orders: when backend filters by 1 type, orders are pre-filtered.
  // When 2 types selected, backend returns all orders → filter client-side.
  const filteredOrders = useMemo(() => {
    if (!data) return [];
    // If all types or exactly 1 type (backend-filtered), use as-is
    if (selectedTypes.size === 3 || selectedTypes.size === 1) return data.orders;
    // 2 types selected: filter client-side
    return data.orders.filter((o) => selectedTypes.has(getLogisticCategory(o.logistic_type)));
  }, [data, selectedTypes]);

  // Packs: same client-side filtering logic for pack groups
  const filteredPacks = useMemo(() => {
    if (!data?.packs) return undefined;
    if (selectedTypes.size === 3 || selectedTypes.size === 1) return data.packs;
    return data.packs.filter((p) => selectedTypes.has(getLogisticCategory(p.logistic_type)));
  }, [data, selectedTypes]);

  // Summary recalculated based on selected logistic types
  // When filtering, sum only the selected types from by_logistic_type
  const filteredSummary = useMemo((): DailySalesSummary => {
    if (!data) return emptySummary;

    // If all types selected, use the backend total summary
    if (selectedTypes.size === 3) return data.summary;

    // Sum only the selected logistic types
    const types: LogisticType[] = ['fulfillment', 'cross_docking', 'other'];
    const selectedSummaries = types
      .filter((t) => selectedTypes.has(t))
      .map((t) => data.by_logistic_type[t]);

    if (selectedSummaries.length === 0) return emptySummary;

    const total_orders = selectedSummaries.reduce((s, t) => s + t.total_orders, 0);
    const gross_amount = selectedSummaries.reduce((s, t) => s + t.gross_amount, 0);
    const net_profit = selectedSummaries.reduce((s, t) => s + t.net_profit, 0);

    return {
      total_orders,
      total_items: selectedSummaries.reduce((s, t) => s + t.total_items, 0),
      gross_amount,
      shipping_cost: selectedSummaries.reduce((s, t) => s + t.shipping_cost, 0),
      marketplace_fee: selectedSummaries.reduce((s, t) => s + t.marketplace_fee, 0),
      iva_amount: selectedSummaries.reduce((s, t) => s + t.iva_amount, 0),
      flex_shipping_cost: selectedSummaries.reduce((s, t) => s + t.flex_shipping_cost, 0),
      shipping_bonus: selectedSummaries.reduce((s, t) => s + t.shipping_bonus, 0),
      courier_cost: selectedSummaries.reduce((s, t) => s + (t.courier_cost || 0), 0),
      total_fees: selectedSummaries.reduce((s, t) => s + t.total_fees, 0),
      net_profit,
      average_order_value: total_orders > 0 ? gross_amount / total_orders : 0,
      average_profit_margin: gross_amount > 0 ? (net_profit / gross_amount) * 100 : 0,
      cancelled_count: selectedSummaries.reduce((s, t) => s + (t.cancelled_count || 0), 0),
      cancelled_amount: selectedSummaries.reduce((s, t) => s + (t.cancelled_amount || 0), 0),
      mediation_count: selectedSummaries.reduce((s, t) => s + (t.mediation_count || 0), 0),
      mediation_amount: selectedSummaries.reduce((s, t) => s + (t.mediation_amount || 0), 0),
      refunded_count: selectedSummaries.reduce((s, t) => s + (t.refunded_count || 0), 0),
      refunded_amount: selectedSummaries.reduce((s, t) => s + (t.refunded_amount || 0), 0),
    };
  }, [data, selectedTypes]);

  // Adjusted pagination: when 2 types selected, all data is fetched → no pagination needed
  const adjustedPagination = useMemo(() => {
    if (!data?.pagination) return undefined;
    // 2 types selected: all orders fetched, client-side filtering → no pagination
    if (isClientSideFiltering) return undefined;
    // All 3 or 1 type: backend handles pagination
    return data.pagination;
  }, [data, isClientSideFiltering]);

  // Shipping calculation based on selected logistic types
  // Includes all shipping-related components so stat cards add up to net_profit:
  // Ganancia = Ventas Brutas - Canceladas + Envío Neto - Comisiones - IVA
  const shippingCalculation = useMemo(() => {
    if (!data) return { shippingNet: 0, shippingIncome: 0, flexShippingCost: 0, shippingBonus: 0 };

    const fulfillment = data.by_logistic_type.fulfillment;
    const flex = data.by_logistic_type.cross_docking;
    const other = data.by_logistic_type.other;

    // Only include types that are currently selected
    const includesFlex = selectedTypes.has('cross_docking');
    const includesFull = selectedTypes.has('fulfillment');
    const includesOther = selectedTypes.has('other');

    // Shipping income from Flex (shipping_cost in Flex is income from buyer)
    const shippingIncome = includesFlex ? flex.shipping_cost : 0;

    // Fazt cost from Flex orders
    const flexShippingCost = includesFlex ? (flex.flex_shipping_cost || 0) : 0;

    // Note: courier_cost (senders[0].cost from ML API) is informational only — ML does NOT
    // charge this for Flex orders. The real courier cost is fazt_cost (flexShippingCost).

    // Shipping bonus from ML (bonificación por envío gratis >$20k)
    const shippingBonus =
      (includesFlex ? (flex.shipping_bonus || 0) : 0) +
      (includesFull ? (fulfillment.shipping_bonus || 0) : 0) +
      (includesOther ? (other.shipping_bonus || 0) : 0);

    // Non-Flex shipping cost: ML shipping cost for Full/Centro
    const nonFlexShippingCost =
      (includesFull ? fulfillment.shipping_cost : 0) +
      (includesOther ? other.shipping_cost : 0);

    // Net shipping = income + bonus - Fazt cost - ML cost
    const shippingNet = shippingIncome + shippingBonus - flexShippingCost - nonFlexShippingCost;

    return { shippingNet, shippingIncome, flexShippingCost, shippingBonus };
  }, [data, selectedTypes]);

  // Cancelled/mediation/refunded stats from backend summary (already filtered by selected logistic types)
  const cancelledAmount = filteredSummary.cancelled_amount || 0;
  const cancelledCount = filteredSummary.cancelled_count || 0;
  const mediationAmount = filteredSummary.mediation_amount || 0;
  const mediationCount = filteredSummary.mediation_count || 0;
  const refundedAmount = filteredSummary.refunded_amount || 0;
  const refundedCount = filteredSummary.refunded_count || 0;
  // Total of all inactive orders (for Ventas Brutas card)
  const totalInactiveAmount = cancelledAmount + mediationAmount + refundedAmount;

  // By logistic type - zero out unselected types so stats reflect the filter
  const filteredByLogisticType = useMemo(() => {
    if (!data) {
      return {
        fulfillment: emptyLogisticSummary,
        cross_docking: emptyLogisticSummary,
        other: emptyLogisticSummary,
      };
    }
    return {
      fulfillment: selectedTypes.has('fulfillment') ? data.by_logistic_type.fulfillment : emptyLogisticSummary,
      cross_docking: selectedTypes.has('cross_docking') ? data.by_logistic_type.cross_docking : emptyLogisticSummary,
      other: selectedTypes.has('other') ? data.by_logistic_type.other : emptyLogisticSummary,
    };
  }, [data, selectedTypes]);

  // Counts for tabs (always show real counts from all orders)
  const tabCounts = useMemo(() => {
    if (!data) return { fulfillment: 0, cross_docking: 0, other: 0 };
    return {
      fulfillment: data.by_logistic_type.fulfillment.total_orders,
      cross_docking: data.by_logistic_type.cross_docking.total_orders,
      other: data.by_logistic_type.other.total_orders,
    };
  }, [data]);

  // Stable callback handlers
  const handleDateRangeChange = useCallback((range: DateRange) => {
    setDateRange(range);
    setSelectedTypes(getInitialSelection()); // Reset to all selected on date change
    setCurrentPage(1); // Reset to first page on date change
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSync = useCallback(async () => {
    await syncDateRange(dateRange, sellerId);
  }, [dateRange, sellerId, syncDateRange]);

  const handleSyncModalClose = useCallback(() => {
    resetProgress();
    refetch(); // Refresh data after sync
  }, [resetProgress, refetch]);

  // Get current logistic filter for export
  const getLogisticFilterForExport = useCallback((): string | null => {
    const selected = Array.from(selectedTypes);
    if (selected.length === 3) return null; // All selected
    if (selected.length === 1) return selected[0] ?? null;
    return null;
  }, [selectedTypes]);

  const handleExport = useCallback(async () => {
    if (!data) return;

    // For export, we need all orders not just the current page
    // Fetch all orders with limit set to a large number
    try {
      const allData = await salesService.getDateRangeSales(
        dateRange,
        sellerId,
        { page: 1, limit: 10000, logistic_type: logisticTypeFilter, date_mode: dateMode }
      );

      exportOrdersToExcel({
        orders: allData.orders,
        fromDate: dateRange.from,
        toDate: dateRange.to,
        logisticTypeFilter: getLogisticFilterForExport(),
      });
    } catch (error) {
      console.error('Error exporting orders:', error);
    }
  }, [data, dateRange, sellerId, logisticTypeFilter, dateMode, getLogisticFilterForExport]);

  const handleViewOrder = useCallback((order: OrderSummary) => {
    setSelectedOrder(order);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const handleSelectionChange = useCallback((types: Set<LogisticType>) => {
    setSelectedTypes(types);
    setCurrentPage(1); // Reset to first page when filter changes
  }, []);

  // Early return for loading state
  if (isLoading) {
    return (
      <div className="dashboard-root">
        <div className="dashboard-grid-overlay" />
        <AppHeader />
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: '68px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '24px',
            }}
            className="animate-fade-up"
          >
            {/* Animated Logo */}
            <div
              style={{
                position: 'relative',
                width: '80px',
                height: '80px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  opacity: 0.2,
                  filter: 'blur(20px)',
                }}
                className="animate-pulse-glow"
              />
              <div
                style={{
                  position: 'relative',
                  width: '80px',
                  height: '80px',
                  borderRadius: '20px',
                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15), rgba(234, 88, 12, 0.1))',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <HiSparkles
                  style={{
                    width: '36px',
                    height: '36px',
                    color: '#f59e0b',
                  }}
                />
              </div>
            </div>

            {/* Loading Text */}
            <div style={{ textAlign: 'center' }}>
              <p
                className="text-display-sm"
                style={{ color: 'var(--text-primary)', marginBottom: '8px' }}
              >
                Cargando Dashboard
              </p>
              <p
                className="text-body"
                style={{ color: 'var(--text-tertiary)' }}
              >
                Obteniendo ventas del {formatDateRangeDisplay(dateRange)}
              </p>
            </div>

            {/* Progress Bar */}
            <div
              style={{
                width: '200px',
                height: '4px',
                borderRadius: '9999px',
                backgroundColor: 'var(--surface-elevated)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  width: '40%',
                  height: '100%',
                  borderRadius: '9999px',
                  background: 'linear-gradient(90deg, #f59e0b, #ea580c)',
                  animation: 'shimmer 1.5s infinite',
                  backgroundSize: '200% 100%',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Early return for error state
  if (error) {
    return (
      <div className="dashboard-root">
        <div className="dashboard-grid-overlay" />
        <AppHeader />
        <div
          style={{
            position: 'relative',
            zIndex: 10,
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            paddingTop: '92px',
          }}
        >
          <div
            style={{
              maxWidth: '400px',
              textAlign: 'center',
            }}
            className="animate-scale-in"
          >
            {/* Error Icon */}
            <div
              style={{
                width: '96px',
                height: '96px',
                margin: '0 auto 24px',
                borderRadius: '24px',
                background: 'rgba(244, 63, 94, 0.1)',
                border: '1px solid rgba(244, 63, 94, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '48px' }}>⚠️</span>
            </div>

            <h2
              className="text-display-md"
              style={{ color: 'var(--text-primary)', marginBottom: '12px' }}
            >
              Error al cargar
            </h2>
            <p
              className="text-body"
              style={{ color: 'var(--text-tertiary)', marginBottom: '24px' }}
            >
              {error instanceof Error ? error.message : 'No se pudieron cargar las ventas. Verifica tu conexión e intenta nuevamente.'}
            </p>

            <button
              onClick={() => refetch()}
              className="btn-primary"
              style={{ width: '100%' }}
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-root">
      <div className="dashboard-grid-overlay" />

      {/* App Header - Navigation */}
      <AppHeader />

      {/* Main Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1400px',
          margin: '0 auto',
          padding: 'clamp(16px, 4vw, 32px) clamp(12px, 3vw, 24px)',
          paddingTop: 'clamp(80px, 12vw, 100px)', // Account for fixed header
        }}
      >
        {/* Page Header */}
        <header
          className="animate-fade-up"
          style={{ marginBottom: 'clamp(24px, 5vw, 40px)' }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'row',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: 'clamp(16px, 3vw, 24px)',
            }}
          >
            {/* Title Section */}
            <div style={{ flex: '1 1 auto', minWidth: '200px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'clamp(12px, 2vw, 16px)', marginBottom: '8px' }}>
                {/* Icon */}
                <div
                  className="icon-container"
                  style={{
                    width: 'clamp(44px, 8vw, 56px)',
                    height: 'clamp(44px, 8vw, 56px)',
                    borderRadius: 'clamp(12px, 2vw, 16px)',
                    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 40px -10px rgba(245, 158, 11, 0.5)',
                    flexShrink: 0,
                  }}
                >
                  <HiSparkles style={{ width: 'clamp(22px, 4vw, 28px)', height: 'clamp(22px, 4vw, 28px)', color: '#fff' }} />
                </div>

                <div>
                  <h1
                    className="text-display-lg"
                    style={{
                      margin: 0,
                      background: 'linear-gradient(135deg, var(--text-primary), var(--text-tertiary))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                    }}
                  >
                    Ventas Diarias
                  </h1>
                  <p
                    className="text-body"
                    style={{ color: 'var(--text-tertiary)', margin: 0, display: 'none' }}
                    data-desktop-only
                  >
                    Dashboard de análisis • Mercado Libre
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: 'clamp(8px, 2vw, 12px)', flexShrink: 0 }}>
              <button
                onClick={handleSync}
                disabled={syncProgress.isSync}
                className="btn-secondary btn-compact"
                style={{ opacity: syncProgress.isSync ? 0.5 : 1 }}
              >
                <HiRefresh
                  className="btn-icon"
                  style={{
                    width: '18px',
                    height: '18px',
                    animation: syncProgress.isSync ? 'spin 1s linear infinite' : 'none',
                  }}
                />
                <span>{syncProgress.isSync ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>

              <button
                onClick={handleExport}
                disabled={!data || filteredOrders.length === 0}
                className="btn-primary btn-compact"
                style={{ opacity: !data || filteredOrders.length === 0 ? 0.5 : 1 }}
              >
                <HiDownload className="btn-icon" style={{ width: '18px', height: '18px' }} />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Date Range Selector + Date Mode Toggle */}
          <div style={{ marginTop: 'clamp(16px, 3vw, 24px)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '16px' }}>
            <DateRangeSelector
              dateRange={dateRange}
              onDateRangeChange={handleDateRangeChange}
            />

            {/* Date Mode Toggle: SII vs Mercado Libre */}
            <div
              style={{
                display: 'inline-flex',
                borderRadius: '10px',
                border: '1px solid var(--border-primary)',
                background: 'var(--bg-secondary)',
                padding: '3px',
                gap: '2px',
              }}
            >
              <button
                onClick={() => setDateMode('sii')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: dateMode === 'sii'
                    ? 'linear-gradient(135deg, #f59e0b, #ea580c)'
                    : 'transparent',
                  color: dateMode === 'sii' ? '#fff' : 'var(--text-tertiary)',
                }}
              >
                SII
              </button>
              <button
                onClick={() => setDateMode('mercado_libre')}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 600,
                  transition: 'all 0.2s ease',
                  background: dateMode === 'mercado_libre'
                    ? 'linear-gradient(135deg, #3483fa, #2968c8)'
                    : 'transparent',
                  color: dateMode === 'mercado_libre' ? '#fff' : 'var(--text-tertiary)',
                }}
              >
                Mercado Libre
              </button>
            </div>
          </div>
        </header>

        {/* Filters - Logistic Type */}
        <section
          className="animate-fade-up stagger-1"
          style={{ opacity: 0, display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'flex-start' }}
        >
          <LogisticTypeTabs
            selectedTypes={selectedTypes}
            onSelectionChange={handleSelectionChange}
            counts={tabCounts}
          />
        </section>

        {/* Stats Section - Now shows filtered data */}
        <section
          className="animate-fade-up stagger-2"
          style={{ opacity: 0 }}
        >
          {data ? (
            <DailySalesStats
              summary={filteredSummary}
              byLogisticType={filteredByLogisticType}
              cancelledAmount={cancelledAmount}
              cancelledCount={cancelledCount}
              mediationAmount={mediationAmount}
              mediationCount={mediationCount}
              refundedAmount={refundedAmount}
              refundedCount={refundedCount}
              totalInactiveAmount={totalInactiveAmount}
              shippingNet={shippingCalculation.shippingNet}
              shippingIncome={shippingCalculation.shippingIncome}
              flexShippingCost={shippingCalculation.flexShippingCost}
              shippingBonus={shippingCalculation.shippingBonus}
            />
          ) : (
            <StatsSkeleton />
          )}
        </section>

        {/* Sales Table */}
        <section
          className="animate-fade-up stagger-3"
          style={{ opacity: 0 }}
        >
          <SalesTable
            orders={filteredOrders}
            packs={filteredPacks}
            onViewOrder={handleViewOrder}
            pagination={adjustedPagination}
            onPageChange={handlePageChange}
            isLoading={isFetching}
          />
        </section>

        {/* Results Summary - Only show if no pagination (pagination has its own info) */}
        {data && data.summary.total_orders > 0 && !data.pagination && (
          <div
            className="animate-fade-up stagger-4"
            style={{
              opacity: 0,
              marginTop: '32px',
              textAlign: 'center',
            }}
          >
            <p className="text-body" style={{ color: 'var(--text-tertiary)' }}>
              Mostrando{' '}
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                {filteredOrders.length}
              </span>{' '}
              de{' '}
              <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>
                {data.summary.total_orders}
              </span>{' '}
              órdenes •{' '}
              <span
                style={{
                  color: 'var(--accent-primary)',
                  fontWeight: 600,
                  textTransform: 'capitalize',
                }}
              >
                {formatDateRangeDisplay(dateRange)}
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Order Detail Modal - Lazy loaded with Suspense */}
      <Suspense fallback={null}>
        {selectedOrder && (
          <OrderDetailModal
            order={selectedOrder}
            isOpen={!!selectedOrder}
            onClose={handleCloseModal}
          />
        )}
      </Suspense>

      {/* Sync Progress Modal */}
      {(syncProgress.isSync || syncProgress.phase !== 'idle') && (
        <SyncProgressModal
          progress={syncProgress}
          onCancel={cancelSync}
          onClose={handleSyncModalClose}
        />
      )}

      {/* Keyframe for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default memo(DailySalesPage);
