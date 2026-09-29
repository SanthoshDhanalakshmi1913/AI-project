import React from 'react';
import './ProgressBar.css';

const ProgressBar = ({
    value = 0,
    max = 100,
    label,
    showPercentage = true,
    size = 'md', // 'sm' | 'md' | 'lg'
    color = 'primary', // 'primary' | 'success' | 'warning' | 'info' | 'purple'
    animated = false,
    className = '',
}) => {
    const safeValue = Math.min(Math.max(0, Number(value) || 0), max);
    const percentage = Math.round((safeValue / max) * 100);

    return (
        <div className={`progress-bar-wrapper progress-size-${size} ${className}`}>
            {(label || showPercentage) && (
                <div className="progress-bar-labels">
                    {label && <span className="progress-bar-label">{label}</span>}
                    {showPercentage && <span className="progress-bar-pct">{percentage}%</span>}
                </div>
            )}
            <div className="progress-track" role="progressbar" aria-valuenow={percentage} aria-valuemin={0} aria-valuemax={100}>
                <div
                    className={`progress-fill color-${color} ${animated ? 'progress-animated' : ''}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
};

export default ProgressBar;
