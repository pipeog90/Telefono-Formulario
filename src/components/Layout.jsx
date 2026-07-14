import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const NavLink = ({ to, children }) => {
    const location = useLocation();
    const isActive = location.pathname === to;

    const style = {
        color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)',
        textDecoration: 'none',
        fontWeight: '500',
        padding: 'var(--nav-padding)',
        borderRadius: 'var(--nav-radius)',
        margin: 'var(--nav-margin-y) 0',
        height: 'var(--nav-item-height)',
        display: 'inline-flex',
        alignItems: 'center',
        transition: 'all 0.3s ease',

        background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
        border: isActive ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid transparent',
        fontSize: 'var(--nav-font-size)',
        boxSizing: 'border-box'
    };

    return (
        <Link to={to} style={style}>
            {children}
        </Link>
    );
};



const Layout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const isAdmin = user && user.role === 'admin';

    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, [location.pathname]);

    const handleLogout = async () => {
        await auth.signOut();

        // Clear all session storage (automatically clears on tab close, but we force it here too)
        sessionStorage.clear();
        
        // Clear locally persisted form data in case some are still in localStorage
        localStorage.removeItem('callFormDraft');
        localStorage.removeItem('adminSelectedList');

        // Navigate to login via SPA
        navigate('/login', { replace: true });
    };

    return (
        <div className="app-wrapper">
            <nav className="layout-nav">
                <div
                    style={{
                        display: 'flex',
                        gap: '8px',
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        flex: 1,
                        minWidth: 0,
                        alignItems: 'center',
                        scrollbarWidth: 'none',        /* Firefox */
                        msOverflowStyle: 'none',       /* IE/Edge */
                    }}
                    className="mini-scrollbar"
                >
                    <NavLink to="/">1. Registro de Llamadas</NavLink>
                    {isAdmin && <NavLink to="/admin">2. Administración de Listas</NavLink>}
                    <NavLink to="/reportes">3. Generación de Reportes</NavLink>
                    {isAdmin && <NavLink to="/users">4. Gestión de Usuarios</NavLink>}
                    <style>{`
                        .mini-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                </div>
                <button
                    onClick={handleLogout}
                    className="logout-btn-nav"
                >
                    <LogOut size={16} strokeWidth={2} />
                    <span className="logout-text">Cerrar Sesión</span>
                </button>
            </nav>
            <main className="layout-main">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
