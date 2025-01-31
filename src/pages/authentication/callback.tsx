import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Callback() {
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    // Evitar ejecución múltiple si ya se está procesando
    if (processing || sessionStorage.getItem('callbackProcessed') === 'true') return;

    setProcessing(true);
    const urlParams = new URLSearchParams(window.location.search);
    
    const userId = urlParams.get('userId');
    const nickname = urlParams.get('nickname');
    const email = urlParams.get('email');

    if (userId) {
      sessionStorage.setItem('userId', userId);
      if (nickname) sessionStorage.setItem('nickname', nickname);
      if (email) sessionStorage.setItem('email', email);

      sessionStorage.setItem('callbackProcessed', 'true'); // Evita ejecución doble
      navigate('/dashboard-page');
    } else {
      // Limpia datos en caso de fallo
      sessionStorage.removeItem('callbackProcessed');
      sessionStorage.removeItem('userId');
      sessionStorage.removeItem('nickname');
      sessionStorage.removeItem('email');
      navigate('/');
    }
  }, [navigate, processing]);

  return <div>Cargando...</div>;
}

export default Callback;
