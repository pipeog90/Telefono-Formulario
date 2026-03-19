import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/Admin';
import Reportes from './pages/Reportes';
import { ListsProvider } from './context/ListsContext';

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

const Navigation = () => {
  return (
    <nav style={{
      display: 'flex',
      justifyContent: 'center',
      gap: '10px',
      padding: '20px',
      marginBottom: '20px',
      borderBottom: '1px solid var(--color-glass-border)',
      background: 'rgba(255, 255, 255, 0.8)',
      backdropFilter: 'blur(10px)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <NavLink to="/">1. Registro de Llamadas</NavLink>
      <NavLink to="/admin">2. Administración de Listas</NavLink>
      <NavLink to="/reportes">3. Generación de Reportes</NavLink>
    </nav>
  );
};

function App() {
  return (
    <ListsProvider>
      <Router>
        <div className="app-wrapper">
          <Navigation />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/reportes" element={<Reportes />} />
          </Routes>
        </div>
      </Router>
    </ListsProvider>
  );
}

export default App;
