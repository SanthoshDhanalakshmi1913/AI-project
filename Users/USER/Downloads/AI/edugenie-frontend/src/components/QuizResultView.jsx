import React, { useState } from 'react';
import Card from './Card';
import Button from './Button';
import {
    AwardIcon,
    CheckCircleIcon,
    XCircleIcon,
    RefreshIcon,
    SparklesIcon,
    TrendingUpIcon,
    BookIcon,
} from './Icons';
import { aiService } from '../services/aiService';
import './QuizResultView.css';

const QuizResultView = ({
    attempt,
    quizTitle = 'Assessment',
    onRetake,
    onBackToList,
    onViewProgress,
}) => {
    const [aiExplanations, setAiExplanations] = useState({});
    const [explainingId, setExplainingId] = useState(null);

    if (!attempt) return null;

    const score = attempt.score || 0;
    const totalQuestions = attempt.totalQuestions || (attempt.answers?.length || 0);
    const percentage = attempt.percentage ?? Math.round((score / Math.max(1, totalQuestions)) * 100);
    const passed = attempt.passed ?? percentage >= 70;
    const incorrectCount = Math.max(0, totalQuestions - score);

    const handleAskAiExplanation = async (answer) => {
        const key = answer.id || answer.questionId;
        setExplainingId(key);
        try {
            const data = await aiService.askAssistant({
                prompt: `Please explain clearly and concisely why "${answer.correctAnswer}" is the correct answer to: "${answer.questionText || 'this question'}" and why "${answer.selectedAnswer || 'unanswered'}" is incorrect.`,
                topic: 'Quiz Question Review',
                taskType: 'EXPLAIN',
            });
            const text = typeof data === 'string' ? data : data?.answer || 'Explanation generated.';
            setAiExplanations((prev) => ({ ...prev, [key]: text }));
        } catch (err) {
            setAiExplanations((prev) => ({
                ...prev,
                [key]: 'Unable to fetch AI explanation at this time.',
            }));
        } finally {
            setExplainingId(null);
        }
    };

    return (
        <div className="quiz-result-view">
            {/* Score Hero Summary Banner */}
            <div className={`result-hero-banner ${passed ? 'banner-passed' : 'banner-failed'}`}>
                <div className="hero-verdict-left">
                    <div className="hero-icon-circle">
                        {passed ? <AwardIcon size={38} /> : <XCircleIcon size={38} />}
                    </div>
                    <div>
                        <span className="verdict-tag">
                            {passed ? 'Assessment Passed 🎉' : 'Needs Practice 💪'}
                        </span>
                        <h1 className="hero-score-heading">
                            You scored {percentage}% ({score}/{totalQuestions})
                        </h1>
                        <p className="hero-score-sub">
                            {passed
                                ? 'Great job! You met the passing threshold of 70%.'
                                : 'You scored below the 70% passing threshold. Review the questions below to strengthen your understanding.'}
                        </p>
                    </div>
                </div>

                <div className="hero-actions-right">
                    {onRetake && (
                        <Button
                            variant="secondary"
                            icon={RefreshIcon}
                            onClick={onRetake}
                        >
                            Retake Quiz
                        </Button>
                    )}
                    {onViewProgress && (
                        <Button
                            variant="primary"
                            icon={TrendingUpIcon}
                            onClick={onViewProgress}
                        >
                            View Progress
                        </Button>
                    )}
                </div>
            </div>

            {/* Score Breakdown Grid */}
            <div className="result-metric-cards-grid">
                <div className="metric-box box-score">
                    <span className="box-label">Final Score</span>
                    <h3 className="box-val">{score} / {totalQuestions}</h3>
                </div>
                <div className="metric-box box-pct">
                    <span className="box-label">Percentage</span>
                    <h3 className="box-val">{percentage}%</h3>
                </div>
                <div className="metric-box box-correct">
                    <span className="box-label">Correct Answers</span>
                    <h3 className="box-val">{score}</h3>
                </div>
                <div className="metric-box box-incorrect">
                    <span className="box-label">Incorrect Answers</span>
                    <h3 className="box-val">{incorrectCount}</h3>
                </div>
            </div>

            {/* Detailed Answers Review */}
            <div className="answers-review-container">
                <h2 className="section-heading">Detailed Question Review</h2>

                {attempt.answers && attempt.answers.length > 0 ? (
                    <div className="answers-review-cards">
                        {attempt.answers.map((answer, index) => {
                            const isCorrect = answer.isCorrect;
                            const qKey = answer.id || answer.questionId;
                            const explanation = aiExplanations[qKey];
                            const isExplaining = explainingId === qKey;

                            return (
                                <Card
                                    key={qKey || index}
                                    className={`answer-review-card ${isCorrect ? 'is-correct' : 'is-incorrect'}`}
                                >
                                    <div className="answer-header-row">
                                        <div className="answer-q-title">
                                            {isCorrect ? (
                                                <CheckCircleIcon size={20} className="icon-green" />
                                            ) : (
                                                <XCircleIcon size={20} className="icon-red" />
                                            )}
                                            <h4>Question {index + 1}</h4>
                                        </div>
                                        <span className={`status-badge ${isCorrect ? 'status-green' : 'status-red'}`}>
                                            {isCorrect ? 'Correct (+1)' : 'Incorrect (0)'}
                                        </span>
                                    </div>

                                    <p className="answer-prompt-text">
                                        {answer.questionText || `Question #${answer.questionId}`}
                                    </p>

                                    <div className="answers-comparison-grid">
                                        <div className={`answer-pill-box ${isCorrect ? 'pill-green' : 'pill-red'}`}>
                                            <span className="pill-tag">Your Answer:</span>
                                            <strong>{answer.selectedAnswer || '(No answer provided)'}</strong>
                                        </div>

                                        {!isCorrect && answer.correctAnswer && (
                                            <div className="answer-pill-box pill-green">
                                                <span className="pill-tag">Correct Answer:</span>
                                                <strong>{answer.correctAnswer}</strong>
                                            </div>
                                        )}
                                    </div>

                                    {/* AI Explanation Accordion */}
                                    <div className="ai-explainer-row">
                                        {!explanation ? (
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                icon={SparklesIcon}
                                                loading={isExplaining}
                                                onClick={() => handleAskAiExplanation(answer)}
                                            >
                                                Ask Genie AI to Explain This
                                            </Button>
                                        ) : (
                                            <div className="ai-explainer-output">
                                                <div className="explainer-head">
                                                    <SparklesIcon size={14} />
                                                    <span>Genie AI Explanation:</span>
                                                </div>
                                                <p>{explanation}</p>
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                ) : (
                    <Card>
                        <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            Assessment completed and recorded.
                        </p>
                    </Card>
                )}
            </div>

            {onBackToList && (
                <div className="result-bottom-nav">
                    <Button variant="outline" icon={BookIcon} onClick={onBackToList}>
                        Back to All Quizzes
                    </Button>
                </div>
            )}
        </div>
    );
};

export default QuizResultView;
