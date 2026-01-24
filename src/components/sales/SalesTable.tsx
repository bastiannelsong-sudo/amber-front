import { FC, memo, useCallback, useMemo } from 'react';
import { HiEye, HiExternalLink } from 'react-icons/hi';
import type { OrderSummary } from '../../types/sales.types';

interface Props {
  orders: OrderSummary[];
  onViewOrder: (order: OrderSummary) => void;
}

// Config objects - outside component
const STATUS_CONFIG: Record<string, { bg: string; color: string; label: string }> = {
  paid: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', label: 'Pagado' },
  approved: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', label: 'Aprobado' },
  pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', label: 'Pendiente' },
  cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', label: 'Cancelado' },
  refunded: { bg: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', label: 'Reembolsado' },
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
  return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
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
  const statusConfig = STATUS_CONFIG[order.status] || DEFAULT_STATUS;
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

      {/* Shipping Cost - Flex (income): positive green, Flex (cost) & Full/Centro: negative */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        {(() => {
          // Flex orders with INCOME (buyer pays shipping to seller)
          const isFlexWithIncome = order.logistic_type === 'cross_docking' || order.logistic_type === 'self_service';
          // Flex orders with COST (free shipping >$20k, seller pays)
          const isFlexWithCost = order.logistic_type === 'cross_docking_cost' || order.logistic_type === 'self_service_cost';

          if (order.shipping_cost > 0) {
            // Only show as positive income for Flex orders where buyer pays shipping
            // For Flex with cost (free shipping), show as negative cost
            return isFlexWithIncome && !isFlexWithCost ? (
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#34d399', // Green for income
                }}
              >
                +{formatCurrency(order.shipping_cost)}
              </span>
            ) : (
              <span
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#38bdf8', // Blue for cost
                }}
              >
                -{formatCurrency(order.shipping_cost)}
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

      {/* Marketplace Fee */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#fb7185',
          }}
        >
          {order.marketplace_fee > 0 ? `-${formatCurrency(order.marketplace_fee)}` : formatCurrency(0)}
        </span>
      </td>

      {/* IVA */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 500,
            color: '#fb923c',
          }}
        >
          {(order.iva_amount || 0) > 0 ? `-${formatCurrency(order.iva_amount)}` : formatCurrency(0)}
        </span>
      </td>

      {/* Shipping Bonus - only shows for orders with bonus (free shipping >$20k) */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <span
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.875rem',
            fontWeight: 500,
            color: (order.shipping_bonus || 0) > 0 ? '#34d399' : 'var(--text-tertiary)',
          }}
        >
          {(order.shipping_bonus || 0) > 0 ? `+${formatCurrency(order.shipping_bonus)}` : formatCurrency(0)}
        </span>
      </td>

      {/* Net Profit */}
      <td style={{ padding: '16px', textAlign: 'right' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontWeight: 700,
              fontSize: '0.9375rem',
              color: order.net_profit >= 0 ? 'var(--status-success)' : 'var(--status-error)',
            }}
          >
            {formatCurrency(order.net_profit)}
          </span>
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6875rem',
              color: 'var(--text-tertiary)',
            }}
          >
            {order.profit_margin.toFixed(1)}%
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

// Main Component
const SalesTable: FC<Props> = ({ orders, onViewOrder }) => {
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
  if (orders.length === 0) {
    return <EmptyState />;
  }

  return (
    <div
      className="glass-card custom-scrollbar"
      style={{ overflow: 'hidden' }}
    >
      {/* Table Wrapper */}
      <div style={{ overflowX: 'auto' }}>
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
                  }}
                >
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Body */}
          <tbody>
            {orders.map((order) => (
              <TableRow
                key={order.id}
                order={order}
                onView={createViewHandler(order)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div
        style={{
          padding: '14px 20px',
          backgroundColor: 'var(--surface-elevated)',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
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
        </div>
      </div>
    </div>
  );
};

export default memo(SalesTable);
