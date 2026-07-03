import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { ListsProvider } from './context/ListsContext';
import ErrorBoundary from '../../src/components/ErrorBoundary';

// Lazy-loaded pages for code splitting
const Home = React.lazy(() => import('./pages/Home'));
const Admin = React.lazy(() => import('./pages/Admin'));
const Reportes = React.lazy(() => import('./pages/Reportes'));

const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '40vh' }}>
    <div style={{ width: '2rem', height: '2rem', border: '3px solid #E8F5E9', borderTopColor: '#66BB6A', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
  </div>
);

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
    <ErrorBoundary>
      <ListsProvider>
        <Router>
          <div className="app-wrapper">
            <Navigation />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/reportes" element={<Reportes />} />
              </Routes>
            </Suspense>
          </div>
        </Router>
      </ListsProvider>
    </ErrorBoundary>
  );
}

export default App;
