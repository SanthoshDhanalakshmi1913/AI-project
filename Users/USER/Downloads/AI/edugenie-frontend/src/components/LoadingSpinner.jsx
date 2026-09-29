import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({
    size = 'md', // 'sm' | 'md' | 'lg'
    text = 'Loading...',
    fullPage = false,
    className = '',
}) => {
    const content = (
        <div className={`spinner-container spinner-${size} ${className}`}>
            <div className="spinner-ring">
                <div />
                <div />
                <div />
                <div />
            </div>
            {text && <p className="spinner-text">{text}</p>}
        </div>
    );

    if (fullPage) {
        return <div className="spinner-fullpage">{content}</div>;
    }

    return content;
};

export default LoadingSpinner;
