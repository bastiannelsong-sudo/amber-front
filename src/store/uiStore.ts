import { create } from 'zustand';

interface UIState {
  // Modales
  isAddProductModalOpen: boolean;
  isEditProductModalOpen: boolean;
  isDeleteProductModalOpen: boolean;
  isAdjustStockModalOpen: boolean;
  isHistoryModalOpen: boolean;
  isLowStockModalOpen: boolean;

  // Loading states
  isLoading: boolean;

  // Producto seleccionado (para editar/eliminar/ajustar/historial)
  selectedProductId: number | null;

  // Actions para modales
  openAddProductModal: () => void;
  closeAddProductModal: () => void;

  openEditProductModal: (productId: number) => void;
  closeEditProductModal: () => void;

  openDeleteProductModal: (productId: number) => void;
  closeDeleteProductModal: () => void;

  openAdjustStockModal: (productId: number) => void;
  closeAdjustStockModal: () => void;

  openHistoryModal: (productId: number) => void;
  closeHistoryModal: () => void;

  openLowStockModal: () => void;
  closeLowStockModal: () => void;

  // Actions para loading
  setLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  // Estado inicial
  isAddProductModalOpen: false,
  isEditProductModalOpen: false,
  isDeleteProductModalOpen: false,
  isAdjustStockModalOpen: false,
  isHistoryModalOpen: false,
  isLowStockModalOpen: false,
  isLoading: false,
  selectedProductId: null,

  // Implementación de actions
  openAddProductModal: () => set({ isAddProductModalOpen: true }),
  closeAddProductModal: () => set({ isAddProductModalOpen: false }),

  openEditProductModal: (productId) =>
    set({ isEditProductModalOpen: true, selectedProductId: productId }),
  closeEditProductModal: () =>
    set({ isEditProductModalOpen: false, selectedProductId: null }),

  openDeleteProductModal: (productId) =>
    set({ isDeleteProductModalOpen: true, selectedProductId: productId }),
  closeDeleteProductModal: () =>
    set({ isDeleteProductModalOpen: false, selectedProductId: null }),

  openAdjustStockModal: (productId) =>
    set({ isAdjustStockModalOpen: true, selectedProductId: productId }),
  closeAdjustStockModal: () =>
    set({ isAdjustStockModalOpen: false, selectedProductId: null }),

  openHistoryModal: (productId) =>
    set({ isHistoryModalOpen: true, selectedProductId: productId }),
  closeHistoryModal: () =>
    set({ isHistoryModalOpen: false, selectedProductId: null }),

  openLowStockModal: () => set({ isLowStockModalOpen: true }),
  closeLowStockModal: () => set({ isLowStockModalOpen: false }),

  setLoading: (loading) => set({ isLoading: loading }),
}));

export default useUIStore;
