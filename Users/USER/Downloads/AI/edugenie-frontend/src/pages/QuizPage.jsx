import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { quizService } from '../services/quizService';
import QuizTimer from '../components/QuizTimer';
import QuizProgress from '../components/QuizProgress';
import QuestionCard from '../components/QuestionCard';
import Card from '../components/Card';
import Button from '../components/Button';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    CheckCircleIcon,
    QuizIcon,
    SparklesIcon,
} from '../components/Icons';
import './Quiz.css';

const QuizPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionId]: optionText }
    const [flaggedQuestions, setFlaggedQuestions] = useState({}); // { [questionId]: boolean }

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    // Ref guard to absolutely prevent double submission
    const isSubmittingRef = useRef(false);

    useEffect(() => {
        const loadQuizData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [quizData, questionsData] = await Promise.all([
                    quizService.getQuizById(id),
                    quizService.getQuestionsByQuiz(id),
                ]);
                setQuiz(quizData);
                setQuestions(questionsData || []);
            } catch (err) {
                setError(err.message || 'Failed to load quiz content');
            } finally {
                setLoading(false);
            }
        };

        loadQuizData();
    }, [id]);

    const handleSelectOption = useCallback((optionText) => {
        if (isSubmittingRef.current || submitting) return;
        const currentQ = questions[currentIndex];
        if (!currentQ) return;

        setSelectedAnswers((prev) => ({
            ...prev,
            [currentQ.id]: optionText,
        }));
    }, [questions, currentIndex, submitting]);

    const handleToggleFlag = useCallback(() => {
        const currentQ = questions[currentIndex];
        if (!currentQ) return;

        setFlaggedQuestions((prev) => ({
            ...prev,
            [currentQ.id]: !prev[currentQ.id],
        }));
    }, [questions, currentIndex]);

    const handleSubmitQuiz = async () => {
        // Prevent accidental multiple submissions
        if (isSubmittingRef.current || submitting) return;
        isSubmittingRef.current = true;
        setSubmitting(true);
        setIsConfirmModalOpen(false);
        setError(null);

        try {
            // Build answers payload: ensure all questions are submitted
            const payload = questions.map((q) => ({
                questionId: q.id,
                selectedAnswer: selectedAnswers[q.id] || '',
            }));

            const result = await quizService.submitQuiz(id, payload);
            navigate(`/quizzes/${id}/results/${result.id}`, { replace: true });
        } catch (err) {
            setError(err.message || 'Failed to submit quiz. Please try again.');
            isSubmittingRef.current = false;
            setSubmitting(false);
        }
    };

    const handleTimerExpire = useCallback(() => {
        if (!isSubmittingRef.current && !submitting) {
            handleSubmitQuiz();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [questions, selectedAnswers]);

    if (loading) {
        return <LoadingSpinner fullPage={false} text="Preparing your quiz questions..." />;
    }

    if (error && questions.length === 0) {
        return (
            <div className="quiz-take-page">
                <ErrorMessage message={error} />
                <Button variant="secondary" onClick={() => navigate('/quizzes')}>
                    Back to Quizzes
                </Button>
            </div>
        );
    }

    if (questions.length === 0) {
        return (
            <div className="quiz-take-page">
                <Card>
                    <div className="empty-state">
                        <QuizIcon size={44} className="empty-icon" />
                        <h3>No questions currently configured for this quiz</h3>
                        <p>This assessment is being finalized by instructors.</p>
                        <Button variant="primary" onClick={() => navigate('/quizzes')}>
                            Back to Quizzes
                        </Button>
                    </div>
                </Card>
            </div>
        );
    }

    const currentQuestion = questions[currentIndex];
    const answeredCount = Object.keys(selectedAnswers).length;
    const unansweredCount = Math.max(0, questions.length - answeredCount);
    const flaggedCount = Object.values(flaggedQuestions).filter(Boolean).length;
    const isCurrentFlagged = !!flaggedQuestions[currentQuestion?.id];
    const currentSelectedOption = selectedAnswers[currentQuestion?.id] || null;

    return (
        <div className="quiz-take-page">
            {/* Top Toolbar */}
            <div className="quiz-status-header">
                <div className="quiz-info-left">
                    <span className="quiz-badge-name">
                        {quiz?.courseTitle ? `${quiz.courseTitle} • ` : ''}Assessment
                    </span>
                    <h2>{quiz?.title || 'Quiz'}</h2>
                </div>

                <div className="quiz-info-right">
                    <QuizTimer
                        initialSeconds={600}
                        onExpire={handleTimerExpire}
                        isActive={!submitting}
                    />

                    <Button
                        variant="primary"
                        size="sm"
                        icon={CheckCircleIcon}
                        onClick={() => setIsConfirmModalOpen(true)}
                        disabled={submitting}
                        loading={submitting}
                    >
                        Submit Test
                    </Button>
                </div>
            </div>

            {/* Quiz Progress Module */}
            <QuizProgress
                currentIndex={currentIndex}
                totalQuestions={questions.length}
                answeredQuestions={selectedAnswers}
                flaggedQuestions={flaggedQuestions}
                questions={questions}
                onSelectQuestion={(idx) => setCurrentIndex(idx)}
            />

            {error && <ErrorMessage message={error} />}

            {/* Question Card */}
            <QuestionCard
                questionNumber={currentIndex + 1}
                question={currentQuestion}
                selectedAnswer={currentSelectedOption}
                onSelectOption={handleSelectOption}
                isFlagged={isCurrentFlagged}
                onToggleFlag={handleToggleFlag}
                disabled={submitting}
            />

            {/* Navigation Controls Bar */}
            <div className="quiz-navigation-controls-bar">
                <Button
                    variant="secondary"
                    icon={ChevronLeftIcon}
                    disabled={currentIndex === 0 || submitting}
                    onClick={() => setCurrentIndex((p) => Math.max(0, p - 1))}
                >
                    Previous Question
                </Button>

                <div className="nav-center-status">
                    <span className="question-stepper-text">
                        {currentIndex + 1} / {questions.length}
                    </span>
                </div>

                {currentIndex < questions.length - 1 ? (
                    <Button
                        variant="primary"
                        icon={ChevronRightIcon}
                        iconPosition="right"
                        disabled={submitting}
                        onClick={() => setCurrentIndex((p) => Math.min(questions.length - 1, p + 1))}
                    >
                        Next Question
                    </Button>
                ) : (
                    <Button
                        variant="success"
                        icon={CheckCircleIcon}
                        disabled={submitting}
                        loading={submitting}
                        onClick={() => setIsConfirmModalOpen(true)}
                    >
                        Review & Submit
                    </Button>
                )}
            </div>

            {/* Submit Confirmation Modal */}
            <Modal
                isOpen={isConfirmModalOpen}
                onClose={() => setIsConfirmModalOpen(false)}
                title="Confirm Quiz Submission"
                size="md"
            >
                <div className="submit-modal-content">
                    <p className="modal-lead-text">
                        You are about to finalize and grade your assessment. Please review your completion status before continuing:
                    </p>

                    <div className="submit-summary-grid">
                        <div className="summary-tile">
                            <span className="tile-label">Total Questions</span>
                            <strong className="tile-val">{questions.length}</strong>
                        </div>
                        <div className="summary-tile green">
                            <span className="tile-label">Answered</span>
                            <strong className="tile-val">{answeredCount}</strong>
                        </div>
                        <div className="summary-tile red">
                            <span className="tile-label">Unanswered</span>
                            <strong className="tile-val">{unansweredCount}</strong>
                        </div>
                        <div className="summary-tile yellow">
                            <span className="tile-label">Flagged</span>
                            <strong className="tile-val">{flaggedCount}</strong>
                        </div>
                    </div>

                    {unansweredCount > 0 && (
                        <p className="unanswered-warning-msg">
                            ⚠️ Warning: You have <strong>{unansweredCount} unanswered questions</strong>. They will be marked as 0 points.
                        </p>
                    )}
                </div>

                <div className="modal-actions-right">
                    <Button
                        variant="secondary"
                        onClick={() => setIsConfirmModalOpen(false)}
                        disabled={submitting}
                    >
                        Return to Questions
                    </Button>
                    <Button
                        variant="primary"
                        icon={CheckCircleIcon}
                        loading={submitting}
                        disabled={submitting}
                        onClick={handleSubmitQuiz}
                    >
                        Confirm & Grade
                    </Button>
                </div>
            </Modal>
        </div>
    );
};

export default QuizPage;
