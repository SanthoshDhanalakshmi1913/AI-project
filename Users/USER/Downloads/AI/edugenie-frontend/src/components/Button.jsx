import React from 'react';
import './Button.css';

const Button = ({
    children,
    variant = 'primary', // 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost'
    size = 'md', // 'sm' | 'md' | 'lg'
    icon: Icon = null,
    iconPosition = 'left',
    loading = false,
    disabled = false,
    className = '',
    type = 'button',
    onClick,
    ...props
}) => {
    const classNames = [
        'btn',
        `btn-${variant}`,
        `btn-${size}`,
        loading ? 'btn-loading' : '',
        disabled ? 'btn-disabled' : '',
        className,
    ].filter(Boolean).join(' ');

    return (
        <button
            type={type}
            className={classNames}
            disabled={disabled || loading}
            onClick={onClick}
            {...props}
        >
            {loading && <span className="btn-spinner" />}
            {!loading && Icon && iconPosition === 'left' && <span className="btn-icon left"><Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} /></span>}
            <span className="btn-text">{children}</span>
            {!loading && Icon && iconPosition === 'right' && <span className="btn-icon right"><Icon size={size === 'sm' ? 16 : size === 'lg' ? 22 : 18} /></span>}
        </button>
    );
};

export default Button;
