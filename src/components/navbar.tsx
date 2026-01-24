import type { FC } from "react";
import { Avatar, Dropdown, Navbar } from "flowbite-react";
import { HiLogout } from "react-icons/hi";
import { useAuthStore } from "../store/authStore";
import { useNavigate } from "react-router-dom";

const ExampleNavbar: FC = function () {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <Navbar fluid className="border-b border-gray-200 bg-white">
      <div className="w-full p-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Navbar.Brand href="/productos">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-amber-600 rounded-xl flex items-center justify-center">
                  <span className="text-xl font-bold text-white">A</span>
                </div>
                <span className="self-center whitespace-nowrap text-2xl font-semibold text-gray-900">
                  Amber
                </span>
              </div>
            </Navbar.Brand>
          </div>

          <div className="flex items-center lg:gap-3">
            {user && (
              <div className="hidden lg:block">
                <UserDropdown onLogout={handleLogout} />
              </div>
            )}
          </div>
        </div>
      </div>
    </Navbar>
  );
};

const UserDropdown: FC<{ onLogout: () => void }> = function ({ onLogout }) {
  const user = useAuthStore((state) => state.user);

  return (
    <Dropdown
      arrowIcon={false}
      inline
      label={
        <span>
          <span className="sr-only">User menu</span>
          <Avatar
            alt={user?.nickname || "User"}
            placeholderInitials={user?.nickname?.charAt(0).toUpperCase() || "U"}
            rounded
            size="sm"
          />
        </span>
      }
    >
      <Dropdown.Header>
        <span className="block text-sm font-medium">{user?.nickname}</span>
        <span className="block truncate text-sm text-gray-500">
          {user?.email}
        </span>
      </Dropdown.Header>
      <Dropdown.Item icon={HiLogout} onClick={onLogout}>
        Cerrar sesión
      </Dropdown.Item>
    </Dropdown>
  );
};

export default ExampleNavbar;
