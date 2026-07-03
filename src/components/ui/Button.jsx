import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', disabled = false, style = {}, ...props }) => {
    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            style={style}
            className={`ui-button ${variant} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
};

export default React.memo(Button);
