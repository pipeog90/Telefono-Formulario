import React, { useState, useEffect } from 'react';
import { auth } from '../services/firebase';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import { Users as UsersIcon, UserPlus, Trash2, Edit2, Save, X, Mail, KeyRound, Eye, EyeOff } from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

const isFakeEmail = (email) => !email || email.endsWith('@te.org');

const PasswordInput = ({ label, value, onChange, placeholder, style = {}, centered = false }) => {
    const [show, setShow] = useState(false);

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
        marginBottom: '2px',
        width: '100%'
    };

    const labelStyle = {
        fontSize: '0.9rem',
        color: 'var(--color-text-muted)',
        fontWeight: '500',
        marginLeft: centered ? '0' : '4px',
        textAlign: centered ? 'center' : 'left'
    };

    const inputStyle = {
        padding: 'var(--input-padding)',
        paddingRight: '40px', // For the eye icon
        borderRadius: 'var(--radius-sm)',
        border: '1px solid #43A047',
        background: '#ffffff',
        color: 'var(--color-text-main)',
        fontWeight: 'normal',
        fontSize: 'var(--input-font-size)',
        lineHeight: 'var(--input-line-height)',
        height: 'var(--input-height)',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        width: '100%',
        appearance: 'none',
        WebkitAppearance: 'none',
        MozAppearance: 'none',
        boxShadow: 'none',
        textAlign: centered ? 'center' : 'left',
        ...style
    };

    return (
        <div style={containerStyle}>
            {label && <label style={labelStyle}>{label}</label>}
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center', width: '100%' }}>
                <input
                    type={show ? "text" : "password"}
                    value={value}
                    onChange={onChange}
                    placeholder={placeholder}
                    style={inputStyle}
                    className="mobile-input-fix"
                />
                <button
                    type="button"
                    onClick={() => setShow(!show)}
                    style={{
                        position: 'absolute',
                        right: '12px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: '#9ca3af',
                        display: 'flex',
                        alignItems: 'center',
                        padding: 0
                    }}
                >
                    {show ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
            </div>
        </div>
    );
};

/** Show the email; if it's a fake @te.org, display a softer label */
const EmailDisplay = ({ email }) => {
    if (isFakeEmail(email)) {
        return (
            <span style={{ color: '#9ca3af', fontStyle: 'italic', fontSize: '0.85rem' }}>
                {email || '—'} <span style={{ fontSize: '0.75rem' }}>(sin email real)</span>
            </span>
        );
    }
    return <span>{email}</span>;
};

// ─── Component ───────────────────────────────────────────────────────────────

