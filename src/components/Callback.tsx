import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function Callback() {
  const navigate = useNavigate();

  useEffect(() => {

    const userId = localStorage.getItem('userId');

    if (userId) {
      navigate('/inventario');
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const userId = urlParams.get('userId');


      if (userId) {
        sessionStorage.setItem("userId", userId);


        navigate('/inventario');
      } else {
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
