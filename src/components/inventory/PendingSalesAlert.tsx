import { FC, useState } from 'react';
import { HiExclamation } from 'react-icons/hi';
import { usePendingSales } from '../../hooks/usePendingSales';
import { useNavigate } from 'react-router-dom';
import type { PendingSale } from '../../types/product.types';

interface PendingSaleItemProps {
  sale: PendingSale;
  onMap: (sale: PendingSale) => void;
}

const PendingSaleItem: FC<PendingSaleItemProps> = ({ sale, onMap }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-CL', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPlatformBadge = (platformName: string) => {
    const colors: Record<string, string> = {
      'Mercado Libre': 'bg-yellow-400 text-gray-900',
      'Falabella': 'bg-green-600 text-white',
    };

    return (
      <span
        className={`px-2 py-1 rounded text-xs font-semibold ${
          colors[platformName] || 'bg-gray-500 text-white'
        }`}
      >
        {platformName}
      </span>
    );
  };

  return (
    <div className="bg-white border border-orange-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            {sale.platform && getPlatformBadge(sale.platform.platform_name)}
            <span className="font-mono text-sm text-gray-600 truncate">
              {sale.platform_order_id}
            </span>
            <span className="text-gray-400">|</span>
            <span className="text-sm text-gray-500">{formatDate(sale.sale_date)}</span>
          </div>

          <div className="mt-2">
            <span className="text-gray-700">SKU vendido:</span>
            <span className="ml-2 font-mono font-semibold text-gray-900">
              {sale.platform_sku}
            </span>
            <span className="ml-3 text-gray-600">Cantidad: {sale.quantity}</span>
          </div>
        </div>

        <button
          onClick={() => onMap(sale)}
          className="px-4 py-2 bg-gradient-to-r from-[#d4a574] to-[#b8935e] hover:from-[#b8935e] hover:to-[#d4a574] text-white rounded-lg font-semibold hover:shadow-lg transition-all whitespace-nowrap"
        >
          Mapear Ahora
        </button>
      </div>
    </div>
  );
};

interface Props {
  onMapSale?: (sale: PendingSale) => void;
}

const PendingSalesAlert: FC<Props> = ({ onMapSale }) => {
  const navigate = useNavigate();
  const { data: pendingSales, isLoading } = usePendingSales('pending');

  if (isLoading || !pendingSales || pendingSales.length === 0) {
    return null;
  }

  const count = pendingSales.length;
  const firstThree = pendingSales.slice(0, 3);

  return (
    <div className="bg-gradient-to-r from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 border-l-4 border-orange-500 p-6 mb-6 rounded-lg shadow-md">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <HiExclamation className="text-3xl text-orange-600" />
        </div>

        <div className="flex-1">
          <h3 className="font-bold text-orange-900 dark:text-orange-200 text-lg mb-2">
            ⚠️ {count} Venta{count > 1 ? 's' : ''} Pendiente{count > 1 ? 's' : ''} de Mapeo
          </h3>
          <p className="text-orange-800 dark:text-orange-300 mb-4">
            Estas ventas no pudieron descontar stock automáticamente porque no se encontró el
            producto correspondiente. Configura el mapeo para automatizar futuros descuentos.
          </p>

          {/* Primeras 3 ventas pendientes */}
          <div className="space-y-3 mb-4">
            {firstThree.map((sale) => (
              <PendingSaleItem
                key={sale.pending_sale_id}
                sale={sale}
                onMap={onMapSale || (() => navigate('/pending-sales'))}
              />
            ))}
          </div>

          {count > 3 && (
            <button
              onClick={() => navigate('/pending-sales')}
              className="text-orange-700 dark:text-orange-400 font-semibold hover:underline flex items-center gap-1"
            >
              Ver todas las ventas pendientes ({count}) →
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PendingSalesAlert;
