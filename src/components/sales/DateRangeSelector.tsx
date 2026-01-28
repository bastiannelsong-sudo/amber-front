import { FC, memo, useCallback, useMemo, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { HiCalendar, HiX, HiExclamationCircle, HiCheckCircle, HiArrowRight } from 'react-icons/hi';
import { DateRange } from '../../types/sales.types';

interface Props {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
}

const MAX_DAYS = 31;

// Helper functions
const formatDisplayDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
  });
};

const formatFullDate = (dateStr: string): string => {
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const getToday = (): string => {
  const iso = new Date().toISOString();
  return iso.split('T')[0] as string;
};

const addDays = (dateStr: string, days: number): string => {
  const date = new Date(dateStr + 'T12:00:00');
  date.setDate(date.getDate() + days);
  const iso = date.toISOString();
  return iso.split('T')[0] as string;
};

const getFirstDayOfMonth = (): string => {
  const now = new Date();
  const iso = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  return iso.split('T')[0] as string;
};

const calculateDaysDiff = (from: string, to: string): number => {
  if (!from || !to) return 0;
  const fromDate = new Date(from + 'T12:00:00');
  const toDate = new Date(to + 'T12:00:00');
  const diff = Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  return diff;
};

type PresetKey = 'today' | 'yesterday' | '7days' | '15days' | 'month';

interface Preset {
  key: PresetKey;
  label: string;
  getRange: () => DateRange;
}

const presets: Preset[] = [
  {
    key: 'today',
    label: 'Hoy',
    getRange: () => ({ from: getToday(), to: getToday() }),
  },
  {
    key: 'yesterday',
    label: 'Ayer',
    getRange: () => {
      const yesterday = addDays(getToday(), -1);
      return { from: yesterday, to: yesterday };
    },
  },
  {
    key: '7days',
    label: '7 días',
    getRange: () => ({ from: addDays(getToday(), -6), to: getToday() }),
  },
  {
    key: '15days',
    label: '15 días',
    getRange: () => ({ from: addDays(getToday(), -14), to: getToday() }),
  },
  {
    key: 'month',
    label: 'Este mes',
    getRange: () => ({ from: getFirstDayOfMonth(), to: getToday() }),
  },
];

// Modal styles as CSS-in-JS with keyframe animations
const modalStyles = `
  @keyframes modalBackdropIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }

  @keyframes modalContentIn {
    from {
      opacity: 0;
      transform: scale(0.95) translateY(-10px);
    }
    to {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  @keyframes shimmer {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }

  @keyframes pulse-ring {
    0% { transform: scale(0.95); opacity: 0.5; }
    50% { transform: scale(1); opacity: 0.3; }
    100% { transform: scale(0.95); opacity: 0.5; }
  }

  .date-modal-backdrop {
    animation: modalBackdropIn 0.2s ease-out forwards;
  }

  .date-modal-content {
    animation: modalContentIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .date-input-custom::-webkit-calendar-picker-indicator {
    filter: invert(1);
    cursor: pointer;
    opacity: 0.7;
    transition: opacity 0.15s;
  }

  .date-input-custom::-webkit-calendar-picker-indicator:hover {
    opacity: 1;
  }

  .date-input-custom:focus {
    border-color: rgba(139, 92, 246, 0.6) !important;
    box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.15);
  }
`;

// Custom Modal Component rendered via Portal
interface CustomDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  customFrom: string;
  customTo: string;
  onFromChange: (value: string) => void;
  onToChange: (value: string) => void;
  onApply: () => void;
  validationError: string | null;
  customDays: number;
  today: string;
}

