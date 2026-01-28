import { FC, memo, useCallback, useMemo, useState } from 'react';
import { HiEye, HiExternalLink, HiChevronLeft, HiChevronRight, HiChevronDown, HiChevronUp } from 'react-icons/hi';
import type { OrderSummary, PaginationMeta, PackGroup } from '../../types/sales.types';

interface Props {
  orders: OrderSummary[];
  packs?: PackGroup[]; // Orders grouped by pack
  onViewOrder: (order: OrderSummary) => void;
  pagination?: PaginationMeta;
  onPageChange?: (page: number) => void;
  isLoading?: boolean;
}

// Config objects - outside component
const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  paid: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', label: 'Pagado' },
  approved: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', label: 'Aprobado' },
  pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', label: 'Pendiente' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', label: 'Cancelado' },
  refunded: { bg: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', label: 'Reembolsado' },
  in_mediation: { bg: 'rgba(251, 146, 60, 0.1)', color: '#fb923c', label: 'En Mediación' },
};

const FLEX_CONFIG = { bg: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', icon: '⚡', label: 'Flex' };
const CENTRO_ENVIO_CONFIG = { bg: 'rgba(113, 113, 122, 0.1)', color: '#a1a1aa', icon: '🏢', label: 'Centro de Envío' };

const LOGISTIC_CONFIG: Record<string, { bg: string; color: string; icon: string; label: string }> = {
  fulfillment: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', icon: '📦', label: 'Full' },
  cross_docking: FLEX_CONFIG,
  self_service: FLEX_CONFIG, // self_service = Flex (seller uses own courier, buyer pays shipping)
  cross_docking_cost: FLEX_CONFIG, // Free shipping >$20k, seller pays shipping (cost, not income)
  self_service_cost: FLEX_CONFIG, // Free shipping >$20k, seller pays shipping (cost, not income)
  xd_drop_off: CENTRO_ENVIO_CONFIG, // ML uses this for drop-off at collection point (ML charges)
  other: CENTRO_ENVIO_CONFIG,
};

const DEFAULT_STATUS = { bg: 'rgba(113, 113, 122, 0.1)', color: '#a1a1aa', label: 'Desconocido' };
const DEFAULT_LOGISTIC = LOGISTIC_CONFIG.other;

// Utility functions - outside component
const formatTime = (dateStr: string): string => {
  const date = new Date(dateStr);
  const day = date.getDate();
  const month = date.toLocaleString('es-CL', { month: 'short' });
  const time = date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  return `${day} ${month} ${time}`;
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0,
  }).format(amount);
};

// Memoized Table Row Component
interface TableRowProps {
  order: OrderSummary;
  onView: () => void;
}

