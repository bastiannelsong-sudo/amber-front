import type { FC } from "react";
import { Navigate, Outlet, useLocation } from "react-router";
import { useAuthStore } from "../../store/authStore";

const ProtectedRoute: FC = function () {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirigir a login guardando la ruta original
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