const Users = () => {
    const [users, setUsers] = useState([]);
    const [newUser, setNewUser] = useState({ name: '', username: '', email: '', password: '', role: 'user' });
    const [editingUser, setEditingUser] = useState(null);
    const [userError, setUserError] = useState('');
    const [userSuccess, setUserSuccess] = useState('');
    const [editError, setEditError] = useState('');
    const [resetStatus, setResetStatus] = useState({}); // { uid: 'sending' | 'sent' | 'error:msg' }

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const fetchedUsers = await auth.getUsers();
            setUsers(fetchedUsers);
        } catch (err) {
            console.error('Error loading users:', err);
        }
    };

    const isValidUsername = (username) => /^[a-zA-Z0-9._]+$/.test(username);

    // ── Create ──────────────────────────────────────────────────────────────
    const handleAddUser = async (e) => {
        e.preventDefault();
        setUserError('');
        setUserSuccess('');

        const { name, username, password, role, email } = newUser;

        if (!name || !username || !password) {
            setUserError('Nombre, usuario y contraseña son obligatorios.');
            return;
        }
        if (!isValidUsername(username)) {
            setUserError('El usuario solo puede contener letras, números, puntos y guiones bajos.');
            return;
        }
        if (email && !email.includes('@')) {
            setUserError('El email debe tener un formato válido (ej: usuario@dominio.com).');
            return;
        }

        try {
            // Pass username as the login identifier; email is optional real address
            await auth.createUser({ name, email: username, password, role, realEmail: email || null });
            setUserSuccess(`Usuario ${name} creado exitosamente.`);
            setNewUser({ name: '', username: '', email: '', password: '', role: 'user' });
            loadUsers();
        } catch (err) {
            setUserError(err.message || 'Error al crear usuario.');
        }
    };

    // ── Delete ──────────────────────────────────────────────────────────────
    const handleDeleteUser = async (uid) => {
        const userToDelete = users.find(u => u.uid === uid);
        if (userToDelete && (userToDelete.username === 'admin' || userToDelete.email === 'admin@te.org')) {
            alert('No se puede eliminar al Super Administrador.');
            return;
        }
        if (auth.currentUser && auth.currentUser.uid === uid) {
            alert('No puedes eliminar tu propia cuenta.');
            return;
        }
        if (window.confirm('¿Está seguro de eliminar este usuario?')) {
            try {
                await auth.deleteUser(uid);
                loadUsers();
            } catch (err) {
                console.error('Error deleting user:', err);
            }
        }
    };

    // ── Edit ─────────────────────────────────────────────────────────────────
    const startEdit = (user) => {
        if (user.username === 'admin' || user.email === 'admin@te.org') {
            alert('No se puede editar al Super Administrador.');
            return;
        }
        setEditingUser({ ...user });
        setEditError('');
    };

    const cancelEdit = () => {
        setEditingUser(null);
        setEditError('');
    };

    const saveEdit = async () => {
        setEditError('');
        if (!editingUser.name) {
            setEditError('El nombre es obligatorio.');
            return;
        }
        if (editingUser.realEmail && !editingUser.realEmail.includes('@')) {
            setEditError('El email debe tener un formato válido.');
            return;
        }
        try {
            await auth.updateUser(editingUser.uid, {
                name: editingUser.name,
                role: editingUser.role,
                realEmail: editingUser.realEmail || null
            });
            setEditingUser(null);
            loadUsers();
        } catch (err) {
            console.error('Error updating user:', err);
            setEditError(err.message || 'Error al actualizar usuario.');
        }
    };

    // ── Reset Password ───────────────────────────────────────────────────────
    const handleResetPassword = async (u) => {
        const emailToReset = u.realEmail;
        if (!emailToReset || isFakeEmail(emailToReset)) {
            setResetStatus(prev => ({ ...prev, [u.uid]: 'error:Sin email real registrado. Edite el usuario y añada un email válido primero.' }));
            return;
        }
        setResetStatus(prev => ({ ...prev, [u.uid]: 'sending' }));
        try {
            await auth.resetPassword(emailToReset);
            setResetStatus(prev => ({ ...prev, [u.uid]: 'sent' }));
            setTimeout(() => setResetStatus(prev => { const s = { ...prev }; delete s[u.uid]; return s; }), 5000);
        } catch (err) {
            setResetStatus(prev => ({ ...prev, [u.uid]: `error:${err.message}` }));
        }
    };

    // ── Shared button style ──────────────────────────────────────────────────
    const btnStyle = (color, bg = 'transparent') => ({
        border: `1px solid ${color}`,
        color,
        background: bg,
        padding: '5px 10px',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '0.8rem',
        fontWeight: '500',
        whiteSpace: 'nowrap'
    });

    return (
        <div className="container animate-fade-in" style={{ paddingBottom: '4rem' }}>
            <h2 style={{ color: 'var(--color-secondary)', borderBottom: '2px solid var(--color-secondary)', paddingBottom: '2px', marginBottom: '2px', fontWeight: '600' }}>
                Gestión de Usuarios
            </h2>

            {/* ── Add User Form ─────────────────────────────────────────── */}
            <div className="glass-panel card-responsive-padding" style={{ marginBottom: '2px' }}>
                <h3 className="section-title">
                    <UserPlus size={20} /> Agregar Nuevo Usuario
                </h3>
                <form onSubmit={handleAddUser} style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', 
                    gap: '12px', 
                    alignItems: 'end'
                }}>
                    <Input
                        label="Nombre Completo"
                        value={newUser.name}
                        onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                        placeholder="Ej: Juan Pérez"
                        centered={true}
                    />
                    <Input
                        label="Usuario (Login)"
                        value={newUser.username}
                        onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                        placeholder="Ej: jperez"
                        centered={true}
                    />
                    <PasswordInput
                        label="Contraseña inicial"
                        value={newUser.password}
                        onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                        placeholder="Mínimo 6 caracteres"
                        centered={true}
                    />
                    <Input
                        label="Email real (opcional)"
                        type="email"
                        value={newUser.email}
                        onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                        placeholder="Ej: juan@empresa.com"
                        centered={true}
                    />
                    <Select
                        label="Rol"
                        value={newUser.role}
                        onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                        options={[
                            { value: 'user', label: 'Orientador (Usuario)' },
                            { value: 'admin', label: 'Administrador' }
                        ]}
                        centered={true}
                    />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '2px' }}>
                        <label style={{ fontSize: '0.9rem', visibility: 'hidden', padding: '0', margin: '0' }}>Spacer</label>
                        <Button type="submit" variant="primary" style={{ height: 'var(--input-height)' }}>Crear Usuario</Button>
                    </div>
                </form>
                {userError && <p style={{ color: 'red', fontWeight: 'bold', marginTop: '10px' }}>{userError}</p>}
                {userSuccess && <p style={{ color: 'green', marginTop: '10px' }}>{userSuccess}</p>}
            </div>

            {/* ── Users Table ───────────────────────────────────────────── */}
            <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
                <div className="table-responsive-wrapper">
                    <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--color-primary-light)' }}>
                            <tr>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Nombre</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Usuario</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: '15px', textAlign: 'left' }}>Rol</th>
                                <th style={{ padding: '15px', textAlign: 'right' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(u => {
                                const isAdmin = u.username === 'admin' || u.email === 'admin@te.org';
                                const isEditing = editingUser && editingUser.uid === u.uid;
                                const rs = resetStatus[u.uid];
                                const hasRealEmail = u.realEmail && !isFakeEmail(u.realEmail);

                                return (
                                    <tr key={u.uid} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        {/* Name */}
                                        <td style={{ padding: '15px' }}>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="input-field mobile-input-fix"
                                                    value={editingUser.name}
                                                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                                />
                                            ) : u.name}
                                        </td>

                                        {/* Username */}
                                        <td style={{ padding: '15px', color: '#6b7280', fontSize: '0.9rem' }}>
                                            {u.username || (u.email ? u.email.replace('@te.org', '') : '—')}
                                        </td>

                                        {/* Email */}
                                        <td style={{ padding: '15px' }}>
                                            {isEditing ? (
                                                <input
                                                    type="email"
                                                    className="input-field mobile-input-fix"
                                                    value={editingUser.realEmail || ''}
                                                    onChange={e => setEditingUser({ ...editingUser, realEmail: e.target.value })}
                                                    placeholder="email@dominio.com (opcional)"
                                                />
                                            ) : (
                                                <EmailDisplay email={u.realEmail} />
                                            )}
                                        </td>

                                        {/* Role */}
                                        <td style={{ padding: '15px' }}>
                                            {isEditing ? (
                                                <select
                                                    className="input-field"
                                                    value={editingUser.role}
                                                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                                >
                                                    <option value="user">Orientador</option>
                                                    <option value="admin">Administrador</option>
                                                </select>
                                            ) : (
                                                <span style={{
                                                    padding: '4px 8px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.8rem',
                                                    backgroundColor: u.role === 'admin' ? '#e0e7ff' : '#f3f4f6',
                                                    color: u.role === 'admin' ? '#3730a3' : '#374151'
                                                }}>
                                                    {u.role === 'admin' ? 'Administrador' : 'Orientador'}
                                                </span>
                                            )}
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding: '15px', textAlign: 'right' }}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '5px' }}>
                                                    {editError && (
                                                        <span style={{ color: 'red', fontWeight: 'bold', fontSize: '0.8rem' }}>
                                                            {editError}
                                                        </span>
                                                    )}
                                                    <div style={{ display: 'flex', gap: '5px' }}>
                                                        <button onClick={saveEdit} style={btnStyle('white', 'var(--color-success)')}>
                                                            <Save size={14} style={{ verticalAlign: 'middle', marginRight: '3px' }} />Guardar
                                                        </button>
                                                        <button onClick={cancelEdit} style={btnStyle('#6b7280')}>
                                                            <X size={14} style={{ verticalAlign: 'middle', marginRight: '3px' }} />Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : isAdmin ? (
                                                <span style={{ fontSize: '0.8rem', color: '#999', fontStyle: 'italic' }}>Super Admin</span>
                                            ) : (
                                                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
                                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                                                        {/* Edit */}
                                                        <button onClick={() => startEdit(u)} style={btnStyle('var(--color-primary)')}>
                                                            <Edit2 size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />Editar
                                                        </button>

                                                        {/* Reset password — only enabled if real email exists */}
                                                        <button
                                                            onClick={() => handleResetPassword(u)}
                                                            disabled={rs === 'sending'}
                                                            title={hasRealEmail ? `Enviar enlace de reseteo a ${u.realEmail}` : 'El usuario no tiene email real registrado'}
                                                            style={{
                                                                ...btnStyle(hasRealEmail ? '#f59e0b' : '#d1d5db', 'transparent'),
                                                                cursor: hasRealEmail ? 'pointer' : 'not-allowed',
                                                                opacity: hasRealEmail ? 1 : 0.5
                                                            }}
                                                        >
                                                            <KeyRound size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />
                                                            {rs === 'sending' ? 'Enviando…' : 'Reset contraseña'}
                                                        </button>

                                                        {/* Delete */}
                                                        {auth.currentUser?.uid !== u.uid && (
                                                            <button onClick={() => handleDeleteUser(u.uid)} style={btnStyle('var(--color-danger)')}>
                                                                <Trash2 size={13} style={{ verticalAlign: 'middle', marginRight: '3px' }} />Eliminar
                                                            </button>
                                                        )}
                                                    </div>

                                                    {/* Reset feedback */}
                                                    {rs === 'sent' && (
                                                        <span style={{ color: 'green', fontSize: '0.78rem' }}>
                                                            ✔ Enlace enviado a {u.realEmail}
                                                        </span>
                                                    )}
                                                    {rs && rs.startsWith('error:') && (
                                                        <span style={{ color: 'red', fontSize: '0.78rem', maxWidth: '260px', textAlign: 'right' }}>
                                                            {rs.replace('error:', '')}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Users;
