import { useEffect, type FC } from "react";
import { Routes, Route, Navigate } from "react-router";
import { BrowserRouter } from "react-router-dom";
import EcommerceProductsPage from "./pages/e-commerce/products";
import ProductInventoryPage from "./pages/ProductInventoryPage";
import PendingSalesPage from "./pages/PendingSalesPage";
import DailySalesPage from "./pages/DailySalesPage";
import FlexCostsPage from "./pages/FlexCostsPage";
import FlowbiteWrapper from "./components/flowbite-wrapper";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import Login from "./pages/authentication/login";
import Callback from "./pages/authentication/callback";
import { useAuthStore } from "./store/authStore";

const App: FC = function () {
  const initAuth = useAuthStore((state) => state.initAuth);

  // Inicializar autenticación desde localStorage al cargar la app
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<FlowbiteWrapper />}>
          {/* Redirect root to sales dashboard */}
          <Route path="/" element={<Navigate to="/sales" replace />} index />

          {/* Login con Mercado Libre OAuth */}
          <Route path="/login" element={<Login />} />

          {/* OAuth Callback */}
          <Route path="/callback" element={<Callback />} />

          {/* Rutas protegidas - requieren autenticación */}
          <Route element={<ProtectedRoute />}>
            {/* CRUD de Productos */}
            <Route path="/productos" element={<EcommerceProductsPage />} />

            {/* Inventario Multi-Plataforma */}
            <Route path="/inventory" element={<ProductInventoryPage />} />

            {/* Ventas Pendientes de Mapeo */}
            <Route path="/pending-sales" element={<PendingSalesPage />} />

            {/* Dashboard de Ventas Diarias */}
            <Route path="/sales" element={<DailySalesPage />} />

            {/* Costos Envío Flex */}
            <Route path="/flex-costs" element={<FlexCostsPage />} />

            {/* Redirect old route to new one */}
            <Route path="/e-commerce/products" element={<EcommerceProductsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
