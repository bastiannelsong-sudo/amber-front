import { FC, useEffect, useRef } from 'react';
import { HiX, HiExternalLink, HiUser, HiCube, HiCurrencyDollar, HiTruck, HiDocumentText } from 'react-icons/hi';
import type { OrderSummary } from '../../types/sales.types';

interface Props {
  order: OrderSummary | null;
  isOpen: boolean;
  onClose: () => void;
}

// Status config
const getStatusConfig = (status: string) => {
  const configs: Record<string, { bg: string; color: string; border: string; label: string }> = {
    paid: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)', label: 'Pagado' },
    approved: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: 'rgba(16, 185, 129, 0.3)', label: 'Aprobado' },
    pending: { bg: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: 'rgba(245, 158, 11, 0.3)', label: 'Pendiente' },
    cancelled: { bg: 'rgba(239, 68, 68, 0.1)', color: '#f87171', border: 'rgba(239, 68, 68, 0.3)', label: 'Cancelado' },
    refunded: { bg: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', border: 'rgba(139, 92, 246, 0.3)', label: 'Reembolsado' },
  };
  return configs[status] || { bg: 'rgba(113, 113, 122, 0.1)', color: '#a1a1aa', border: 'rgba(113, 113, 122, 0.3)', label: status };
};

// Logistic type config
const getLogisticConfig = (type: string) => {
  const flexConfig = { bg: 'rgba(14, 165, 233, 0.1)', color: '#38bdf8', icon: '⚡', label: 'Flex' };
  const centroEnvioConfig = { bg: 'rgba(113, 113, 122, 0.1)', color: '#a1a1aa', icon: '🏢', label: 'Centro de Envío' };

  const configs: Record<string, { bg: string; color: string; icon: string; label: string }> = {
    fulfillment: { bg: 'rgba(16, 185, 129, 0.1)', color: '#34d399', icon: '📦', label: 'Full' },
    cross_docking: flexConfig,
    self_service: flexConfig, // self_service = Flex (seller uses own courier, buyer pays shipping)
    cross_docking_cost: flexConfig, // Free shipping >$20k, seller pays shipping (cost, not income)
    self_service_cost: flexConfig, // Free shipping >$20k, seller pays shipping (cost, not income)
    xd_drop_off: centroEnvioConfig, // ML uses this for drop-off at collection point (ML charges)
    other: centroEnvioConfig,
  };
  return configs[type] || configs.other;
};