const TableRow: FC<TableRowProps> = memo(({ order, onView }) => {
  const logisticConfig = LOGISTIC_CONFIG[order.logistic_type] || DEFAULT_LOGISTIC;
  // Use cancellation_type from backend for accurate status display
  const effectiveStatus = order.cancellation_type || order.status;
  const statusConfig = STATUS_CONFIG[effectiveStatus] || DEFAULT_STATUS;
  const dateStr = order.date_created || order.date_approved;

  return (
    <tr
      style={{
        backgroundColor: 'transparent',
        borderBottom: '1px solid var(--border-subtle)',
        transition: 'background-color 150ms',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--surface-hover)')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
    >
      {/* Order ID */}
      <td style={{ padding: '16px 20px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'var(--text-primary)',
            }}
          >
            #{order.id}
          </span>
          {order.pack_id && (
            <span
              style={{
                fontSize: '0.6875rem',
                color: 'var(--text-tertiary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <span
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#8b5cf6',
                }}
              />
              Pack {order.pack_id}
            </span>
          )}
        </div>
      </td>

      {/* Time */}
      <td style={{ padding: '16px' }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 500,
            color: 'var(--text-secondary)',
          }}
        >
          {formatTime(dateStr)}
        </span>
      </td>

      {/* Logistic Type */}
      <td style={{ padding: '16px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            fontWeight: 600,
            fontFamily: "'Outfit', sans-serif",
            backgroundColor: logisticConfig.bg,
            color: logisticConfig.color,
            border: `1px solid ${logisticConfig.color}25`,
          }}
        >
          <span style={{ fontSize: '0.875rem' }}>{logisticConfig.icon}</span>
          <span>{logisticConfig.label}</span>
        </span>
      </td>

      {/* Status */}
      <td style={{ padding: '16px' }}>
        <span
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '5px 10px',
            borderRadius: '8px',
            fontSize: '0.6875rem',
            fontWeight: 700,
            fontFamily: "'Outfit', sans-serif",
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            backgroundColor: statusConfig.bg,
            color: statusConfig.color,
            border: `1px solid ${statusConfig.color}25`,
          }}
        >
          {statusConfig.label}
        </span>
      </td>

      {/* Items */}
      <td style={{ padding: '16px', maxWidth: '220px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Product Thumbnail */}
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              backgroundColor: 'var(--surface-elevated)',
              border: '1px solid var(--border-subtle)',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {order.items[0]?.thumbnail ? (
              <img
                src={order.items[0].thumbnail}
                alt={order.items[0].title}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
                loading="lazy"
              />
            ) : (
              <span style={{ fontSize: '20px' }}>📦</span>
            )}
          </div>
          {/* Product Info */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)',
              }}
            >
              {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
            </span>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {order.items[0]?.title || 'Sin descripción'}
            </span>
          </div>
        </div>
      </td>

      {/* Gross Amount */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontWeight: 600,
            fontSize: '0.9375rem',
            color: 'var(--text-primary)',
          }}
        >
          {formatCurrency(order.gross_amount)}
        </span>
      </td>

      {/* Shipping Cost - For Flex: uses Fazt cost, For Full/Centro: uses ML shipping_cost */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        {(() => {
          // If order is cancelled, shipping cost is 0
          if (order.is_cancelled || order.status === 'cancelled') {
            return (
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                }}
              >
                {formatCurrency(0)}
              </span>
            );
          }

          // Determine if it's a Flex order
          const isFlexOrder = ['cross_docking', 'self_service', 'cross_docking_cost', 'self_service_cost'].includes(order.logistic_type);
          // Flex orders with INCOME (buyer pays shipping to seller)
          const isFlexWithIncome = order.logistic_type === 'cross_docking' || order.logistic_type === 'self_service';

          // For Flex orders: use Fazt cost (flex_shipping_cost)
          // For Full/Centro: use ML shipping_cost
          const shippingCost = isFlexOrder ? (order.flex_shipping_cost || 0) : order.shipping_cost;

          if (shippingCost > 0) {
            // For Flex with income (buyer pays): show as positive income from buyer
            // but also show Fazt cost as negative (net shipping result)
            if (isFlexWithIncome && order.shipping_cost > 0) {
              // Show Fazt cost as expense (what we pay to Fazt)
              return (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      color: '#34d399', // Green for income from buyer
                    }}
                  >
                    +{formatCurrency(order.shipping_cost)}
                  </span>
                  {(order.flex_shipping_cost || 0) > 0 && (
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: '#8b5cf6', // Purple for Fazt cost
                      }}
                    >
                      -{formatCurrency(order.flex_shipping_cost)}
                    </span>
                  )}
                </div>
              );
            }
            // For Flex with cost or Full/Centro: just show as negative cost
            return (
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: isFlexOrder ? '#8b5cf6' : '#38bdf8', // Purple for Fazt, Blue for ML
                }}
              >
                -{formatCurrency(shippingCost)}
              </span>
            );
          }
          return (
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
              }}
            >
              {formatCurrency(0)}
            </span>
          );
        })()}
      </td>

      {/* Marketplace Fee - $0 if cancelled */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 500,
            color: (order.is_cancelled || order.status === 'cancelled') ? 'var(--text-tertiary)' : '#fb7185',
          }}
        >
          {(order.is_cancelled || order.status === 'cancelled')
            ? formatCurrency(0)
            : order.marketplace_fee > 0 ? `-${formatCurrency(order.marketplace_fee)}` : formatCurrency(0)}
        </span>
      </td>

      {/* IVA - $0 if cancelled */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 500,
            color: (order.is_cancelled || order.status === 'cancelled') ? 'var(--text-tertiary)' : '#fb923c',
          }}
        >
          {(order.is_cancelled || order.status === 'cancelled')
            ? formatCurrency(0)
            : (order.iva_amount || 0) > 0 ? `-${formatCurrency(order.iva_amount)}` : formatCurrency(0)}
        </span>
      </td>

      {/* Shipping Bonus - $0 if cancelled */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 500,
            color: (order.is_cancelled || order.status === 'cancelled')
              ? 'var(--text-tertiary)'
              : (order.shipping_bonus || 0) > 0 ? '#34d399' : 'var(--text-tertiary)',
          }}
        >
          {(order.is_cancelled || order.status === 'cancelled')
            ? formatCurrency(0)
            : (order.shipping_bonus || 0) > 0 ? `+${formatCurrency(order.shipping_bonus)}` : formatCurrency(0)}
        </span>
      </td>


      {/* Net Profit - $0 if cancelled */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: (order.is_cancelled || order.status === 'cancelled')
                ? 'var(--text-tertiary)'
                : order.net_profit >= 0 ? 'var(--status-success)' : 'var(--status-error)',
            }}
          >
            {(order.is_cancelled || order.status === 'cancelled') ? formatCurrency(0) : formatCurrency(order.net_profit)}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6875rem',
              color: 'var(--text-tertiary)',
            }}
          >
            {(order.is_cancelled || order.status === 'cancelled') ? '0.0%' : `${order.profit_margin.toFixed(1)}%`}
          </span>
        </div>
      </td>

      {/* Actions */}
      <td style={{ padding: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
          <button
            onClick={onView}
            title="Ver detalle"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              backgroundColor: 'var(--surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
              e.currentTarget.style.borderColor = 'var(--accent-primary)';
              e.currentTarget.style.color = '#0a0a0b';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <HiEye style={{ width: '16px', height: '16px' }} />
          </button>
          <a
            href={`https://www.mercadolibre.cl/ventas/${order.pack_id || order.id}/detalle`}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver en Mercado Libre"
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              backgroundColor: 'var(--surface-elevated)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-tertiary)',
              textDecoration: 'none',
              transition: 'all 150ms',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#0ea5e9';
              e.currentTarget.style.borderColor = '#0ea5e9';
              e.currentTarget.style.color = '#ffffff';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.color = 'var(--text-tertiary)';
            }}
          >
            <HiExternalLink style={{ width: '16px', height: '16px' }} />
          </a>
        </div>
      </td>
    </tr>
  );
});

// Pack Table Row Component - Shows pack-level data with expandable orders
interface PackTableRowProps {
  pack: PackGroup;
  onViewOrder: (order: OrderSummary) => void;
}

