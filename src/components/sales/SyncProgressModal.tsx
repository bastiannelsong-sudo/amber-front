import { FC, memo } from 'react';
import { HiRefresh, HiX, HiCheckCircle, HiExclamationCircle } from 'react-icons/hi';
import type { SyncProgress } from '../../hooks/useSyncDateRange';

interface Props {
  progress: SyncProgress;
  onCancel: () => void;
  onClose: () => void;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  // Handle date range format "YYYY-MM-DD → YYYY-MM-DD"
  if (dateStr.includes('→')) {
    const [from, to] = dateStr.split(' → ');
    if (from && to) {
      const fromDate = new Date(from.trim() + 'T12:00:00');
      const toDate = new Date(to.trim() + 'T12:00:00');
      const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short' };
      return `${fromDate.toLocaleDateString('es-CL', options)} → ${toDate.toLocaleDateString('es-CL', options)}`;
    }
  }
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-CL', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const SyncProgressModal: FC<Props> = ({ progress, onCancel, onClose }) => {
  const { isSync, currentDay, totalDays, currentDate, percentage, syncedOrders, statusChanges, error, phase } = progress;

  const isComplete = !isSync && phase === 'complete';
  const hasError = !isSync && error;

  // Don't render if not syncing and no final state to show
  if (!isSync && phase === 'idle') {
    return null;
  }

  // Phase label shown during sync
  const getPhaseLabel = (): string => {
    if (phase === 'syncing') return 'Sincronizando órdenes...';
    if (phase === 'status_changes') return 'Verificando cambios de estado...';
    if (phase === 'complete') return 'Sincronización completada';
    if (phase === 'error') return 'Error en sincronización';
    return '';
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '400px',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '20px',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {isSync && (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: 'spin 1s linear infinite',
              }}
            >
              <HiRefresh style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
          )}
          {isComplete && (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HiCheckCircle style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
          )}
          {hasError && (
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HiExclamationCircle style={{ width: '20px', height: '20px', color: '#ffffff' }} />
            </div>
          )}
          <div>
            <h2
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.25rem',
                fontWeight: 700,
                color: '#fafafa',
                margin: 0,
              }}
            >
              {getPhaseLabel()}
            </h2>
            {isSync && phase === 'syncing' && (
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.75rem',
                  color: '#71717a',
                  margin: '4px 0 0 0',
                }}
              >
                {totalDays} día{totalDays !== 1 ? 's' : ''} · 3 en paralelo
              </p>
            )}
          </div>
        </div>

        {/* Progress Info */}
        {(isSync || isComplete) && (
          <div
            style={{
              width: '100%',
              textAlign: 'center',
            }}
          >
            {phase === 'syncing' && (
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#a1a1aa',
                  margin: '0 0 4px 0',
                }}
              >
                Día {currentDay} de {totalDays}
              </p>
            )}
            {phase === 'status_changes' && (
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: '#a1a1aa',
                  margin: '0 0 4px 0',
                }}
              >
                Buscando cancelaciones y devoluciones...
              </p>
            )}
            <p
              style={{
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#fafafa',
                margin: 0,
              }}
            >
              {formatDate(currentDate)}
            </p>
          </div>
        )}

        {/* Progress Bar */}
        {(isSync || isComplete) && (
          <div
            style={{
              width: '100%',
              height: '8px',
              backgroundColor: 'rgba(39, 39, 42, 0.8)',
              borderRadius: '4px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${percentage}%`,
                height: '100%',
                background: isComplete
                  ? 'linear-gradient(90deg, #10b981, #059669)'
                  : phase === 'status_changes'
                    ? 'linear-gradient(90deg, #f59e0b, #ea580c)'
                    : 'linear-gradient(90deg, #3b82f6, #8b5cf6)',
                borderRadius: '4px',
                transition: 'width 300ms ease-out',
              }}
            />
          </div>
        )}

        {/* Percentage */}
        {(isSync || isComplete) && (
          <p
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: '2rem',
              fontWeight: 700,
              color: isComplete ? '#10b981' : phase === 'status_changes' ? '#f59e0b' : '#3b82f6',
              margin: 0,
            }}
          >
            {percentage}%
          </p>
        )}

        {/* Synced Orders Count */}
        {(isSync || isComplete) && (
          <div style={{ textAlign: 'center' }}>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#71717a',
                margin: 0,
              }}
            >
              {syncedOrders} órdenes sincronizadas
            </p>
            {isComplete && statusChanges > 0 && (
              <p
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: '0.8125rem',
                  fontWeight: 500,
                  color: '#f59e0b',
                  margin: '4px 0 0 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <span style={{
                  display: 'inline-block',
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#f59e0b'
                }} />
                {statusChanges} cambios de estado detectados
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {hasError && (
          <p
            style={{
              fontFamily: "'Outfit', sans-serif",
              fontSize: '0.875rem',
              fontWeight: 500,
              color: '#ef4444',
              margin: 0,
              textAlign: 'center',
            }}
          >
            {error}
          </p>
        )}

        {/* Buttons */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '8px',
          }}
        >
          {isSync && (
            <button
              onClick={onCancel}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#ef4444',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              }}
            >
              <HiX style={{ width: '16px', height: '16px' }} />
              Cancelar
            </button>
          )}
          {(isComplete || hasError) && (
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: isComplete ? '#10b981' : '#3f3f46',
                color: '#ffffff',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = '0.9';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* CSS for spin animation */}
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default memo(SyncProgressModal);
