import { FC, useState, useMemo, useCallback, memo, Suspense, lazy, useEffect } from 'react';
import { HiRefresh, HiDownload, HiSparkles } from 'react-icons/hi';
import { useDailySales, useRefreshDailySales } from '../hooks/useDailySales';
import { useAuthStore } from '../store/authStore';
import { useThemeStore, useApplyTheme } from '../store/themeStore';
import AppHeader from '../components/layout/AppHeader';
import DateSelector from '../components/sales/DateSelector';
import DailySalesStats from '../components/sales/DailySalesStats';
import LogisticTypeTabs from '../components/sales/LogisticTypeTabs';
import SalesTable from '../components/sales/SalesTable';
import type { OrderSummary, LogisticType, DailySalesSummary, LogisticTypeSummary } from '../types/sales.types';
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

// Get initial date (lazy initialization)
const getInitialDate = (): string => new Date().toISOString().split('T')[0];

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
  total_fees: 0,
  net_profit: 0,
  average_order_value: 0,
  average_profit_margin: 0,
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
  total_fees: 0,
  net_profit: 0,
  average_order_value: 0,
  average_profit_margin: 0,
};

const DailySalesPage: FC = () => {
  // Apply theme to document
  useApplyTheme();

  // State with lazy initialization
  const [selectedDate, setSelectedDate] = useState(getInitialDate);
  const [selectedTypes, setSelectedTypes] = useState<Set<LogisticType>>(getInitialSelection);
  const [selectedOrder, setSelectedOrder] = useState<OrderSummary | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Auth - Get seller ID from session
  const user = useAuthStore((state) => state.user);
  const sellerId = user?.userId ? parseInt(user.userId) : 0;

  // Data fetching
  const { data, isLoading, error, refetch } = useDailySales(selectedDate, sellerId);
  const { refresh } = useRefreshDailySales();

  // Memoized filtered orders - based on selected types
  const filteredOrders = useMemo(() => {
    if (!data) return [];

    const orders: OrderSummary[] = [];

    if (selectedTypes.has('fulfillment')) {
      orders.push(...data.orders.fulfillment);
    }
    if (selectedTypes.has('cross_docking')) {
      orders.push(...data.orders.cross_docking);
    }
    if (selectedTypes.has('other')) {
      orders.push(...data.orders.other);
    }

    return orders.sort((a, b) =>
      new Date(b.date_created || b.date_approved).getTime() -
      new Date(a.date_created || a.date_approved).getTime()
    );
  }, [data, selectedTypes]);

  // Memoized filtered summary - recalculates totals based on selected types
  const filteredSummary = useMemo((): DailySalesSummary => {
    if (!data) return emptySummary;

    // If all selected, return original summary
    if (selectedTypes.size === 3) {
      return data.summary;
    }

    // Calculate filtered summary from selected types
    const selectedData: LogisticTypeSummary[] = [];
    if (selectedTypes.has('fulfillment')) {
      selectedData.push(data.by_logistic_type.fulfillment);
    }
    if (selectedTypes.has('cross_docking')) {
      selectedData.push(data.by_logistic_type.cross_docking);
    }
    if (selectedTypes.has('other')) {
      selectedData.push(data.by_logistic_type.other);
    }

    const total_orders = selectedData.reduce((sum, d) => sum + d.total_orders, 0);
    const total_items = selectedData.reduce((sum, d) => sum + d.total_items, 0);
    const gross_amount = selectedData.reduce((sum, d) => sum + d.gross_amount, 0);
    const shipping_cost = selectedData.reduce((sum, d) => sum + d.shipping_cost, 0);
    const marketplace_fee = selectedData.reduce((sum, d) => sum + d.marketplace_fee, 0);
    const iva_amount = selectedData.reduce((sum, d) => sum + d.iva_amount, 0);
    const flex_shipping_cost = selectedData.reduce((sum, d) => sum + (d.flex_shipping_cost || 0), 0);
    const total_fees = selectedData.reduce((sum, d) => sum + d.total_fees, 0);
    const net_profit = selectedData.reduce((sum, d) => sum + d.net_profit, 0);

    return {
      total_orders,
      total_items,
      gross_amount,
      shipping_cost,
      marketplace_fee,
      iva_amount,
      flex_shipping_cost,
      total_fees,
      net_profit,
      average_order_value: total_orders > 0 ? gross_amount / total_orders : 0,
      average_profit_margin: gross_amount > 0 ? (net_profit / gross_amount) * 100 : 0,
    };
  }, [data, selectedTypes]);

  // Memoized filtered byLogisticType - only show selected types
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

  // Memoized counts for tabs (always show real counts, not filtered)
  const tabCounts = useMemo(() => {
    if (!data) return { fulfillment: 0, cross_docking: 0, other: 0 };
    return {
      fulfillment: data.by_logistic_type.fulfillment.total_orders,
      cross_docking: data.by_logistic_type.cross_docking.total_orders,
      other: data.by_logistic_type.other.total_orders,
    };
  }, [data]);

  // Stable callback handlers
  const handleDateChange = useCallback((date: string) => {
    setSelectedDate(date);
    setSelectedTypes(getInitialSelection()); // Reset to all selected on date change
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await refresh(selectedDate, sellerId);
    } finally {
      setIsRefreshing(false);
    }
  }, [selectedDate, sellerId, refresh]);

  const handleViewOrder = useCallback((order: OrderSummary) => {
    setSelectedOrder(order);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedOrder(null);
  }, []);

  const handleSelectionChange = useCallback((types: Set<LogisticType>) => {
    setSelectedTypes(types);
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
                Obteniendo ventas del {formatDisplayDate(selectedDate)}
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
          padding: '32px 24px',
          paddingTop: '100px', // Account for fixed header
        }}
      >
        {/* Page Header */}
        <header
          className="animate-fade-up"
          style={{ marginBottom: '40px' }}
        >
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            {/* Title Section */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                {/* Icon */}
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 40px -10px rgba(245, 158, 11, 0.5)',
                  }}
                >
                  <HiSparkles style={{ width: '28px', height: '28px', color: '#fff' }} />
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
                    style={{ color: 'var(--text-tertiary)', margin: 0 }}
                  >
                    Dashboard de análisis • Mercado Libre
                  </p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="btn-secondary"
                style={{ opacity: isRefreshing ? 0.5 : 1 }}
              >
                <HiRefresh
                  style={{
                    width: '18px',
                    height: '18px',
                    animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
                  }}
                />
                <span>{isRefreshing ? 'Sincronizando...' : 'Sincronizar'}</span>
              </button>

              <button className="btn-primary">
                <HiDownload style={{ width: '18px', height: '18px' }} />
                <span>Exportar</span>
              </button>
            </div>
          </div>

          {/* Date Selector */}
          <div style={{ marginTop: '24px' }}>
            <DateSelector
              selectedDate={selectedDate}
              onDateChange={handleDateChange}
            />
          </div>
        </header>

        {/* Tabs - Above stats now */}
        <section
          className="animate-fade-up stagger-1"
          style={{ opacity: 0 }}
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
            onViewOrder={handleViewOrder}
          />
        </section>

        {/* Results Summary */}
        {data && data.summary.total_orders > 0 && (
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
                {formatDisplayDate(selectedDate)}
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
