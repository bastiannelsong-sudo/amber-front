import type { FC } from "react";
import { useEffect, useState, useRef } from "react";
import authService from "../../services/auth.service";

// Animated golden particle component
const GoldenParticles: FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const setSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    setSize();
    window.addEventListener('resize', setSize);

    // Particle class
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2 + 0.5;
        this.speedX = (Math.random() - 0.5) * 0.3;
        this.speedY = (Math.random() - 0.5) * 0.3;
        this.opacity = Math.random() * 0.5 + 0.2;
        // Amber/gold color variations
        const colors = ['#d4a574', '#c9956c', '#e8c39e', '#f5d7a1', '#b8935e'];
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        // Wrap around screen
        if (this.x < 0) this.x = canvas.width;
        if (this.x > canvas.width) this.x = 0;
        if (this.y < 0) this.y = canvas.height;
        if (this.y > canvas.height) this.y = 0;
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // Create particles
    const particles: Particle[] = [];
    for (let i = 0; i < 60; i++) {
      particles.push(new Particle());
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.update();
        p.draw();
      });
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      window.removeEventListener('resize', setSize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}
    />
  );
};

// Diamond icon component
const DiamondIcon: FC<{ size?: number; className?: string }> = ({ size = 24, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2L2 9l10 13L22 9 12 2z" />
  </svg>
);

const Login: FC = function () {
  const [isHovered, setIsHovered] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    authService.clearSession();
    // Trigger entrance animation
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = () => {
    authService.loginWithMercadoLibre();
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0a0908 0%, #141210 25%, #1a1714 50%, #0f0d0b 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Outfit', sans-serif",
      }}
    >
      {/* Animated particles */}
      <GoldenParticles />

      {/* Ambient glow effects */}
      <div
        style={{
          position: 'absolute',
          top: '-20%',
          right: '-10%',
          width: '600px',
          height: '600px',
          background: 'radial-gradient(circle, rgba(212, 165, 116, 0.08) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: '-30%',
          left: '-15%',
          width: '700px',
          height: '700px',
          background: 'radial-gradient(circle, rgba(184, 147, 94, 0.06) 0%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      {/* Main card */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          width: '100%',
          maxWidth: '480px',
          opacity: isLoaded ? 1 : 0,
          transform: isLoaded ? 'translateY(0) scale(1)' : 'translateY(30px) scale(0.97)',
          transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Decorative corner accents */}
        <div
          style={{
            position: 'absolute',
            top: '-2px',
            left: '-2px',
            width: '60px',
            height: '60px',
            borderTop: '2px solid #d4a574',
            borderLeft: '2px solid #d4a574',
            borderTopLeftRadius: '28px',
            opacity: 0.6,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-2px',
            right: '-2px',
            width: '60px',
            height: '60px',
            borderBottom: '2px solid #d4a574',
            borderRight: '2px solid #d4a574',
            borderBottomRightRadius: '28px',
            opacity: 0.6,
          }}
        />

        {/* Card content */}
        <div
          style={{
            background: 'linear-gradient(165deg, rgba(26, 23, 20, 0.95) 0%, rgba(20, 18, 16, 0.98) 100%)',
            backdropFilter: 'blur(20px)',
            borderRadius: '28px',
            border: '1px solid rgba(212, 165, 116, 0.15)',
            boxShadow: `
              0 4px 24px -4px rgba(0, 0, 0, 0.5),
              0 24px 48px -12px rgba(0, 0, 0, 0.4),
              inset 0 1px 0 rgba(255, 255, 255, 0.03)
            `,
            padding: '56px 48px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* Inner glow */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: '50%',
              transform: 'translateX(-50%)',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(212, 165, 116, 0.08) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* Logo section */}
          <div
            style={{
              textAlign: 'center',
              marginBottom: '48px',
              position: 'relative',
            }}
          >
            {/* Logo with glow */}
            <div
              style={{
                display: 'inline-block',
                position: 'relative',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: '-8px',
                  background: 'radial-gradient(circle, rgba(212, 165, 116, 0.2) 0%, transparent 70%)',
                  borderRadius: '24px',
                  filter: 'blur(10px)',
                }}
              />
              <img
                src="/images/logo.jpg"
                alt="Amber Nelson"
                style={{
                  width: '100px',
                  height: '100px',
                  objectFit: 'contain',
                  borderRadius: '20px',
                  border: '2px solid rgba(212, 165, 116, 0.4)',
                  boxShadow: '0 8px 32px -8px rgba(212, 165, 116, 0.3)',
                  position: 'relative',
                }}
              />
            </div>

            {/* Brand name */}
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '36px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                background: 'linear-gradient(135deg, #f5e6d3 0%, #d4a574 50%, #c49a6c 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                margin: '0 0 8px 0',
                textTransform: 'uppercase',
              }}
            >
              Amber Nelson
            </h1>

            {/* Tagline */}
            <p
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: '13px',
                color: '#8a7b6b',
                letterSpacing: '0.25em',
                textTransform: 'uppercase',
                margin: 0,
              }}
            >
              Accesorios Premium
            </p>

            {/* Decorative line */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                marginTop: '24px',
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '1px',
                  background: 'linear-gradient(90deg, transparent, #d4a574)',
                }}
              />
              <DiamondIcon size={12} className="" />
              <div
                style={{
                  width: '60px',
                  height: '1px',
                  background: 'linear-gradient(90deg, #d4a574, transparent)',
                }}
              />
            </div>
          </div>

          {/* Welcome text */}
          <div style={{ textAlign: 'center', marginBottom: '40px' }}>
            <h2
              style={{
                fontFamily: "'Cormorant Garamond', Georgia, serif",
                fontSize: '28px',
                fontWeight: 500,
                color: '#f5e6d3',
                margin: '0 0 8px 0',
              }}
            >
              Bienvenido
            </h2>
            <p
              style={{
                fontSize: '15px',
                color: '#9a8b7a',
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              Ingresa a tu panel de gestión de inventario
            </p>
          </div>

          {/* Login button */}
          <button
            onClick={handleLogin}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            style={{
              width: '100%',
              padding: '18px 32px',
              borderRadius: '14px',
              border: 'none',
              background: isHovered
                ? 'linear-gradient(135deg, #ffe600 0%, #ffd000 100%)'
                : 'linear-gradient(135deg, #ffe600 0%, #ffcc00 100%)',
              color: '#1a1a1a',
              fontSize: '16px',
              fontWeight: 600,
              fontFamily: "'Outfit', sans-serif",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
              boxShadow: isHovered
                ? '0 12px 40px -8px rgba(255, 230, 0, 0.4), 0 4px 12px -4px rgba(255, 230, 0, 0.2)'
                : '0 8px 24px -8px rgba(255, 230, 0, 0.25)',
            }}
          >
            {/* MercadoLibre logo */}
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-2-6c0 1.1.9 2 2 2s2-.9 2-2-.9-2-2-2-2 .9-2 2zm.5-4c0 .28.22.5.5.5s.5-.22.5-.5-.22-.5-.5-.5-.5.22-.5.5zm3 0c0 .28.22.5.5.5s.5-.22.5-.5-.22-.5-.5-.5-.5.22-.5.5z" />
            </svg>
            <span>Ingresar con Mercado Libre</span>
          </button>

          {/* Security badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              marginTop: '20px',
              padding: '12px 16px',
              borderRadius: '10px',
              background: 'rgba(212, 165, 116, 0.06)',
              border: '1px solid rgba(212, 165, 116, 0.1)',
            }}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#d4a574"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span style={{ fontSize: '13px', color: '#a89a8a' }}>
              Autenticación segura OAuth 2.0
            </span>
          </div>

          {/* Features */}
          <div
            style={{
              marginTop: '40px',
              paddingTop: '32px',
              borderTop: '1px solid rgba(212, 165, 116, 0.1)',
            }}
          >
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, 1fr)',
                gap: '16px',
              }}
            >
              {[
                { icon: '📦', label: 'Inventario' },
                { icon: '📊', label: 'Métricas' },
                { icon: '🔄', label: 'Sync ML' },
              ].map((feature, idx) => (
                <div
                  key={idx}
                  style={{
                    textAlign: 'center',
                    padding: '16px 8px',
                    borderRadius: '12px',
                    background: 'rgba(212, 165, 116, 0.04)',
                    border: '1px solid rgba(212, 165, 116, 0.08)',
                    transition: 'all 0.3s ease',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 165, 116, 0.08)';
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.15)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(212, 165, 116, 0.04)';
                    e.currentTarget.style.borderColor = 'rgba(212, 165, 116, 0.08)';
                  }}
                >
                  <span style={{ fontSize: '24px', display: 'block', marginBottom: '8px' }}>
                    {feature.icon}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#9a8b7a',
                      fontWeight: 500,
                      letterSpacing: '0.02em',
                    }}
                  >
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            textAlign: 'center',
            marginTop: '32px',
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateY(0)' : 'translateY(10px)',
            transition: 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
          }}
        >
          <p
            style={{
              fontSize: '13px',
              color: '#6a5f54',
              margin: '0 0 8px 0',
            }}
          >
            ¿Necesitas ayuda?{' '}
            <a
              href="mailto:soporte@ambernelson.cl"
              style={{
                color: '#d4a574',
                textDecoration: 'none',
                fontWeight: 500,
                transition: 'color 0.2s ease',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#e8c39e')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#d4a574')}
            >
              Contactar soporte
            </a>
          </p>
          <p
            style={{
              fontSize: '11px',
              color: '#4a4540',
              margin: 0,
              letterSpacing: '0.05em',
            }}
          >
            © 2025 Inversiones Amber · v1.0.0
          </p>
        </div>
      </div>

      {/* CSS for fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap');

        * {
          box-sizing: border-box;
        }

        body {
          margin: 0;
          padding: 0;
        }
      `}</style>
    </div>
  );
};

export default Login;
