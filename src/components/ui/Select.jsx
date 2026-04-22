import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

const Select = ({ label, id, value, onChange, options = [], required = false, disabled = false, placeholder = "Seleccionar...", error = false, centered = false }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, maxHeight: 300, isFlipped: false });
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    // Find the label for the current value
    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (optionValue) => {
        onChange({
            target: {
                id,
                value: optionValue
            }
        });
        setIsOpen(false);
    };

    // Calculate position when opening or scrolling
    const updatePosition = () => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Decision: Flip if below is tight (<230px) AND above is spacious (>230px)
            // Or if both are tight, flip if above > below
            let shouldFlip = (spaceBelow < 230 && spaceAbove > 230) || (spaceBelow < 230 && spaceAbove > spaceBelow);

            // Calculate Strictly Available Height
            const availableHeight = shouldFlip ? spaceAbove : spaceBelow;
            // Cap at 300px, but ensure we use almost all available space if needed (minus 10px buffer)
            const calculatedMaxHeight = Math.min(availableHeight - 10, 300);

            if (shouldFlip) {
                setCoords({
                    top: rect.top + window.scrollY - 4,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    maxHeight: Math.max(calculatedMaxHeight, 100), // Minimum functional height
                    isFlipped: true
                });
            } else {
                setCoords({
                    top: rect.bottom + window.scrollY + 4,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    maxHeight: Math.max(calculatedMaxHeight, 100),
                    isFlipped: false
                });
            }
        }
    };

    useLayoutEffect(() => {
        updatePosition();
    }, [isOpen]);

    // Lock body scroll when open to prevent page scrolling (with width compensation)
    useEffect(() => {
        if (isOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            const originalStyle = window.getComputedStyle(document.body).overflow;
            const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;

            document.body.style.overflow = 'hidden';
            // Add padding to prevent layout shift if scrollbar exists (>0)
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }

            return () => {
                document.body.style.overflow = originalStyle;
                document.body.style.paddingRight = originalPaddingRight;
            };
        }
    }, [isOpen]);

    // Close when clicking outside and handle resize/scroll
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (triggerRef.current && triggerRef.current.contains(event.target)) return;
            if (menuRef.current && menuRef.current.contains(event.target)) return;
            setIsOpen(false);
        };

        const handleScroll = (event) => {
            // If scrolling happens inside the menu, do not close
            if (menuRef.current && menuRef.current.contains(event.target)) {
                return;
            }

            if (isOpen) updatePosition();
            setIsOpen(false);
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            window.addEventListener('resize', () => setIsOpen(false));
            window.addEventListener('scroll', handleScroll, true);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', () => setIsOpen(false));
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [isOpen]);

    const containerStyle = {
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        position: 'relative'
    };

    const labelStyle = {
        fontSize: '0.9rem',
        color: error ? '#f59e0b' : 'var(--color-text-muted)', // Yellow if error
        fontWeight: '500',
        marginLeft: centered ? '0' : '4px',
        textAlign: centered ? 'center' : 'left',
        whiteSpace: 'nowrap'
    };

    return (
        <div style={containerStyle} ref={containerRef}>
            {label && <label htmlFor={id} style={labelStyle}>{label} {required && <span style={{ color: 'var(--color-accent)' }}>*</span>}</label>}

            {/* Trigger Button */}
            <div
                ref={triggerRef}
                className="custom-select-trigger"
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    color: error ? '#ef4444' : (value ? 'var(--color-text-main)' : '#9ca3af'), // Red if error
                    fontWeight: error ? '700' : 'normal', // Bold if error
                    opacity: disabled ? 0.7 : 1,
                    cursor: disabled ? 'not-allowed' : 'pointer',
                    background: disabled ? '#f3f4f6' : '#ffffff',
                    border: error ? '2px solid #ef4444' : `1px solid ${isOpen ? '#66BB6A' : '#43A047'}`, // Green border
                    textAlign: centered ? 'center' : 'left',
                    justifyContent: centered ? 'center' : 'flex-start',
                    paddingRight: centered ? '12px' : '40px' // Reduce right padding if centered to balance space
                }}
            >
                {displayValue}
            </div>

            {/* Dropdown Menu - Portaled to body for absolute positioning */}
            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    className="custom-select-menu" // Animation removed from here to prevent transform conflict
                    style={{
                        position: 'absolute',
                        top: coords.top,
                        left: coords.left,
                        width: coords.width,
                        height: 'auto',
                        maxHeight: coords.maxHeight,
                        zIndex: 9999,
                        // If flipped, move it up by 100% of its own height so its bottom sits at 'top' coord
                        transform: coords.isFlipped ? 'translateY(-100%)' : 'none',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ul className="custom-select-list animate-fade-in-fast" style={{ maxHeight: 'inherit' }}>
                        {/* Placeholder/Empty option */}
                        <li
                            className={`custom-select-option ${value === "" ? "selected" : ""}`}
                            onClick={() => handleSelect("")}
                            style={{ color: '#9ca3af', fontStyle: 'italic' }}
                        >
                            {placeholder}
                        </li>

                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                className={`custom-select-option ${value === opt.value ? "selected" : ""}`}
                                onClick={() => handleSelect(opt.value)}
                            >
                                {opt.label}
                            </li>
                        ))}
                    </ul>
                </div>,
                document.body
            )}
        </div>
    );
};

export default React.memo(Select);
