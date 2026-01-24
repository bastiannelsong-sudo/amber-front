import type { FC } from "react";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Spinner } from "flowbite-react";
import { useAuthStore } from "../../store/authStore";

const Callback: FC = function () {
  const navigate = useNavigate();
  const location = useLocation();
  const setUser = useAuthStore((state) => state.setUser);

  useEffect(() => {
    // Verificar si ya se procesó el callback
    const callbackProcessed = localStorage.getItem("callbackProcessed");
    if (callbackProcessed) {
      navigate("/sales");
      return;
    }

    // Obtener parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get("userId");
    const nickname = urlParams.get("nickname");
    const email = urlParams.get("email");

    if (userId && nickname && email) {
      // Guardar usuario en el store
      setUser({ userId, nickname, email });

      // Marcar callback como procesado
      localStorage.setItem("callbackProcessed", "true");

      // Redirigir a la ruta original o a /sales por defecto
      const from = (location.state as { from?: string })?.from || "/sales";
      navigate(from);
    } else {
      // Si no hay parámetros, redirigir a login
      console.error("Parámetros de autenticación faltantes");
      navigate("/login");
    }
  }, [navigate, setUser, location.state]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="text-center">
        <Spinner size="xl" color="warning" />
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          Procesando autenticación...
        </p>
      </div>
    </div>
  );
};

export default Callback;
