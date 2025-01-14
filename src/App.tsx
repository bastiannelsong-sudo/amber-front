// src/App.jsx
import React from 'react';

function App() {
  const handleLogin = () => {
    // Redirige al backend para obtener la URL de autenticación
    window.location.href = 'http://localhost:3000/auth/login'; // URL de login del backend
  };

  return (
    <div>
      <h1>Login con Mercado Libre</h1>
      <button onClick={handleLogin}>Iniciar sesión</button>
    </div>
  );
}

export default App;
