import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import App from '../components/App';
import Callback from '../components/Callback';
import Inventario from '../components/Inventario';

const AppRoutes = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/callback" element={<Callback />} />
                <Route path="/inventario" element={<Inventario />} />
            </Routes>
        </Router>
    );
};

export default AppRoutes;
