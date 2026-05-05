import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

const Input = ({ label, id, type = 'text', value, onChange, placeholder, required = false, disabled = false, style = {}, error = false, tooltip = '', maxLength }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const labelRef = useRef(null);

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        gap: '2px',
        marginBottom: '2px',
        width: '100%',
        minWidth: 0
    };

    const labelStyle = {
        fontSize: '0.78rem',
        color: error ? '#f59e0b' : 'var(--color-text-muted)',
        fontWeight: '500',
        marginLeft: '4px',
        cursor: tooltip ? 'help' : 'default',
        userSelect: 'none',
        position: 'relative',
        display: 'block',
        maxWidth: '100%',
        wordBreak: 'break-word',
        gap: '4px'
    };

    const inputStyle = {
        padding: 'var(--input-padding)',
        borderRadius: 'var(--radius-sm)',
        border: error ? '2px solid #ef4444' : '1px solid var(--color-secondary)',
        background: '#ffffff',
        color: error ? '#ef4444' : 'var(--color-text-main)',
        fontWeight: error ? '700' : 'normal',
        fontSize: 'var(--input-font-size)',
        lineHeight: 'var(--input-line-height)',
        height: 'var(--input-height)',
        boxSizing: 'border-box',
        outline: 'none',
        transition: 'border-color 0.3s ease, box-shadow 0.3s ease',
        width: '100%',
        ...style
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

    const handleLabelUp = () => {
        setShowTooltip(false);
    };

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
            <input
                id={id}
                type={type}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required={required}
                disabled={disabled}
                autoComplete="off"
                style={inputStyle}
                maxLength={maxLength}
            />
        </div>
    );
};

export default Input;
