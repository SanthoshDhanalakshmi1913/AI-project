import React from 'react';
import Button from './Button';
import { QuizIcon, ClockIcon, AwardIcon, ChevronRightIcon } from './Icons';
import './QuizCard.css';

const QuizCard = ({
    quiz,
    latestAttempt = null,
    onStart,
    onReview,
    className = '',
}) => {
    return (
        <div className={`quiz-hub-card ${className}`}>
            <div className="quiz-hub-top">
                <span className="quiz-course-tag">
                    {quiz.courseTitle || (quiz.courseId ? `Course #${quiz.courseId}` : 'General')}
                </span>

                {latestAttempt && (
                    <span className={`quiz-attempt-pill ${latestAttempt.passed ? 'passed' : 'failed'}`}>
                        {latestAttempt.passed ? 'Passed ✓' : 'Failed ✕'} ({latestAttempt.percentage}%)
                    </span>
                )}
            </div>

            <h3 className="quiz-hub-title">{quiz.title}</h3>
            <p className="quiz-hub-desc">{quiz.description || 'Test and reinforce your understanding with this assessment.'}</p>

            <div className="quiz-hub-meta-row">
                <div className="meta-badge">
                    <ClockIcon size={14} />
                    <span>~10 Mins</span>
                </div>
                <div className="meta-badge">
                    <AwardIcon size={14} />
                    <span>Pass: 70%</span>
                </div>
            </div>

            <div className="quiz-hub-actions">
                {latestAttempt && onReview && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onReview(latestAttempt.id)}
                    >
                        Review
                    </Button>
                )}
                <Button
                    variant="primary"
                    size="sm"
                    icon={ChevronRightIcon}
                    iconPosition="right"
                    onClick={() => onStart(quiz)}
                >
                    {latestAttempt ? 'Retake Quiz' : 'Start Quiz'}
                </Button>
            </div>
        </div>
    );
};

export default QuizCard;
