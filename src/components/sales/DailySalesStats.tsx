import { FC, memo, useEffect, useState, useMemo } from 'react';
import { HiShoppingCart, HiCurrencyDollar, HiTruck, HiReceiptTax, HiTrendingUp, HiDocumentText } from 'react-icons/hi';
import type { DailySalesSummary, LogisticTypeSummary } from '../../types/sales.types';

interface Props {
  summary: DailySalesSummary;
  byLogisticType: {
    fulfillment: LogisticTypeSummary;
    cross_docking: LogisticTypeSummary;
    other: LogisticTypeSummary;
  };
}

// Animated Counter - extracted for reuse and memoization
const AnimatedNumber: FC<{
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}> = memo(({ value, prefix = '', suffix = '', decimals = 0 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const steps = 40;
    const increment = value / steps;
    let current = 0;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      current += increment;
      if (step >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(current);
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [value]);

  const formatted = useMemo(() => {
    if (decimals > 0) return displayValue.toFixed(decimals);
    return Math.round(displayValue).toLocaleString('es-CL');
  }, [displayValue, decimals]);

  return (
    <span>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
});

// Single Stat Card
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  subtitle?: string;
  accentColor: string;
  glowColor: string;
  delay?: number;
}

const StatCard: FC<StatCardProps> = memo(({
  icon,
  label,
  value,
  prefix = '',
  suffix = '',
  subtitle,
  accentColor,
  glowColor,
}) => (
  <div
    className="stat-card glass-card"
    style={{
      position: 'relative',
      padding: '20px',
      borderRadius: '16px',
      overflow: 'hidden',
      transition: 'all 250ms',
    }}
  >
    {/* Glow Effect */}
    <div
      className="stat-glow"
      style={{
        position: 'absolute',
        top: '-30%',
        right: '-30%',
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: glowColor,
        filter: 'blur(50px)',
        opacity: 0.4,
      }}
    />

    {/* Top Row */}
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px', position: 'relative' }}>
      <div
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          background: `linear-gradient(135deg, ${accentColor}20, ${accentColor}10)`,
          border: `1px solid ${accentColor}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {icon}
      </div>
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {label}
      </span>
    </div>

    {/* Value */}
    <div style={{ position: 'relative' }}>
      <p
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '1.875rem',
          fontWeight: 800,
          color: 'var(--text-primary)',
          margin: 0,
          letterSpacing: '-0.03em',
        }}
      >
        <AnimatedNumber value={value} prefix={prefix} suffix={suffix} />
      </p>
      {subtitle && (
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.8125rem',
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            margin: '4px 0 0 0',
          }}
        >
          {subtitle}
        </p>
      )}
    </div>

    {/* Bottom Accent */}
    <div
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '3px',
        background: `linear-gradient(90deg, ${accentColor}, ${accentColor}60)`,
        opacity: 0.7,
      }}
    />
  </div>
));

// Logistic Type Card (smaller)
interface LogisticCardProps {
  type: 'fulfillment' | 'cross_docking' | 'other';
  data: LogisticTypeSummary;
}

const LogisticCard: FC<LogisticCardProps> = memo(({ type, data }) => {
  const config = useMemo(() => {
    const configs = {
      fulfillment: {
        icon: '📦',
        label: 'Full',
        desc: 'Fulfillment',
        accent: '#10b981',
        glow: 'rgba(16, 185, 129, 0.3)',
      },
      cross_docking: {
        icon: '⚡',
        label: 'Flex',
        desc: 'Cross Docking',
        accent: '#0ea5e9',
        glow: 'rgba(14, 165, 233, 0.3)',
      },
      other: {
        icon: '🚚',
        label: 'Normal',
        desc: 'Mercado Envío',
        accent: '#a1a1aa',
        glow: 'rgba(161, 161, 170, 0.2)',
      },
    };
    return configs[type];
  }, [type]);

  const marginPercent = useMemo(() => {
    return data.average_profit_margin.toFixed(1);
  }, [data.average_profit_margin]);

  return (
    <div
      style={{
        position: 'relative',
        padding: '20px',
        borderRadius: '16px',
        background: `linear-gradient(135deg, ${config.accent}08, ${config.accent}04)`,
        border: `1px solid ${config.accent}20`,
        transition: 'all 250ms',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '28px' }}>{config.icon}</span>
          <div>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.125rem',
                fontWeight: 700,
                color: config.accent,
                margin: 0,
              }}
            >
              {config.label}
            </p>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 500,
                color: 'var(--text-tertiary)',
                margin: 0,
              }}
            >
              {data.total_orders} {data.total_orders === 1 ? 'orden' : 'órdenes'}
            </p>
          </div>
        </div>
        <span
          className="badge"
          style={{
            padding: '4px 10px',
            borderRadius: '20px',
            fontSize: '0.6875rem',
            fontWeight: 600,
            background: `${config.accent}15`,
            color: config.accent,
            border: `1px solid ${config.accent}25`,
          }}
        >
          {data.total_items} items
        </span>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
        <div>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            Ventas
          </p>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.125rem',
              fontWeight: 700,
              color: 'var(--text-primary)',
              margin: '4px 0 0 0',
            }}
          >
            ${data.gross_amount.toLocaleString('es-CL')}
          </p>
        </div>
        <div>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            IVA
          </p>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.125rem',
              fontWeight: 700,
              color: '#fb923c',
              margin: '4px 0 0 0',
            }}
          >
            ${(data.iva_amount || 0).toLocaleString('es-CL')}
          </p>
        </div>
        <div>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.6875rem',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              margin: 0,
            }}
          >
            Ganancia
          </p>
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '1.125rem',
              fontWeight: 700,
              color: data.net_profit >= 0 ? 'var(--status-success)' : 'var(--status-error)',
              margin: '4px 0 0 0',
            }}
          >
            ${data.net_profit.toLocaleString('es-CL')}
          </p>
        </div>
      </div>

      {/* Costs Breakdown */}
      <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
        <p
          style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '0.625rem',
            fontWeight: 700,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            margin: '0 0 10px 0',
          }}
        >
          Desglose de costos
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {/* Shipping */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: "'Outfit', sans-serif", fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#38bdf8' }} />
              Envío
            </span>
            <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              ${(data.shipping_cost || 0).toLocaleString('es-CL')}
            </span>
          </div>
          {/* Commission */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#fb7185', fontFamily: "'Outfit', sans-serif", fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fb7185' }} />
              Comisión ML
            </span>
            <span style={{ fontSize: '0.75rem', color: '#fb7185', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              ${(data.marketplace_fee || 0).toLocaleString('es-CL')}
            </span>
          </div>
          {/* IVA */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: '#fb923c', fontFamily: "'Outfit', sans-serif", fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#fb923c' }} />
              IVA (19%)
            </span>
            <span style={{ fontSize: '0.75rem', color: '#fb923c', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              ${(data.iva_amount || 0).toLocaleString('es-CL')}
            </span>
          </div>
          {/* Total Fees */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px', paddingTop: '6px', borderTop: '1px dashed var(--border-subtle)' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>
              Total costos
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-primary)', fontFamily: "'Outfit', sans-serif", fontWeight: 700 }}>
              ${(data.total_fees || 0).toLocaleString('es-CL')}
            </span>
          </div>
        </div>
      </div>

      {/* Margin Bar */}
      <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '6px' }}>
          <span style={{ color: 'var(--text-tertiary)', fontFamily: "'Outfit', sans-serif", fontWeight: 500 }}>Margen</span>
          <span style={{ color: config.accent, fontFamily: "'Outfit', sans-serif", fontWeight: 600 }}>{marginPercent}%</span>
        </div>
        <div
          style={{
            height: '6px',
            borderRadius: '20px',
            backgroundColor: 'var(--surface-hover)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: '20px',
              background: `linear-gradient(90deg, ${config.accent}, ${config.accent}80)`,
              width: `${Math.min(Math.max(data.average_profit_margin, 0), 100)}%`,
              transition: 'width 1s ease-out',
            }}
          />
        </div>
      </div>
    </div>
  );
});

const DailySalesStats: FC<Props> = ({ summary, byLogisticType }) => {
  const profitMarginText = useMemo(() => `${summary.average_profit_margin.toFixed(1)}% margen`, [summary.average_profit_margin]);

  // Calculate actual shipping costs vs income
  // Flex shipping = INCOME (positive, green in table)
  // Full/Centro shipping = COST (negative, shown as cost in table)
  const shippingCalculation = useMemo(() => {
    const flexIncome = byLogisticType.cross_docking.shipping_cost || 0; // Flex = income
    const fulfillmentCost = byLogisticType.fulfillment.shipping_cost || 0; // Full = cost
    const otherCost = byLogisticType.other.shipping_cost || 0; // Centro de Envío = cost
    const actualCost = fulfillmentCost + otherCost; // Only these are real costs
    const netShipping = flexIncome - actualCost; // Positive = net income, Negative = net cost
    return { flexIncome, actualCost, netShipping };
  }, [byLogisticType]);

  return (
    <div style={{ marginBottom: '32px' }}>
      {/* Main Stats Row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '24px',
        }}
      >
        <StatCard
          icon={<HiShoppingCart style={{ width: '22px', height: '22px', color: '#f59e0b' }} />}
          label="Órdenes"
          value={summary.total_orders}
          subtitle={`${summary.total_items} productos`}
          accentColor="#f59e0b"
          glowColor="rgba(245, 158, 11, 0.4)"
        />
        <StatCard
          icon={<HiCurrencyDollar style={{ width: '22px', height: '22px', color: '#10b981' }} />}
          label="Ventas Brutas"
          value={summary.gross_amount}
          prefix="$"
          accentColor="#10b981"
          glowColor="rgba(16, 185, 129, 0.4)"
        />
        <StatCard
          icon={<HiTruck style={{ width: '22px', height: '22px', color: shippingCalculation.netShipping >= 0 ? '#10b981' : '#f43f5e' }} />}
          label="Costos Envío"
          value={Math.abs(shippingCalculation.netShipping)}
          prefix={shippingCalculation.netShipping >= 0 ? '+$' : '-$'}
          subtitle={shippingCalculation.netShipping >= 0 ? 'Ingreso neto (Flex)' : 'Costo neto'}
          accentColor={shippingCalculation.netShipping >= 0 ? '#10b981' : '#f43f5e'}
          glowColor={shippingCalculation.netShipping >= 0 ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}
        />
        <StatCard
          icon={<HiReceiptTax style={{ width: '22px', height: '22px', color: '#f43f5e' }} />}
          label="Comisiones ML"
          value={summary.marketplace_fee}
          prefix="$"
          accentColor="#f43f5e"
          glowColor="rgba(244, 63, 94, 0.4)"
        />
        <StatCard
          icon={<HiDocumentText style={{ width: '22px', height: '22px', color: '#fb923c' }} />}
          label="IVA (19%)"
          value={summary.iva_amount || 0}
          prefix="$"
          subtitle="Impuesto a la venta"
          accentColor="#fb923c"
          glowColor="rgba(251, 146, 60, 0.4)"
        />
        <StatCard
          icon={<HiTrendingUp style={{ width: '22px', height: '22px', color: '#8b5cf6' }} />}
          label="Ganancia Neta"
          value={summary.net_profit}
          prefix="$"
          subtitle={profitMarginText}
          accentColor="#8b5cf6"
          glowColor="rgba(139, 92, 246, 0.4)"
        />
      </div>

      {/* Logistic Type Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '16px',
        }}
      >
        <LogisticCard type="fulfillment" data={byLogisticType.fulfillment} />
        <LogisticCard type="cross_docking" data={byLogisticType.cross_docking} />
        <LogisticCard type="other" data={byLogisticType.other} />
      </div>
    </div>
  );
};

export default memo(DailySalesStats);
