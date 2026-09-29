import React from 'react';
import './Card.css';

const Card = ({
    children,
    title,
    subtitle,
    headerAction,
    footer,
    hoverable = false,
    className = '',
    onClick,
    ...props
}) => {
    return (
        <div
            className={`edu-card ${hoverable ? 'edu-card-hoverable' : ''} ${onClick ? 'edu-card-clickable' : ''} ${className}`}
            onClick={onClick}
            {...props}
        >
            {(title || subtitle || headerAction) && (
                <div className="edu-card-header">
                    <div className="edu-card-title-group">
                        {title && <h3 className="edu-card-title">{title}</h3>}
                        {subtitle && <p className="edu-card-subtitle">{subtitle}</p>}
                    </div>
                    {headerAction && <div className="edu-card-header-action">{headerAction}</div>}
                </div>
            )}
            <div className="edu-card-body">{children}</div>
            {footer && <div className="edu-card-footer">{footer}</div>}
        </div>
    );
};

export default Card;
