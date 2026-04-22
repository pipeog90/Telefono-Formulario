import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, style = {}, ...props }) => {
    const getStyle = () => {
        let baseStyle = {
            padding: '0 24px',
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: disabled ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            opacity: disabled ? 0.6 : 1,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            lineHeight: '1',
            ...(variant === 'primary' ? {
                background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3)'
            } : {}),
            ...(variant === 'secondary' ? {
                background: 'white',
                border: '1px solid var(--color-glass-border)',
                color: 'var(--color-text-main)'
            } : {}),
            ...(variant === 'danger' ? {
                background: 'linear-gradient(135deg, var(--color-error), #b91c1c)',
                boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
            } : {}),
            ...(variant === 'outline' ? {
                background: 'white',
                border: '2px solid var(--color-primary)',
                color: 'var(--color-primary)'
            } : {}),
        };
        return { ...baseStyle, ...style };
    };

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={getStyle()}
            className={`nano-btn ${className}`}
            onMouseEnter={(e) => !disabled && (e.currentTarget.style.opacity = '0.9')}
            onMouseLeave={(e) => !disabled && (e.currentTarget.style.opacity = '1')}
            {...props}
        >
            {children}
        </button>
    );
};

export default React.memo(Button);
