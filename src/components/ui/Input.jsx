import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Input = ({ label, id, type = 'text', value, onChange, placeholder, required = false, disabled = false, style = {}, error = false, tooltip = '', maxLength, autoComplete = 'off', ...props }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const labelRef = useRef(null);
    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        width: '100%',
        position: 'relative',
        minWidth: 0 // Prevent expansion beyond parent/grid cell
    };

    const labelStyle = {
        marginLeft: '4px',
        textAlign: 'left',
        cursor: tooltip ? 'help' : 'default',
        userSelect: 'none',
        position: 'relative',
        maxWidth: '100%',
        wordBreak: 'break-word',
    };

    const handleLabelDown = () => {
        if (tooltip && labelRef.current) {
            const rect = labelRef.current.getBoundingClientRect();
            setTooltipPos({
                top: rect.bottom + window.scrollY + 4,
                left: rect.left + window.scrollX
            });
            setShowTooltip(true);
        }
    };

    const handleLabelUp = () => setShowTooltip(false);

    const tooltipElement = showTooltip ? createPortal(
        <div style={{
            position: 'absolute',
            top: `${tooltipPos.top}px`,
            left: `${tooltipPos.left}px`,
            background: 'linear-gradient(135deg, #1e293b, #334155)',
            color: '#e2e8f0',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '0.78rem',
            lineHeight: '1.4',
            maxWidth: '280px',
            width: 'max-content',
            boxShadow: '0 4px 16px rgba(0,0,0,0.25)',
            zIndex: 9999,
            pointerEvents: 'none',
            animation: 'tooltipFadeIn 0.15s ease-out'
        }}>
            {tooltip}
        </div>,
        document.body
    ) : null;

    const inputStyle = {
        paddingRight: (type === 'date' && value) ? '40px' : '14px',
        textAlign: 'left',
        ...style
    };

    const isDateEmpty = type === 'date' && !value;

    return (
        <div style={containerStyle}>
            {label && (
                <label
                    ref={labelRef}
                    htmlFor={id}
                    style={{
                        ...labelStyle,
                        color: disabled ? 'var(--color-text-muted)' : labelStyle.color
                    }}
                    className={`ui-label ${error ? 'has-error' : ''}`}
                    onMouseDown={handleLabelDown}
                    onMouseUp={handleLabelUp}
                    onMouseLeave={handleLabelUp}
                    onTouchStart={handleLabelDown}
                    onTouchEnd={handleLabelUp}
                >
                    {label} {required && <span style={{ color: disabled ? '#9ca3af' : 'var(--color-accent)' }}>*</span>}
                    {tooltip && <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>ⓘ</span>}
                </label>
            )}
            {tooltipElement}
            <div style={{ position: 'relative', width: '100%' }}>

                <input
                    id={id}
                    type={type}
                    autoComplete={autoComplete}
                    value={value || ''}
                    onChange={onChange}
                    placeholder={placeholder}
                    required={required}
                    disabled={disabled}
                    tabIndex={disabled ? "-1" : "0"}
                    style={{
                        ...inputStyle,
                        color: isDateEmpty ? 'transparent' : inputStyle.color,
                        opacity: disabled ? 0.5 : 1,
                        pointerEvents: disabled ? 'none' : 'auto'
                    }}
                    className={`ui-input mobile-input-fix ${isDateEmpty ? 'empty-date-input' : ''} ${error ? 'has-error' : ''}`}
                    maxLength={maxLength}
                    {...props}
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
