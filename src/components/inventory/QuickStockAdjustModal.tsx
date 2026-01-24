import { FC, useState, useEffect } from 'react';
import { HiX } from 'react-icons/hi';
import { FaChartLine } from 'react-icons/fa';
import StockBadge from './StockBadge';
import type { Product } from '../../types/product.types';

interface Props {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productId: number, adjustment: number, reason: string, description: string) => void;
}

const PRESET_ADJUSTMENTS = [-10, -5, -1, 1, 5, 10];

const ADJUSTMENT_REASONS = [
  { value: 'sale', label: '📦 Venta manual' },
  { value: 'restock', label: '📥 Reposición de stock' },
  { value: 'damaged', label: '💔 Producto dañado' },
  { value: 'lost', label: '🔍 Pérdida / extravío' },
  { value: 'correction', label: '✏️ Corrección de inventario' },
  { value: 'return', label: '↩️ Devolución de cliente' },
  { value: 'transfer', label: '🔄 Transferencia entre plataformas' },
  { value: 'other', label: '📝 Otro motivo' },
];

const QuickStockAdjustModal: FC<Props> = ({ product, isOpen, onClose, onConfirm }) => {
  const [adjustment, setAdjustment] = useState<number>(0);
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Reset form when modal opens/closes or product changes
  useEffect(() => {
    if (isOpen) {
      setAdjustment(0);
      setReason('');
      setDescription('');
      setError('');
    }
  }, [isOpen, product]);

  if (!isOpen || !product) return null;

  const resultingStock = product.stock + adjustment;
  const isValid = adjustment !== 0 && reason !== '' && resultingStock >= 0;

  const handlePresetClick = (value: number) => {
    setAdjustment(value);
    setError('');
  };

  const handleCustomAdjustment = (value: string) => {
    const num = parseInt(value, 10);
    if (!isNaN(num)) {
      setAdjustment(num);
      setError('');
    } else if (value === '' || value === '-') {
      setAdjustment(0);
      setError('');
    }
  };

  const handleConfirm = () => {
    if (!isValid) {
      setError('Por favor completa todos los campos requeridos');
      return;
    }

    if (resultingStock < 0) {
      setError('El ajuste resultaría en stock negativo');
      return;
    }

    onConfirm(product.product_id, adjustment, reason, description);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#1a1a1a] to-[#2d2020] border-b-2 border-[#d4a574] p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h2 className="text-2xl font-bold bg-gradient-to-r from-[#f5d7a1] to-[#d4a574] bg-clip-text text-transparent flex items-center gap-2">
                <FaChartLine />
                Ajustar Stock
              </h2>
              <p className="text-[#c4b5a0] mt-1">{product.name}</p>
              <p className="text-[#c4b5a0] font-mono text-sm">SKU: {product.internal_sku}</p>
            </div>
            <button
              onClick={onClose}
              className="text-[#d4a574] hover:text-[#f5d7a1] text-2xl transition-colors"
            >
              <HiX />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Current Stock */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Stock Actual</p>
            <StockBadge stock={product.stock} />
          </div>

          {/* Preset Adjustments */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
              Ajustes Rápidos
            </label>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_ADJUSTMENTS.map((value) => (
                <button
                  key={value}
                  onClick={() => handlePresetClick(value)}
                  className={`px-4 py-3 rounded-lg font-bold transition-all ${
                    adjustment === value
                      ? 'bg-[#d4a574] text-white shadow-lg scale-105'
                      : value < 0
                      ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                      : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                  }`}
                >
                  {value > 0 ? '+' : ''}
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Custom Adjustment */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Ajuste Personalizado
            </label>
            <input
              type="number"
              value={adjustment || ''}
              onChange={(e) => handleCustomAdjustment(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-3 text-lg font-bold text-center border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 dark:bg-gray-800 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              Usa números positivos para aumentar (+) o negativos para disminuir (-)
            </p>
          </div>

          {/* Preview */}
          {adjustment !== 0 && (
            <div
              className={`rounded-lg p-4 border-2 ${
                resultingStock < 0
                  ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                  : resultingStock >= product.stock
                  ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                  : 'bg-orange-50 dark:bg-orange-900/20 border-orange-500'
              }`}
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Vista Previa del Cambio
              </p>
              <div className="flex items-center justify-center gap-4 text-lg font-bold">
                <span className="text-gray-600 dark:text-gray-400">{product.stock}</span>
                <span className="text-2xl">→</span>
                <span
                  className={
                    resultingStock < 0
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-green-600 dark:text-green-400'
                  }
                >
                  {resultingStock}
                </span>
                <span
                  className={`text-sm px-2 py-1 rounded ${
                    adjustment > 0
                      ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                      : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                  }`}
                >
                  {adjustment > 0 ? '+' : ''}
                  {adjustment}
                </span>
              </div>
              {resultingStock < 0 && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2 text-center font-semibold">
                  ⚠️ El stock no puede ser negativo
                </p>
              )}
            </div>
          )}

          {/* Reason */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Motivo del Ajuste <span className="text-red-500">*</span>
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Selecciona un motivo...</option>
              {ADJUSTMENT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Descripción Adicional (Opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Agrega detalles adicionales sobre este ajuste..."
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:border-[#d4a574] focus:ring-2 focus:ring-[#d4a574]/20 dark:bg-gray-800 dark:text-white resize-none"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-3">
              <p className="text-sm text-red-600 dark:text-red-400 font-semibold">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t-2 border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-lg font-semibold transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleConfirm}
              disabled={!isValid}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-all ${
                isValid
                  ? 'bg-gradient-to-r from-[#d4a574] to-[#b8935e] hover:from-[#b8935e] hover:to-[#d4a574] text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              Confirmar Ajuste
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickStockAdjustModal;
