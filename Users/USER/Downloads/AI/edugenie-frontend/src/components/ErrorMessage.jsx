import React from 'react';
import { XCircleIcon, RefreshIcon } from './Icons';
import Button from './Button';
import './ErrorMessage.css';

const ErrorMessage = ({
    title = 'Something went wrong',
    message,
    onRetry,
    className = '',
}) => {
    if (!message && !title) return null;

    return (
        <div className={`error-message-box ${className}`}>
            <div className="error-icon-wrapper">
                <XCircleIcon size={24} className="error-icon" />
            </div>
            <div className="error-content">
                <h4 className="error-title">{title}</h4>
                {message && <p className="error-desc">{message}</p>}
            </div>
            {onRetry && (
                <div className="error-action">
                    <Button
                        size="sm"
                        variant="outline"
                        icon={RefreshIcon}
                        onClick={onRetry}
                    >
                        Retry
                    </Button>
                </div>
            )}
        </div>
    );
};

export default ErrorMessage;
