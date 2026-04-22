import React from 'react';
import { X } from 'lucide-react';

const Input = ({ label, id, type = 'text', value, onChange, placeholder, required = false, disabled = false, style = {}, error = false, centered = false }) => {
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        width: '100%',
        position: 'relative' // Added for absolute positioning of clear button
    };

    const labelStyle = {
        fontSize: '0.9rem',
        color: error ? '#f59e0b' : 'var(--color-text-muted)',
        fontWeight: '500',
        marginLeft: centered ? '0' : '4px',
        textAlign: centered ? 'center' : 'left',
        whiteSpace: 'nowrap'
    };

    const inputStyle = {
        padding: 'var(--input-padding)',
        paddingRight: (type === 'date' && value) ? '40px' : '12px',
        borderRadius: 'var(--radius-sm)',
        border: error ? '2px solid #ef4444' : '1px solid #43A047',
        background: '#ffffff',
        color: error ? '#ef4444' : 'var(--color-text-main)',
        fontWeight: error ? '700' : 'normal',
        fontSize: 'var(--input-font-size)',
        lineHeight: 'var(--input-line-height)',
        minHeight: 'var(--input-height)',
        height: 'auto',
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

    const isDateEmpty = type === 'date' && !value;

    return (
        <div style={containerStyle}>
            {label && <label htmlFor={id} style={labelStyle}>{label} {required && <span style={{ color: 'var(--color-accent)' }}>*</span>}</label>}
            <div style={{ position: 'relative', width: '100%' }}>
                {/* Custom Placeholder Overlay for Dates */}
                {isDateEmpty && (
                    <div style={{
                        position: 'absolute',
                        left: '16px',
                        top: '0',
                        bottom: '0',
                        display: 'flex',
                        alignItems: 'center',
                        color: '#9ca3af',
                        pointerEvents: 'none',
                    }}>
                        yyyy-mm-dd
                    </div>
                )}
                <input
                    id={id}
                    type={type}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    style={{
                        ...inputStyle,
                        color: isDateEmpty ? 'transparent' : inputStyle.color
                    }}
                    className={isDateEmpty ? "empty-date-input mobile-input-fix" : "mobile-input-fix"}
                />
                {type === 'date' && value && (
                    <button
                        type="button"
                        onClick={(e) => {
                            e.preventDefault();
                            if (onChange) onChange({ target: { id, value: '' } });
                        }}
                        style={{
                            position: 'absolute',
                            right: '12px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#e74c3c',
                            padding: '4px'
                        }}
                        aria-label="Limpiar fecha"
                    >
                        <X size={20} style={{ strokeWidth: 3 }} />
                    </button>
                )}
            </div>
        </div>
    );
};

export default React.memo(Input);