const PackTableRow: FC<PackTableRowProps> = memo(({ pack, onViewOrder }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const logisticConfig = LOGISTIC_CONFIG[pack.logistic_type] || DEFAULT_LOGISTIC;
  const effectiveStatus = pack.cancellation_type || pack.status;
  const statusConfig = STATUS_CONFIG[effectiveStatus] || DEFAULT_STATUS;
  const dateStr = pack.date_approved;

  // Determine display values based on pack data
  const isMultiOrderPack = pack.orders.length > 1;
  const displayId = pack.pack_id || pack.orders[0]?.id;
  const totalItems = pack.all_items.reduce((sum, item) => sum + item.quantity, 0);

  // Use pack-level shipping values from backend (already de-duplicated for multi-order packs)
  const isFlexOrder = ['cross_docking', 'self_service', 'cross_docking_cost', 'self_service_cost'].includes(pack.logistic_type);
  const isFlexWithIncome = pack.logistic_type === 'cross_docking' || pack.logistic_type === 'self_service';

  // Backend provides correct pack-level values (NOT summed for multi-order packs)
  const packFlexShippingCost = pack.pack_flex_shipping_cost || 0;
  const packShippingIncome = isFlexWithIncome ? pack.pack_shipping_cost : 0;
  const displayShippingCost = isFlexOrder ? packFlexShippingCost : pack.pack_shipping_cost;

  return (
    <>
      <tr
        style={{
          backgroundColor: isMultiOrderPack ? 'rgba(139, 92, 246, 0.03)' : 'transparent',
          borderBottom: '1px solid var(--border-subtle)',
          transition: 'background-color 150ms',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = isMultiOrderPack ? 'rgba(139, 92, 246, 0.08)' : 'var(--surface-hover)')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = isMultiOrderPack ? 'rgba(139, 92, 246, 0.03)' : 'transparent')}
      >
        {/* Order/Pack ID */}
        <td style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isMultiOrderPack && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '4px',
                    backgroundColor: 'rgba(139, 92, 246, 0.2)',
                    border: 'none',
                    color: '#a78bfa',
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {isExpanded ? <HiChevronUp size={14} /> : <HiChevronDown size={14} />}
                </button>
              )}
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                }}
              >
                #{displayId}
              </span>
            </div>
            {isMultiOrderPack && (
              <span
                style={{
                  fontSize: '0.6875rem',
                  color: '#a78bfa',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginLeft: isMultiOrderPack ? '28px' : '0',
                }}
              >
                <span
                  style={{
                    width: '5px',
                    height: '5px',
                    borderRadius: '50%',
                    backgroundColor: '#8b5cf6',
                  }}
                />
                Pack ({pack.orders.length} órdenes)
              </span>
            )}
          </div>
        </td>

        {/* Time */}
        <td style={{ padding: '16px' }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'var(--text-secondary)',
            }}
          >
            {formatTime(dateStr)}
          </span>
        </td>

        {/* Logistic Type */}
        <td style={{ padding: '16px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.8125rem',
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              backgroundColor: logisticConfig.bg,
              color: logisticConfig.color,
              border: `1px solid ${logisticConfig.color}25`,
            }}
          >
            <span style={{ fontSize: '0.875rem' }}>{logisticConfig.icon}</span>
            <span>{logisticConfig.label}</span>
          </span>
        </td>

        {/* Status */}
        <td style={{ padding: '16px' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              fontFamily: "'Outfit', sans-serif",
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
              border: `1px solid ${statusConfig.color}25`,
            }}
          >
            {statusConfig.label}
          </span>
        </td>

        {/* Items */}
        <td style={{ padding: '16px', maxWidth: '220px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* Product Thumbnail */}
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                overflow: 'hidden',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {pack.all_items[0]?.thumbnail ? (
                <img
                  src={pack.all_items[0].thumbnail}
                  alt={pack.all_items[0].title}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                  loading="lazy"
                />
              ) : (
                <span style={{ fontSize: '20px' }}>📦</span>
              )}
            </div>
            {/* Product Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0 }}>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)',
                }}
              >
                {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
              </span>
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {pack.all_items[0]?.title || 'Sin descripción'}
              </span>
            </div>
          </div>
        </td>

        {/* Gross Amount - Pack total */}
        <td style={{ padding: '16px', textAlign: 'right' }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 600,
              fontSize: '0.9375rem',
              color: 'var(--text-primary)',
            }}
          >
            {formatCurrency(pack.pack_total_amount)}
          </span>
        </td>

        {/* Shipping Cost - Pack level */}
        <td style={{ padding: '16px', textAlign: 'right' }}>
          {(() => {
            if (pack.is_cancelled || pack.status === 'cancelled') {
              return (
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-tertiary)',
                  }}
                >
                  {formatCurrency(0)}
                </span>
              );
            }

            if (displayShippingCost > 0 || packShippingIncome > 0) {
              if (isFlexWithIncome && packShippingIncome > 0) {
                return (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#34d399',
                      }}
                    >
                      +{formatCurrency(packShippingIncome)}
                    </span>
                    {packFlexShippingCost > 0 && (
                      <span
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: '0.75rem',
                          fontWeight: 500,
                          color: '#8b5cf6',
                        }}
                      >
                        -{formatCurrency(packFlexShippingCost)}
                      </span>
                    )}
                  </div>
                );
              }
              return (
                <span
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isFlexOrder ? '#8b5cf6' : '#38bdf8',
                  }}
                >
                  -{formatCurrency(displayShippingCost)}
                </span>
              );
            }
            return (
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-tertiary)',
                }}
              >
                {formatCurrency(0)}
              </span>
            );
          })()}
        </td>

        {/* Marketplace Fee - Pack total */}
        <td style={{ padding: '16px', textAlign: 'right' }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 500,
              color: (pack.is_cancelled || pack.status === 'cancelled') ? 'var(--text-tertiary)' : '#fb7185',
            }}
          >
            {(pack.is_cancelled || pack.status === 'cancelled')
              ? formatCurrency(0)
              : pack.pack_marketplace_fee > 0 ? `-${formatCurrency(pack.pack_marketplace_fee)}` : formatCurrency(0)}
          </span>
        </td>

        {/* IVA - Pack total */}
        <td style={{ padding: '16px', textAlign: 'right' }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 500,
              color: (pack.is_cancelled || pack.status === 'cancelled') ? 'var(--text-tertiary)' : '#fb923c',
            }}
          >
            {(pack.is_cancelled || pack.status === 'cancelled')
              ? formatCurrency(0)
              : pack.pack_iva_amount > 0 ? `-${formatCurrency(pack.pack_iva_amount)}` : formatCurrency(0)}
          </span>
        </td>

        {/* Shipping Bonus - Pack total */}
        <td style={{ padding: '16px', textAlign: 'right' }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 500,
              color: (pack.is_cancelled || pack.status === 'cancelled')
                ? 'var(--text-tertiary)'
                : pack.pack_shipping_bonus > 0 ? '#34d399' : 'var(--text-tertiary)',
            }}
          >
            {(pack.is_cancelled || pack.status === 'cancelled')
              ? formatCurrency(0)
              : pack.pack_shipping_bonus > 0 ? `+${formatCurrency(pack.pack_shipping_bonus)}` : formatCurrency(0)}
          </span>
        </td>

        {/* Net Profit - Pack total */}
        <td style={{ padding: '16px', textAlign: 'right' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontWeight: 700,
                fontSize: '0.9375rem',
                color: (pack.is_cancelled || pack.status === 'cancelled')
                  ? 'var(--text-tertiary)'
                  : pack.pack_net_profit >= 0 ? 'var(--status-success)' : 'var(--status-error)',
              }}
            >
              {(pack.is_cancelled || pack.status === 'cancelled') ? formatCurrency(0) : formatCurrency(pack.pack_net_profit)}
            </span>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.6875rem',
                color: 'var(--text-tertiary)',
              }}
            >
              {(pack.is_cancelled || pack.status === 'cancelled') ? '0.0%' : `${pack.pack_profit_margin.toFixed(1)}%`}
            </span>
          </div>
        </td>

        {/* Actions */}
        <td style={{ padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <button
              onClick={() => onViewOrder(pack.orders[0])}
              title="Ver detalle"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--accent-primary)';
                e.currentTarget.style.borderColor = 'var(--accent-primary)';
                e.currentTarget.style.color = '#0a0a0b';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <HiEye style={{ width: '16px', height: '16px' }} />
            </button>
            <a
              href={`https://www.mercadolibre.cl/ventas/${pack.pack_id || pack.orders[0]?.id}/detalle`}
              target="_blank"
              rel="noopener noreferrer"
              title="Ver en Mercado Libre"
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-tertiary)',
                textDecoration: 'none',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#0ea5e9';
                e.currentTarget.style.borderColor = '#0ea5e9';
                e.currentTarget.style.color = '#ffffff';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                e.currentTarget.style.borderColor = 'var(--border-subtle)';
                e.currentTarget.style.color = 'var(--text-tertiary)';
              }}
            >
              <HiExternalLink style={{ width: '16px', height: '16px' }} />
            </a>
          </div>
        </td>
      </tr>

      {/* Expanded rows for multi-order packs */}
      {isExpanded && isMultiOrderPack && pack.orders.map((order, idx) => (
        <tr
          key={order.id}
          style={{
            backgroundColor: 'rgba(139, 92, 246, 0.05)',
            borderBottom: idx === pack.orders.length - 1 ? '2px solid rgba(139, 92, 246, 0.3)' : '1px solid rgba(139, 92, 246, 0.1)',
          }}
        >
          {/* Order ID (indented) */}
          <td style={{ padding: '12px 20px 12px 48px' }}>
            <span
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontWeight: 500,
                fontSize: '0.8125rem',
                color: 'var(--text-secondary)',
              }}
            >
              └ #{order.id}
            </span>
          </td>

          {/* Empty cells for alignment */}
          <td colSpan={3}></td>

          {/* Items for this order */}
          <td style={{ padding: '12px 16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {order.items.map((item, itemIdx) => (
                <div key={itemIdx} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                      overflow: 'hidden',
                      flexShrink: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {item.thumbnail ? (
                      <img src={item.thumbnail} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} loading="lazy" />
                    ) : (
                      <span style={{ fontSize: '12px' }}>📦</span>
                    )}
                  </div>
                  <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.75rem', color: 'var(--text-tertiary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                    {item.title}
                  </span>
                </div>
              ))}
            </div>
          </td>

          {/* Gross for this order */}
          <td style={{ padding: '12px 16px', textAlign: 'right' }}>
            <span style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {formatCurrency(order.gross_amount)}
            </span>
          </td>

          {/* Empty cells for alignment */}
          <td colSpan={5}></td>

          {/* View button */}
          <td style={{ padding: '12px 16px' }}>
            <button
              onClick={() => onViewOrder(order)}
              title="Ver detalle"
              style={{
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                backgroundColor: 'var(--surface-elevated)',
                border: '1px solid var(--border-subtle)',
                color: 'var(--text-tertiary)',
                cursor: 'pointer',
                margin: '0 auto',
              }}
            >
              <HiEye style={{ width: '14px', height: '14px' }} />
            </button>
          </td>
        </tr>
      ))}
    </>
  );
});

