import React from 'react';

const Input = ({ label, id, type = 'text', value, onChange, placeholder, required = false, disabled = false, style = {}, error = false }) => {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        marginBottom: '16px',
        width: '100%'
    };

    const labelStyle = {
        fontSize: '0.9rem',
        color: error ? '#f59e0b' : 'var(--color-text-muted)', // Yellow if error
        fontWeight: '500',
        marginLeft: '4px'
    };

    const inputStyle = {
        padding: '12px 16px',
        borderRadius: 'var(--radius-sm)',
        border: error ? '2px solid #ef4444' : '1px solid var(--color-secondary)', // Red border if error
        background: '#ffffff',
        color: error ? '#ef4444' : 'var(--color-text-main)', // Red text if error
        fontWeight: error ? '700' : 'normal', // Bold if error
        fontSize: '1rem',
        outline: 'none',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        width: '100%',
        ...style
    };

    return (
        <div style={containerStyle}>
            {label && <label htmlFor={id} style={labelStyle}>{label} {required && <span style={{ color: 'var(--color-accent)' }}>*</span>}</label>}
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                style={inputStyle}

            />
        </div>
    );
};

export default Input;
