import { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import AppRoutes from './routes/AppRoutes';
import './index.css';

function App() {
    useEffect(() => {
        // Establecer el modo oscuro por defecto
        document.body.classList.add('dark');
    }, []);

    return <AppRoutes />;
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <App />
);
