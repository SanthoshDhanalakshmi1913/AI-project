import React from 'react';
import { formatDate } from '../../utils/formatters';
import Button from '../Button';
import { AwardIcon, CheckCircleIcon, XCircleIcon, ChevronRightIcon } from '../Icons';
import './RecentQuizCard.css';

const RecentQuizCard = ({
    attempt,
    quizTitle,
    onReview,
    className = '',
}) => {
    if (!attempt) return null;

    const percentage = attempt.percentage ?? Math.round(((attempt.score || 0) / (attempt.totalQuestions || 1)) * 100);
    const passed = attempt.passed ?? percentage >= 70;
    const displayTitle = quizTitle || attempt.quizTitle || `Quiz Assessment #${attempt.quizId}`;

    return (
        <div className={`recent-quiz-card-item ${passed ? 'quiz-passed' : 'quiz-failed'} ${className}`}>
            <div className="recent-quiz-icon-col">
                {passed ? (
                    <div className="quiz-status-icon passed">
                        <CheckCircleIcon size={20} />
                    </div>
                ) : (
                    <div className="quiz-status-icon failed">
                        <XCircleIcon size={20} />
                    </div>
                )}
            </div>

            <div className="recent-quiz-info-col">
                <div className="recent-quiz-title-row">
                    <h4 className="recent-quiz-name">{displayTitle}</h4>
                    <span className={`recent-score-pill ${passed ? 'pill-passed' : 'pill-failed'}`}>
                        {percentage}% {passed ? 'Passed' : 'Failed'}
                    </span>
                </div>
                <div className="recent-quiz-meta-row">
                    <span>
                        Score: <strong>{attempt.score}</strong> of <strong>{attempt.totalQuestions || 5}</strong>
                    </span>
                    <span className="dot-divider">•</span>
                    <span>{formatDate(attempt.completedAt || attempt.startedAt)}</span>
                </div>
            </div>

            {onReview && (
                <div className="recent-quiz-action-col">
                    <Button
                        size="sm"
                        variant="ghost"
                        icon={ChevronRightIcon}
                        iconPosition="right"
                        onClick={() => onReview(attempt)}
                    >
                        Review
                    </Button>
                </div>
            )}
        </div>
    );
};

export default RecentQuizCard;
