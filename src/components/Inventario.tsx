// Inventario.tsx
import { useEffect, useState } from 'react';
import { UserInfo } from '../types/UserInfo';
import Sidebar from './Sidebar';
import TableScreen from './TableScreen';
import ProductList from "./ProductList";

function Inventario() {
    const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const userId = sessionStorage.getItem('userId');
        if (userId) {
            // Fetch user information from backend
            fetch(`http://localhost:3000/auth/user-info?userId=${userId}`)
                .then((response) => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch user info');
                    }
                    return response.json();
                })
                .then((data) => {
                    // Filter the data according to the UserInfo interface
                    const filteredUserInfo: UserInfo = {
                        first_name: data.first_name,
                        email: data.email,
                        nickname: data.nickname,
                        last_name: data.last_name,
                    };
                    setUserInfo(filteredUserInfo);
                    setLoading(false);
                })
                .catch((error) => {
                    console.error('Error fetching user info:', error);
                    setError(error.message);
                    setLoading(false);
                });
        } else {
            setLoading(false);
        }
    }, []);

    return (
        <div className="flex min-h-screen w-screen bg-gray-100">
            {/* Sidebar ocupa la esquina izquierda con un ancho fijo, ocultándose en pantallas pequeñas */}
            <div className="w-64 h-full bg-white shadow-lg hidden md:block">
                <Sidebar userInfo={userInfo} loading={loading} error={error}/>
            </div>

            {/* TableScreen ocupa todo el espacio restante */}
            <main className="flex-1 flex flex-col bg-white shadow-md">
                <div className="flex-1 overflow-auto dark:bg-gray-900 h-full pt-1">
                    <TableScreen />
                </div>
            </main>
        </div>


    );
}

export default Inventario;
