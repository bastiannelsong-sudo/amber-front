import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuthCallback = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Obtener el código de la URL (Mercado Libre lo pasa en la URL)
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code'); // Mercado Libre enviará este código

        if (code) {
            // Enviar el código al backend para obtener el token
            axios
                .post('http://localhost:3000/auth/callback', { code }) // Ajusta la URL de tu backend
                .then((response) => {
                    const token = response.data.access_token; // Obtener el token de la respuesta
                    sessionStorage.setItem('access_token', token); // Guardar el token en sessionStorage
                    navigate('/dashboard'); // Redirigir al Dashboard
                })
                .catch((error) => {
                    console.error('Error al obtener el token:', error);
                });
        } else {
            console.error('No se encontró el código en la URL.');
        }
    }, [navigate]);

    return <div>Autenticando...</div>;
};

export default AuthCallback;
