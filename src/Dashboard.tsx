import React, { useEffect, useState } from 'react';

function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    console.log(token)
    if (token) {
      fetch(`http://localhost:3000/auth/user-info?token=${token}`)
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
