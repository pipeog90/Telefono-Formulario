import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error in application:", error, errorInfo);
        
        // Handle ChunkLoadError (happens when lazy-loaded chunks fail to load, often due to new deployments or network drops)
        const isChunkLoadError = error.name === 'ChunkLoadError' || (error.message && /Loading chunk .* failed/.test(error.message));
        
        if (isChunkLoadError) {
            const hasReloaded = sessionStorage.getItem('chunk_load_error_reload');
            if (!hasReloaded) {
                sessionStorage.setItem('chunk_load_error_reload', 'true');
                window.location.reload(true);
            }
        }
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    minHeight: '100vh', 
                    padding: '20px', 
                    textAlign: 'center',
                    background: 'linear-gradient(180deg, #d5eed8 0%, #bbdac0 100%)',
                    fontFamily: 'var(--font-family, sans-serif)'
                }}>
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.9)',
                        padding: '40px',
                        borderRadius: '16px',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ color: '#ef4444', marginBottom: '16px', fontSize: '1.5rem', fontWeight: '600' }}>¡Oops! Algo salió mal.</h2>
                        <p style={{ color: '#4b5563', marginBottom: '24px', fontSize: '1rem' }}>
                            Ha ocurrido un error al cargar la aplicación.<br />
                            Esto suele suceder por problemas de conexión o actualizaciones.
                        </p>
                        <button 
                            onClick={() => {
                                sessionStorage.removeItem('chunk_load_error_reload');
                                window.location.reload();
                            }} 
                            style={{ 
                                padding: '12px 24px', 
                                backgroundColor: '#16a34a', 
                                color: 'white', 
                                border: 'none', 
                                borderRadius: '8px', 
                                cursor: 'pointer', 
                                fontWeight: '600',
                                fontSize: '1rem',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseOver={(e) => e.target.style.backgroundColor = '#15803d'}
                            onMouseOut={(e) => e.target.style.backgroundColor = '#16a34a'}
                        >
                            Recargar Página
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
