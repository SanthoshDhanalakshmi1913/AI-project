import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { quizService } from '../services/quizService';
import { courseService } from '../services/courseService';
import QuizCard from '../components/QuizCard';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
    QuizIcon,
    SparklesIcon,
    SearchIcon,
    PlusIcon,
    AwardIcon,
    ClockIcon,
    CheckCircleIcon,
    PlayCircleIcon,
} from '../components/Icons';
import './Quiz.css';

const QuizList = () => {
    const { user, isInstructor, isAdmin } = useAuth();
    const navigate = useNavigate();

    const [quizzes, setQuizzes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search and filter
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCourseFilter, setSelectedCourseFilter] = useState('ALL');

    // Instructions Modal
    const [selectedQuizForInstructions, setSelectedQuizForInstructions] = useState(null);

    // Create Quiz Modal (Instructor/Admin)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newQuiz, setNewQuiz] = useState({
        title: '',
        description: '',
        courseId: '',
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    const loadQuizzesData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [quizzesData, coursesData, attemptsData] = await Promise.allSettled([
                quizService.getAllQuizzes(),
                courseService.getAllCourses(),
                quizService.getMyAttempts(),
            ]);

            if (quizzesData.status === 'fulfilled') {
                setQuizzes(quizzesData.value || []);
            }
            if (coursesData.status === 'fulfilled') {
                setCourses(coursesData.value || []);
                if (coursesData.value?.length > 0) {
                    setNewQuiz((prev) => ({ ...prev, courseId: coursesData.value[0].id }));
                }
            }
            if (attemptsData.status === 'fulfilled') {
                setAttempts(attemptsData.value || []);
            }
        } catch (err) {
            setError(err.message || 'Failed to load quizzes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadQuizzesData();
    }, []);

    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        if (!newQuiz.title.trim() || !newQuiz.courseId) {
            setCreateError('Please provide quiz title and select a course');
            return;
        }

        setCreateLoading(true);
        setCreateError('');
        try {
            const created = await quizService.createQuiz({
                title: newQuiz.title,
                description: newQuiz.description,
                courseId: Number(newQuiz.courseId),
            });
            setQuizzes((prev) => [created, ...prev]);
            setIsCreateModalOpen(false);
            setNewQuiz({ title: '', description: '', courseId: courses[0]?.id || '' });
        } catch (err) {
            setCreateError(err.message || 'Failed to create quiz');
        } finally {
            setCreateLoading(false);
        }
    };

    const getLatestAttempt = (quizId) => {
        const found = attempts.filter((a) => a.quizId === quizId);
        if (found.length === 0) return null;
        return found[found.length - 1];
    };

    const handleOpenInstructions = (quiz) => {
        setSelectedQuizForInstructions(quiz);
    };

    const handleStartConfirmed = () => {
        if (selectedQuizForInstructions) {
            const quizId = selectedQuizForInstructions.id;
            setSelectedQuizForInstructions(null);
            navigate(`/quizzes/${quizId}`);
        }
    };

    const filteredQuizzes = quizzes.filter((q) => {
        const matchesSearch =
            q.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            q.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCourse = selectedCourseFilter === 'ALL' || String(q.courseId) === String(selectedCourseFilter);
        return matchesSearch && matchesCourse;
    });

    return (
        <div className="quiz-list-page">
            {/* Header */}
            <div className="page-title-row">
                <div>
                    <h1 className="page-heading">Assessments & Quizzes</h1>
                    <p className="page-subheading">
                        Test your mastery, review past performance, or generate AI practice tests.
                    </p>
                </div>
                <div className="quiz-head-actions">
                    <Button
                        variant="secondary"
                        icon={SparklesIcon}
                        onClick={() => navigate('/ai-quiz')}
                    >
                        AI Practice Quiz
                    </Button>
                    {(isInstructor || isAdmin) && (
                        <Button
                            variant="primary"
                            icon={PlusIcon}
                            onClick={() => setIsCreateModalOpen(true)}
                        >
                            Create Quiz
                        </Button>
                    )}
                </div>
            </div>

            {error && <ErrorMessage message={error} onRetry={loadQuizzesData} />}

            {/* AI Generator Promo Card */}
            <div className="ai-quiz-promo-card">
                <div className="ai-promo-content">
                    <div className="ai-promo-badge">
                        <SparklesIcon size={14} />
                        <span>AI Learning Assistant</span>
                    </div>
                    <h3>Need instant practice on any customized topic?</h3>
                    <p>
                        Generate tailored multiple-choice quizzes with custom difficulty and detailed step-by-step explanations on any subject!
                    </p>
                </div>
                <Button
                    variant="primary"
                    size="md"
                    icon={SparklesIcon}
                    onClick={() => navigate('/ai-quiz')}
                >
                    Try AI Quiz Generator
                </Button>
            </div>

            {/* Filters Bar */}
            <div className="courses-filter-bar">
                <div className="search-filter-input">
                    <Input
                        placeholder="Search quizzes by title, topic, or course..."
                        icon={SearchIcon}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-selects-group">
                    <select
                        className="filter-dropdown"
                        value={selectedCourseFilter}
                        onChange={(e) => setSelectedCourseFilter(e.target.value)}
                    >
                        <option value="ALL">All Courses</option>
                        {courses.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Quiz Cards Grid */}
            {loading ? (
                <LoadingSpinner text="Loading quizzes..." />
            ) : filteredQuizzes.length === 0 ? (
                <Card>
                    <div className="empty-state">
                        <QuizIcon size={48} className="empty-icon" />
                        <h3>No quizzes found</h3>
                        <p>Adjust your search filters or generate a practice test with AI.</p>
                        <Button
                            variant="primary"
                            icon={SparklesIcon}
                            onClick={() => navigate('/ai-quiz')}
                        >
                            Generate Custom Quiz
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="quiz-grid">
                    {filteredQuizzes.map((quiz) => (
                        <QuizCard
                            key={quiz.id}
                            quiz={quiz}
                            latestAttempt={getLatestAttempt(quiz.id)}
                            onStart={handleOpenInstructions}
                            onReview={(attemptId) => navigate(`/quizzes/${quiz.id}/results/${attemptId}`)}
                        />
                    ))}
                </div>
            )}

            {/* Quiz Instructions Modal */}
            <Modal
                isOpen={!!selectedQuizForInstructions}
                onClose={() => setSelectedQuizForInstructions(null)}
                title="Quiz Instructions & Rules"
                size="md"
            >
                {selectedQuizForInstructions && (
                    <div className="instructions-modal-content">
                        <div className="instruction-quiz-header">
                            <span className="quiz-course-tag">
                                {selectedQuizForInstructions.courseTitle || `Course #${selectedQuizForInstructions.courseId}`}
                            </span>
                            <h3>{selectedQuizForInstructions.title}</h3>
                            <p>{selectedQuizForInstructions.description || 'Test your knowledge on this module.'}</p>
                        </div>

                        <div className="instructions-rules-list">
                            <h4>📋 Assessment Guidelines:</h4>
                            <ul>
                                <li>
                                    <strong>⏱️ Timed Test:</strong> You have <strong>10 minutes</strong> to complete all questions once started.
                                </li>
                                <li>
                                    <strong>🎯 Passing Score:</strong> Minimum <strong>70% score</strong> is required to pass.
                                </li>
                                <li>
                                    <strong>⌨️ Interactive Navigation:</strong> Use the on-screen buttons or keyboard keys (<strong>A, B, C, D</strong>) to select options.
                                </li>
                                <li>
                                    <strong>🚩 Flag for Review:</strong> You can mark difficult questions and return to them anytime before submission.
                                </li>
                                <li>
                                    <strong>🛡️ Single Submission:</strong> Your answers will be submitted immediately upon confirmation.
                                </li>
                            </ul>
                        </div>

                        <div className="modal-actions-right">
                            <Button
                                variant="secondary"
                                onClick={() => setSelectedQuizForInstructions(null)}
                            >
                                Cancel
                            </Button>
                            <Button
                                variant="primary"
                                icon={PlayCircleIcon}
                                onClick={handleStartConfirmed}
                            >
                                Start Quiz Now
                            </Button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Create Quiz Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Assessment"
                size="md"
            >
                {createError && <ErrorMessage message={createError} />}
                <form onSubmit={handleCreateQuiz}>
                    <Input
                        label="Quiz Title"
                        placeholder="e.g. State Management & Hooks Quiz"
                        value={newQuiz.title}
                        onChange={(e) => setNewQuiz({ ...newQuiz, title: e.target.value })}
                        required
                    />

                    <div className="input-group">
                        <label className="input-label">Associate with Course</label>
                        <select
                            className="form-control"
                            value={newQuiz.courseId}
                            onChange={(e) => setNewQuiz({ ...newQuiz, courseId: e.target.value })}
                            required
                        >
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>
                                    {course.title}
                                </option>
                            ))}
                        </select>
                    </div>

                    <Input
                        label="Description & Instructions"
                        type="textarea"
                        placeholder="Enter quiz description and learning objectives..."
                        value={newQuiz.description}
                        onChange={(e) => setNewQuiz({ ...newQuiz, description: e.target.value })}
                        rows={3}
                    />

                    <div className="modal-actions-right">
                        <Button
                            variant="secondary"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={createLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={createLoading}
                        >
                            Create Quiz
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default QuizList;
