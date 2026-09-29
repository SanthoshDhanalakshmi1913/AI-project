import React from 'react';
import './QuizProgress.css';

const QuizProgress = ({
    currentIndex,
    totalQuestions,
    answeredQuestions = {}, // { [questionId]: answer }
    flaggedQuestions = {}, // { [questionId]: boolean }
    questions = [],
    onSelectQuestion,
    className = '',
}) => {
    const answeredCount = Object.keys(answeredQuestions).length;
    const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
    const percentage = totalQuestions > 0 ? Math.round(((currentIndex + 1) / totalQuestions) * 100) : 0;

    return (
        <div className={`quiz-progress-module ${className}`}>
            {/* Top Stats Line */}
            <div className="quiz-progress-header">
                <div className="progress-text-left">
                    <span className="question-count-text">
                        Question <strong>{currentIndex + 1}</strong> of <strong>{totalQuestions}</strong>
                    </span>
                    <span className="answered-status-sub">
                        ({answeredCount} of {totalQuestions} answered)
                    </span>
                </div>

                {flaggedCount > 0 && (
                    <span className="flagged-count-badge">
                        🚩 {flaggedCount} Flagged
                    </span>
                )}
            </div>

            {/* Continuous Progress Bar */}
            <div className="quiz-progress-track">
                <div
                    className="quiz-progress-bar-fill"
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                />
            </div>

            {/* Question Quick Jump Navigation Dots */}
            {questions && questions.length > 0 && onSelectQuestion && (
                <div className="quiz-jump-dots-wrapper">
                    <div className="jump-dots-list">
                        {questions.map((q, idx) => {
                            const isCurrent = idx === currentIndex;
                            const isAnswered = !!answeredQuestions[q.id];
                            const isFlagged = !!flaggedQuestions[q.id];

                            let dotClass = '';
                            if (isCurrent) dotClass += ' dot-current';
                            if (isAnswered) dotClass += ' dot-answered';
                            if (isFlagged) dotClass += ' dot-flagged';

                            return (
                                <button
                                    key={q.id || idx}
                                    type="button"
                                    className={`jump-dot-btn ${dotClass}`}
                                    onClick={() => onSelectQuestion(idx)}
                                    title={`Question ${idx + 1}: ${isAnswered ? 'Answered' : 'Unanswered'}${isFlagged ? ' (Flagged)' : ''}`}
                                >
                                    {idx + 1}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

export default QuizProgress;
