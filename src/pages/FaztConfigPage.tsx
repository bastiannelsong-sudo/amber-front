import { FC, useState, useCallback, useEffect, memo } from 'react';
import { HiCog, HiTruck, HiCurrencyDollar, HiCheck, HiRefresh, HiDownload } from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import { useApplyTheme } from '../store/themeStore';
import AppHeader from '../components/layout/AppHeader';
import { faztConfigService } from '../services/fazt-config.service';
import { api } from '../services/api';
import type {
  FaztConfigSummary,
  CurrentRateResult,
  FaztRateTier,
} from '../types/fazt-config.types';
import { DEFAULT_FAZT_TIERS, formatShipmentRange } from '../types/fazt-config.types';
import '../styles/dashboard.css';

interface SyncMonthResult {
  total_synced: number;
  days_processed: number;
  message: string;
  year_month: string;
  seller_id: number;
  details: { date: string; synced: number }[];
}

const FaztConfigPage: FC = () => {
  useApplyTheme();

  const user = useAuthStore((state) => state.user);
  const sellerId = user?.userId ? parseInt(user.userId) : 0;

  const [config, setConfig] = useState<FaztConfigSummary | null>(null);
  const [currentRate, setCurrentRate] = useState<CurrentRateResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Editable state for tiers
  const [editableTiers, setEditableTiers] = useState<FaztRateTier[]>(DEFAULT_FAZT_TIERS);
  const [specialZoneSurcharge, setSpecialZoneSurcharge] = useState(1000);
  const [defaultServiceType, setDefaultServiceType] = useState<'same_day_rm' | 'next_day_v_region'>('same_day_rm');

  // Sync state
  const [syncMonth, setSyncMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<SyncMonthResult | null>(null);

  // Load configuration
  const loadConfig = useCallback(async () => {
    if (!sellerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const [configData, rateData] = await Promise.all([
        faztConfigService.getConfiguration(sellerId),
        faztConfigService.getCurrentRate(sellerId).catch(() => null),
      ]);

      setConfig(configData);
      setCurrentRate(rateData);

      if (configData) {
        setEditableTiers(configData.rate_tiers);
        setSpecialZoneSurcharge(configData.special_zone_surcharge);
        setDefaultServiceType(configData.default_service_type as 'same_day_rm' | 'next_day_v_region');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  // Handle tier change
  const handleTierChange = useCallback(
    (index: number, field: keyof FaztRateTier, value: number | null) => {
      setEditableTiers((prev) =>
        prev.map((tier, i) => (i === index ? { ...tier, [field]: value } : tier))
      );
    },
    []
  );

  // Save configuration
  const handleSave = useCallback(async () => {
    if (!sellerId) return;

    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      await faztConfigService.upsertConfiguration({
        seller_id: sellerId,
        rate_tiers: editableTiers,
        special_zone_surcharge: specialZoneSurcharge,
        default_service_type: defaultServiceType,
      });

      setSuccess('Configuracion guardada correctamente');
      await loadConfig();

      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError('Error al guardar la configuracion');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [sellerId, editableTiers, specialZoneSurcharge, defaultServiceType, loadConfig]);

  // Reset to defaults
  const handleResetDefaults = useCallback(() => {
    setEditableTiers(DEFAULT_FAZT_TIERS);
    setSpecialZoneSurcharge(1000);
    setDefaultServiceType('same_day_rm');
  }, []);

  // Sync month from MercadoLibre
  const handleSyncMonth = useCallback(async () => {
    if (!sellerId || !syncMonth) return;

    setIsSyncing(true);
    setError(null);
    setSyncResult(null);

    try {
      // Use a longer timeout (10 minutes) for monthly sync as it can take a while
      const response = await api.get('/orders/sync-month', {
        params: {
          year_month: syncMonth,
          seller_id: sellerId,
        },
        timeout: 600000, // 10 minutes
      });

      setSyncResult(response.data);
      setSuccess(`Se sincronizaron ${response.data.total_synced} ordenes de ${response.data.days_processed} dias`);

      // Reload config to update current rate
      await loadConfig();

      setTimeout(() => setSuccess(null), 5000);
    } catch (err: any) {
      const errorMsg = err.code === 'ECONNABORTED'
        ? 'La sincronizacion tomo demasiado tiempo. Intenta con un mes con menos ordenes.'
        : err.response?.data?.message || 'Error al sincronizar ordenes';
      setError(errorMsg);
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  }, [sellerId, syncMonth, loadConfig]);

  return (
    <div className="dashboard-root">
      <div className="dashboard-grid-overlay" />
      <AppHeader />

      <div
        style={{
          position: 'relative',
          zIndex: 10,
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '32px 24px',
          paddingTop: '100px',
        }}
      >
        {/* Page Header */}
        <header className="animate-fade-up" style={{ marginBottom: '40px' }}>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '24px',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '8px' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '16px',
                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 40px -10px rgba(139, 92, 246, 0.5)',
                  }}
                >
                  <HiCog style={{ width: '28px', height: '28px', color: '#fff' }} />
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
                    Configuracion Fazt
                  </h1>
                  <p className="text-body" style={{ color: 'var(--text-tertiary)', margin: 0 }}>
                    Tarifas de envio segun volumen mensual
                  </p>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={handleResetDefaults} className="btn-secondary">
                <HiRefresh style={{ width: '18px', height: '18px' }} />
                <span>Restaurar</span>
              </button>
              <button onClick={handleSave} className="btn-primary" disabled={isSaving}>
                <HiCheck style={{ width: '18px', height: '18px' }} />
                <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Success/Error messages */}
        {success && (
          <div
            style={{
              padding: '16px',
              marginBottom: '24px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#10b981',
            }}
          >
            {success}
          </div>
        )}
        {error && (
          <div
            style={{
              padding: '16px',
              marginBottom: '24px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.1)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              color: '#f43f5e',
            }}
          >
            {error}
          </div>
        )}

        {/* Current Rate Card */}
        {currentRate && (
          <section className="animate-fade-up stagger-1" style={{ opacity: 0, marginBottom: '32px' }}>
            <div
              className="glass-card"
              style={{
                padding: '24px',
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.1), rgba(124, 58, 237, 0.05))',
                border: '1px solid rgba(139, 92, 246, 0.2)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <HiTruck style={{ width: '24px', height: '24px', color: '#8b5cf6' }} />
                <span style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                  Estado Actual - {currentRate.year_month}
                </span>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '20px',
                }}
              >
                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Envios Este Mes
                  </p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: '#8b5cf6', margin: 0 }}>
                    {currentRate.shipments_count}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Tarifa Same Day RM
                  </p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: '#10b981', margin: 0 }}>
                    ${currentRate.same_day_rm_rate.toLocaleString('es-CL')}
                  </p>
                </div>

                <div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                    Tarifa Next Day V Region
                  </p>
                  <p style={{ fontSize: '2rem', fontWeight: 700, color: '#0ea5e9', margin: 0 }}>
                    ${currentRate.next_day_v_region_rate.toLocaleString('es-CL')}
                  </p>
                </div>

                {currentRate.current_tier && (
                  <div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginBottom: '4px', textTransform: 'uppercase' }}>
                      Rango Actual
                    </p>
                    <p style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                      {formatShipmentRange(currentRate.current_tier)} envios
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Rate Tiers Table */}
        <section className="animate-fade-up stagger-2" style={{ opacity: 0, marginBottom: '32px' }}>
          <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-subtle)',
                background: 'rgba(39, 39, 42, 0.3)',
              }}
            >
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Tarifas por Volumen (sin IVA)
              </h2>
            </div>

            {isLoading ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-tertiary)' }}>Cargando...</p>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <th
                      style={{
                        padding: '16px 20px',
                        textAlign: 'left',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Envios Mensuales
                    </th>
                    <th
                      style={{
                        padding: '16px 20px',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Same Day R.M.
                    </th>
                    <th
                      style={{
                        padding: '16px 20px',
                        textAlign: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        color: 'var(--text-tertiary)',
                        textTransform: 'uppercase',
                      }}
                    >
                      Next Day V Region
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {editableTiers.map((tier, index) => (
                    <tr
                      key={index}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        background:
                          currentRate?.current_tier &&
                          tier.min_shipments === currentRate.current_tier.min_shipments
                            ? 'rgba(139, 92, 246, 0.1)'
                            : 'transparent',
                      }}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formatShipmentRange(tier)}
                        </span>
                        {currentRate?.current_tier &&
                          tier.min_shipments === currentRate.current_tier.min_shipments && (
                            <span
                              style={{
                                marginLeft: '8px',
                                padding: '2px 8px',
                                borderRadius: '4px',
                                fontSize: '0.7rem',
                                fontWeight: 600,
                                background: 'rgba(139, 92, 246, 0.2)',
                                color: '#8b5cf6',
                              }}
                            >
                              ACTUAL
                            </span>
                          )}
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <span style={{ color: 'var(--text-tertiary)' }}>$</span>
                          <input
                            type="number"
                            value={tier.same_day_rm}
                            onChange={(e) =>
                              handleTierChange(index, 'same_day_rm', parseInt(e.target.value) || 0)
                            }
                            style={{
                              width: '100px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-subtle)',
                              background: 'var(--surface-elevated)',
                              color: '#10b981',
                              fontSize: '1rem',
                              fontFamily: "'JetBrains Mono', monospace",
                              textAlign: 'right',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                          <span style={{ color: 'var(--text-tertiary)' }}>$</span>
                          <input
                            type="number"
                            value={tier.next_day_v_region}
                            onChange={(e) =>
                              handleTierChange(index, 'next_day_v_region', parseInt(e.target.value) || 0)
                            }
                            style={{
                              width: '100px',
                              padding: '8px 12px',
                              borderRadius: '8px',
                              border: '1px solid var(--border-subtle)',
                              background: 'var(--surface-elevated)',
                              color: '#0ea5e9',
                              fontSize: '1rem',
                              fontFamily: "'JetBrains Mono', monospace",
                              textAlign: 'right',
                              outline: 'none',
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>

        {/* Additional Settings */}
        <section className="animate-fade-up stagger-3" style={{ opacity: 0 }}>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <h2 style={{ margin: '0 0 20px 0', fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              Configuracion Adicional
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '24px' }}>
              {/* Special Zone Surcharge */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Recargo Zona Especial (Colina, Padre Hurtado)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--text-tertiary)' }}>$</span>
                  <input
                    type="number"
                    value={specialZoneSurcharge}
                    onChange={(e) => setSpecialZoneSurcharge(parseInt(e.target.value) || 0)}
                    style={{
                      width: '120px',
                      padding: '12px 16px',
                      borderRadius: '12px',
                      border: '1px solid var(--border-subtle)',
                      background: 'var(--surface-elevated)',
                      color: 'var(--text-primary)',
                      fontSize: '1rem',
                      fontFamily: "'JetBrains Mono', monospace",
                      outline: 'none',
                    }}
                  />
                  <span style={{ color: 'var(--text-tertiary)', fontSize: '0.875rem' }}>+ IVA</span>
                </div>
              </div>

              {/* Default Service Type */}
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Tipo de Servicio por Defecto
                </label>
                <select
                  value={defaultServiceType}
                  onChange={(e) => setDefaultServiceType(e.target.value as 'same_day_rm' | 'next_day_v_region')}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--surface-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    outline: 'none',
                  }}
                >
                  <option value="same_day_rm">Same Day - Region Metropolitana</option>
                  <option value="next_day_v_region">Next Day - V Region</option>
                </select>
              </div>
            </div>

            <div
              style={{
                marginTop: '20px',
                padding: '16px',
                borderRadius: '12px',
                background: 'rgba(251, 146, 60, 0.1)',
                border: '1px solid rgba(251, 146, 60, 0.2)',
              }}
            >
              <p style={{ margin: 0, fontSize: '0.875rem', color: '#fb923c' }}>
                <strong>Nota:</strong> Las tarifas son sin IVA. El sistema agregara automaticamente el 19% al calcular los costos.
                Los recargos por zona especial se aplican cuando el destino es Colina o Padre Hurtado.
              </p>
            </div>
          </div>
        </section>

        {/* Monthly Sync Section */}
        <section className="animate-fade-up stagger-4" style={{ opacity: 0, marginTop: '32px' }}>
          <div className="glass-card" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <HiDownload style={{ width: '24px', height: '24px', color: '#0ea5e9' }} />
              <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                Sincronizar Ventas de MercadoLibre
              </h2>
            </div>

            <p style={{ color: 'var(--text-tertiary)', marginBottom: '20px', fontSize: '0.875rem' }}>
              Sincroniza todas las ventas de un mes especifico desde MercadoLibre.
              Esto recalculara los costos de Fazt para todas las ordenes Flex del mes.
            </p>

            <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'flex-end', gap: '16px' }}>
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'var(--text-secondary)',
                    marginBottom: '8px',
                  }}
                >
                  Mes a Sincronizar
                </label>
                <input
                  type="month"
                  value={syncMonth}
                  onChange={(e) => setSyncMonth(e.target.value)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '12px',
                    border: '1px solid var(--border-subtle)',
                    background: 'var(--surface-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '1rem',
                    outline: 'none',
                    minWidth: '200px',
                  }}
                />
              </div>

              <button
                onClick={handleSyncMonth}
                disabled={isSyncing || !config}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  opacity: isSyncing || !config ? 0.6 : 1,
                  cursor: isSyncing || !config ? 'not-allowed' : 'pointer',
                }}
              >
                <HiDownload style={{ width: '18px', height: '18px' }} />
                <span>{isSyncing ? 'Sincronizando...' : 'Sincronizar Mes'}</span>
              </button>
            </div>

            {!config && (
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 16px',
                  borderRadius: '8px',
                  background: 'rgba(251, 146, 60, 0.1)',
                  border: '1px solid rgba(251, 146, 60, 0.2)',
                }}
              >
                <p style={{ margin: 0, fontSize: '0.875rem', color: '#fb923c' }}>
                  Primero debes guardar una configuracion de tarifas antes de sincronizar.
                </p>
              </div>
            )}

            {isSyncing && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(14, 165, 233, 0.1)',
                  border: '1px solid rgba(14, 165, 233, 0.2)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      border: '3px solid rgba(14, 165, 233, 0.3)',
                      borderTopColor: '#0ea5e9',
                      animation: 'spin 1s linear infinite',
                    }}
                  />
                  <span style={{ color: '#0ea5e9', fontWeight: 500 }}>
                    Sincronizando ordenes... Esto puede tomar varios minutos.
                  </span>
                </div>
              </div>
            )}

            {syncResult && !isSyncing && (
              <div
                style={{
                  marginTop: '20px',
                  padding: '16px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.1)',
                  border: '1px solid rgba(16, 185, 129, 0.2)',
                }}
              >
                <p style={{ margin: '0 0 12px 0', fontSize: '1rem', fontWeight: 600, color: '#10b981' }}>
                  Sincronizacion Completada
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Total Ordenes
                    </p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: '#10b981' }}>
                      {syncResult.total_synced}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Dias Procesados
                    </p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {syncResult.days_processed}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Mes
                    </p>
                    <p style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {syncResult.year_month}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
};

export default memo(FaztConfigPage);