const CustomDateModal: FC<CustomDateModalProps> = memo(({
  isOpen,
  onClose,
  customFrom,
  customTo,
  onFromChange,
  onToChange,
  onApply,
  validationError,
  customDays,
  today,
}) => {
  const isValid = !validationError && customDays > 0;

  if (!isOpen) return null;

  const modalContent = (
    <>
      <style>{modalStyles}</style>

      {/* Backdrop */}
      <div
        className="date-modal-backdrop"
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          zIndex: 99999,
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        {/* Modal Content */}
        <div
          className="date-modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '420px',
            background: 'linear-gradient(145deg, rgba(24, 24, 27, 0.95), rgba(15, 15, 18, 0.98))',
            borderRadius: '20px',
            border: '1px solid rgba(63, 63, 70, 0.4)',
            boxShadow: `
              0 0 0 1px rgba(255, 255, 255, 0.03),
              0 25px 50px -12px rgba(0, 0, 0, 0.5),
              0 0 100px rgba(139, 92, 246, 0.08)
            `,
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Decorative gradient orb */}
          <div
            style={{
              position: 'absolute',
              top: '-50px',
              right: '-50px',
              width: '150px',
              height: '150px',
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Header */}
          <div
            style={{
              padding: '24px 24px 0 24px',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              position: 'relative',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              {/* Icon with glow */}
              <div
                style={{
                  position: 'relative',
                  width: '48px',
                  height: '48px',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.3), rgba(124, 58, 237, 0.3))',
                    animation: 'pulse-ring 2s ease-in-out infinite',
                  }}
                />
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    borderRadius: '14px',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                  }}
                >
                  <HiCalendar style={{ width: '22px', height: '22px', color: '#ffffff' }} />
                </div>
              </div>

              <div>
                <h2
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '1.25rem',
                    fontWeight: 700,
                    color: '#fafafa',
                    margin: 0,
                    letterSpacing: '-0.01em',
                  }}
                >
                  Rango Personalizado
                </h2>
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.8125rem',
                    color: '#71717a',
                    margin: '4px 0 0 0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span
                    style={{
                      display: 'inline-block',
                      width: '6px',
                      height: '6px',
                      borderRadius: '50%',
                      backgroundColor: '#8b5cf6',
                    }}
                  />
                  Máximo {MAX_DAYS} días
                </p>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'rgba(39, 39, 42, 0.6)',
                color: '#71717a',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
                e.currentTarget.style.color = '#f87171';
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.6)';
                e.currentTarget.style.color = '#71717a';
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <HiX style={{ width: '18px', height: '18px' }} />
            </button>
          </div>

          {/* Body */}
          <div style={{ padding: '24px' }}>
            {/* Date Inputs Row */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto 1fr',
                gap: '12px',
                alignItems: 'end',
                marginBottom: '20px',
              }}
            >
              {/* From Date */}
              <div>
                <label
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: '#a1a1aa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Desde
                </label>
                <input
                  type="date"
                  className="date-input-custom"
                  value={customFrom}
                  max={today}
                  onChange={(e) => onFromChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(63, 63, 70, 0.5)',
                    backgroundColor: 'rgba(24, 24, 27, 0.6)',
                    color: '#fafafa',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              {/* Arrow */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingBottom: '10px',
                }}
              >
                <HiArrowRight
                  style={{
                    width: '20px',
                    height: '20px',
                    color: '#52525b',
                  }}
                />
              </div>

              {/* To Date */}
              <div>
                <label
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.6875rem',
                    fontWeight: 600,
                    color: '#a1a1aa',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '8px',
                    display: 'block',
                  }}
                >
                  Hasta
                </label>
                <input
                  type="date"
                  className="date-input-custom"
                  value={customTo}
                  max={today}
                  onChange={(e) => onToChange(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '14px 12px',
                    borderRadius: '12px',
                    border: '1px solid rgba(63, 63, 70, 0.5)',
                    backgroundColor: 'rgba(24, 24, 27, 0.6)',
                    color: '#fafafa',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: '0.875rem',
                    outline: 'none',
                    transition: 'all 0.15s ease',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Selected Range Preview Card */}
            {customFrom && customTo && (
              <div
                style={{
                  padding: '16px',
                  borderRadius: '14px',
                  background: 'linear-gradient(135deg, rgba(39, 39, 42, 0.4), rgba(24, 24, 27, 0.6))',
                  border: '1px solid rgba(63, 63, 70, 0.3)',
                  marginBottom: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        color: '#71717a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Inicio
                    </span>
                    <p
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#fafafa',
                        margin: '4px 0 0 0',
                      }}
                    >
                      {formatFullDate(customFrom)}
                    </p>
                  </div>

                  <div
                    style={{
                      width: '1px',
                      height: '36px',
                      backgroundColor: 'rgba(63, 63, 70, 0.5)',
                      margin: '0 16px',
                    }}
                  />

                  <div style={{ flex: 1, textAlign: 'right' }}>
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '0.6875rem',
                        fontWeight: 500,
                        color: '#71717a',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                      }}
                    >
                      Fin
                    </span>
                    <p
                      style={{
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#fafafa',
                        margin: '4px 0 0 0',
                      }}
                    >
                      {formatFullDate(customTo)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Validation Status */}
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '12px',
                backgroundColor: validationError
                  ? 'rgba(239, 68, 68, 0.08)'
                  : isValid
                    ? 'rgba(34, 197, 94, 0.08)'
                    : 'rgba(139, 92, 246, 0.08)',
                border: `1px solid ${
                  validationError
                    ? 'rgba(239, 68, 68, 0.25)'
                    : isValid
                      ? 'rgba(34, 197, 94, 0.25)'
                      : 'rgba(139, 92, 246, 0.25)'
                }`,
                marginBottom: '20px',
                transition: 'all 0.2s ease',
              }}
            >
              {validationError ? (
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                  <HiExclamationCircle
                    style={{
                      width: '20px',
                      height: '20px',
                      color: '#f87171',
                      flexShrink: 0,
                      marginTop: '1px',
                    }}
                  />
                  <p
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '0.875rem',
                      color: '#fca5a5',
                      margin: 0,
                      lineHeight: 1.5,
                    }}
                  >
                    {validationError}
                  </p>
                </div>
              ) : isValid ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <HiCheckCircle
                      style={{
                        width: '20px',
                        height: '20px',
                        color: '#4ade80',
                        flexShrink: 0,
                      }}
                    />
                    <span
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: '0.875rem',
                        color: '#86efac',
                      }}
                    >
                      Rango válido
                    </span>
                  </div>
                  <span
                    style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: '#4ade80',
                      background: 'rgba(34, 197, 94, 0.1)',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    {customDays} {customDays === 1 ? 'día' : 'días'}
                  </span>
                </div>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <div
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#8b5cf6',
                      animation: 'pulse-ring 1.5s ease-in-out infinite',
                    }}
                  />
                  <span
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '0.875rem',
                      color: '#a78bfa',
                    }}
                  >
                    Selecciona las fechas
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: '1px solid rgba(63, 63, 70, 0.5)',
                  backgroundColor: 'transparent',
                  color: '#a1a1aa',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.5)';
                  e.currentTarget.style.color = '#fafafa';
                  e.currentTarget.style.borderColor = 'rgba(82, 82, 91, 0.8)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.color = '#a1a1aa';
                  e.currentTarget.style.borderColor = 'rgba(63, 63, 70, 0.5)';
                }}
              >
                Cancelar
              </button>

              <button
                onClick={onApply}
                disabled={!isValid}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: isValid
                    ? 'linear-gradient(135deg, #22c55e, #16a34a)'
                    : 'rgba(63, 63, 70, 0.5)',
                  color: isValid ? '#ffffff' : '#52525b',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.9375rem',
                  fontWeight: 600,
                  cursor: isValid ? 'pointer' : 'not-allowed',
                  transition: 'all 0.15s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: isValid ? '0 4px 15px rgba(34, 197, 94, 0.3)' : 'none',
                }}
                onMouseEnter={(e) => {
                  if (isValid) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(34, 197, 94, 0.4)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (isValid) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(34, 197, 94, 0.3)';
                  }
                }}
              >
                {isValid && <HiCheckCircle style={{ width: '18px', height: '18px' }} />}
                {isValid ? `Aplicar (${customDays} días)` : 'Aplicar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Render via portal to ensure it's at the top of the DOM
  return createPortal(modalContent, document.body);
});

