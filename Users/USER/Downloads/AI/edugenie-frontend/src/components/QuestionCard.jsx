import React, { useEffect } from 'react';
import OptionButton from './OptionButton';
import './QuestionCard.css';

const QuestionCard = ({
    questionNumber,
    question,
    selectedAnswer,
    onSelectOption,
    isFlagged = false,
    onToggleFlag,
    disabled = false,
    className = '',
}) => {
    // Keyboard shortcuts for options A, B, C, D / 1, 2, 3, 4
    useEffect(() => {
        if (disabled || !question?.options) return;

        const handleKeyPress = (e) => {
            // Ignore if typing in an input or textarea
            if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

            const key = e.key.toUpperCase();
            let optionIndex = -1;

            if (['A', '1'].includes(key)) optionIndex = 0;
            else if (['B', '2'].includes(key)) optionIndex = 1;
            else if (['C', '3'].includes(key)) optionIndex = 2;
            else if (['D', '4'].includes(key)) optionIndex = 3;

            if (optionIndex >= 0 && optionIndex < question.options.length) {
                const opt = question.options[optionIndex];
                const optText = typeof opt === 'string' ? opt : opt.optionText || opt.text || '';
                onSelectOption(optText);
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [question, onSelectOption, disabled]);

    if (!question) return null;

    return (
        <div className={`question-card-container ${className}`}>
            <div className="question-card-header">
                <div className="question-badge-group">
                    <span className="question-number-pill">Q{questionNumber}</span>
                    <span className="question-type-tag">Multiple Choice</span>
                </div>

                {onToggleFlag && (
                    <button
                        type="button"
                        className={`flag-question-btn ${isFlagged ? 'is-flagged' : ''}`}
                        onClick={onToggleFlag}
                        title={isFlagged ? 'Remove review flag' : 'Flag for review'}
                    >
                        <span>{isFlagged ? '🚩 Flagged for Review' : '🏳️ Flag for Review'}</span>
                    </button>
                )}
            </div>

            <h2 className="question-prompt-text">{question.questionText}</h2>

            {/* Options List */}
            <div className="question-options-list">
                {question.options &&
                    question.options.map((option, idx) => {
                        const optionText = typeof option === 'string' ? option : option.optionText || option.text || '';
                        const isSelected = selectedAnswer === optionText;

                        return (
                            <OptionButton
                                key={option.id || idx}
                                index={idx}
                                optionText={optionText}
                                isSelected={isSelected}
                                disabled={disabled}
                                onClick={() => onSelectOption(optionText)}
                            />
                        );
                    })}
            </div>

            <div className="question-card-footer-tip">
                <span className="tip-text">
                    💡 Tip: You can click the options or press keys <strong>A, B, C, D</strong> on your keyboard.
                </span>
            </div>
        </div>
    );
};

export default QuestionCard;