// Mobile Order Card Component
interface MobileOrderCardProps {
  order: OrderSummary;
  onView: () => void;
}

const MobileOrderCard: FC<MobileOrderCardProps> = memo(({ order, onView }) => {
  const logisticConfig = LOGISTIC_CONFIG[order.logistic_type] || DEFAULT_LOGISTIC;
  const effectiveStatus = order.is_cancelled && order.status === 'paid' ? 'in_mediation' : order.status;
  const statusConfig = STATUS_CONFIG[effectiveStatus] || DEFAULT_STATUS;
  const dateStr = order.date_created || order.date_approved;

  return (
    <div className="mobile-order-card">
      {/* Header: Order ID, Time, Badges */}
      <div className="mobile-order-card-header">
        <div>
          <div className="mobile-order-card-id">#{order.id}</div>
          <div className="mobile-order-card-time">{formatTime(dateStr)}</div>
        </div>
        <div className="mobile-order-card-badges">
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              backgroundColor: logisticConfig.bg,
              color: logisticConfig.color,
              border: `1px solid ${logisticConfig.color}25`,
            }}
          >
            {logisticConfig.icon} {logisticConfig.label}
          </span>
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
              border: `1px solid ${statusConfig.color}25`,
            }}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="mobile-order-card-product">
        <div className="mobile-order-card-thumb">
          {order.items[0]?.thumbnail ? (
            <img src={order.items[0].thumbnail} alt={order.items[0].title} loading="lazy" />
          ) : (
            <span style={{ fontSize: '20px' }}>📦</span>
          )}
        </div>
        <div className="mobile-order-card-product-info">
          <div className="mobile-order-card-product-title">{order.items[0]?.title || 'Sin descripción'}</div>
          <div className="mobile-order-card-product-qty">
            {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mobile-order-card-financials">
        <div className="mobile-order-card-financial-item">
          <div className="mobile-order-card-financial-label">Venta</div>
          <div className="mobile-order-card-financial-value" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(order.gross_amount)}
          </div>
        </div>
        <div className="mobile-order-card-financial-item">
          <div className="mobile-order-card-financial-label">Comisión</div>
          <div className="mobile-order-card-financial-value" style={{
            color: (order.is_cancelled || order.status === 'cancelled') ? 'var(--text-tertiary)' : '#fb7185'
          }}>
            {(order.is_cancelled || order.status === 'cancelled') ? formatCurrency(0) : `-${formatCurrency(order.marketplace_fee)}`}
          </div>
        </div>
        <div className="mobile-order-card-financial-item">
          <div className="mobile-order-card-financial-label">IVA</div>
          <div className="mobile-order-card-financial-value" style={{
            color: (order.is_cancelled || order.status === 'cancelled') ? 'var(--text-tertiary)' : '#fb923c'
          }}>
            {(order.is_cancelled || order.status === 'cancelled') ? formatCurrency(0) : `-${formatCurrency(order.iva_amount || 0)}`}
          </div>
        </div>
        {/* Shipping cost - For Flex: Fazt cost, For Full: ML shipping */}
        {(() => {
          // If order is cancelled, don't show shipping cost
          if (order.is_cancelled || order.status === 'cancelled') {
            return null;
          }

          const isFlexOrder = ['cross_docking', 'self_service', 'cross_docking_cost', 'self_service_cost'].includes(order.logistic_type);
          const isFlexWithIncome = order.logistic_type === 'cross_docking' || order.logistic_type === 'self_service';
          const shippingCost = isFlexOrder ? (order.flex_shipping_cost || 0) : order.shipping_cost;

          if (isFlexWithIncome && order.shipping_cost > 0) {
            return (
              <>
                <div className="mobile-order-card-financial-item">
                  <div className="mobile-order-card-financial-label">Envío (ingreso)</div>
                  <div className="mobile-order-card-financial-value" style={{ color: '#34d399' }}>
                    +{formatCurrency(order.shipping_cost)}
                  </div>
                </div>
                {(order.flex_shipping_cost || 0) > 0 && (
                  <div className="mobile-order-card-financial-item">
                    <div className="mobile-order-card-financial-label">Fazt</div>
                    <div className="mobile-order-card-financial-value" style={{ color: '#8b5cf6' }}>
                      -{formatCurrency(order.flex_shipping_cost)}
                    </div>
                  </div>
                )}
              </>
            );
          } else if (shippingCost > 0) {
            return (
              <div className="mobile-order-card-financial-item">
                <div className="mobile-order-card-financial-label">{isFlexOrder ? 'Fazt' : 'Envío'}</div>
                <div className="mobile-order-card-financial-value" style={{ color: isFlexOrder ? '#8b5cf6' : '#38bdf8' }}>
                  -{formatCurrency(shippingCost)}
                </div>
              </div>
            );
          }
          return null;
        })()}
      </div>

      {/* Footer: Profit and Actions */}
      <div className="mobile-order-card-footer">
        <div className="mobile-order-card-profit">
          <div
            className="mobile-order-card-profit-value"
            style={{
              color: (order.is_cancelled || order.status === 'cancelled')
                ? 'var(--text-tertiary)'
                : order.net_profit >= 0 ? 'var(--status-success)' : 'var(--status-error)'
            }}
          >
            {(order.is_cancelled || order.status === 'cancelled') ? formatCurrency(0) : formatCurrency(order.net_profit)}
          </div>
          <div className="mobile-order-card-profit-margin">
            {(order.is_cancelled || order.status === 'cancelled') ? '0.0% margen' : `${order.profit_margin.toFixed(1)}% margen`}
          </div>
        </div>
        <div className="mobile-order-card-actions">
          <button className="mobile-order-card-action" onClick={onView} title="Ver detalle">
            <HiEye style={{ width: '18px', height: '18px' }} />
          </button>
          <a
            href={`https://www.mercadolibre.cl/ventas/${order.pack_id || order.id}/detalle`}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-order-card-action"
            title="Ver en ML"
          >
            <HiExternalLink style={{ width: '18px', height: '18px' }} />
          </a>
        </div>
      </div>
    </div>
  );
});