const OrderDetailModal: FC<Props> = ({ order, isOpen, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen || !order) return null;

  // Debug: Log buyer data
  console.log('[OrderDetailModal] Order buyer data:', order.buyer);
  console.log('[OrderDetailModal] Full order:', order);

  const logisticConfig = getLogisticConfig(order.logistic_type);
  const statusConfig = getStatusConfig(order.status);

  // Format date
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        ref={modalRef}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '672px',
          maxHeight: '90vh',
          overflow: 'hidden',
          borderRadius: '24px',
          backgroundColor: '#18181b',
          border: '1px solid #27272a',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Header */}
        <div
          style={{
            position: 'relative',
            padding: '20px 24px',
            borderBottom: '1px solid #27272a',
            background: 'linear-gradient(to right, #18181b, rgba(39, 39, 42, 0.5), #18181b)',
          }}
        >
          {/* Background Glow */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent, rgba(245, 158, 11, 0.05))',
            }}
          />

          <div style={{ position: 'relative', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              {/* Order Icon */}
              <div
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '16px',
                  background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.2)',
                }}
              >
                <HiCube style={{ width: '28px', height: '28px', color: '#ffffff' }} />
              </div>

              {/* Order Info */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <h2 style={{ fontSize: '24px', fontWeight: 700, color: '#ffffff', margin: 0 }}>
                    Orden #{order.id}
                  </h2>
                  {order.pack_id && (
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(139, 92, 246, 0.2)',
                        color: '#a78bfa',
                        fontSize: '12px',
                        fontWeight: 600,
                        border: '1px solid rgba(139, 92, 246, 0.3)',
                      }}
                    >
                      Pack #{order.pack_id}
                    </span>
                  )}
                </div>
                <p style={{ fontSize: '14px', color: '#71717a', textTransform: 'capitalize', margin: '4px 0 0 0' }}>
                  {formatDate(order.date_created || order.date_approved)}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                padding: '8px',
                borderRadius: '12px',
                backgroundColor: '#27272a',
                border: '1px solid #3f3f46',
                color: '#a1a1aa',
                cursor: 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.2)';
                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.5)';
                e.currentTarget.style.color = '#f87171';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#27272a';
                e.currentTarget.style.borderColor = '#3f3f46';
                e.currentTarget.style.color = '#a1a1aa';
              }}
            >
              <HiX style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {/* Badges Row */}
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: 600,
                backgroundColor: logisticConfig.bg,
                color: logisticConfig.color,
                border: `1px solid ${logisticConfig.color}30`,
              }}
            >
              <span>{logisticConfig.icon}</span>
              <span>{logisticConfig.label}</span>
            </span>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                borderRadius: '8px',
                fontSize: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                backgroundColor: statusConfig.bg,
                color: statusConfig.color,
                border: `1px solid ${statusConfig.border}`,
              }}
            >
              {statusConfig.label}
            </span>
          </div>
        </div>

        {/* Content - Scrollable */}
        <div style={{ overflowY: 'auto', maxHeight: 'calc(90vh - 200px)', padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Buyer Info */}
          {order.buyer && (
            <div
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.02))',
                border: '1px solid rgba(139, 92, 246, 0.2)',
                overflow: 'hidden',
              }}
            >
              {/* Buyer Header */}
              <div
                style={{
                  padding: '16px 20px',
                  borderBottom: '1px solid rgba(139, 92, 246, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  {/* Avatar */}
                  <div
                    style={{
                      width: '52px',
                      height: '52px',
                      borderRadius: '14px',
                      background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 4px 12px -2px rgba(139, 92, 246, 0.4)',
                    }}
                  >
                    <span style={{ fontSize: '22px', fontWeight: 700, color: '#ffffff' }}>
                      {order.buyer.first_name?.[0]?.toUpperCase() || order.buyer.nickname?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                  {/* Name */}
                  <div>
                    <p style={{ fontSize: '11px', fontWeight: 600, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
                      Comprador
                    </p>
                    <p style={{ fontSize: '17px', fontWeight: 700, color: '#ffffff', margin: '4px 0 0 0' }}>
                      {order.buyer.first_name && order.buyer.last_name
                        ? `${order.buyer.first_name} ${order.buyer.last_name}`
                        : order.buyer.nickname || 'Sin nombre'}
                    </p>
                  </div>
                </div>
                {/* Profile Link */}
                <a
                  href={`https://perfil.mercadolibre.cl/${order.buyer.nickname}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: '8px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(139, 92, 246, 0.15)',
                    border: '1px solid rgba(139, 92, 246, 0.3)',
                    color: '#a78bfa',
                    fontSize: '13px',
                    fontWeight: 600,
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.25)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(139, 92, 246, 0.15)';
                    e.currentTarget.style.borderColor = 'rgba(139, 92, 246, 0.3)';
                  }}
                >
                  <HiExternalLink style={{ width: '14px', height: '14px' }} />
                  Ver perfil
                </a>
              </div>

              {/* Buyer Details Grid */}
              <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Nickname */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(39, 39, 42, 0.5)',
                    border: '1px solid rgba(63, 63, 70, 0.3)',
                  }}
                >
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    Usuario ML
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7', margin: '4px 0 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
                    @{order.buyer.nickname || '—'}
                  </p>
                </div>

                {/* Buyer ID */}
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: 'rgba(39, 39, 42, 0.5)',
                    border: '1px solid rgba(63, 63, 70, 0.3)',
                  }}
                >
                  <p style={{ fontSize: '11px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                    ID Comprador
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#e4e4e7', margin: '4px 0 0 0', fontFamily: "'JetBrains Mono', monospace" }}>
                    #{order.buyer.id || '—'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Products Section */}
          <div>
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#a1a1aa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '12px',
              }}
            >
              <HiCube style={{ width: '16px', height: '16px' }} />
              Productos ({order.items.length})
            </h3>

            <div style={{ borderRadius: '12px', border: '1px solid #27272a', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(39, 39, 42, 0.5)' }}>
                    <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
                      Producto
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
                      SKU
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: '12px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
                      Cant.
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
                      P. Unit.
                    </th>
                    <th style={{ padding: '12px 16px', textAlign: 'right', fontSize: '12px', fontWeight: 700, color: '#71717a', textTransform: 'uppercase' }}>
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderTop: '1px solid rgba(39, 39, 42, 0.5)',
                        transition: 'background-color 0.2s',
                      }}
                    >
                      <td style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          {/* Thumbnail */}
                          <div
                            style={{
                              width: '48px',
                              height: '48px',
                              borderRadius: '10px',
                              backgroundColor: '#27272a',
                              border: '1px solid #3f3f46',
                              overflow: 'hidden',
                              flexShrink: 0,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            {item.thumbnail ? (
                              <img
                                src={item.thumbnail}
                                alt={item.title}
                                style={{
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                }}
                                loading="lazy"
                              />
                            ) : (
                              <span style={{ fontSize: '22px' }}>📦</span>
                            )}
                          </div>
                          {/* Title */}
                          <p
                            style={{
                              fontSize: '14px',
                              color: '#ffffff',
                              fontWeight: 500,
                              margin: 0,
                              overflow: 'hidden',
                              display: '-webkit-box',
                              WebkitLineClamp: 2,
                              WebkitBoxOrient: 'vertical',
                            }}
                          >
                            {item.title}
                          </p>
                        </div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span
                          style={{
                            fontFamily: 'monospace',
                            fontSize: '12px',
                            color: '#71717a',
                            backgroundColor: '#27272a',
                            padding: '4px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          {item.seller_sku || '—'}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                          {item.quantity}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right', fontSize: '14px', color: '#a1a1aa' }}>
                        {formatCurrency(item.unit_price)}
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>
                          {formatCurrency(item.unit_price * item.quantity)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div>
            <h3
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '14px',
                fontWeight: 700,
                color: '#a1a1aa',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '16px',
              }}
            >
              <HiCurrencyDollar style={{ width: '16px', height: '16px' }} />
              Resumen Financiero
            </h3>

            {/* Main Financial Card */}
            <div
              style={{
                borderRadius: '16px',
                background: 'linear-gradient(135deg, rgba(24, 24, 27, 0.9), rgba(39, 39, 42, 0.6))',
                border: '1px solid rgba(63, 63, 70, 0.5)',
                overflow: 'hidden',
              }}
            >
              {/* Gross Amount - Hero Section */}
              <div
                style={{
                  padding: '24px',
                  background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(16, 185, 129, 0.02))',
                  borderBottom: '1px solid rgba(63, 63, 70, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0.1))',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <HiCurrencyDollar style={{ width: '22px', height: '22px', color: '#34d399' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: '12px', fontWeight: 600, color: '#71717a', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>
                        Venta Bruta
                      </p>
                      <p style={{ fontSize: '11px', color: '#52525b', margin: '2px 0 0 0' }}>
                        Total facturado
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: '28px', fontWeight: 800, color: '#10b981', fontFamily: "'Outfit', sans-serif" }}>
                    {formatCurrency(order.gross_amount)}
                  </span>
                </div>
              </div>

              {/* Deductions Grid */}
              <div style={{ padding: '20px 24px' }}>
                <p style={{ fontSize: '11px', fontWeight: 700, color: '#52525b', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 16px 0' }}>
                  Deducciones y Costos
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Shipping Cost/Income - Flex (income): green, Flex (cost) & Full/Centro: blue */}
                  {(() => {
                    // Flex orders with INCOME (buyer pays shipping to seller)
                    const isFlexWithIncome = order.logistic_type === 'cross_docking' || order.logistic_type === 'self_service';
                    // Flex orders with COST (free shipping >$20k, seller pays)
                    const isFlexWithCost = order.logistic_type === 'cross_docking_cost' || order.logistic_type === 'self_service_cost';
                    // Only show as income if it's a normal Flex order (not the _cost variant)
                    const isShippingIncome = isFlexWithIncome && !isFlexWithCost;

                    const shippingColor = isShippingIncome ? '#34d399' : '#38bdf8';
                    const shippingBgRgba = isShippingIncome ? 'rgba(52, 211, 153, ' : 'rgba(56, 189, 248, ';
                    return (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          borderRadius: '12px',
                          background: `linear-gradient(135deg, ${shippingBgRgba}0.08), ${shippingBgRgba}0.02))`,
                          border: `1px solid ${shippingBgRgba}0.15)`,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div
                            style={{
                              width: '36px',
                              height: '36px',
                              borderRadius: '10px',
                              backgroundColor: `${shippingBgRgba}0.15)`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <HiTruck style={{ width: '18px', height: '18px', color: shippingColor }} />
                          </div>
                          <div>
                            <p style={{ fontSize: '13px', fontWeight: 600, color: shippingColor, margin: 0 }}>
                              {isShippingIncome ? 'Ingreso por Envío' : 'Costo de Envío'}
                            </p>
                            <p style={{ fontSize: '11px', color: '#71717a', margin: '2px 0 0 0' }}>
                              {isShippingIncome ? 'Flex (comprador paga)' : isFlexWithCost ? 'Flex (envío gratis >$20k)' : 'Mercado Envíos'}
                            </p>
                          </div>
                        </div>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: shippingColor, fontFamily: "'JetBrains Mono', monospace" }}>
                          {isShippingIncome ? '+' : '-'} {formatCurrency(order.shipping_cost)}
                        </span>
                      </div>
                    );
                  })()}

                  {/* Marketplace Fee */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(251, 113, 133, 0.08), rgba(251, 113, 133, 0.02))',
                      border: '1px solid rgba(251, 113, 133, 0.15)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(251, 113, 133, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: 700,
                          color: '#fb7185',
                        }}
                      >
                        %
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#fb7185', margin: 0 }}>Comisión ML</p>
                        <p style={{ fontSize: '11px', color: '#71717a', margin: '2px 0 0 0' }}>Fee del marketplace</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#fb7185', fontFamily: "'JetBrains Mono', monospace" }}>
                      - {formatCurrency(order.marketplace_fee)}
                    </span>
                  </div>

                  {/* IVA */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px 16px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, rgba(251, 146, 60, 0.08), rgba(251, 146, 60, 0.02))',
                      border: '1px solid rgba(251, 146, 60, 0.15)',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: 'rgba(251, 146, 60, 0.15)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <HiDocumentText style={{ width: '18px', height: '18px', color: '#fb923c' }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '13px', fontWeight: 600, color: '#fb923c', margin: 0 }}>IVA (19%)</p>
                        <p style={{ fontSize: '11px', color: '#71717a', margin: '2px 0 0 0' }}>Impuesto a la venta</p>
                      </div>
                    </div>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: '#fb923c', fontFamily: "'JetBrains Mono', monospace" }}>
                      - {formatCurrency(order.iva_amount || 0)}
                    </span>
                  </div>

                  {/* Courier Cost - only shows for orders with courier cost (free shipping >$20k) */}
                  {(order.courier_cost || 0) > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08), rgba(139, 92, 246, 0.02))',
                        border: '1px solid rgba(139, 92, 246, 0.15)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(139, 92, 246, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                          }}
                        >
                          🚚
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#a78bfa', margin: 0 }}>Costo Courier</p>
                          <p style={{ fontSize: '11px', color: '#71717a', margin: '2px 0 0 0' }}>Envío externo (vendedor paga)</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#a78bfa', fontFamily: "'JetBrains Mono', monospace" }}>
                        - {formatCurrency(order.courier_cost)}
                      </span>
                    </div>
                  )}

                  {/* Shipping Bonus - only shows for orders with bonus (free shipping >$20k) */}
                  {(order.shipping_bonus || 0) > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '14px 16px',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.08), rgba(52, 211, 153, 0.02))',
                        border: '1px solid rgba(52, 211, 153, 0.15)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div
                          style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '10px',
                            backgroundColor: 'rgba(52, 211, 153, 0.15)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '16px',
                          }}
                        >
                          🎁
                        </div>
                        <div>
                          <p style={{ fontSize: '13px', fontWeight: 600, color: '#34d399', margin: 0 }}>Bonificación ML</p>
                          <p style={{ fontSize: '11px', color: '#71717a', margin: '2px 0 0 0' }}>Compensación por envío gratis</p>
                        </div>
                      </div>
                      <span style={{ fontSize: '16px', fontWeight: 700, color: '#34d399', fontFamily: "'JetBrains Mono', monospace" }}>
                        + {formatCurrency(order.shipping_bonus)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Total Fees Summary */}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: '16px',
                    paddingTop: '16px',
                    borderTop: '1px dashed rgba(63, 63, 70, 0.5)',
                  }}
                >
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#a1a1aa' }}>Total Deducciones</span>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#ef4444', fontFamily: "'JetBrains Mono', monospace" }}>
                    - {formatCurrency(order.shipping_cost + (order.courier_cost || 0) + order.marketplace_fee + (order.iva_amount || 0) - (order.shipping_bonus || 0))}
                  </span>
                </div>
              </div>

              {/* Net Profit - Result Section */}
              <div
                style={{
                  padding: '24px',
                  background: order.net_profit >= 0
                    ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.04))'
                    : 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.04))',
                  borderTop: '1px solid rgba(63, 63, 70, 0.3)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '14px',
                        background: order.net_profit >= 0
                          ? 'linear-gradient(135deg, #10b981, #059669)'
                          : 'linear-gradient(135deg, #ef4444, #dc2626)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: order.net_profit >= 0
                          ? '0 8px 20px -4px rgba(16, 185, 129, 0.4)'
                          : '0 8px 20px -4px rgba(239, 68, 68, 0.4)',
                      }}
                    >
                      <span style={{ fontSize: '24px' }}>{order.net_profit >= 0 ? '💰' : '📉'}</span>
                    </div>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff', margin: 0 }}>Ganancia Neta</p>
                      <p style={{ fontSize: '12px', color: '#71717a', margin: '2px 0 0 0' }}>
                        {order.net_profit >= 0 ? 'Beneficio final' : 'Pérdida en esta venta'}
                      </p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span
                      style={{
                        fontSize: '32px',
                        fontWeight: 800,
                        color: order.net_profit >= 0 ? '#34d399' : '#f87171',
                        fontFamily: "'Outfit', sans-serif",
                        textShadow: order.net_profit >= 0
                          ? '0 0 40px rgba(52, 211, 153, 0.3)'
                          : '0 0 40px rgba(248, 113, 113, 0.3)',
                      }}
                    >
                      {formatCurrency(order.net_profit)}
                    </span>
                  </div>
                </div>

                {/* Profit Margin Visual */}
                <div
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(0, 0, 0, 0.2)',
                    border: '1px solid rgba(63, 63, 70, 0.3)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '20px' }}>📊</span>
                      <span style={{ fontSize: '13px', fontWeight: 600, color: '#d4d4d8' }}>Distribución del Total</span>
                    </div>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 700,
                        color: '#a1a1aa',
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {formatCurrency(order.gross_amount)}
                    </span>
                  </div>

                  {/* Stacked Bar - Distribution */}
                  <div style={{ marginBottom: '16px' }}>
                    <div
                      style={{
                        height: '32px',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        display: 'flex',
                        backgroundColor: 'rgba(63, 63, 70, 0.3)',
                      }}
                    >
                      {/* Net Profit */}
                      <div
                        style={{
                          width: `${Math.max((order.net_profit / order.gross_amount) * 100, 0)}%`,
                          height: '100%',
                          background: 'linear-gradient(180deg, #34d399, #10b981)',
                          transition: 'width 1s ease-out',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: order.net_profit > 0 ? '40px' : '0',
                        }}
                      >
                        {order.net_profit > 0 && (order.net_profit / order.gross_amount) * 100 > 15 && (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#064e3b' }}>
                            {((order.net_profit / order.gross_amount) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      {/* Shipping */}
                      <div
                        style={{
                          width: `${(order.shipping_cost / order.gross_amount) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(180deg, #38bdf8, #0ea5e9)',
                          transition: 'width 1s ease-out',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: order.shipping_cost > 0 ? '30px' : '0',
                        }}
                      >
                        {(order.shipping_cost / order.gross_amount) * 100 > 10 && (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#0c4a6e' }}>
                            {((order.shipping_cost / order.gross_amount) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      {/* Commission */}
                      <div
                        style={{
                          width: `${(order.marketplace_fee / order.gross_amount) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(180deg, #fb7185, #e11d48)',
                          transition: 'width 1s ease-out',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: order.marketplace_fee > 0 ? '30px' : '0',
                        }}
                      >
                        {(order.marketplace_fee / order.gross_amount) * 100 > 10 && (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#881337' }}>
                            {((order.marketplace_fee / order.gross_amount) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                      {/* IVA */}
                      <div
                        style={{
                          width: `${((order.iva_amount || 0) / order.gross_amount) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(180deg, #fb923c, #ea580c)',
                          transition: 'width 1s ease-out',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          minWidth: (order.iva_amount || 0) > 0 ? '30px' : '0',
                        }}
                      >
                        {((order.iva_amount || 0) / order.gross_amount) * 100 > 10 && (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#7c2d12' }}>
                            {(((order.iva_amount || 0) / order.gross_amount) * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    {/* Net Profit */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(180deg, #34d399, #10b981)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#34d399' }}>Ganancia</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#34d399', fontFamily: "'JetBrains Mono', monospace" }}>
                        {order.profit_margin.toFixed(1)}%
                      </span>
                    </div>

                    {/* Shipping */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(56, 189, 248, 0.1)',
                        border: '1px solid rgba(56, 189, 248, 0.2)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(180deg, #38bdf8, #0ea5e9)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#38bdf8' }}>Envío</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#38bdf8', fontFamily: "'JetBrains Mono', monospace" }}>
                        {((order.shipping_cost / order.gross_amount) * 100).toFixed(1)}%
                      </span>
                    </div>

                    {/* Commission */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(251, 113, 133, 0.1)',
                        border: '1px solid rgba(251, 113, 133, 0.2)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(180deg, #fb7185, #e11d48)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#fb7185' }}>Comisión</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fb7185', fontFamily: "'JetBrains Mono', monospace" }}>
                        {((order.marketplace_fee / order.gross_amount) * 100).toFixed(1)}%
                      </span>
                    </div>

                    {/* IVA */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(251, 146, 60, 0.1)',
                        border: '1px solid rgba(251, 146, 60, 0.2)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: 'linear-gradient(180deg, #fb923c, #ea580c)' }} />
                        <span style={{ fontSize: '12px', fontWeight: 600, color: '#fb923c' }}>IVA</span>
                      </div>
                      <span style={{ fontSize: '12px', fontWeight: 700, color: '#fb923c', fontFamily: "'JetBrains Mono', monospace" }}>
                        {(((order.iva_amount || 0) / order.gross_amount) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #27272a',
            backgroundColor: 'rgba(24, 24, 27, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <a
            href={`https://www.mercadolibre.cl/ventas/${order.pack_id || order.id}/detalle`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              borderRadius: '12px',
              backgroundColor: '#27272a',
              border: '1px solid #3f3f46',
              color: '#a1a1aa',
              fontSize: '14px',
              fontWeight: 500,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(14, 165, 233, 0.2)';
              e.currentTarget.style.borderColor = 'rgba(14, 165, 233, 0.5)';
              e.currentTarget.style.color = '#38bdf8';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#27272a';
              e.currentTarget.style.borderColor = '#3f3f46';
              e.currentTarget.style.color = '#a1a1aa';
            }}
          >
            <HiExternalLink style={{ width: '16px', height: '16px' }} />
            Ver en Mercado Libre
          </a>

          <button
            onClick={onClose}
            style={{
              padding: '10px 24px',
              borderRadius: '12px',
              background: 'linear-gradient(to right, #f59e0b, #ea580c)',
              color: '#18181b',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s',
              boxShadow: '0 10px 15px -3px rgba(245, 158, 11, 0.2)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(245, 158, 11, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(245, 158, 11, 0.2)';
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailModal;
