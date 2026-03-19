import React from 'react';

const AngelLogo = ({ className = '', style = {} }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={{
                width: '60px',
                height: '60px',
                color: 'var(--color-primary-dark)',
                display: 'inline-block',
                marginBottom: '10px',
                ...style
            }}
        >
            {/* Wings */}
            <path d="M12 12c0-3-2-5-5-5-3 0-5 2-5 5 0 4 5 9 5 9s5-5 5-9z" fill="rgba(74, 222, 128, 0.2)" stroke="var(--color-primary-dark)" />
            <path d="M12 12c0-3 2-5 5-5 3 0 5 2 5 5 0 4-5 9-5 9s-5-5-5-9z" fill="rgba(74, 222, 128, 0.2)" stroke="var(--color-primary-dark)" />

            {/* Halo */}
            <ellipse cx="12" cy="5" rx="4" ry="1.5" stroke="var(--color-warning)" strokeWidth="2" />

            {/* Head/Body abstract */}
            <circle cx="12" cy="10" r="2.5" fill="var(--color-text-main)" stroke="none" />
            <path d="M12 13v6" stroke="var(--color-text-main)" strokeWidth="2" />
            <path d="M9 16l3 3 3-3" stroke="var(--color-text-main)" strokeWidth="2" />
        </svg>
    );
};

export const PhoneLogo = ({ className = '', style = {} }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
            style={{
                width: '50px',
                height: '50px',
                color: 'var(--color-primary-dark)',
                display: 'inline-block',
                marginBottom: '10px',
                ...style
            }}
        >
            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.05 12.05 0 0 0 .57 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.05 12.05 0 0 0 2.81.57A2 2 0 0 1 22 16.92z" />
            <path d="M16 3h5v5" stroke="var(--color-warning)" />
            <path d="M21 3L16 8" stroke="var(--color-warning)" />
        </svg>
    );
};

export default AngelLogo;
