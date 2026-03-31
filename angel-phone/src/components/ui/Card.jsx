import React from 'react';

const Card = ({ children, title, headerAction, className = '', style = {} }) => {
    const cardStyle = {
        marginBottom: '2px',
        ...style
    };

    const titleStyle = {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: 'var(--color-primary)',
    };

    return (
        <div className={`glass-panel card-responsive-padding ${className}`} style={cardStyle}>
            {title && (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--color-glass-border)' }}>
                    <h3 style={titleStyle}>{title}</h3>
                    {headerAction && <div>{headerAction}</div>}
                </div>
            )}
            {children}
        </div>
    );
};

export default Card;
