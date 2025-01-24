

function App() {
    const handleLogin = () => {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        window.location.href = `${backendUrl}/auth/login`;
    };

    return (

        <section className="bg-[url('/public/img/jewelery-6902963_1920.jpg')] bg-no-repeat bg-cover bg-center bg-gray-700 bg-blend-multiply bg-opacity-60 min-h-screen flex items-center justify-center">

            <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto sm:w-full md:h-auto lg:w-1/3">
                <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-white">
                    <img className="w-32 h-auto sm:w-32 md:w-32 lg:w-32" src="/public/img/logo_amber_nelson.png" alt="Amber Nelson Logo" />
                </a>
                <div className="w-full bg-white rounded-lg shadow-lg md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800">
                    <div className="p-6 space-y-4 md:space-y-6 lg:space-y-8 sm:p-8">
                        <h1 className="text-xl font-semibold leading-tight tracking-tight text-center text-gray-900 md:text-2xl dark:text-white">
                            Bienvenido a Amber Nelson, inicia sesión con Mercado Libre
                        </h1>
                        <button
                            onClick={handleLogin}
                            className="w-full text-white bg-[#FFCC00] hover:bg-[#FFB800] focus:ring-4 focus:outline-none focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-3 text-center dark:bg-[#FFB800] dark:hover:bg-[#FF9900] dark:focus:ring-yellow-400 flex items-center justify-center gap-4 shadow-lg"
                        >
                            <img className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14" src="/public/img/mercado-libre-logo.webp" alt="Mercado Libre Logo" />
                            <span className="ml-3">Iniciar sesión con Mercado Libre</span>
                        </button>
                        <p className="text-sm text-center text-gray-500 dark:text-gray-400">
                            Al iniciar sesión, aceptas los <a href="#" className="text-blue-500 hover:underline">términos y condiciones</a>.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default App;
