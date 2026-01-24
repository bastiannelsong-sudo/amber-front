import { FC, memo, useMemo, useCallback } from 'react';

export type OrderStatus = 'paid' | 'cancelled';

interface Props {
  selectedStatuses: Set<OrderStatus>;
  onSelectionChange: (statuses: Set<OrderStatus>) => void;
  counts: {
    paid: number;
    cancelled: number;
  };
}

// Status configuration
const STATUS_CONFIG = [
  {
    key: 'paid' as OrderStatus,
    label: 'Pagadas',
    icon: '✅',
    accent: '#10b981', // Green
  },
  {
    key: 'cancelled' as OrderStatus,
    label: 'Canceladas',
    icon: '❌',
    accent: '#f43f5e', // Red
  },
] as const;

// Individual Checkbox Button - memoized
interface CheckboxButtonProps {
  config: (typeof STATUS_CONFIG)[number];
  count: number;
  isSelected: boolean;
  onClick: () => void;
}

const CheckboxButton: FC<CheckboxButtonProps> = memo(({ config, count, isSelected, onClick }) => (
  <button
    onClick={onClick}
    style={{
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '10px',
      padding: '12px 16px',
      borderRadius: '10px',
      border: isSelected ? `2px solid ${config.accent}` : '2px solid transparent',
      fontFamily: "'Outfit', sans-serif",
      fontSize: '0.875rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      background: isSelected
        ? `linear-gradient(135deg, ${config.accent}20, ${config.accent}10)`
        : 'transparent',
      color: isSelected ? config.accent : '#a1a1aa',
      boxShadow: isSelected ? `0 4px 16px -4px ${config.accent}40` : 'none',
      transform: isSelected ? 'scale(1)' : 'scale(0.98)',
    }}
    onMouseEnter={(e) => {
      if (!isSelected) {
        e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.5)';
        e.currentTarget.style.color = '#fafafa';
        e.currentTarget.style.transform = 'scale(1)';
      }
    }}
    onMouseLeave={(e) => {
      if (!isSelected) {
        e.currentTarget.style.backgroundColor = 'transparent';
        e.currentTarget.style.color = '#a1a1aa';
        e.currentTarget.style.transform = 'scale(0.98)';
      }
    }}
  >
    {/* Checkbox indicator */}
    <div
      style={{
        width: '16px',
        height: '16px',
        borderRadius: '4px',
        border: isSelected ? `2px solid ${config.accent}` : '2px solid #52525b',
        backgroundColor: isSelected ? config.accent : 'transparent',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 150ms ease',
        flexShrink: 0,
      }}
    >
      {isSelected && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 12 12"
          fill="none"
          style={{ color: '#fff' }}
        >
          <path
            d="M2.5 6L5 8.5L9.5 3.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </div>

    {/* Icon */}
    <span style={{ position: 'relative', fontSize: '1rem' }}>{config.icon}</span>

    {/* Label */}
    <span style={{ position: 'relative' }}>{config.label}</span>

    {/* Count Badge */}
    <span
      style={{
        position: 'relative',
        padding: '2px 6px',
        borderRadius: '20px',
        fontSize: '0.7rem',
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        backgroundColor: isSelected ? `${config.accent}30` : 'rgba(39, 39, 42, 0.8)',
        color: isSelected ? config.accent : '#71717a',
        minWidth: '20px',
        textAlign: 'center',
      }}
    >
      {count}
    </span>
  </button>
));

const StatusFilterTabs: FC<Props> = ({ selectedStatuses, onSelectionChange, counts }) => {
  // Toggle a status in the selection
  const handleToggle = useCallback(
    (key: OrderStatus) => () => {
      const newSelection = new Set(selectedStatuses);

      if (newSelection.has(key)) {
        // Don't allow deselecting if it's the last one
        if (newSelection.size > 1) {
          newSelection.delete(key);
        }
      } else {
        newSelection.add(key);
      }

      onSelectionChange(newSelection);
    },
    [selectedStatuses, onSelectionChange]
  );

  // Memoize statuses with counts
  const statusesWithCounts = useMemo(
    () =>
      STATUS_CONFIG.map((config) => ({
        ...config,
        count: counts[config.key],
      })),
    [counts]
  );

  return (
    <div
      className="glass-card"
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        gap: '10px',
        padding: '12px',
        borderRadius: '12px',
      }}
    >
      {/* Header */}
      <span
        style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '0.7rem',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          paddingBottom: '6px',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        Estado
      </span>

      {/* Checkbox Row */}
      <div
        style={{
          display: 'flex',
          gap: '6px',
        }}
      >
        {statusesWithCounts.map((config) => (
          <CheckboxButton
            key={config.key}
            config={config}
            count={config.count}
            isSelected={selectedStatuses.has(config.key)}
            onClick={handleToggle(config.key)}
          />
        ))}
      </div>
    </div>
  );
};

export default memo(StatusFilterTabs);
