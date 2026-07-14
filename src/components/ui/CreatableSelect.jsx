import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

const CreatableSelect = ({ label, id, value, onChange, options, placeholder = 'Seleccione...', tooltip = '', required = false, disabled = false, error = false, style = {} }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const labelRef = useRef(null);
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
        cursor: tooltip ? 'help' : 'default',
        userSelect: 'none',
        position: 'relative',
        maxWidth: '100%',
        wordBreak: 'break-word',
        color: disabled ? 'var(--color-text-muted)' : undefined
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

    return (
        <div style={containerStyle}>
            {label && (
                <label
                    ref={labelRef}
                    htmlFor={id}
                    style={labelStyle}
                    className={`ui-label ${error ? 'has-error' : ''}`}
                    onMouseDown={handleLabelDown}
                    onMouseUp={handleLabelUp}
                    onMouseLeave={handleLabelUp}
                    onTouchStart={handleLabelDown}
                    onTouchEnd={handleLabelUp}
                >
                    {label} {required && <span style={{ color: disabled ? '#9ca3af' : 'var(--color-accent)' }}>*</span>}
                    {tooltip && <span style={{ fontSize: '0.7rem', color: '#9ca3af', marginLeft: '4px' }}>ⓘ</span>}
                </label>
            )}
            {tooltipElement}

            {!isCreating ? (
                <select
                    id={id}
                    value={value || ''}
                    onChange={handleSelectChange}
                    disabled={disabled}
                    className={`ui-input mobile-input-fix ${error ? 'has-error' : ''}`}
                    style={{ 
                        ...style, 
                        width: '100%',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        opacity: disabled ? 0.5 : 1,
                        appearance: 'none',
                        background: '#fff',
                        backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                        backgroundRepeat: 'no-repeat',
                        backgroundPosition: 'right 14px center',
                        backgroundSize: '16px',
                        paddingRight: '40px'
                    }}
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
                        className={`ui-input mobile-input-fix ${error ? 'has-error' : ''}`}
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
                            padding: '4px'
                        }}
                    >
                        <X size={18} style={{ strokeWidth: 2.5 }} />
                    </button>
                </div>
            )}
        </div>
    );
};

export default React.memo(CreatableSelect);
