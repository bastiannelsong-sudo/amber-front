// Sidebar.tsx
import { UserInfo } from '../types/UserInfo';

interface SidebarProps {
    userInfo: UserInfo | null;
    loading: boolean;
    error: string | null;
}

const Sidebar: React.FC<SidebarProps> = ({ userInfo, loading, error }) => {
    return (
        <aside
            id="sidebar-user"
            className="fixed top-0 left-0 z-40 w-64 h-screen transition-transform -translate-x-full sm:translate-x-0 dark:bg-gray-800 dark:border-gray-700"
            aria-label="Sidebar"
        >
            <div className="overflow-y-auto py-4 px-3 bg-white border-r border-gray-200 dark:bg-gray-800 dark:border-gray-700 flex flex-col justify-between">
                <div className="text-center text-gray-500 dark:text-gray-400">
                    <img
                        className="mx-auto mb-4 w-20 h-20 rounded-full object-cover"
                        src="/public/img/logo_amber_nelson.png"
                        alt="User Avatar"
                    />
                    {loading ? (
                        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
                    ) : error ? (
                        <p className="text-red-500">{error}</p>
                    ) : userInfo ? (
                        <>
                            <h3 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white">
                                {`${userInfo.first_name} `}
                            </h3>
                            <p className="font-light text-gray-500 dark:text-gray-400">{userInfo.email}</p>
                        </>
                    ) : (
                        <p className="text-gray-500 dark:text-gray-400">User not found.</p>
                    )}
                </div>

                {userInfo && (
                    <ul className="pt-5 mt-5 space-y-2 border-t border-gray-200 dark:border-gray-700">
                        <li>
                            <a href="#" className="flex items-center p-2 text-base font-normal text-gray-900 rounded-lg dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 group">
                                <svg
                                    aria-hidden="true"
                                    className="w-6 h-6 text-gray-400 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path fillRule="evenodd" d="M10 2a1 1 0 00-1 1v1a1 1 0 002 0V3a1 1 0 00-1-1zM4 4h3a3 3 0 006 0h3a2 2 0 012 2v9a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm2.5 7a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm2.45 4a2.5 2.5 0 10-4.9 0h4.9zM12 9a1 1 0 100 2h3a1 1 0 100-2h-3zm-1 4a1 1 0 011-1h2a1 1 0 110 2h-2a1 1 0 01-1-1z" clipRule="evenodd"></path>
                                </svg>
                                <span className="ml-3">Inventario</span>
                            </a>
                        </li>
                    </ul>
                )}

                {/* Logout button at the bottom */}
                <a
                    href="#"
                    className="inline-flex items-center justify-center w-full py-2.5 px-5 my-5 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
                >
                    <svg
                        aria-hidden="true"
                        className="mr-1 w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                    </svg>
                    Logout
                </a>
            </div>
        </aside>
    );
};

export default Sidebar;
