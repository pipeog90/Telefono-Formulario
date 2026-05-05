import React, { useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const Input = ({ label, id, type = 'text', value, onChange, placeholder, required = false, disabled = false, style = {}, error = false, centered = false, tooltip = '', maxLength }) => {
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
        fontSize: '0.78rem',
        color: error ? '#f59e0b' : 'var(--color-text-muted)',
        fontWeight: '500',
        marginLeft: centered ? '0' : '4px',
        textAlign: centered ? 'center' : 'left',
        whiteSpace: 'normal',
        overflowWrap: 'break-word',
        overflow: 'hidden',
        cursor: tooltip ? 'help' : 'default',
        userSelect: 'none',
        position: 'relative',
        display: 'block',
        maxWidth: '100%',
        wordBreak: 'break-word',
        gap: '4px'
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
            {label && (
                <label
                    ref={labelRef}
                    htmlFor={id}
                    style={labelStyle}
                    onMouseDown={handleLabelDown}
                    onMouseUp={handleLabelUp}
                    onMouseLeave={handleLabelUp}
                    onTouchStart={handleLabelDown}
                    onTouchEnd={handleLabelUp}
                >
                    {label} {required && <span style={{ color: 'var(--color-accent)' }}>*</span>}
                    {tooltip && <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>ⓘ</span>}
                </label>
            )}
            {tooltipElement}
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
                    autoComplete="off"
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
                    maxLength={maxLength}
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
