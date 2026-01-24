import { useEffect, type FC } from "react";
import { Routes, Route } from "react-router";
import { BrowserRouter } from "react-router-dom";
import EcommerceProductsPage from "./pages/e-commerce/products";
import ProductInventoryPage from "./pages/ProductInventoryPage";
import PendingSalesPage from "./pages/PendingSalesPage";
import DailySalesPage from "./pages/DailySalesPage";
import FlexCostsPage from "./pages/FlexCostsPage";
import FlowbiteWrapper from "./components/flowbite-wrapper";
import Login from "./pages/authentication/login";
import Callback from "./pages/authentication/callback";
import { useAuthStore } from "./store/authStore";

const App: FC = function () {
  const initAuth = useAuthStore((state) => state.initAuth);

  // Inicializar autenticación desde sessionStorage al cargar la app
  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<FlowbiteWrapper />}>
          {/* Login con Mercado Libre OAuth */}
          <Route path="/" element={<Login />} index />

          {/* OAuth Callback */}
          <Route path="/callback" element={<Callback />} />

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
      </Routes>
    </BrowserRouter>
  );
};

export default App;
