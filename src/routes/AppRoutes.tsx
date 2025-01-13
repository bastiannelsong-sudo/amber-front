import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import AuthCallback from '../pages/AuthCallback';
import Dashboard from '../pages/Dashboard'; // Asegúrate de importar Dashboard

const AppRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<Login />} />
    <Route path="/callback" element={<AuthCallback />} />
    <Route path="/dashboard" element={<Dashboard />} /> {/* Asegúrate de que esta ruta esté definida */}
  </Routes>
);

export default AppRoutes;
