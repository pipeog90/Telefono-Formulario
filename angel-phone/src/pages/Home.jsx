import React from 'react';
import CallForm from '../components/CallForm';
import AngelLogo from '../components/ui/AngelLogo';

const Home = () => {
    return (
        <div className="container">
            <header style={{ textAlign: 'center', marginBottom: '40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <AngelLogo />
                <h1 className="animate-fade-in" style={{ marginTop: '10px' }}>Ángel al Teléfono</h1>
                <p style={{ color: 'var(--color-text-muted)', fontSize: '1.1rem' }}>
                    Sistema de Registro de Asistencia Emocional
                </p>
            </header>

            <main>
                <CallForm />
            </main>

            <footer style={{ textAlign: 'center', marginTop: '60px', color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>
                <p>&copy; {new Date().getFullYear()} Ángel al Teléfono. Prototipo Funcional. **AngelPhone.V.3.5**.</p>
            </footer>
        </div>
    );
};

export default Home;
