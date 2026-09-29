import React from 'react';
import './OptionButton.css';

const OptionButton = ({
    index,
    optionText,
    isSelected = false,
    isCorrect = null, // null | true | false (for review mode)
    disabled = false,
    onClick,
    className = '',
}) => {
    const letter = String.fromCharCode(65 + index); // A, B, C, D...

    let stateClass = '';
    if (isCorrect === true) {
        stateClass = 'option-btn-correct';
    } else if (isCorrect === false) {
        stateClass = 'option-btn-incorrect';
    } else if (isSelected) {
        stateClass = 'option-btn-selected';
    }

    return (
        <button
            type="button"
            className={`option-button ${stateClass} ${disabled ? 'option-btn-disabled' : ''} ${className}`}
            onClick={onClick}
            disabled={disabled}
            aria-pressed={isSelected}
        >
            <span className="option-badge-letter">{letter}</span>
            <span className="option-label-text">{optionText}</span>
            {isCorrect === true && <span className="option-verdict-icon correct">✓</span>}
            {isCorrect === false && <span className="option-verdict-icon incorrect">✕</span>}
        </button>
    );
};

export default OptionButton;
