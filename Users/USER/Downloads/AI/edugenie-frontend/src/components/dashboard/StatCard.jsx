import React from 'react';
import './StatCard.css';

const StatCard = ({
    title,
    value,
    subtext,
    icon: Icon,
    colorTheme = 'indigo', // 'indigo' | 'emerald' | 'blue' | 'amber' | 'purple'
    trend,
    className = '',
}) => {
    return (
        <div className={`stat-card-box stat-theme-${colorTheme} ${className}`}>
            <div className="stat-card-main">
                <div className="stat-meta">
                    <span className="stat-title">{title}</span>
                    <h3 className="stat-value">{value}</h3>
                    {subtext && <p className="stat-subtext">{subtext}</p>}
                </div>
                {Icon && (
                    <div className="stat-icon-wrapper">
                        <Icon size={24} />
                    </div>
                )}
            </div>
            {trend && (
                <div className="stat-trend-footer">
                    <span className={`trend-badge ${trend.isPositive ? 'trend-up' : 'trend-down'}`}>
                        {trend.isPositive ? '↑' : '↓'} {trend.text}
                    </span>
                </div>
            )}
        </div>
    );
};

export default StatCard;
