import React, { useState, useEffect, useRef } from 'react';
import { ClockIcon } from './Icons';
import './QuizTimer.css';

const QuizTimer = ({
    initialSeconds = 600, // default 10 mins
    onExpire,
    isActive = true,
    warningThreshold = 120, // 2 mins warning
    className = '',
}) => {
    const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
    const hasExpiredRef = useRef(false);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    if (!hasExpiredRef.current && onExpire) {
                        hasExpiredRef.current = true;
                        onExpire();
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [isActive, onExpire]);

    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    const formatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    const isWarning = secondsLeft <= warningThreshold && secondsLeft > 0;
    const isCritical = secondsLeft <= 30 && secondsLeft > 0;

    return (
        <div
            className={`quiz-timer-container ${isWarning ? 'timer-warning' : ''} ${isCritical ? 'timer-critical' : ''} ${className}`}
            title="Time Remaining"
            role="timer"
            aria-live="polite"
        >
            <ClockIcon size={18} className="timer-icon" />
            <span className="timer-label">Time:</span>
            <span className="timer-digits">{formatted}</span>
        </div>
    );
};

export default QuizTimer;