// Mobile Pack Card Component
interface MobilePackCardProps {
  pack: PackGroup;
  onViewOrder: (order: OrderSummary) => void;
}

const MobilePackCard: FC<MobilePackCardProps> = memo(({ pack, onViewOrder }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const logisticConfig = LOGISTIC_CONFIG[pack.logistic_type] || DEFAULT_LOGISTIC;
  const effectiveStatus = pack.cancellation_type || pack.status;
  const statusConfig = STATUS_CONFIG[effectiveStatus] || DEFAULT_STATUS;
  const dateStr = pack.date_approved;

  const isMultiOrderPack = pack.orders.length > 1;
  const displayId = pack.pack_id || pack.orders[0]?.id;
  const totalItems = pack.all_items.reduce((sum, item) => sum + item.quantity, 0);

  // Use pack-level shipping values from backend (already de-duplicated for multi-order packs)
  const isFlexOrder = ['cross_docking', 'self_service', 'cross_docking_cost', 'self_service_cost'].includes(pack.logistic_type);
  const isFlexWithIncome = pack.logistic_type === 'cross_docking' || pack.logistic_type === 'self_service';
  const packFlexShippingCost = pack.pack_flex_shipping_cost || 0;
  const packShippingIncome = isFlexWithIncome ? pack.pack_shipping_cost : 0;
  const displayShippingCost = isFlexOrder ? packFlexShippingCost : pack.pack_shipping_cost;

  return (
    <div
      className="mobile-order-card"
      style={{
        borderColor: isMultiOrderPack ? 'rgba(139, 92, 246, 0.3)' : undefined,
        backgroundColor: isMultiOrderPack ? 'rgba(139, 92, 246, 0.03)' : undefined,
      }}
    >
      {/* Header */}
      <div className="mobile-order-card-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {isMultiOrderPack && (
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '6px',
                backgroundColor: 'rgba(139, 92, 246, 0.2)',
                border: 'none',
                color: '#a78bfa',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {isExpanded ? <HiChevronUp size={16} /> : <HiChevronDown size={16} />}
            </button>
          )}
          <div>
            <div className="mobile-order-card-id">#{displayId}</div>
            <div className="mobile-order-card-time">
              {formatTime(dateStr)}
              {isMultiOrderPack && (
                <span style={{ color: '#a78bfa', marginLeft: '8px' }}>
                  ({pack.orders.length} órdenes)
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="mobile-order-card-badges">
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.6875rem',
              fontWeight: 600,
              backgroundColor: logisticConfig.bg,
              color: logisticConfig.color,
              border: `1px solid ${logisticConfig.color}25`,
            }}
          >
            {logisticConfig.icon} {logisticConfig.label}
          </span>
          <span
            style={{
              padding: '4px 8px',
              borderRadius: '6px',
              fontSize: '0.6875rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              backgroundColor: statusConfig.bg,
              color: statusConfig.color,
              border: `1px solid ${statusConfig.color}25`,
            }}
          >
            {statusConfig.label}
          </span>
        </div>
      </div>

      {/* Product Info */}
      <div className="mobile-order-card-product">
        <div className="mobile-order-card-thumb">
          {pack.all_items[0]?.thumbnail ? (
            <img src={pack.all_items[0].thumbnail} alt={pack.all_items[0].title} loading="lazy" />
          ) : (
            <span style={{ fontSize: '20px' }}>📦</span>
          )}
        </div>
        <div className="mobile-order-card-product-info">
          <div className="mobile-order-card-product-title">{pack.all_items[0]?.title || 'Sin descripción'}</div>
          <div className="mobile-order-card-product-qty">
            {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="mobile-order-card-financials">
        <div className="mobile-order-card-financial-item">
          <div className="mobile-order-card-financial-label">Venta</div>
          <div className="mobile-order-card-financial-value" style={{ color: 'var(--text-primary)' }}>
            {formatCurrency(pack.pack_total_amount)}
          </div>
        </div>
        <div className="mobile-order-card-financial-item">
          <div className="mobile-order-card-financial-label">Comisión</div>
          <div className="mobile-order-card-financial-value" style={{
            color: (pack.is_cancelled || pack.status === 'cancelled') ? 'var(--text-tertiary)' : '#fb7185'
          }}>
            {(pack.is_cancelled || pack.status === 'cancelled') ? formatCurrency(0) : `-${formatCurrency(pack.pack_marketplace_fee)}`}
          </div>
        </div>
        <div className="mobile-order-card-financial-item">
          <div className="mobile-order-card-financial-label">IVA</div>
          <div className="mobile-order-card-financial-value" style={{
            color: (pack.is_cancelled || pack.status === 'cancelled') ? 'var(--text-tertiary)' : '#fb923c'
          }}>
            {(pack.is_cancelled || pack.status === 'cancelled') ? formatCurrency(0) : `-${formatCurrency(pack.pack_iva_amount)}`}
          </div>
        </div>
        {/* Shipping cost */}
        {!pack.is_cancelled && pack.status !== 'cancelled' && (displayShippingCost > 0 || packShippingIncome > 0) && (
          <>
            {isFlexWithIncome && packShippingIncome > 0 && (
              <div className="mobile-order-card-financial-item">
                <div className="mobile-order-card-financial-label">Envío (ingreso)</div>
                <div className="mobile-order-card-financial-value" style={{ color: '#34d399' }}>
                  +{formatCurrency(packShippingIncome)}
                </div>
              </div>
            )}
            {packFlexShippingCost > 0 && (
              <div className="mobile-order-card-financial-item">
                <div className="mobile-order-card-financial-label">Fazt</div>
                <div className="mobile-order-card-financial-value" style={{ color: '#8b5cf6' }}>
                  -{formatCurrency(packFlexShippingCost)}
                </div>
              </div>
            )}
            {!isFlexOrder && displayShippingCost > 0 && (
              <div className="mobile-order-card-financial-item">
                <div className="mobile-order-card-financial-label">Envío</div>
                <div className="mobile-order-card-financial-value" style={{ color: '#38bdf8' }}>
                  -{formatCurrency(displayShippingCost)}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Expanded orders */}
      {isExpanded && isMultiOrderPack && (
        <div style={{ padding: '12px 0', borderTop: '1px solid rgba(139, 92, 246, 0.2)', marginTop: '8px' }}>
          {pack.orders.map((order, idx) => (
            <div
              key={order.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 0',
                borderBottom: idx < pack.orders.length - 1 ? '1px solid rgba(139, 92, 246, 0.1)' : 'none',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                  └ #{order.id}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {formatCurrency(order.gross_amount)}
                </span>
              </div>
              <button
                onClick={() => onViewOrder(order)}
                style={{
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '6px',
                  backgroundColor: 'var(--surface-elevated)',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-tertiary)',
                  cursor: 'pointer',
                }}
              >
                <HiEye style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mobile-order-card-footer">
        <div className="mobile-order-card-profit">
          <div
            className="mobile-order-card-profit-value"
            style={{
              color: (pack.is_cancelled || pack.status === 'cancelled')
                ? 'var(--text-tertiary)'
                : pack.pack_net_profit >= 0 ? 'var(--status-success)' : 'var(--status-error)'
            }}
          >
            {(pack.is_cancelled || pack.status === 'cancelled') ? formatCurrency(0) : formatCurrency(pack.pack_net_profit)}
          </div>
          <div className="mobile-order-card-profit-margin">
            {(pack.is_cancelled || pack.status === 'cancelled') ? '0.0% margen' : `${pack.pack_profit_margin.toFixed(1)}% margen`}
          </div>
        </div>
        <div className="mobile-order-card-actions">
          <button className="mobile-order-card-action" onClick={() => onViewOrder(pack.orders[0])} title="Ver detalle">
            <HiEye style={{ width: '18px', height: '18px' }} />
          </button>
          <a
            href={`https://www.mercadolibre.cl/ventas/${pack.pack_id || pack.orders[0]?.id}/detalle`}
            target="_blank"
            rel="noopener noreferrer"
            className="mobile-order-card-action"
            title="Ver en ML"
          >
            <HiExternalLink style={{ width: '18px', height: '18px' }} />
          </a>
        </div>
      </div>
    </div>
  );
});

// Empty State Component
const EmptyState: FC = memo(() => (
  <div
    className="glass-card"
    style={{
      padding: '80px 24px',
      textAlign: 'center',
    }}
  >
    <div
      style={{
        width: '80px',
        height: '80px',
        margin: '0 auto 24px',
        borderRadius: '20px',
        backgroundColor: 'var(--surface-elevated)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ fontSize: '40px' }}>📊</span>
    </div>
    <h3
      style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: '1.5rem',
        fontWeight: 700,
        color: 'var(--text-primary)',
        margin: '0 0 8px 0',
      }}
    >
      No hay ventas registradas
    </h3>
    <p
      style={{
        fontFamily: "'Outfit', sans-serif",
        fontSize: '0.9375rem',
        color: 'var(--text-tertiary)',
        maxWidth: '400px',
        margin: '0 auto',
      }}
    >
      No se encontraron ventas para esta fecha. Selecciona otra fecha o sincroniza los datos desde Mercado Libre.
    </p>
  </div>
));

// Pagination Controls Component
interface PaginationControlsProps {
  pagination: PaginationMeta;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
}

const PaginationControls: FC<PaginationControlsProps> = memo(({ pagination, onPageChange, isLoading }) => {
  const { page, total_pages, total, limit, has_prev, has_next } = pagination;

  // Calculate range of items shown
  const startItem = (page - 1) * limit + 1;
  const endItem = Math.min(page * limit, total);

  // Generate page numbers to show
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showPages = 5; // Max pages to show

    if (total_pages <= showPages) {
      for (let i = 1; i <= total_pages; i++) pages.push(i);
    } else {
      if (page <= 3) {
        for (let i = 1; i <= 4; i++) pages.push(i);
        pages.push('...');
        pages.push(total_pages);
      } else if (page >= total_pages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = total_pages - 3; i <= total_pages; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push('...');
        for (let i = page - 1; i <= page + 1; i++) pages.push(i);
        pages.push('...');
        pages.push(total_pages);
      }
    }
    return pages;
  };

  const buttonStyle = {
    minWidth: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    border: '1px solid var(--border-subtle)',
    backgroundColor: 'var(--surface-elevated)',
    color: 'var(--text-secondary)',
    fontFamily: "'Outfit', sans-serif",
    fontSize: '0.875rem',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'all 150ms',
    padding: '0 12px',
  };

  const activeButtonStyle = {
    ...buttonStyle,
    backgroundColor: 'var(--accent-primary)',
    borderColor: 'var(--accent-primary)',
    color: '#0a0a0b',
    fontWeight: 600,
  };

  const disabledButtonStyle = {
    ...buttonStyle,
    opacity: 0.4,
    cursor: 'not-allowed',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        borderTop: '1px solid var(--border-subtle)',
        backgroundColor: 'var(--surface-elevated)',
        flexWrap: 'wrap',
        gap: '12px',
      }}
    >
      {/* Items info */}
      <div
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.8125rem',
          color: 'var(--text-tertiary)',
        }}
      >
        Mostrando{' '}
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
          {startItem}-{endItem}
        </span>{' '}
        de{' '}
        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{total}</span> órdenes
      </div>

      {/* Pagination controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
        {/* Previous button */}
        <button
          onClick={() => has_prev && !isLoading && onPageChange(page - 1)}
          disabled={!has_prev || isLoading}
          style={!has_prev || isLoading ? disabledButtonStyle : buttonStyle}
          onMouseEnter={(e) => {
            if (has_prev && !isLoading) {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              e.currentTarget.style.borderColor = 'var(--text-tertiary)';
            }
          }}
          onMouseLeave={(e) => {
            if (has_prev && !isLoading) {
              e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }
          }}
        >
          <HiChevronLeft style={{ width: '18px', height: '18px' }} />
        </button>

        {/* Page numbers */}
        {getPageNumbers().map((pageNum, idx) =>
          pageNum === '...' ? (
            <span
              key={`ellipsis-${idx}`}
              style={{
                padding: '0 8px',
                color: 'var(--text-tertiary)',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              ...
            </span>
          ) : (
            <button
              key={pageNum}
              onClick={() => !isLoading && pageNum !== page && onPageChange(pageNum as number)}
              disabled={isLoading}
              style={pageNum === page ? activeButtonStyle : buttonStyle}
              onMouseEnter={(e) => {
                if (pageNum !== page && !isLoading) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                  e.currentTarget.style.borderColor = 'var(--text-tertiary)';
                }
              }}
              onMouseLeave={(e) => {
                if (pageNum !== page && !isLoading) {
                  e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                }
              }}
            >
              {pageNum}
            </button>
          )
        )}

        {/* Next button */}
        <button
          onClick={() => has_next && !isLoading && onPageChange(page + 1)}
          disabled={!has_next || isLoading}
          style={!has_next || isLoading ? disabledButtonStyle : buttonStyle}
          onMouseEnter={(e) => {
            if (has_next && !isLoading) {
              e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              e.currentTarget.style.borderColor = 'var(--text-tertiary)';
            }
          }}
          onMouseLeave={(e) => {
            if (has_next && !isLoading) {
              e.currentTarget.style.backgroundColor = 'var(--surface-elevated)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
            }
          }}
        >
          <HiChevronRight style={{ width: '18px', height: '18px' }} />
        </button>
      </div>
    </div>
  );
});

// Main Component
const SalesTable: FC<Props> = ({ orders, packs, onViewOrder, pagination, onPageChange, isLoading }) => {
  // Use packs if available, otherwise fall back to orders
  const usePacks = packs && packs.length > 0;

  // Memoize view handler creator
  const createViewHandler = useCallback(
    (order: OrderSummary) => () => onViewOrder(order),
    [onViewOrder]
  );

  // Memoize table headers
  const headers = useMemo(
    () => [
      { label: 'Orden', align: 'left' as const },
      { label: 'Hora', align: 'left' as const },
      { label: 'Envío', align: 'left' as const },
      { label: 'Estado', align: 'left' as const },
      { label: 'Productos', align: 'left' as const },
      { label: 'Venta', align: 'right' as const },
      { label: 'Envío', align: 'right' as const },
      { label: 'Comisión', align: 'right' as const },
      { label: 'IVA', align: 'right' as const },
      { label: 'Bonif.', align: 'right' as const },
      { label: 'Ganancia', align: 'right' as const },
      { label: 'Acciones', align: 'center' as const },
    ],
    []
  );

  // Early return for empty state
  if (orders.length === 0 && (!packs || packs.length === 0)) {
    return <EmptyState />;
  }

  return (
    <>
      {/* Desktop Table View */}
      <div
        className="glass-card desktop-only"
        style={{ display: 'flex', flexDirection: 'column' }}
      >
        {/* Table Wrapper - horizontal scroll only, vertical uses page scroll */}
        <div className="custom-scrollbar" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '1100px' }}>
            {/* Header */}
            <thead>
              <tr
                style={{
                  background: 'var(--table-header-bg)',
                }}
              >
                {headers.map((header, idx) => (
                  <th
                    key={header.label + idx}
                    style={{
                      padding: idx === 0 ? '14px 20px' : '14px 16px',
                      textAlign: header.align,
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: 'var(--text-tertiary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                      whiteSpace: 'nowrap',
                      background: 'var(--table-header-bg)',
                    }}
                  >
                    {header.label}
                  </th>
                ))}
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {usePacks ? (
                // Render grouped packs
                packs!.map((pack) => (
                  <PackTableRow
                    key={pack.pack_id || pack.orders[0]?.id}
                    pack={pack}
                    onViewOrder={onViewOrder}
                  />
                ))
              ) : (
                // Fallback to individual orders
                orders.map((order) => (
                  <TableRow
                    key={order.id}
                    order={order}
                    onView={createViewHandler(order)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination */}
        {pagination && onPageChange ? (
          <PaginationControls
            pagination={pagination}
            onPageChange={onPageChange}
            isLoading={isLoading}
          />
        ) : (
          <div
            style={{
              padding: '14px 20px',
              backgroundColor: 'var(--surface-elevated)',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
              width: '100%',
            }}
          >
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.8125rem',
                color: 'var(--text-tertiary)',
                margin: 0,
              }}
            >
              Mostrando{' '}
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{orders.length}</span> órdenes
            </p>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                fontFamily: "'Outfit', sans-serif",
              }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--status-success)' }} />
                Ganancia
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
                Envío
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fb7185' }} />
                Comisión
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#fb923c' }} />
                IVA
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#34d399' }} />
                Bonif.
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#8b5cf6' }} />
                Fazt (Flex)
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Card View */}
      <div className="mobile-only">
        {/* Mobile Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
            padding: '0 4px',
          }}
        >
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'var(--text-secondary)',
            }}
          >
            {pagination ? `${pagination.total} ${pagination.total === 1 ? 'orden' : 'órdenes'}` : `${orders.length} ${orders.length === 1 ? 'orden' : 'órdenes'}`}
          </span>
        </div>

        {/* Mobile Cards */}
        {usePacks ? (
          // Render grouped packs on mobile
          packs!.map((pack) => (
            <MobilePackCard
              key={pack.pack_id || pack.orders[0]?.id}
              pack={pack}
              onViewOrder={onViewOrder}
            />
          ))
        ) : (
          // Fallback to individual orders
          orders.map((order) => (
            <MobileOrderCard
              key={order.id}
              order={order}
              onView={createViewHandler(order)}
            />
          ))
        )}

        {/* Mobile Pagination */}
        {pagination && onPageChange && pagination.total_pages > 1 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '16px',
              padding: '16px',
              backgroundColor: 'var(--surface-elevated)',
              borderRadius: '12px',
              border: '1px solid var(--border-subtle)',
            }}
          >
            <button
              onClick={() => pagination.has_prev && !isLoading && onPageChange(pagination.page - 1)}
              disabled={!pagination.has_prev || isLoading}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--surface-elevated)',
                color: pagination.has_prev && !isLoading ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                opacity: pagination.has_prev && !isLoading ? 1 : 0.4,
                cursor: pagination.has_prev && !isLoading ? 'pointer' : 'not-allowed',
              }}
            >
              <HiChevronLeft style={{ width: '20px', height: '20px' }} />
            </button>

            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.875rem',
                color: 'var(--text-secondary)',
                padding: '0 16px',
              }}
            >
              Página <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pagination.page}</span> de{' '}
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{pagination.total_pages}</span>
            </span>

            <button
              onClick={() => pagination.has_next && !isLoading && onPageChange(pagination.page + 1)}
              disabled={!pagination.has_next || isLoading}
              style={{
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                backgroundColor: 'var(--surface-elevated)',
                color: pagination.has_next && !isLoading ? 'var(--text-secondary)' : 'var(--text-tertiary)',
                opacity: pagination.has_next && !isLoading ? 1 : 0.4,
                cursor: pagination.has_next && !isLoading ? 'pointer' : 'not-allowed',
              }}
            >
              <HiChevronRight style={{ width: '20px', height: '20px' }} />
            </button>
          </div>
        )}
      </div>
    </>
  );
};

export default memo(SalesTable);
