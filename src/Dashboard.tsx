import { useEffect, useState } from 'react';

function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const userId = sessionStorage.getItem('userId');
    if (userId) {
      const backendUrl = import.meta.env.VITE_BACKEND_URL;
      fetch(`${backendUrl}/auth/user-info?userId=${userId}`)
        .then((response) => response.json())
        .then((data) => {
          setUserInfo(data);
        })
        .catch((error) => console.error('Error fetching user info:', error));
    }
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {userInfo ? (
        <div>
          <h2>Welcome</h2>
          {/* Muestra más detalles del usuario */}
        </div>
      ) : (
        <p>Cargando datos del usuario...</p>
      )}
    </div>
  );
}

export default Dashboard;
