import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';

const Select = ({ label, id, value, onChange, options = [], required = false, disabled = false, placeholder = "Seleccionar...", error = false, tooltip = '', style = {} }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [showTooltip, setShowTooltip] = useState(false);
    const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
    const labelRef = useRef(null);
    const isOpenRef = useRef(isOpen);
    useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);

    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, maxHeight: 300, isFlipped: false });
    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    // Find the label for the current value
    const selectedOption = options.find(opt => opt.value === value);
    const displayValue = selectedOption ? selectedOption.label : placeholder;

    const handleSelect = (optionValue) => {
        if (disabled) return;
        onChange({
            target: {
                id,
                value: optionValue
            }
        });
        setIsOpen(false);
    };

    const handleSelectRef = useRef(handleSelect);
    useLayoutEffect(() => {
        handleSelectRef.current = handleSelect;
    });

    const searchBufferRef = useRef('');
    const [highlightedValue, setHighlightedValueState] = useState(null);
    const highlightedValueRef = useRef(highlightedValue);
    
    // Synchronous setter for highlightedValue to prevent race conditions
    const setHighlightedValue = (val) => {
        highlightedValueRef.current = val;
        setHighlightedValueState(val);
    };

    const optionsRef = useRef(options);
    const valueRef = useRef(value);
    
    // Sync external props (these change via React tree, so useEffect is fine)
    useEffect(() => { optionsRef.current = options; }, [options]);
    useEffect(() => { valueRef.current = value; }, [value]);

    const bufferTimeoutRef = useRef(null);
    const optionRefs = useRef({});
    const isKeyboardInteraction = useRef(false);

    // Track mouse movement to enable hover highlighting
    useEffect(() => {
        const handleMouseMove = (e) => {
            if (e.movementX !== 0 || e.movementY !== 0) {
                isKeyboardInteraction.current = false;
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Find matching option helper
    const findMatch = (buffer) => {
        return options.find(opt => 
            opt.label.toLowerCase().startsWith(buffer) || 
            opt.value.toLowerCase().startsWith(buffer)
        );
    };

    // Helper for safe scrolling
    const scrollToItem = (itemValue) => {
        const listEl = menuRef.current?.querySelector('ul');
        const itemEl = optionRefs.current[itemValue];
        if (listEl && itemEl) {
            const itemTop = itemEl.offsetTop;
            const itemBottom = itemTop + itemEl.offsetHeight;
            const listTop = listEl.scrollTop;
            const listBottom = listTop + listEl.clientHeight;

            if (itemTop < listTop) {
                listEl.scrollTop = itemTop;
            } else if (itemBottom > listBottom) {
                listEl.scrollTop = itemBottom - listEl.clientHeight;
            }
        }
    };

    // Type-to-Select Logic
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (!isOpenRef.current) return;
            isKeyboardInteraction.current = true;

            // Handle Navigation Keys
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const currentIndex = optionsRef.current.findIndex(opt => opt.value === (highlightedValueRef.current || valueRef.current));
                const nextIndex = (currentIndex + 1) % optionsRef.current.length;
                const nextOpt = optionsRef.current[nextIndex];
                if (nextOpt) {
                    setHighlightedValue(nextOpt.value);
                    scrollToItem(nextOpt.value);
                }
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const currentIndex = optionsRef.current.findIndex(opt => opt.value === (highlightedValueRef.current || valueRef.current));
                const prevIndex = (currentIndex - 1 + optionsRef.current.length) % optionsRef.current.length;
                const prevOpt = optionsRef.current[prevIndex];
                if (prevOpt) {
                    setHighlightedValue(prevOpt.value);
                    scrollToItem(prevOpt.value);
                }
                return;
            }
            if (e.key === 'Enter') {
                e.preventDefault();
                if (highlightedValueRef.current !== null && highlightedValueRef.current !== undefined) {
                    handleSelectRef.current(highlightedValueRef.current);
                }
                return;
            }
            if (e.key === 'Escape') {
                e.preventDefault();
                setIsOpen(false);
                return;
            }

            // Handle Type-ahead
            if (e.key.length !== 1 || e.ctrlKey || e.metaKey) return;

            e.preventDefault();
            const newBuffer = (searchBufferRef.current + e.key).toLowerCase();
            searchBufferRef.current = newBuffer;

            if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
            bufferTimeoutRef.current = setTimeout(() => {
                searchBufferRef.current = '';
            }, 1000);

            const match = optionsRef.current.find(opt => {
                const labelStr = opt.label != null ? String(opt.label).toLowerCase() : '';
                const valueStr = opt.value != null ? String(opt.value).toLowerCase() : '';
                return labelStr.startsWith(newBuffer) || valueStr.startsWith(newBuffer);
            });
            
            if (match) {
                console.log("Type-to-select match found:", match.value);
                setHighlightedValue(match.value);
                scrollToItem(match.value);
            } else {
                console.log("Type-to-select no match for:", newBuffer);
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (bufferTimeoutRef.current) clearTimeout(bufferTimeoutRef.current);
        };
    }, []);

    // Initialize highlight when opening
    useEffect(() => {
        if (isOpen) {
            setHighlightedValue(value || (options.length > 0 ? options[0].value : null));
        } else {
            searchBufferRef.current = '';
        }
    }, [isOpen, value, options]);

    // Calculate position when opening or scrolling
    const updatePosition = () => {
        if (isOpen && triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            const spaceBelow = viewportHeight - rect.bottom;
            const spaceAbove = rect.top;

            let shouldFlip = (spaceBelow < 230 && spaceAbove > 230) || (spaceBelow < 230 && spaceAbove > spaceBelow);
            const availableHeight = shouldFlip ? spaceAbove : spaceBelow;
            const calculatedMaxHeight = Math.min(availableHeight - 10, 300);

            if (shouldFlip) {
                setCoords({
                    top: rect.top + window.scrollY - 4,
                    left: rect.left + window.scrollX,
                    width: rect.width,
                    maxHeight: Math.max(calculatedMaxHeight, 100),
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

    // Lock body scroll when open
    useEffect(() => {
        if (isOpen) {
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            const originalStyle = window.getComputedStyle(document.body).overflow;
            const originalPaddingRight = window.getComputedStyle(document.body).paddingRight;

            document.body.style.overflow = 'hidden';
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }

            return () => {
                document.body.style.overflow = originalStyle;
                document.body.style.paddingRight = originalPaddingRight;
            };
        }
    }, [isOpen]);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!isOpenRef.current) return;
            if (triggerRef.current && triggerRef.current.contains(event.target)) return;
            if (menuRef.current && menuRef.current.contains(event.target)) return;
            setIsOpen(false);
            searchBufferRef.current = '';
        };

        const handleScroll = (event) => {
            if (!isOpenRef.current) return;
            if (menuRef.current && menuRef.current.contains(event.target)) return;
            updatePosition();
            setIsOpen(false);
            searchBufferRef.current = '';
        };

        const handleResize = () => {
            if (!isOpenRef.current) return;
            setIsOpen(false);
            searchBufferRef.current = '';
        };

        document.addEventListener('mousedown', handleClickOutside);
        window.addEventListener('resize', handleResize);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, []);

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
            whiteSpace: 'normal',
            animation: 'tooltipFadeIn 0.15s ease-out'
        }}>
            {tooltip}
        </div>,
        document.body
    ) : null;

    return (
        <div style={containerStyle} ref={containerRef}>
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
                    {label} {required && <span style={{ color: 'var(--color-accent)' }}>*</span>}
                    {tooltip && <span style={{ fontSize: '0.7rem', color: '#9ca3af' }}>ⓘ</span>}
                </label>
            )}
            {tooltipElement}

            {/* Trigger Button */}
            <div
                ref={triggerRef}
                className={`ui-input custom-select-trigger mobile-input-fix ${isOpen ? 'active' : ''} ${error ? 'has-error' : ''}`}
                tabIndex={disabled ? "-1" : "0"}
                onClick={() => !disabled && setIsOpen(!isOpen)}
                style={{
                    color: disabled ? '#9ca3af' : (value ? 'var(--color-text-main)' : '#9ca3af'),
                    textAlign: 'left',
                    justifyContent: 'flex-start',
                    paddingRight: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    ...style
                }}
            >
                {displayValue}
            </div>

            {/* Dropdown Menu */}
            {isOpen && createPortal(
                <div
                    ref={menuRef}
                    className="custom-select-menu"
                    style={{
                        position: 'absolute',
                        top: coords.top,
                        left: coords.left,
                        width: coords.width,
                        height: 'auto',
                        maxHeight: coords.maxHeight,
                        zIndex: 9999,
                        transform: coords.isFlipped ? 'translateY(-100%)' : 'none',
                        display: 'flex',
                        flexDirection: 'column'
                    }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <ul className="custom-select-list animate-fade-in-fast" style={{ maxHeight: 'inherit' }}>
                        {/* Placeholder/Empty option */}
                        <li
                            className={`custom-select-option ${value === "" ? "selected" : ""} ${highlightedValue === "" ? "highlighted" : ""}`}
                            onClick={() => handleSelect("")}
                            onMouseEnter={() => {
                                if (!isKeyboardInteraction.current) setHighlightedValue("");
                            }}
                            style={{ color: '#9ca3af', fontStyle: 'italic' }}
                        >
                            {placeholder}
                        </li>

                        {options.map((opt) => (
                            <li
                                key={opt.value}
                                ref={el => optionRefs.current[opt.value] = el}
                                className={`custom-select-option ${value === opt.value ? "selected" : ""} ${highlightedValue === opt.value ? "highlighted" : ""}`}
                                onClick={() => handleSelect(opt.value)}
                                onMouseEnter={() => {
                                    if (!isKeyboardInteraction.current) setHighlightedValue(opt.value);
                                }}
                                style={{
                                    backgroundColor: highlightedValue === opt.value ? '#E8F5E9' : 'transparent',
                                    fontWeight: highlightedValue === opt.value ? '600' : 'normal'
                                }}
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

