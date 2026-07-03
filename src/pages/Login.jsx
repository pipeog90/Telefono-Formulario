import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../services/firebase';
import Button from '../components/ui/Button';
import { User, Lock, Eye, EyeOff, ArrowRight, Database, Mail } from 'lucide-react';

import { useAuth } from '../context/AuthContext';

const Login = () => {
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Redirect if already logged in - Use SPA navigation
    React.useEffect(() => {
        if (user) {
            navigate('/', { replace: true });
        }
    }, [user, navigate]);

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
                            src="/logo_nuevo.png"
                            alt="Teléfono de la Esperanza"
                            className="logo-img logo-image"
                            style={{ marginBottom: '2px' }}
                        />
                    </div>

                    {/* Titles */}
                    <h1 className="app-title" style={{ marginTop: '2px', marginBottom: '2px' }}>
                        Ángel al Teléfono
                    </h1>
                    <p className="app-subtitle" style={{ marginTop: '2px', marginBottom: '2px' }}>
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
                                    <legend style={{ textAlign: 'center' }}>Usuario</legend>
                                    <div className="input-content justify-center" >
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
                                    <legend style={{ textAlign: 'center' }}>Contraseña</legend>
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
                                    className="btn-login-premium primary"
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
                                            <ArrowRight size={18} style={{ marginLeft: '6px' }} />
                                        </>
                                    )}
                                </button>
                            </form>

                            <div style={{ marginTop: '2px', textAlign: 'center' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowChangePassword(true);
                                        setError('');
                                    }}
                                    className="btn-login-premium secondary"
                                >
                                    Cambiar Contraseña
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowRecovery(true);
                                        setError('');
                                    }}
                                    className="btn-login-premium secondary"
                                >
                                    Recuperar Contraseña
                                </button>
                            </div>
                        </>
                    ) : showChangePassword ? (
                        <div style={{ width: '100%' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0px', color: '#1f2937' }}>Cambiar Contraseña</h2>

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

                            <form onSubmit={handleChangePassword} className="space-y-2">
                                <fieldset className="input-fieldset">
                                    <legend style={{ textAlign: 'center' }}>Usuario</legend>
                                    <div className="input-content justify-center" >
                                        <User className="icon" size={18} />
                                        <input
                                            type="text"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="input-field text-center"
                                            placeholder="Ingrese su usuario"
                                            required
                                        />
                                    </div>
                                </fieldset>

                                <fieldset className="input-fieldset">
                                    <legend style={{ textAlign: 'center' }}>Contraseña Actual</legend>
                                    <div className="input-content justify-center" style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Lock className="icon" size={18} />
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
                                        >
                                            {showOldPass ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </fieldset>

                                <fieldset className="input-fieldset">
                                    <legend style={{ textAlign: 'center' }}>Nueva Contraseña</legend>
                                    <div className="input-content justify-center" style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Lock className="icon" size={18} />
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
                                        >
                                            {showNewPass ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </fieldset>

                                <fieldset className="input-fieldset">
                                    <legend style={{ textAlign: 'center' }}>Confirmar Nueva Contraseña</legend>
                                    <div className="input-content justify-center" style={{ width: '100%', display: 'flex', alignItems: 'center' }}>
                                        <Lock className="icon" size={18} />
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
                                        >
                                            {showConfirmPass ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </fieldset>

                                <button
                                    type="submit"
                                    className="btn-login-premium primary"
                                >
                                    Actualizar Contraseña
                                </button>
                            </form>

                            <div style={{ marginTop: '4px', textAlign: 'center' }}>
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
                                    className="btn-login-premium danger"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    ) : showRecovery ? (
                        <div style={{ width: '100%' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', textAlign: 'center', marginBottom: '0px', color: '#1f2937' }}>Recuperar Contraseña</h2>

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

                            <form onSubmit={handleRecovery} className="space-y-2">
                                <fieldset className="input-fieldset">
                                    <legend style={{ textAlign: 'center' }}>Email</legend>
                                    <Mail className="icon" size={18} />
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
                                    className="btn-login-premium primary"
                                >
                                    {loading ? 'Enviando...' : 'Recuperar Contraseña'}
                                </button>
                            </form>

                            <div style={{ marginTop: '4px', textAlign: 'center' }}>
                                <button
                                    onClick={() => {
                                        setShowRecovery(false);
                                        setRecoveryError('');
                                        setRecoverySuccess('');
                                        setError('');
                                        setRecoveryEmail('');
                                    }}
                                    className="btn-login-premium danger"
                                >
                                    Cancelar
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
