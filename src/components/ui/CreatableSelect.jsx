import React, { useState, useRef, useEffect } from 'react';
import { X } from 'lucide-react';

const CreatableSelect = ({ label, id, value, onChange, options, placeholder = 'Seleccione...', tooltip = '', required = false, disabled = false, style = {} }) => {
    const [isCreating, setIsCreating] = useState(false);
    const inputRef = useRef(null);

    // If the parent passes a value that is NOT in the options, 
    // it implies we should be in "creating" mode (e.g. editing a user with a custom centro).
    useEffect(() => {
        if (value && !options.some(opt => opt.value === value) && value !== '') {
            setIsCreating(true);
        }
    }, [value, options]);

    useEffect(() => {
        if (isCreating && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isCreating]);

    const handleSelectChange = (e) => {
        if (e.target.value === '__NEW__') {
            setIsCreating(true);
            onChange({ target: { id, value: '' } });
        } else {
            onChange(e);
        }
    };

    const handleCancelCreate = () => {
        setIsCreating(false);
        onChange({ target: { id, value: '' } });
    };

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        width: '100%',
        position: 'relative',
        minWidth: 0
    };

    const labelStyle = {
        marginLeft: '4px',
        textAlign: 'left',
        fontSize: '0.9rem',
        color: disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
        fontWeight: '500'
    };

    return (
        <div style={containerStyle}>
            {label && (
                <label style={labelStyle} htmlFor={id}>
                    {label} {required && <span style={{ color: 'var(--color-accent)' }}>*</span>}
                    {tooltip && <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginLeft: '4px', cursor: 'help' }} title={tooltip}>ⓘ</span>}
                </label>
            )}

            {!isCreating ? (
                <select
                    id={id}
                    value={value || ''}
                    onChange={handleSelectChange}
                    disabled={disabled}
                    className="ui-select"
                    style={{ ...style, width: '100%' }}
                >
                    <option value="" disabled>{placeholder}</option>
                    {options.map((opt, i) => (
                        <option key={i} value={opt.value}>{opt.label}</option>
                    ))}
                    <option value="__NEW__" style={{ fontWeight: 'bold', color: 'var(--color-primary)' }}>
                        ➕ Agregar un nuevo Centro...
                    </option>
                </select>
            ) : (
                <div style={{ position: 'relative', width: '100%' }}>
                    <input
                        ref={inputRef}
                        id={id}
                        type="text"
                        value={value || ''}
                        onChange={onChange}
                        disabled={disabled}
                        placeholder="Escriba el nuevo valor..."
                        className="ui-input"
                        style={{ ...style, width: '100%', paddingRight: '30px' }}
                    />
                    <button
                        type="button"
                        onClick={handleCancelCreate}
                        title="Cancelar y volver a la lista"
                        style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#e74c3c',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            padding: '2px'
                        }}
                    >
                        <X size={18} style={{ strokeWidth: 2.5 }} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default CreatableSelect;