CustomDateModal.displayName = 'CustomDateModal';

const DateRangeSelector: FC<Props> = ({ dateRange, onDateRangeChange }) => {
  const today = useMemo(() => getToday(), []);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customFrom, setCustomFrom] = useState(dateRange.from);
  const [customTo, setCustomTo] = useState(dateRange.to);

  // Reset custom dates when modal opens
  useEffect(() => {
    if (showCustomModal) {
      setCustomFrom(dateRange.from);
      setCustomTo(dateRange.to);
    }
  }, [showCustomModal, dateRange.from, dateRange.to]);

  // Compute validation error directly from state
  const validationError = useMemo((): string | null => {
    if (!customFrom || !customTo) return null;

    const days = calculateDaysDiff(customFrom, customTo);

    if (days < 1) {
      return 'La fecha inicial debe ser anterior o igual a la fecha final.';
    }
    if (days > MAX_DAYS) {
      return `El rango máximo es de ${MAX_DAYS} días. Seleccionaste ${days} días.`;
    }
    if (customFrom > today || customTo > today) {
      return 'Las fechas no pueden ser futuras.';
    }
    return null;
  }, [customFrom, customTo, today]);

  // Determine which preset is active
  const activePreset = useMemo((): PresetKey | 'custom' | null => {
    for (const preset of presets) {
      const range = preset.getRange();
      if (range.from === dateRange.from && range.to === dateRange.to) {
        return preset.key;
      }
    }
    return 'custom';
  }, [dateRange]);

  const isCustomActive = activePreset === 'custom' && !presets.some(p => {
    const range = p.getRange();
    return range.from === dateRange.from && range.to === dateRange.to;
  });

  const handleFromChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newFrom = e.target.value;
      if (newFrom && newFrom <= today) {
        const newTo = newFrom > dateRange.to ? newFrom : dateRange.to;
        onDateRangeChange({ from: newFrom, to: newTo });
      }
    },
    [today, dateRange.to, onDateRangeChange]
  );

  const handleToChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const newTo = e.target.value;
      if (newTo && newTo <= today) {
        const newFrom = newTo < dateRange.from ? newTo : dateRange.from;
        onDateRangeChange({ from: newFrom, to: newTo });
      }
    },
    [today, dateRange.from, onDateRangeChange]
  );

  const handlePresetClick = useCallback(
    (preset: Preset) => {
      onDateRangeChange(preset.getRange());
    },
    [onDateRangeChange]
  );

  const openCustomModal = useCallback(() => {
    setShowCustomModal(true);
  }, []);

  const closeCustomModal = useCallback(() => {
    setShowCustomModal(false);
  }, []);

  const handleApplyCustomRange = useCallback(() => {
    if (!customFrom || !customTo || validationError) {
      return;
    }
    onDateRangeChange({ from: customFrom, to: customTo });
    setShowCustomModal(false);
  }, [customFrom, customTo, validationError, onDateRangeChange]);

  // Calculate days in range for display
  const daysInRange = useMemo(() => {
    return calculateDaysDiff(dateRange.from, dateRange.to);
  }, [dateRange]);

  // Calculate custom days for modal preview
  const customDays = useMemo(() => {
    if (!customFrom || !customTo) return 0;
    return calculateDaysDiff(customFrom, customTo);
  }, [customFrom, customTo]);

  return (
    <>
      <div
        className="glass-card"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '8px 12px',
          flexWrap: 'wrap',
        }}
      >
        {/* Date Range Inputs */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          {/* From Date */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(39, 39, 42, 0.5)',
              border: '1px solid rgba(63, 63, 70, 0.5)',
            }}
          >
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#71717a',
              }}
            >
              Desde
            </span>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <HiCalendar style={{ width: '14px', height: '14px', color: '#ffffff' }} />
                <input
                  type="date"
                  value={dateRange.from}
                  max={today}
                  onChange={handleFromChange}
                  aria-label="Fecha desde"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#fafafa',
                }}
              >
                {formatDisplayDate(dateRange.from)}
              </span>
            </div>
          </div>

          {/* Arrow */}
          <span
            style={{
              color: '#52525b',
              fontSize: '1rem',
            }}
          >
            →
          </span>

          {/* To Date */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              borderRadius: '10px',
              backgroundColor: 'rgba(39, 39, 42, 0.5)',
              border: '1px solid rgba(63, 63, 70, 0.5)',
            }}
          >
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.75rem',
                fontWeight: 500,
                color: '#71717a',
              }}
            >
              Hasta
            </span>
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                <HiCalendar style={{ width: '14px', height: '14px', color: '#ffffff' }} />
                <input
                  type="date"
                  value={dateRange.to}
                  max={today}
                  onChange={handleToChange}
                  aria-label="Fecha hasta"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    width: '100%',
                    height: '100%',
                  }}
                />
              </div>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: '#fafafa',
                }}
              >
                {formatDisplayDate(dateRange.to)}
              </span>
            </div>
          </div>

          {/* Days count badge */}
          <span
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '0.6875rem',
              fontWeight: 500,
              color: daysInRange > MAX_DAYS ? '#f87171' : '#a1a1aa',
              padding: '4px 8px',
              borderRadius: '6px',
              backgroundColor: daysInRange > MAX_DAYS ? 'rgba(239, 68, 68, 0.1)' : 'rgba(39, 39, 42, 0.5)',
            }}
          >
            {daysInRange} {daysInRange === 1 ? 'día' : 'días'}
          </span>
        </div>

        {/* Divider */}
        <div
          style={{
            width: '1px',
            height: '28px',
            backgroundColor: '#3f3f46',
          }}
        />

        {/* Presets */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
          }}
        >
          {presets.map((preset) => {
            const isActive = activePreset === preset.key;
            return (
              <button
                key={preset.key}
                onClick={() => handlePresetClick(preset)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                  backgroundColor: isActive ? '#f59e0b' : 'rgba(39, 39, 42, 0.5)',
                  color: isActive ? '#0a0a0b' : '#a1a1aa',
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(245, 158, 11, 0.2)';
                    e.currentTarget.style.color = '#f59e0b';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(39, 39, 42, 0.5)';
                    e.currentTarget.style.color = '#a1a1aa';
                  }
                }}
              >
                {preset.label}
              </button>
            );
          })}

          {/* Custom/Personalizar button */}
          <button
            onClick={openCustomModal}
            style={{
              padding: '8px 12px',
              borderRadius: '10px',
              border: isCustomActive ? 'none' : '1px dashed rgba(139, 92, 246, 0.5)',
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.8125rem',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms',
              backgroundColor: isCustomActive ? '#8b5cf6' : 'transparent',
              color: isCustomActive ? '#ffffff' : '#8b5cf6',
            }}
            onMouseEnter={(e) => {
              if (!isCustomActive) {
                e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.15)';
                e.currentTarget.style.borderColor = '#8b5cf6';
              }
            }}
            onMouseLeave={(e) => {
              if (!isCustomActive) {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
              }
            }}
          >
            Personalizar
          </button>
        </div>
      </div>

      {/* Custom Date Range Modal - Rendered via Portal */}
      <CustomDateModal
        isOpen={showCustomModal}
        onClose={closeCustomModal}
        customFrom={customFrom}
        customTo={customTo}
        onFromChange={setCustomFrom}
        onToChange={setCustomTo}
        onApply={handleApplyCustomRange}
        validationError={validationError}
        customDays={customDays}
        today={today}
      />
    </>
  );
};

export default memo(DateRangeSelector);
