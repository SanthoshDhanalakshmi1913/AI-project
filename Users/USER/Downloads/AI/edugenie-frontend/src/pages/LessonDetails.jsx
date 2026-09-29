import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { lessonService } from '../services/lessonService';
import { aiService } from '../services/aiService';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    SparklesIcon,
    CheckCircleIcon,
    BookIcon,
    BotIcon,
    CopyIcon,
} from '../components/Icons';
import './Lesson.css';

const LessonDetails = () => {
    const { courseId, lessonId } = useParams();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [currentLesson, setCurrentLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // AI Assistant Assistant for this lesson
    const [aiDrawerOpen, setAiDrawerOpen] = useState(false);
    const [aiTask, setAiTask] = useState('EXPLAIN');
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiResult, setAiResult] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const loadLessonData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [courseData, lessonsData] = await Promise.all([
                    courseService.getCourseById(courseId),
                    lessonService.getLessonsByCourse(courseId),
                ]);
                setCourse(courseData);
                setLessons(lessonsData || []);

                const foundLesson = lessonsData?.find((l) => String(l.id) === String(lessonId)) || lessonsData?.[0];
                setCurrentLesson(foundLesson);
            } catch (err) {
                setError(err.message || 'Failed to load lesson content');
            } finally {
                setLoading(false);
            }
        };

        loadLessonData();
    }, [courseId, lessonId]);

    const currentIndex = lessons.findIndex((l) => String(l.id) === String(lessonId));
    const prevLesson = currentIndex > 0 ? lessons[currentIndex - 1] : null;
    const nextLesson = currentIndex >= 0 && currentIndex < lessons.length - 1 ? lessons[currentIndex + 1] : null;

    const handleAskAi = async (taskType = 'EXPLAIN', customPrompt = '') => {
        setAiTask(taskType);
        setAiLoading(true);
        setAiResult('');
        try {
            const promptText =
                customPrompt ||
                (taskType === 'EXPLAIN'
                    ? `Please explain the key concepts of "${currentLesson?.title}" in a clear, easy-to-understand educational manner.`
                    : taskType === 'EXAMPLES'
                    ? `Give 3 real-world practical examples for "${currentLesson?.title}".`
                    : taskType === 'SIMPLIFY'
                    ? `Simplify the topic "${currentLesson?.title}" like I am 12 years old with analogy.`
                    : `Summarize the main takeaways of "${currentLesson?.title}".`);

            const data = await aiService.askAssistant({
                prompt: promptText,
                topic: currentLesson?.title || '',
                context: currentLesson?.content || '',
                taskType: taskType,
            });

            const answer = typeof data === 'string' ? data : data?.answer || data?.overview || JSON.stringify(data, null, 2);
            setAiResult(answer);
        } catch (err) {
            setAiResult(`AI Assistant Error: ${err.message || 'Could not generate explanation.'}`);
        } finally {
            setAiLoading(false);
        }
    };

    const handleCopyAiResult = () => {
        navigator.clipboard.writeText(aiResult);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (loading) {
        return <LoadingSpinner text="Opening lesson reader..." />;
    }

    if (error || !currentLesson) {
        return (
            <div className="lesson-page-container">
                <ErrorMessage message={error || 'Lesson not found'} />
                <Button variant="secondary" onClick={() => navigate(`/courses/${courseId}`)}>
                    Back to Course Syllabus
                </Button>
            </div>
        );
    }

    return (
        <div className="lesson-page-container">
            {/* Top Navigation Bar */}
            <div className="lesson-top-bar">
                <Link to={`/courses/${courseId}`} className="lesson-back-btn">
                    <ChevronLeftIcon size={18} />
                    <span>{course?.title || 'Back to Course'}</span>
                </Link>

                <div className="lesson-top-actions">
                    <Button
                        variant={isCompleted ? 'success' : 'outline'}
                        size="sm"
                        icon={CheckCircleIcon}
                        onClick={() => setIsCompleted(!isCompleted)}
                    >
                        {isCompleted ? 'Completed ✓' : 'Mark as Complete'}
                    </Button>

                    <Button
                        variant="primary"
                        size="sm"
                        icon={SparklesIcon}
                        onClick={() => {
                            setAiDrawerOpen(true);
                            if (!aiResult) {
                                handleAskAi('EXPLAIN');
                            }
                        }}
                    >
                        Ask Genie AI
                    </Button>
                </div>
            </div>

            {/* Main Lesson Split Layout */}
            <div className={`lesson-layout-grid ${aiDrawerOpen ? 'with-ai-drawer' : ''}`}>
                {/* Lesson Reader Content */}
                <div className="lesson-reading-pane">
                    <div className="lesson-header-box">
                        <span className="lesson-badge-number">
                            Lesson {currentLesson.lessonOrder || currentIndex + 1} of {lessons.length}
                        </span>
                        <h1 className="lesson-main-heading">{currentLesson.title}</h1>
                    </div>

                    <div className="lesson-body-prose">
                        {currentLesson.content ? (
                            currentLesson.content.split('\n\n').map((paragraph, i) => (
                                <p key={i}>{paragraph}</p>
                            ))
                        ) : (
                            <p>No content has been added to this lesson yet.</p>
                        )}
                    </div>

                    {/* Lesson Footer Navigation */}
                    <div className="lesson-navigation-footer">
                        {prevLesson ? (
                            <Button
                                variant="secondary"
                                icon={ChevronLeftIcon}
                                onClick={() => navigate(`/courses/${courseId}/lessons/${prevLesson.id}`)}
                            >
                                Previous: {prevLesson.title}
                            </Button>
                        ) : (
                            <div />
                        )}

                        {nextLesson ? (
                            <Button
                                variant="primary"
                                icon={ChevronRightIcon}
                                iconPosition="right"
                                onClick={() => navigate(`/courses/${courseId}/lessons/${nextLesson.id}`)}
                            >
                                Next: {nextLesson.title}
                            </Button>
                        ) : (
                            <Button
                                variant="success"
                                icon={CheckCircleIcon}
                                onClick={() => navigate(`/courses/${courseId}`)}
                            >
                                Complete Course 🎉
                            </Button>
                        )}
                    </div>
                </div>

                {/* AI Assistant Sidebar / Drawer */}
                {aiDrawerOpen && (
                    <aside className="ai-assistant-drawer">
                        <div className="ai-drawer-header">
                            <div className="ai-drawer-title">
                                <SparklesIcon size={18} className="ai-sparkle-color" />
                                <h3>Lesson AI Tutor</h3>
                            </div>
                            <button
                                type="button"
                                className="ai-drawer-close"
                                onClick={() => setAiDrawerOpen(false)}
                            >
                                ✕
                            </button>
                        </div>

                        <div className="ai-drawer-content">
                            <div className="ai-preset-chips">
                                <button
                                    className={`ai-chip ${aiTask === 'EXPLAIN' ? 'active' : ''}`}
                                    onClick={() => handleAskAi('EXPLAIN')}
                                >
                                    Explain Key Points
                                </button>
                                <button
                                    className={`ai-chip ${aiTask === 'SIMPLIFY' ? 'active' : ''}`}
                                    onClick={() => handleAskAi('SIMPLIFY')}
                                >
                                    Simplify (ELI5)
                                </button>
                                <button
                                    className={`ai-chip ${aiTask === 'EXAMPLES' ? 'active' : ''}`}
                                    onClick={() => handleAskAi('EXAMPLES')}
                                >
                                    Real Examples
                                </button>
                                <button
                                    className={`ai-chip ${aiTask === 'SUMMARIZE' ? 'active' : ''}`}
                                    onClick={() => handleAskAi('SUMMARIZE')}
                                >
                                    Summary
                                </button>
                            </div>

                            <div className="ai-custom-prompt-row">
                                <input
                                    type="text"
                                    placeholder="Ask specific question on this lesson..."
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && aiPrompt.trim()) {
                                            handleAskAi('FOLLOW_UP', aiPrompt);
                                        }
                                    }}
                                    className="ai-prompt-input"
                                />
                                <Button
                                    size="sm"
                                    variant="primary"
                                    loading={aiLoading}
                                    onClick={() => handleAskAi('FOLLOW_UP', aiPrompt)}
                                >
                                    Ask
                                </Button>
                            </div>

                            {aiLoading ? (
                                <div className="ai-loading-box">
                                    <LoadingSpinner size="sm" text="Genie AI is analyzing this lesson..." />
                                </div>
                            ) : aiResult ? (
                                <div className="ai-result-card">
                                    <div className="ai-result-header">
                                        <span>AI Insights</span>
                                        <button
                                            type="button"
                                            className="copy-text-btn"
                                            onClick={handleCopyAiResult}
                                        >
                                            <CopyIcon size={14} />
                                            <span>{copied ? 'Copied!' : 'Copy'}</span>
                                        </button>
                                    </div>
                                    <div className="ai-result-text">
                                        {aiResult.split('\n').map((line, idx) => (
                                            <p key={idx}>{line}</p>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="ai-empty-prompt">
                                    <BotIcon size={32} />
                                    <p>Select a quick prompt above or type your doubt to get an immediate AI explanation.</p>
                                </div>
                            )}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
};

export default LessonDetails;
