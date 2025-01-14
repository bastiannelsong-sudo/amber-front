import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {
    // Intentar recuperar los datos de localStorage
    const storedMessage = localStorage.getItem('message');
    const storedTokenData = localStorage.getItem('tokenData');

    if (storedMessage && storedTokenData) {
      // Si hay datos almacenados, usarlos para la lógica de la redirección
      const tokenData = JSON.parse(storedTokenData);

      // Extraer los valores del tokenData
      const access_token = tokenData.access_token;
      const token_type = tokenData.token_type;
      const expires_in = tokenData.expires_in;
      const scope = tokenData.scope;
      const user_id = tokenData.user_id;
      const refresh_token = tokenData.refresh_token;

      sessionStorage.setItem("token",access_token);

      console.log('Autenticación exitosa', {
        access_token,
        token_type,
        expires_in,
        scope,
        user_id,
        refresh_token,
      });

      // Redirigir al dashboard o página principal
      navigate('/dashboard');
    } else {
      // Si no hay datos en localStorage, verificar la URL
      const urlParams = new URLSearchParams(window.location.search);
      const message = urlParams.get('message');
      const tokenData = urlParams.get('tokenData');

      if (message && tokenData) {
        // Guardar los datos de la URL en localStorage
        localStorage.setItem('message', message);
        localStorage.setItem('tokenData', tokenData);

        // Convertir tokenData en un objeto
        const parsedTokenData = JSON.parse(tokenData);

        // Extraer los valores del tokenData
        const access_token = parsedTokenData.access_token;
        const token_type = parsedTokenData.token_type;
        const expires_in = parsedTokenData.expires_in;
        const scope = parsedTokenData.scope;
        const user_id = parsedTokenData.user_id;
        const refresh_token = parsedTokenData.refresh_token;

        console.log('Autenticación exitosa', {
          access_token,
          token_type,
          expires_in,
          scope,
          user_id,
          refresh_token,
        });

        // Redirigir al dashboard o página principal
        navigate('/dashboard');
      } else {
        console.error('No se recibió tokenData');
        navigate('/');
      }
    }
  }, [navigate]);

  return (
    <div>
      <h1>Callback</h1>
      <p>Esperando redirección...</p>
    </div>
  );
}

export default Callback;
