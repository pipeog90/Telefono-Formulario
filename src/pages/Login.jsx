import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import Button from '../components/ui/Button';
import { User, Lock, Eye, EyeOff, ArrowRight, Database } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in - Force hard reload to ensure clean state
    React.useEffect(() => {
        if (user) {
            window.location.href = '/';
        }
    }, [user]);

    const [showChangePassword, setShowChangePassword] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPass, setShowOldPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);
    const [changePassError, setChangePassError] = useState('');
    const [changePassSuccess, setChangePassSuccess] = useState('');
    const [showRecovery, setShowRecovery] = useState(false);
    const [recoveryEmail, setRecoveryEmail] = useState('');
    const [recoveryError, setRecoveryError] = useState('');
    const [recoverySuccess, setRecoverySuccess] = useState('');

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await auth.signInWithEmailAndPassword(email, password);
            // Navigation handled by useEffect
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setChangePassError('');
        setChangePassSuccess('');

        if (newPassword !== confirmPassword) {
            setChangePassError('Las nuevas contraseñas no coinciden.');
            return;
        }

        if (newPassword.length < 4) {
            setChangePassError('La contraseña debe tener al menos 4 caracteres.');
            return;
        }

        try {
            await auth.changePassword(email, oldPassword, newPassword);
            setChangePassSuccess('¡Contraseña actualizada exitosamente! Ahora puedes iniciar sesión.');
            setTimeout(() => {
                setShowChangePassword(false);
                setPassword(''); // Clear password field to force re-entry
                setChangePassSuccess('');
                setNewPassword('');
                setConfirmPassword('');
                setOldPassword('');
            }, 2000);
        } catch (err) {
            setChangePassError(err.message || 'Error al cambiar la contraseña.');
        }
    };

    const handleRecovery = async (e) => {
        e.preventDefault();
        setRecoveryError('');
        setRecoverySuccess('');
        setLoading(true);

        try {
            await auth.resolveAndResetPassword(recoveryEmail);
            setRecoverySuccess('Si el correo ingresado está registrado en nuestro sistema, recibirá un enlace de recuperación. (Por favor, revise también su carpeta de Spam o Correo no deseado).');
        } catch (err) {
            setRecoverySuccess('Si el correo ingresado está registrado en nuestro sistema, recibirá un enlace de recuperación. (Por favor, revise también su carpeta de Spam o Correo no deseado).');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            {/* Card Container */}
            <div className="login-card fade-in">

                {/* Header Section */}
                <div className="login-header">
                    {/* Logo */}
                    <div className="logo-container">
                        <img
                            src="/logo.png"
                            alt="Teléfono de la Esperanza"
                            className="logo-img logo-image"
                        />
                    </div>

                    {/* Titles */}
                    <h1 className="app-title">
                        Ángel al Teléfono
                    </h1>
                    <p className="app-subtitle">
                        Sistema de Gestión de Llamadas
                    </p>
                </div>

                {/* Form */}
                {/* Form */}
                <div className="login-form">
                    {error && (
                        <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center', color: 'red', fontWeight: 'bold' }}>
                            <span>⚠️</span> {error}
                        </div>
                    )}

                    {!showChangePassword && !showRecovery ? (
                        <>
                            <form onSubmit={handleLogin} style={{ width: '100%' }}>
                                {/* Usuario Fieldset */}
                                <fieldset className="input-fieldset">
                                    <legend className="text-center w-full">Usuario</legend>
                                    <div className="input-content justify-center">
                                        <User className="icon" size={18} />
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="input-field text-center"
                                            required
                                        />
                                    </div>
                                </fieldset>

                                {/* Contraseña Fieldset */}
                                <fieldset className="input-fieldset">
                                    <legend className="text-center w-full">Contraseña</legend>
                                    <div className="input-content justify-center">
                                        <Lock className="icon" size={18} />
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className="input-field text-center"
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="password-toggle"
                                        >
                                            {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </fieldset>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary mt-6"
                                >
                                    {loading ? (
                                        <span className="flex items-center gap-2 justify-center">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </span>
                                    ) : (
                                        <>
                                            Ingresar al Sistema
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div style={{ marginTop: '1.0rem', textAlign: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowChangePassword(true);
                                        setError('');
                                    }}
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        background: 'linear-gradient(135deg, #AED581 0%, #8BC34A 100%)',
                                        borderColor: '#8BC34A',
                                        boxShadow: '0 4px 15px rgba(139, 195, 74, 0.3)'
                                    }}
                                >
                                    Cambiar Contraseña
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRecovery(true);
                                        setError('');
                                    }}
                                    className="btn-primary"
                                    style={{
                                        width: '100%',
                                        justifyContent: 'center',
                                        marginTop: '1.5rem',
                                        background: 'linear-gradient(135deg, #AED581 0%, #8BC34A 100%)',
                                        borderColor: '#8BC34A',
                                        boxShadow: '0 4px 15px rgba(139, 195, 74, 0.3)'
                                    }}
                                >
                                    Recuperar Contraseña
                                </button>
                            </div>
                        </>
                    ) : showChangePassword ? (
                        <div style={{ width: '100%' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem', color: '#1f2937' }}>Cambiar Contraseña</h2>

                            {changePassError && (
                                <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center', color: 'red', fontWeight: 'bold' }}>
                                    {changePassError}
                                </div>
                            )}

                            {changePassSuccess && (
                                <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
                                    {changePassSuccess}
                                </div>
                            )}

                            <form onSubmit={handleChangePassword} className="space-y-4">
                                <fieldset className="input-fieldset">
                                    <legend style={{ textAlign: 'center' }}>Usuario</legend>
                                    <input
                                        type="text"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="input-field text-center"
                                        placeholder="Ingrese su usuario"
                                        required
                                    />
                                </fieldset>

                                <fieldset className="input-fieldset">
                                    <legend style={{ textAlign: 'center' }}>Contraseña Actual</legend>
                                    <div className="input-content justify-center" style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Lock className="icon" size={18} style={{ marginLeft: '10px' }} />
                                        <input
                                            type={showOldPass ? "text" : "password"}
                                            value={oldPassword}
                                            onChange={(e) => setOldPassword(e.target.value)}
                                            className="input-field text-center"
                                            style={{ flex: 1 }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowOldPass(!showOldPass)}
                                            className="password-toggle"
                                            style={{ marginRight: '10px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center' }}
                                        >
                                            {showOldPass ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </fieldset>

                                <fieldset className="input-fieldset">
                                    <legend style={{ textAlign: 'center' }}>Nueva Contraseña</legend>
                                    <div className="input-content justify-center" style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Lock className="icon" size={18} style={{ marginLeft: '10px' }} />
                                        <input
                                            type={showNewPass ? "text" : "password"}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className="input-field text-center"
                                            style={{ flex: 1 }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPass(!showNewPass)}
                                            className="password-toggle"
                                            style={{ marginRight: '10px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center' }}
                                        >
                                            {showNewPass ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </fieldset>

                                <fieldset className="input-fieldset">
                                    <legend style={{ textAlign: 'center' }}>Confirmar Nueva Contraseña</legend>
                                    <div className="input-content justify-center" style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Lock className="icon" size={18} style={{ marginLeft: '10px' }} />
                                        <input
                                            type={showConfirmPass ? "text" : "password"}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className="input-field text-center"
                                            style={{ flex: 1 }}
                                            required
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                                            className="password-toggle"
                                            style={{ marginRight: '10px', background: 'transparent', border: 'none', display: 'flex', alignItems: 'center' }}
                                        >
                                            {showConfirmPass ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </fieldset>

                                <button
                                    type="submit"
                                    className="btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', marginTop: '2rem' }}
                                >
                                    Actualizar Contraseña
                                </button>
                            </form>

                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <button
                                    onClick={() => {
                                        setShowChangePassword(false);
                                        setChangePassError('');
                                        setChangePassSuccess('');
                                        setError('');
                                        setNewPassword('');
                                        setConfirmPassword('');
                                        setOldPassword('');
                                    }}
                                    className="btn-primary"
                                    style={{
                                        background: '#EF4444',
                                        width: '100%',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                                    }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    ) : showRecovery ? (
                        <div style={{ width: '100%' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '1.5rem', color: '#1f2937' }}>Recuperar Contraseña</h2>

                            {recoveryError && (
                                <div style={{ backgroundColor: '#fef2f2', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center', color: 'red', fontWeight: 'bold' }}>
                                    {recoveryError}
                                </div>
                            )}

                            {recoverySuccess && (
                                <div style={{ backgroundColor: '#f0fdf4', color: '#16a34a', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem', textAlign: 'center' }}>
                                    {recoverySuccess}
                                </div>
                            )}

                            <form onSubmit={handleRecovery} className="space-y-4">
                                <fieldset className="input-fieldset">
                                    <legend style={{ textAlign: 'center' }}>Email</legend>
                                    <input
                                        type="text"
                                        value={recoveryEmail}
                                        onChange={(e) => setRecoveryEmail(e.target.value)}
                                        className="input-field text-center"
                                        placeholder="Ingrese su usuario o correo"
                                        required
                                    />
                                </fieldset>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-primary"
                                    style={{ width: '100%', justifyContent: 'center', marginTop: '2rem' }}
                                >
                                    {loading ? 'Enviando...' : 'Recuperar Contraseña'}
                                </button>
                            </form>

                            <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                                <button
                                    onClick={() => {
                                        setShowRecovery(false);
                                        setRecoveryError('');
                                        setRecoverySuccess('');
                                        setError('');
                                        setRecoveryEmail('');
                                    }}
                                    className="btn-primary"
                                    style={{
                                        background: '#EF4444',
                                        width: '100%',
                                        justifyContent: 'center',
                                        boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
                                    }}
                                >
                                    Cerrar
                                </button>
                            </div>
                        </div>
                    ) : null}
                </div>

                <div className="footer">
                    <p className="footer-text">
                        © 2024 Fundación Teléfono de la Esperanza Medellín
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Login;
