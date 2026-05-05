import React, { useState, useEffect, useRef } from 'react';
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
        paddingRight: '36px', // For the eye icon
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
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
        textAlign: 'left', // Always left-align — centering with a right-side icon causes overlap
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
    const [newUser, setNewUser] = useState({ name: '', username: '', email: '', password: '', role: 'user', Clave: '', direccion: '', centro: 'Medellín', fecha_alta: '', fecha_baja: '' });
    const [editingUser, setEditingUser] = useState(null);
    const [userError, setUserError] = useState('');
    const [userSuccess, setUserSuccess] = useState('');
    const [editError, setEditError] = useState('');
    const [resetStatus, setResetStatus] = useState({}); // { uid: 'sending' | 'sent' | 'error:msg' }
    const editRowRef = useRef(null);

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

        const { name, username, password, role, email, Clave } = newUser;

        if (!name || !username || !password || !Clave) {
            setUserError('Nombre, usuario, contraseña y clave son obligatorios.');
            return;
        }
        if (!/^[a-zA-Z]{1,3}$/.test(Clave)) {
            setUserError('La clave debe contener solo letras (máximo 3).');
            return;
        }
        if (!isValidUsername(username)) {
            setUserError('El usuario solo puede contener letras, números, puntos y guiones bajos.');
            return;
        }
        
        const claveExists = users.some(u => u.Clave?.toLowerCase() === Clave.toLowerCase());
        if (claveExists) {
            setUserError('Esta clave ya está en uso por otro usuario.');
            return;
        }
        if (email && !email.includes('@')) {
            setUserError('El email debe tener un formato válido (ej: usuario@dominio.com).');
            return;
        }

        try {
            // Auto-generate MEO code (Fill gaps, start at 2 since 1 is reserved)
            const meoUsers = users.filter(u => u.Código_Orientador?.startsWith('MEO'));
            const usedNumbers = meoUsers.map(u => parseInt(u.Código_Orientador.replace('MEO', '')) || 0);
            let nextNum = 2;
            while (usedNumbers.includes(nextNum)) {
                nextNum++;
            }
            const nextMeoCode = `MEO${String(nextNum).padStart(3, '0')}`;

            // Pass username as the login identifier; email is optional real address
            await auth.createUser({ 
                name, email: username, password, role, realEmail: email || null, Clave, Código_Orientador: nextMeoCode, active: true,
                direccion: newUser.direccion || null,
                centro: newUser.centro || null,
                fecha_alta: newUser.fecha_alta || null,
                fecha_baja: newUser.fecha_baja || null
            });
            setUserSuccess(`Usuario ${name} creado exitosamente con código ${nextMeoCode}.`);
            setNewUser({ name: '', username: '', email: '', password: '', role: 'user', Clave: '', direccion: '', centro: 'Medellín', fecha_alta: '', fecha_baja: '' });
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
        // Extract the numeric part from MEO code for editing
        const meoNum = (user.Código_Orientador || '').replace(/^MEO0*/i, '');
        setEditingUser({ ...user, _meoNumber: meoNum });
        setEditError('');
        // Scroll to the editing row after React renders
        setTimeout(() => {
            if (editRowRef.current) {
                editRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 50);
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
        if (editingUser.Clave && !/^[a-zA-Z]{1,3}$/.test(editingUser.Clave)) {
            setEditError('La clave debe contener solo letras (máximo 3).');
            return;
        }
        if (editingUser.Clave) {
            const claveExistsEdit = users.some(u => u.uid !== editingUser.uid && u.Clave?.toLowerCase() === editingUser.Clave.toLowerCase());
            if (claveExistsEdit) {
                setEditError('Esta clave ya está en uso.');
                return;
            }
        }

        // Rebuild full MEO code from the number input
        const meoNumber = editingUser._meoNumber ? editingUser._meoNumber.replace(/\D/g, '') : '';
        const fullMeoCode = meoNumber ? `MEO${meoNumber.padStart(2, '0')}` : editingUser.Código_Orientador;

        if (fullMeoCode) {
            const codeExistsEdit = users.some(u => u.uid !== editingUser.uid && u.Código_Orientador?.toUpperCase() === fullMeoCode.toUpperCase());
            if (codeExistsEdit) {
                setEditError('Este código MEO ya está en uso.');
                return;
            }
        }

        try {
            // Save scroll position before update
            const scrollY = window.scrollY;

            // Build update payload — only include realEmail if it actually changed
            // to avoid triggering the Auth email sync Cloud Function unnecessarily
            const originalUser = users.find((u) => u.uid === editingUser.uid);
            const rawUpdates = {
                name: editingUser.name,
                role: editingUser.role,
                Clave: editingUser.Clave,
                Código_Orientador: fullMeoCode,
                direccion: editingUser.direccion,
                centro: editingUser.centro,
                fecha_alta: editingUser.fecha_alta,
                fecha_baja: editingUser.fecha_baja
            };
            const newEmail = editingUser.realEmail || null;
            const oldEmail = originalUser?.realEmail || null;
            if (newEmail !== oldEmail) {
                rawUpdates.realEmail = newEmail;
            }

            // Firestore rejects `undefined` values with invalid-argument — replace with null
            const updates = Object.fromEntries(
                Object.entries(rawUpdates).map(([k, v]) => [k, v === undefined ? null : v])
            );

            await auth.updateUser(editingUser.uid, updates);
            setEditingUser(null);
            await loadUsers();
            // Restore scroll position after re-render
            requestAnimationFrame(() => window.scrollTo(0, scrollY));
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
        padding: 'var(--admin-btn-padding)',
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
                <form onSubmit={handleAddUser}>
                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: '12px', 
                        alignItems: 'end'
                    }}>
                        <div style={{ flex: '1.5 1 150px' }}>
                            <Input
                                label="Nombre *"
                                value={newUser.name}
                                onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                placeholder="Ej: Juan Pérez"
                                centered={true}
                                tooltip="Nombre del orientador"
                            />
                        </div>
                        <div style={{ flex: '1.5 1 150px' }}>
                            <Input
                                label="Usuario Login *"
                                value={newUser.username}
                                onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                                placeholder="Ej: juan.perez"
                                centered={true}
                            />
                        </div>
                        <div style={{ flex: '1.5 1 150px' }}>
                            <PasswordInput
                                label="Contraseña *"
                                value={newUser.password}
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                placeholder="Mín. 6 caracteres"
                                centered={true}
                            />
                        </div>
                        <div style={{ flex: '2 1 200px' }}>
                            <Input
                                label="Email real (opcional)"
                                type="email"
                                value={newUser.email}
                                onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                placeholder="Ej: juan@empresa.com"
                                centered={true}
                                tooltip="Email"
                            />
                        </div>
                        <div style={{ flex: '1 1 120px' }}>
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
                        </div>
                        <div style={{ flex: '0.7 1 80px' }}>
                            <Input
                                label="Clave (Max 3 let.)"
                                value={newUser.Clave}
                                onChange={e => setNewUser({ ...newUser, Clave: e.target.value.toUpperCase() })}
                                placeholder="Ej: ABC"
                                centered={true}
                                tooltip="Clave del orientador."
                                maxLength={3}
                            />
                        </div>
                    </div>
                    <div style={{ 
                        display: 'flex', 
                        flexWrap: 'wrap',
                        gap: '12px', 
                        alignItems: 'end',
                        marginTop: '12px'
                    }}>
                        <div style={{ flex: '2 1 200px' }}>
                            <Input
                                label="Dirección (opcional)"
                                value={newUser.direccion}
                                onChange={e => setNewUser({ ...newUser, direccion: e.target.value })}
                                placeholder="Ej: Calle 123"
                                centered={true}
                                tooltip="Dirección"
                            />
                        </div>
                        <div style={{ flex: '1 1 120px' }}>
                            <Select
                                label="Centro (opcional)"
                                value={newUser.centro}
                                onChange={e => setNewUser({ ...newUser, centro: e.target.value })}
                                options={[{ value: 'Medellín', label: 'Medellín' }]}
                                centered={true}
                                tooltip="Centro del telefono de la Esperanza"
                            />
                        </div>
                        <div style={{ flex: '1.5 1 140px' }}>
                            <Input
                                label="Fecha Alta (opcional)"
                                type="date"
                                value={newUser.fecha_alta}
                                onChange={e => setNewUser({ ...newUser, fecha_alta: e.target.value })}
                                centered={true}
                                tooltip="Fecha en que se ingresa como orientador "
                            />
                        </div>
                        <div style={{ flex: '1.5 1 140px' }}>
                            <Input
                                label="Fecha Baja (opcional)"
                                type="date"
                                value={newUser.fecha_baja}
                                onChange={e => setNewUser({ ...newUser, fecha_baja: e.target.value })}
                                centered={true}
                                tooltip="Fecha en que se inactiva"
                            />
                        </div>
                        <div style={{ flex: '1.5 1 150px', display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '4px' }}>
                            <Button type="submit" variant="primary" style={{ height: 'var(--input-height)', width: '100%' }}>Crear Usuario</Button>
                        </div>
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
                                <th style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left' }}>Cod.</th>
                                <th style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left' }}>Nombre</th>
                                <th style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left' }}>Clave</th>
                                <th style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left' }}>Usuario</th>
                                <th style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left' }}>Email</th>
                                <th style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left' }}>Rol</th>
                                <th style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left' }}>Dirección</th>
                                <th style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left' }}>Centro</th>
                                <th style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left' }}>Fecha Alta</th>
                                <th style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left' }}>Fecha Baja</th>
                                <th style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left', width: '1px', whiteSpace: 'nowrap' }}>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...users].sort((a, b) => {
                                const codA = parseInt((a.Código_Orientador || '').replace('MEO', '')) || 9999;
                                const codB = parseInt((b.Código_Orientador || '').replace('MEO', '')) || 9999;
                                return codA - codB;
                            }).map(u => {
                                const isAdmin = u.username === 'admin' || u.email === 'admin@te.org';
                                const isEditing = editingUser && editingUser.uid === u.uid;
                                const rs = resetStatus[u.uid];
                                const hasRealEmail = u.realEmail && !isFakeEmail(u.realEmail);

                                return (
                                    <tr key={u.uid} ref={isEditing ? editRowRef : null} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                        {/* MEO Code */}
                                        <td style={{ padding: 'var(--admin-cell-padding)', fontWeight: '600', color: 'var(--color-primary)' }}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0px' }}>
                                                    <span style={{
                                                        fontWeight: '600',
                                                        fontSize: 'var(--input-font-size)',
                                                        color: 'var(--color-primary)',
                                                        whiteSpace: 'nowrap',
                                                        padding: 'var(--input-padding)',
                                                        paddingRight: '0',
                                                        minHeight: 'var(--input-height)',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        background: '#f0fdf4',
                                                        border: '1px solid #43A047',
                                                        borderRight: 'none',
                                                        borderRadius: 'var(--radius-sm) 0 0 var(--radius-sm)',
                                                        boxSizing: 'border-box'
                                                    }}>MEO</span>
                                                    <input
                                                        type="text"
                                                        value={editingUser._meoNumber || ''}
                                                        onChange={(e) => {
                                                            const val = e.target.value.replace(/\D/g, '');
                                                            setEditingUser({ ...editingUser, _meoNumber: val });
                                                        }}
                                                        maxLength={4}
                                                        placeholder="01"
                                                        style={{
                                                            width: '55px',
                                                            padding: 'var(--input-padding)',
                                                            paddingLeft: '4px',
                                                            border: '1px solid #43A047',
                                                            borderLeft: 'none',
                                                            borderRadius: '0 var(--radius-sm) var(--radius-sm) 0',
                                                            fontSize: 'var(--input-font-size)',
                                                            lineHeight: 'var(--input-line-height)',
                                                            minHeight: 'var(--input-height)',
                                                            boxSizing: 'border-box',
                                                            outline: 'none',
                                                            fontWeight: '600',
                                                            color: 'var(--color-primary)',
                                                            background: '#ffffff'
                                                        }}
                                                    />
                                                </div>
                                            ) : (u.Código_Orientador || '—')}
                                        </td>

                                        {/* Name */}
                                        <td style={{ padding: 'var(--admin-cell-padding)' }}>
                                            {isEditing ? (
                                                <Input
                                                    value={editingUser.name}
                                                    onChange={e => setEditingUser({ ...editingUser, name: e.target.value })}
                                                    centered={false}
                                                    tooltip="Nombre del orientador"
                                                />
                                            ) : u.name}
                                        </td>

                                        {/* Clave */}
                                        <td style={{ padding: 'var(--admin-cell-padding)' }}>
                                            {isEditing ? (
                                                <Input
                                                    value={editingUser.Clave || ''}
                                                    onChange={e => setEditingUser({ ...editingUser, Clave: e.target.value.toUpperCase() })}
                                                    centered={false}
                                                    tooltip="Clave del orientador."
                                                    maxLength={3}
                                                />
                                            ) : u.Clave || '—'}
                                        </td>

                                        {/* Username */}
                                        <td style={{ padding: 'var(--admin-cell-padding)', color: '#6b7280', fontSize: '0.9rem' }}>
                                            {u.username || (u.email ? u.email.replace('@te.org', '') : '—')}
                                        </td>

                                        {/* Email */}
                                        <td style={{ padding: 'var(--admin-cell-padding)' }}>
                                            {isEditing ? (
                                                <Input
                                                    type="email"
                                                    value={editingUser.realEmail || ''}
                                                    onChange={e => setEditingUser({ ...editingUser, realEmail: e.target.value })}
                                                    placeholder="email@dominio.com (opcional)"
                                                    centered={false}
                                                    tooltip="Email"
                                                />
                                            ) : (
                                                <EmailDisplay email={u.realEmail} />
                                            )}
                                        </td>

                                        {/* Role */}
                                        <td style={{ padding: 'var(--admin-cell-padding)' }}>
                                            {isEditing ? (
                                                <Select
                                                    value={editingUser.role}
                                                    onChange={e => setEditingUser({ ...editingUser, role: e.target.value })}
                                                    options={[
                                                        { value: 'user', label: 'Orientador' },
                                                        { value: 'admin', label: 'Administrador' }
                                                    ]}
                                                    centered={false}
                                                />
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


                                        {/* Dirección */}
                                        <td style={{ padding: 'var(--admin-cell-padding)' }}>
                                            {isEditing ? (
                                                <Input
                                                    value={editingUser.direccion || ''}
                                                    onChange={e => setEditingUser({ ...editingUser, direccion: e.target.value })}
                                                    centered={false}
                                                    tooltip="Dirección"
                                                />
                                            ) : u.direccion || '—'}
                                        </td>

                                        {/* Centro */}
                                        <td style={{ padding: 'var(--admin-cell-padding)' }}>
                                            {isEditing ? (
                                                <Select
                                                    value={editingUser.centro || ''}
                                                    onChange={e => setEditingUser({ ...editingUser, centro: e.target.value })}
                                                    options={[{ value: 'Medellín', label: 'Medellín' }]}
                                                    centered={false}
                                                    tooltip="Centro del telefono de la Esperanza"
                                                />
                                            ) : u.centro || '—'}
                                        </td>

                                        {/* Fecha Alta */}
                                        <td style={{ padding: 'var(--admin-cell-padding)' }}>
                                            {isEditing ? (
                                                <Input
                                                    type="date"
                                                    value={editingUser.fecha_alta || ''}
                                                    onChange={e => setEditingUser({ ...editingUser, fecha_alta: e.target.value })}
                                                    centered={false}
                                                    tooltip="Fecha en que se ingresa como orientador "
                                                />
                                            ) : u.fecha_alta || '—'}
                                        </td>

                                        {/* Fecha Baja */}
                                        <td style={{ padding: 'var(--admin-cell-padding)' }}>
                                            {isEditing ? (
                                                <Input
                                                    type="date"
                                                    value={editingUser.fecha_baja || ''}
                                                    onChange={e => setEditingUser({ ...editingUser, fecha_baja: e.target.value })}
                                                    centered={false}
                                                    tooltip="Fecha en que se inactiva"
                                                />
                                            ) : u.fecha_baja || '—'}
                                        </td>

                                        {/* Actions */}
                                        <td style={{ padding: 'var(--admin-cell-padding)', textAlign: 'left', width: '1px', whiteSpace: 'nowrap' }}>
                                            {isEditing ? (
                                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '5px' }}>
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
                                                <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '6px' }}>
                                                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'nowrap', justifyContent: 'flex-start' }}>
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
