import { FC, memo, useMemo, useCallback } from 'react';
import type { LogisticType } from '../../types/sales.types';

interface Props {
  selectedTypes: Set<LogisticType>;
  onSelectionChange: (types: Set<LogisticType>) => void;
  counts: {
    fulfillment: number;
    cross_docking: number;
    other: number;
  };
}

// Type configuration - outside component to prevent recreation
const TYPE_CONFIG = [
  {
    key: 'fulfillment' as LogisticType,
    label: 'Full',
    icon: '📦',
    accent: '#10b981',
  },
  {
    key: 'cross_docking' as LogisticType,
    label: 'Flex',
    icon: '⚡',
    accent: '#0ea5e9',
  },
  {
    key: 'other' as LogisticType,
    label: 'Centro de Envío',
    icon: '🏢',
    accent: '#a1a1aa',
  },
] as const;

// Individual Checkbox Button - memoized
interface CheckboxButtonProps {
  config: (typeof TYPE_CONFIG)[number];
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
      gap: 'clamp(6px, 1.5vw, 10px)',
      padding: 'clamp(10px, 2vw, 14px) clamp(12px, 2.5vw, 20px)',
      borderRadius: '12px',
      border: isSelected ? `2px solid ${config.accent}` : '2px solid transparent',
      fontFamily: "'Outfit', sans-serif",
      fontSize: 'clamp(0.8125rem, 2vw, 0.9375rem)',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      overflow: 'hidden',
      background: isSelected
        ? `linear-gradient(135deg, ${config.accent}20, ${config.accent}10)`
        : 'transparent',
      color: isSelected ? config.accent : '#a1a1aa',
      boxShadow: isSelected ? `0 4px 20px -4px ${config.accent}40` : 'none',
      transform: isSelected ? 'scale(1)' : 'scale(0.98)',
      minWidth: 0,
      flex: '1 1 auto',
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
        width: '18px',
        height: '18px',
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
          width="12"
          height="12"
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
    <span style={{ position: 'relative', fontSize: '1.125rem', flexShrink: 0 }}>{config.icon}</span>

    {/* Label - hidden on very small screens */}
    <span
      className="filter-label"
      style={{
        position: 'relative',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {config.label}
    </span>

    {/* Count Badge */}
    <span
      style={{
        position: 'relative',
        padding: '2px 8px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: 700,
        fontFamily: "'JetBrains Mono', monospace",
        backgroundColor: isSelected ? `${config.accent}30` : 'rgba(39, 39, 42, 0.8)',
        color: isSelected ? config.accent : '#71717a',
        minWidth: '24px',
        textAlign: 'center',
        flexShrink: 0,
      }}
    >
      {count}
    </span>
  </button>
));

const LogisticTypeTabs: FC<Props> = ({ selectedTypes, onSelectionChange, counts }) => {
  // Toggle a type in the selection
  const handleToggle = useCallback(
    (key: LogisticType) => () => {
      const newSelection = new Set(selectedTypes);

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
    [selectedTypes, onSelectionChange]
  );

  // Select all types
  const handleSelectAll = useCallback(() => {
    onSelectionChange(new Set(['fulfillment', 'cross_docking', 'other']));
  }, [onSelectionChange]);

  // Memoize types with counts
  const typesWithCounts = useMemo(
    () =>
      TYPE_CONFIG.map((config) => ({
        ...config,
        count: counts[config.key],
      })),
    [counts]
  );

  const allSelected = selectedTypes.size === 3;
  const totalSelected = selectedTypes.size;

  return (
    <div style={{ marginBottom: 'clamp(16px, 3vw, 24px)', width: '100%' }}>
      {/* Container */}
      <div
        className="glass-card"
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(8px, 2vw, 12px)',
          padding: 'clamp(12px, 2vw, 16px)',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '100%',
        }}
      >
        {/* Header with Select All */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '8px', borderBottom: '1px solid var(--border-subtle)', flexWrap: 'wrap', gap: '8px' }}>
          <span
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(0.6875rem, 1.8vw, 0.75rem)',
              fontWeight: 600,
              color: 'var(--text-tertiary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
          >
            Filtrar por tipo ({totalSelected})
          </span>
          <button
            onClick={handleSelectAll}
            disabled={allSelected}
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: 'clamp(0.6875rem, 1.8vw, 0.75rem)',
              fontWeight: 600,
              color: allSelected ? 'var(--text-tertiary)' : '#f59e0b',
              background: 'none',
              border: 'none',
              cursor: allSelected ? 'default' : 'pointer',
              padding: '4px 8px',
              borderRadius: '6px',
              transition: 'all 150ms ease',
              opacity: allSelected ? 0.5 : 1,
            }}
            onMouseEnter={(e) => {
              if (!allSelected) {
                e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.1)';
              }
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            Todos
          </button>
        </div>

        {/* Checkbox Grid - responsive: 3 columns on desktop, flexible on mobile */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'clamp(6px, 1.5vw, 8px)',
          }}
        >
          {typesWithCounts.map((config) => (
            <CheckboxButton
              key={config.key}
              config={config}
              count={config.count}
              isSelected={selectedTypes.has(config.key)}
              onClick={handleToggle(config.key)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default memo(LogisticTypeTabs);
