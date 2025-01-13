const Login = () => {
    const handleLogin = () => {
        window.location.href = 'https://a70d-200-124-61-212.ngrok-free.app/auth/login';
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <button
                onClick={handleLogin}
                className="px-4 py-2 bg-blue-600 text-white rounded shadow hover:bg-blue-700"
            >
                Iniciar Sesión
            </button>
        </div>
    );
};

export default Login;
