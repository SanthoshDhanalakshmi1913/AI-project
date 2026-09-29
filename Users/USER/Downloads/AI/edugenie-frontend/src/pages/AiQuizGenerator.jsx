import React, { useState } from 'react';
import { aiService } from '../services/aiService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
    SparklesIcon,
    QuizIcon,
    AwardIcon,
    CheckCircleIcon,
    XCircleIcon,
    RefreshIcon,
} from '../components/Icons';
import './AiTools.css';

const AiQuizGenerator = () => {
    const [topic, setTopic] = useState('');
    const [difficulty, setDifficulty] = useState('MEDIUM');
    const [numberOfQuestions, setNumberOfQuestions] = useState(5);

    const [generating, setGenerating] = useState(false);
    const [generatedQuiz, setGeneratedQuiz] = useState(null);
    const [error, setError] = useState(null);

    // Interactive quiz state
    const [userAnswers, setUserAnswers] = useState({});
    const [showResults, setShowResults] = useState(false);

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic.trim()) {
            setError('Please enter a topic to generate questions for');
            return;
        }

        setGenerating(true);
        setError(null);
        setGeneratedQuiz(null);
        setUserAnswers({});
        setShowResults(false);

        try {
            const data = await aiService.generateQuiz({
                topic: topic.trim(),
                difficulty,
                numberOfQuestions: Number(numberOfQuestions),
            });

            if (!data || !data.questions || data.questions.length === 0) {
                throw new Error('AI was unable to generate questions for this topic. Please try again.');
            }

            setGeneratedQuiz(data);
        } catch (err) {
            setError(err.message || 'Failed to generate AI Quiz');
        } finally {
            setGenerating(false);
        }
    };

    const handleSelectOption = (questionIndex, option) => {
        if (showResults) return; // Prevent changing after submission
        setUserAnswers((prev) => ({
            ...prev,
            [questionIndex]: option,
        }));
    };

    const calculateScore = () => {
        if (!generatedQuiz?.questions) return { score: 0, total: 0, percentage: 0 };
        let correct = 0;
        generatedQuiz.questions.forEach((q, idx) => {
            if (userAnswers[idx] === q.correctAnswer) {
                correct += 1;
            }
        });
        const total = generatedQuiz.questions.length;
        const percentage = Math.round((correct / total) * 100);
        return { score: correct, total, percentage };
    };

    const resultStats = showResults ? calculateScore() : null;

    return (
        <div className="ai-quiz-page">
            <div className="page-title-row">
                <div>
                    <h1 className="page-heading">AI Quiz Generator</h1>
                    <p className="page-subheading">
                        Generate interactive test questions with instant explanations on any subject in seconds.
                    </p>
                </div>
            </div>

            {error && <ErrorMessage message={error} />}

            {/* Generator Form Card */}
            <Card className="generator-control-card">
                <form onSubmit={handleGenerate} className="generator-form">
                    <div className="gen-form-grid">
                        <div className="topic-input-cell">
                            <Input
                                label="Topic or Subject"
                                placeholder="e.g. Asynchronous JavaScript, Microservices Architecture, Binary Search Trees..."
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                required
                            />
                        </div>

                        <div className="input-group">
                            <label className="input-label">Difficulty</label>
                            <select
                                className="form-control"
                                value={difficulty}
                                onChange={(e) => setDifficulty(e.target.value)}
                            >
                                <option value="EASY">Easy (Foundational)</option>
                                <option value="MEDIUM">Medium (Intermediate)</option>
                                <option value="HARD">Hard (Advanced Mastery)</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label className="input-label">Questions Count</label>
                            <select
                                className="form-control"
                                value={numberOfQuestions}
                                onChange={(e) => setNumberOfQuestions(e.target.value)}
                            >
                                <option value={3}>3 Questions (Quick Quiz)</option>
                                <option value={5}>5 Questions (Standard)</option>
                                <option value={10}>10 Questions (Comprehensive)</option>
                            </select>
                        </div>
                    </div>

                    <div className="generator-submit-row">
                        <Button
                            type="submit"
                            variant="primary"
                            size="lg"
                            icon={SparklesIcon}
                            loading={generating}
                        >
                            Generate Custom Quiz with AI
                        </Button>
                    </div>
                </form>
            </Card>

            {/* Loading Indicator */}
            {generating && (
                <div className="ai-generating-banner">
                    <LoadingSpinner text={`Genie AI is synthesizing ${numberOfQuestions} questions on "${topic}"...`} />
                </div>
            )}

            {/* Generated Quiz Interactive View */}
            {generatedQuiz && generatedQuiz.questions && (
                <div className="generated-quiz-container">
                    <div className="quiz-generated-header">
                        <div>
                            <span className="ai-gen-badge">
                                <SparklesIcon size={14} /> AI Synthesized Quiz
                            </span>
                            <h2>Topic: {generatedQuiz.topic || topic}</h2>
                            <p>Difficulty: <strong>{generatedQuiz.difficulty || difficulty}</strong> • {generatedQuiz.questions.length} Questions</p>
                        </div>

                        {showResults && (
                            <div className="instant-score-badge">
                                <AwardIcon size={24} />
                                <div>
                                    <span>Your Score: {resultStats?.score} / {resultStats?.total}</span>
                                    <strong>{resultStats?.percentage}%</strong>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Question List */}
                    <div className="generated-questions-list">
                        {generatedQuiz.questions.map((q, qIndex) => {
                            const selectedOption = userAnswers[qIndex];
                            const isCorrect = selectedOption === q.correctAnswer;

                            return (
                                <Card key={qIndex} className="gen-question-card">
                                    <div className="gen-q-header">
                                        <span className="gen-q-num">Q{qIndex + 1}</span>
                                        <h3 className="gen-q-text">{q.question}</h3>
                                    </div>

                                    <div className="gen-options-grid">
                                        {q.options && q.options.map((opt, optIndex) => {
                                            const isSelected = selectedOption === opt;
                                            let optionClass = '';

                                            if (showResults) {
                                                if (opt === q.correctAnswer) {
                                                    optionClass = 'opt-correct';
                                                } else if (isSelected && !isCorrect) {
                                                    optionClass = 'opt-incorrect';
                                                }
                                            } else if (isSelected) {
                                                optionClass = 'opt-selected';
                                            }

                                            return (
                                                <div
                                                    key={optIndex}
                                                    className={`gen-option-item ${optionClass}`}
                                                    onClick={() => handleSelectOption(qIndex, opt)}
                                                >
                                                    <span className="opt-letter">
                                                        {String.fromCharCode(65 + optIndex)}
                                                    </span>
                                                    <span className="opt-text">{opt}</span>
                                                </div>
                                            );
                                        })}
                                    </div>

                                    {/* Explanation after submission */}
                                    {showResults && (
                                        <div className="gen-explanation-box">
                                            <div className="explanation-title">
                                                {isCorrect ? (
                                                    <CheckCircleIcon size={16} style={{ color: '#10b981' }} />
                                                ) : (
                                                    <XCircleIcon size={16} style={{ color: '#ef4444' }} />
                                                )}
                                                <strong>
                                                    {isCorrect ? 'Correct!' : `Correct Answer: ${q.correctAnswer}`}
                                                </strong>
                                            </div>
                                            {q.explanation && <p className="explanation-text">{q.explanation}</p>}
                                        </div>
                                    )}
                                </Card>
                            );
                        })}
                    </div>

                    {/* Quiz Action Footer */}
                    <div className="generated-quiz-actions">
                        {!showResults ? (
                            <Button
                                variant="primary"
                                size="lg"
                                icon={CheckCircleIcon}
                                disabled={Object.keys(userAnswers).length === 0}
                                onClick={() => setShowResults(true)}
                            >
                                Submit & Reveal AI Explanations
                            </Button>
                        ) : (
                            <div className="after-results-btns">
                                <Button
                                    variant="secondary"
                                    icon={RefreshIcon}
                                    onClick={() => {
                                        setUserAnswers({});
                                        setShowResults(false);
                                    }}
                                >
                                    Retry Same Quiz
                                </Button>
                                <Button
                                    variant="primary"
                                    icon={SparklesIcon}
                                    onClick={() => {
                                        setGeneratedQuiz(null);
                                        setUserAnswers({});
                                        setShowResults(false);
                                        window.scrollTo({ top: 0, behavior: 'smooth' });
                                    }}
                                >
                                    Generate New Quiz
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AiQuizGenerator;
