function App() {
  const handleLogin = () => {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      window.location.href = `${backendUrl}/auth/login`;
  };

  return (
    <div>
      <h1>Login con Mercado Libre</h1>
      <button onClick={handleLogin}>Iniciar sesión</button>
    </div>
  );
}

export default App;
