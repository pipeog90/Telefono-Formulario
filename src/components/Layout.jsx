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
        padding: '8px 16px',
        borderRadius: 'var(--radius-sm)',
        transition: 'all 0.3s ease',
        background: isActive ? 'rgba(34, 197, 94, 0.1)' : 'transparent',
        border: isActive ? '1px solid rgba(34, 197, 94, 0.2)' : '1px solid transparent'
    };

    return (
        <Link to={to} style={style}>
            {children}
        </Link>
    );
};



const Layout = () => {
    const navigate = useNavigate();
    const { user } = useAuth();

    const isAdmin = user && user.role === 'admin';

    const handleLogout = async () => {
        await auth.signOut();
        
        // Clear locally persisted form data
        localStorage.removeItem('callFormDraft');
        localStorage.removeItem('adminSelectedList');
        
        // Hard redirect to force complete clearance of React memory state 
        // to ensure all 4 subdomains start clean for the next user.
        window.location.href = '/login';
    };

    return (
        <div className="app-wrapper">
            <nav className="layout-nav">
                <div
                    style={{
                        display: 'flex',
                        gap: '15px',
                        overflowX: 'auto',
                        whiteSpace: 'nowrap',
                        paddingBottom: '5px',
                        paddingRight: '15px',
                        flex: 1,
                        marginRight: '15px',
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}
                    className="no-scrollbar"
                >
                    <NavLink to="/">1. Registro de Llamadas</NavLink>
                    {isAdmin && <NavLink to="/admin">2. Administración de Listas</NavLink>}
                    <NavLink to="/reportes">3. Generación de Reportes</NavLink>
                    {isAdmin && <NavLink to="/users">4. Gestión de Usuarios</NavLink>}
                    <style>{`
                        .no-scrollbar::-webkit-scrollbar {
                            display: none;
                        }
                    `}</style>
                </div>
                <button
                    onClick={handleLogout}
                    className="logout-btn-nav"
                >
                    <LogOut size={20} strokeWidth={2.5} />
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
