import { FC, memo, useState, useCallback, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import {
  HiChartBar,
  HiShoppingCart,
  HiCube,
  HiCog,
  HiUser,
  HiLogout,
  HiSun,
  HiMoon,
  HiMenu,
  HiX,
  HiBell,
  HiSearch,
  HiTruck,
} from 'react-icons/hi';
import { useThemeStore } from '../../store/themeStore';
import { useAuthStore } from '../../store/authStore';

// Navigation items
const NAV_ITEMS = [
  {
    path: '/sales',
    label: 'Ventas',
    icon: HiChartBar,
    description: 'Dashboard de ventas diarias',
  },
  {
    path: '/flex-costs',
    label: 'Costos Flex',
    icon: HiTruck,
    description: 'Costos envío Flex mensual',
  },
  {
    path: '/fazt-config',
    label: 'Fazt',
    icon: HiTruck,
    description: 'Tarifas Fazt por volumen',
  },
  {
    path: '/inventory',
    label: 'Inventario',
    icon: HiCube,
    description: 'Control de stock',
  },
  {
    path: '/settings',
    label: 'Configuración',
    icon: HiCog,
    description: 'Ajustes del sistema',
  },
] as const;

// Theme Toggle Button
const ThemeToggle: FC = memo(() => {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${theme === 'dark' ? 'claro' : 'oscuro'}`}
      className="theme-toggle"
      style={{
        width: '44px',
        height: '44px',
        borderRadius: '12px',
        border: 'none',
        backgroundColor: 'var(--header-btn-bg)',
        color: 'var(--header-btn-color)',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Sun Icon */}
      <HiSun
        style={{
          width: '20px',
          height: '20px',
          position: 'absolute',
          transform: theme === 'dark' ? 'rotate(0deg) scale(1)' : 'rotate(90deg) scale(0)',
          opacity: theme === 'dark' ? 1 : 0,
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          color: '#fbbf24',
        }}
      />
      {/* Moon Icon */}
      <HiMoon
        style={{
          width: '20px',
          height: '20px',
          position: 'absolute',
          transform: theme === 'light' ? 'rotate(0deg) scale(1)' : 'rotate(-90deg) scale(0)',
          opacity: theme === 'light' ? 1 : 0,
          transition: 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          color: '#6366f1',
        }}
      />
    </button>
  );
});

// User Menu Component
const UserMenu: FC = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuthStore();

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleLogout = useCallback(() => {
    logout();
    setIsOpen(false);
  }, [logout]);

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* User Avatar Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '44px',
          height: '44px',
          borderRadius: '12px',
          border: '2px solid var(--accent-primary)',
          backgroundColor: 'var(--header-btn-bg)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 200ms',
          overflow: 'hidden',
        }}
      >
        {user?.avatar ? (
          <img
            src={user.avatar}
            alt={user.nickname || 'Usuario'}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <HiUser style={{ width: '20px', height: '20px', color: 'var(--text-secondary)' }} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '240px',
            backgroundColor: 'var(--surface-elevated)',
            borderRadius: '16px',
            border: '1px solid var(--border-subtle)',
            boxShadow: 'var(--shadow-elevated)',
            overflow: 'hidden',
            zIndex: 100,
            animation: 'menuSlideIn 200ms cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* User Info */}
          <div
            style={{
              padding: '16px',
              borderBottom: '1px solid var(--border-subtle)',
              background: 'var(--surface-subtle)',
            }}
          >
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.9375rem',
                fontWeight: 600,
                color: 'var(--text-primary)',
                margin: '0 0 4px 0',
              }}
            >
              {user?.nickname || 'Usuario'}
            </p>
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                margin: 0,
              }}
            >
              Mercado Libre
            </p>
          </div>

          {/* Menu Items */}
          <div style={{ padding: '8px' }}>
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px',
                borderRadius: '10px',
                border: 'none',
                backgroundColor: 'transparent',
                cursor: 'pointer',
                transition: 'all 150ms',
                fontFamily: "'Outfit', sans-serif",
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--color-rose)',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <HiLogout style={{ width: '18px', height: '18px' }} />
              Cerrar Sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

// Mobile Menu
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileMenu: FC<MobileMenuProps> = memo(({ isOpen, onClose }) => {
  const location = useLocation();

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 998,
          animation: 'fadeIn 200ms ease-out',
        }}
      />

      {/* Menu Panel */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          backgroundColor: 'var(--surface-base)',
          borderRight: '1px solid var(--border-subtle)',
          zIndex: 999,
          animation: 'slideInLeft 300ms cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span style={{ fontSize: '20px' }}>🔶</span>
            </div>
            <span
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '1.125rem',
                fontWeight: 700,
                color: 'var(--text-primary)',
              }}
            >
              Amber
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: 'var(--surface-hover)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <HiX style={{ width: '20px', height: '20px' }} />
          </button>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
          {NAV_ITEMS.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={onClose}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  padding: '14px 16px',
                  borderRadius: '12px',
                  marginBottom: '8px',
                  textDecoration: 'none',
                  transition: 'all 200ms',
                  backgroundColor: isActive ? 'var(--accent-subtle)' : 'transparent',
                  border: isActive ? '1px solid var(--accent-border)' : '1px solid transparent',
                }}
              >
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '10px',
                    backgroundColor: isActive ? 'var(--accent-primary)' : 'var(--surface-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transition: 'all 200ms',
                  }}
                >
                  <Icon
                    style={{
                      width: '20px',
                      height: '20px',
                      color: isActive ? '#ffffff' : 'var(--text-muted)',
                    }}
                  />
                </div>
                <div>
                  <p
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: isActive ? 'var(--accent-primary)' : 'var(--text-primary)',
                      margin: 0,
                    }}
                  >
                    {item.label}
                  </p>
                  <p
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: '0.75rem',
                      color: 'var(--text-muted)',
                      margin: '2px 0 0 0',
                    }}
                  >
                    {item.description}
                  </p>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div
          style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
          }}
        >
          <ThemeToggle />
        </div>
      </div>
    </>
  );
});

// Main Header Component
const AppHeader: FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  return (
    <>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          backgroundColor: 'var(--header-bg)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <div
          style={{
            maxWidth: '1400px',
            margin: '0 auto',
            padding: '0 24px',
            height: '72px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '24px',
          }}
        >
          {/* Left: Logo & Mobile Menu */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="mobile-only"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'var(--header-btn-bg)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'none',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <HiMenu style={{ width: '22px', height: '22px' }} />
            </button>

            {/* Logo */}
            <Link
              to="/"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                textDecoration: 'none',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px -4px var(--accent-glow)',
                }}
              >
                <span style={{ fontSize: '22px' }}>🔶</span>
              </div>
              <div className="desktop-only">
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    color: 'var(--text-primary)',
                    margin: 0,
                    letterSpacing: '-0.02em',
                  }}
                >
                  Amber
                </p>
                <p
                  style={{
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    color: 'var(--text-muted)',
                    margin: 0,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                  }}
                >
                  Analytics Suite
                </p>
              </div>
            </Link>
          </div>

          {/* Center: Navigation (Desktop) */}
          <nav
            className="desktop-only"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px',
              borderRadius: '14px',
              backgroundColor: 'var(--nav-bg)',
              border: '1px solid var(--border-subtle)',
            }}
          >
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 16px',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: isActive ? 'var(--accent-primary)' : 'transparent',
                    color: isActive ? '#ffffff' : 'var(--text-secondary)',
                    fontFamily: "'Outfit', sans-serif",
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    boxShadow: isActive ? '0 4px 12px -2px var(--accent-glow)' : 'none',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                      e.currentTarget.style.color = 'var(--text-primary)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.color = 'var(--text-secondary)';
                    }
                  }}
                >
                  <Icon style={{ width: '18px', height: '18px' }} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {/* Search Button */}
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'var(--header-btn-bg)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--header-btn-bg)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <HiSearch style={{ width: '20px', height: '20px' }} />
            </button>

            {/* Notifications */}
            <button
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                border: 'none',
                backgroundColor: 'var(--header-btn-bg)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                transition: 'all 200ms',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--surface-hover)';
                e.currentTarget.style.color = 'var(--text-primary)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--header-btn-bg)';
                e.currentTarget.style.color = 'var(--text-secondary)';
              }}
            >
              <HiBell style={{ width: '20px', height: '20px' }} />
              {/* Notification Dot */}
              <span
                style={{
                  position: 'absolute',
                  top: '10px',
                  right: '10px',
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--color-rose)',
                  border: '2px solid var(--header-bg)',
                }}
              />
            </button>

            {/* Theme Toggle (Desktop) */}
            <div className="desktop-only">
              <ThemeToggle />
            </div>

            {/* Divider */}
            <div
              className="desktop-only"
              style={{
                width: '1px',
                height: '28px',
                backgroundColor: 'var(--border-subtle)',
                margin: '0 8px',
              }}
            />

            {/* User Menu */}
            <UserMenu />
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} onClose={closeMobileMenu} />

      {/* Responsive Styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideInLeft {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }

        @keyframes menuSlideIn {
          from {
            opacity: 0;
            transform: translateY(-8px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .desktop-only {
          display: flex !important;
        }

        .mobile-only {
          display: none !important;
        }

        @media (max-width: 1024px) {
          .desktop-only {
            display: none !important;
          }

          .mobile-only {
            display: flex !important;
          }
        }
      `}</style>
    </>
  );
};

export default memo(AppHeader);
