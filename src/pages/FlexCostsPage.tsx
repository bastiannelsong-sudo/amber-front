import { FC, useState, useMemo, useCallback, memo, useEffect } from 'react';
import { HiPlus, HiTrash, HiPencil, HiTruck, HiCurrencyDollar, HiDocumentText } from 'react-icons/hi';
import { useAuthStore } from '../store/authStore';
import { useApplyTheme } from '../store/themeStore';
import AppHeader from '../components/layout/AppHeader';
import { flexCostService } from '../services/flex-cost.service';
import type { FlexCostSummary, CreateFlexCostDto } from '../types/flex-cost.types';
import { formatYearMonth, getLastMonths, getYearMonth } from '../types/flex-cost.types';
import '../styles/dashboard.css';

// Get current month as default
const getCurrentMonth = (): string => getYearMonth(new Date());

const FlexCostsPage: FC = () => {
  useApplyTheme();

  const user = useAuthStore((state) => state.user);
  const sellerId = user?.userId ? parseInt(user.userId) : 0;

  const [costs, setCosts] = useState<FlexCostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCost, setEditingCost] = useState<FlexCostSummary | null>(null);
  const [formData, setFormData] = useState({
    year_month: getCurrentMonth(),
    total_with_iva: '',
    notes: '',
  });
  const [isSaving, setIsSaving] = useState(false);

  // Load costs
  const loadCosts = useCallback(async () => {
    if (!sellerId) return;

    setIsLoading(true);
    setError(null);

    try {
      const data = await flexCostService.getAll(sellerId);
      setCosts(data);
    } catch (err) {
      setError('Error al cargar los costos. Intenta nuevamente.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [sellerId]);

  useEffect(() => {
    loadCosts();
  }, [loadCosts]);

  // Open modal for new cost
  const handleOpenNew = useCallback(() => {
    setEditingCost(null);
    setFormData({
      year_month: getCurrentMonth(),
      total_with_iva: '',
      notes: '',
    });
    setIsModalOpen(true);
  }, []);

  // Open modal for editing
  const handleEdit = useCallback((cost: FlexCostSummary) => {
    setEditingCost(cost);
    setFormData({
      year_month: cost.year_month,
      total_with_iva: cost.total_cost.toString(),
      notes: cost.notes || '',
    });
    setIsModalOpen(true);
  }, []);

  // Close modal
  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCost(null);
  }, []);

  // Handle form changes
  const handleFormChange = useCallback(
    (field: string, value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Save cost
  const handleSave = useCallback(async () => {
    if (!sellerId) return;

    const totalWithIva = parseFloat(formData.total_with_iva);
    if (isNaN(totalWithIva) || totalWithIva <= 0) {
      setError('Ingresa un monto válido');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const dto: CreateFlexCostDto = {
        seller_id: sellerId,
        year_month: formData.year_month,
        total_with_iva: totalWithIva,
        notes: formData.notes || undefined,
      };

      await flexCostService.upsert(dto);
      await loadCosts();
      handleCloseModal();
    } catch (err) {
      setError('Error al guardar. Intenta nuevamente.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  }, [sellerId, formData, loadCosts, handleCloseModal]);

  // Delete cost
  const handleDelete = useCallback(
    async (cost: FlexCostSummary) => {
      if (!sellerId) return;
      if (!confirm(`¿Eliminar costo de ${formatYearMonth(cost.year_month)}?`)) return;

      try {
        await flexCostService.delete(sellerId, cost.year_month);
        await loadCosts();
      } catch (err) {
        setError('Error al eliminar. Intenta nuevamente.');
        console.error(err);
      }
    },
    [sellerId, loadCosts]
  );

  // Available months for dropdown (last 24 months)
  const availableMonths = useMemo(() => getLastMonths(24), []);

  // Calculate totals
  const totals = useMemo(() => {
    return costs.reduce(
      (acc, cost) => ({
        net_cost: acc.net_cost + cost.net_cost,
        iva_amount: acc.iva_amount + cost.iva_amount,
        total_cost: acc.total_cost + cost.total_cost,
        flex_orders: acc.flex_orders + cost.flex_orders_count,
      }),
      { net_cost: 0, iva_amount: 0, total_cost: 0, flex_orders: 0 }
    );
  }, [costs]);

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
                    background: 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 0 40px -10px rgba(14, 165, 233, 0.5)',
                  }}
                >
                  <HiTruck style={{ width: '28px', height: '28px', color: '#fff' }} />
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
                    Costos Envío Flex
                  </h1>
                  <p className="text-body" style={{ color: 'var(--text-tertiary)', margin: 0 }}>
                    Gestiona los costos mensuales de envío Flex
                  </p>
                </div>
              </div>
            </div>

            <button onClick={handleOpenNew} className="btn-primary">
              <HiPlus style={{ width: '18px', height: '18px' }} />
              <span>Agregar Costo</span>
            </button>
          </div>
        </header>

        {/* Summary Cards */}
        <section className="animate-fade-up stagger-1" style={{ opacity: 0, marginBottom: '32px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px',
            }}
          >
            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(14, 165, 233, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HiCurrencyDollar style={{ width: '20px', height: '20px', color: '#0ea5e9' }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Total Neto
                </span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
                ${totals.net_cost.toLocaleString('es-CL')}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(251, 146, 60, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HiDocumentText style={{ width: '20px', height: '20px', color: '#fb923c' }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Total IVA
                </span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fb923c', margin: 0 }}>
                ${totals.iva_amount.toLocaleString('es-CL')}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(244, 63, 94, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HiCurrencyDollar style={{ width: '20px', height: '20px', color: '#f43f5e' }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Total con IVA
                </span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f43f5e', margin: 0 }}>
                ${totals.total_cost.toLocaleString('es-CL')}
              </p>
            </div>

            <div className="glass-card" style={{ padding: '20px', borderRadius: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    background: 'rgba(16, 185, 129, 0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <HiTruck style={{ width: '20px', height: '20px', color: '#10b981' }} />
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                  Envíos Flex
                </span>
              </div>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', margin: 0 }}>
                {totals.flex_orders.toLocaleString('es-CL')}
              </p>
            </div>
          </div>
        </section>

        {/* Error message */}
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

        {/* Costs Table */}
        <section className="animate-fade-up stagger-2" style={{ opacity: 0 }}>
          <div className="glass-card" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-tertiary)' }}>Cargando...</p>
              </div>
            ) : costs.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center' }}>
                <p style={{ color: 'var(--text-tertiary)', marginBottom: '16px' }}>
                  No hay costos registrados
                </p>
                <button onClick={handleOpenNew} className="btn-secondary">
                  Agregar primer costo
                </button>
              </div>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      background: 'rgba(39, 39, 42, 0.3)',
                    }}
                  >
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
                      Mes
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Neto
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      IVA
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Total
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Órdenes Flex
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'right', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Costo/Orden
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Notas
                    </th>
                    <th style={{ padding: '16px 20px', textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((cost) => (
                    <tr
                      key={cost.id}
                      style={{
                        borderBottom: '1px solid var(--border-subtle)',
                        transition: 'background 150ms',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(39, 39, 42, 0.3)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                          {formatYearMonth(cost.year_month)}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-primary)' }}>
                        ${cost.net_cost.toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#fb923c' }}>
                        ${cost.iva_amount.toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#f43f5e' }}>
                        ${cost.total_cost.toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        {cost.flex_orders_count}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", color: '#0ea5e9' }}>
                        ${cost.cost_per_order.toLocaleString('es-CL')}
                      </td>
                      <td style={{ padding: '16px 20px', color: 'var(--text-tertiary)', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {cost.notes || '-'}
                      </td>
                      <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                          <button
                            onClick={() => handleEdit(cost)}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'rgba(14, 165, 233, 0.1)',
                              color: '#0ea5e9',
                              cursor: 'pointer',
                            }}
                          >
                            <HiPencil style={{ width: '16px', height: '16px' }} />
                          </button>
                          <button
                            onClick={() => handleDelete(cost)}
                            style={{
                              padding: '8px',
                              borderRadius: '8px',
                              border: 'none',
                              background: 'rgba(244, 63, 94, 0.1)',
                              color: '#f43f5e',
                              cursor: 'pointer',
                            }}
                          >
                            <HiTrash style={{ width: '16px', height: '16px' }} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(4px)',
          }}
          onClick={handleCloseModal}
        >
          <div
            className="glass-card"
            style={{
              width: '100%',
              maxWidth: '480px',
              padding: '32px',
              borderRadius: '20px',
              margin: '16px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2
              style={{
                fontSize: '1.5rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
                marginBottom: '24px',
              }}
            >
              {editingCost ? 'Editar Costo Flex' : 'Agregar Costo Flex'}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Month selector */}
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
                  Mes
                </label>
                <select
                  value={formData.year_month}
                  onChange={(e) => handleFormChange('year_month', e.target.value)}
                  disabled={!!editingCost}
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
                  {availableMonths.map((month) => (
                    <option key={month} value={month}>
                      {formatYearMonth(month)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Total with IVA */}
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
                  Total con IVA ($)
                </label>
                <input
                  type="number"
                  value={formData.total_with_iva}
                  onChange={(e) => handleFormChange('total_with_iva', e.target.value)}
                  placeholder="Ej: 150000"
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
                />
                {formData.total_with_iva && !isNaN(parseFloat(formData.total_with_iva)) && (
                  <div
                    style={{
                      marginTop: '8px',
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'rgba(14, 165, 233, 0.1)',
                      fontSize: '0.875rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Neto:</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        ${Math.round(parseFloat(formData.total_with_iva) / 1.19).toLocaleString('es-CL')}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#fb923c', marginTop: '4px' }}>
                      <span>IVA (19%):</span>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                        ${Math.round(parseFloat(formData.total_with_iva) - parseFloat(formData.total_with_iva) / 1.19).toLocaleString('es-CL')}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Notes */}
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
                  Notas (opcional)
                </label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  placeholder="Ej: Factura #12345"
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
                />
              </div>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button
                onClick={handleCloseModal}
                className="btn-secondary"
                style={{ flex: 1 }}
                disabled={isSaving}
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                className="btn-primary"
                style={{ flex: 1 }}
                disabled={isSaving}
              >
                {isSaving ? 'Guardando...' : editingCost ? 'Actualizar' : 'Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default memo(FlexCostsPage);
