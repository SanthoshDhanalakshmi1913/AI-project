import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { quizService } from '../services/quizService';
import { courseService } from '../services/courseService';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
    QuizIcon,
    SearchIcon,
    PlusIcon,
    TrashIcon,
    SparklesIcon,
    BookIcon,
} from '../components/Icons';
import './AdminPages.css';

const ITEMS_PER_PAGE = 6;

const QuizManagement = () => {
    const [quizzes, setQuizzes] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [difficultyFilter, setDifficultyFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedQuiz, setSelectedQuiz] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        courseId: '',
        difficultyLevel: 'INTERMEDIATE',
        passingScore: 70,
        timeLimitMinutes: 15,
    });
    const [formErrors, setFormErrors] = useState({});

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [quizData, courseData] = await Promise.all([
                quizService.getAllQuizzes(),
                courseService.getAllCourses(),
            ]);
            setQuizzes(quizData || []);
            setCourses(courseData || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch quizzes from server.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const courseMap = useMemo(() => {
        const map = {};
        courses.forEach((c) => {
            map[c.id] = c.title;
        });
        return map;
    }, [courses]);

    // Filter & Paginate
    const filteredQuizzes = useMemo(() => {
        return quizzes.filter((q) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                q.title?.toLowerCase().includes(query) ||
                q.description?.toLowerCase().includes(query) ||
                (courseMap[q.courseId] && courseMap[q.courseId].toLowerCase().includes(query));
            const matchesDiff = difficultyFilter === 'ALL' || q.difficultyLevel === difficultyFilter;
            return matchesSearch && matchesDiff;
        });
    }, [quizzes, searchQuery, difficultyFilter, courseMap]);

    const totalPages = Math.ceil(filteredQuizzes.length / ITEMS_PER_PAGE) || 1;
    const paginatedQuizzes = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredQuizzes.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredQuizzes, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, difficultyFilter]);

    const showNotification = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3500);
    };

    // Open Create Modal
    const handleOpenCreateModal = () => {
        setFormData({
            title: '',
            description: '',
            courseId: courses.length > 0 ? courses[0].id : '',
            difficultyLevel: 'INTERMEDIATE',
            passingScore: 70,
            timeLimitMinutes: 15,
        });
        setFormErrors({});
        setIsCreateModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEditModal = (quiz) => {
        setSelectedQuiz(quiz);
        setFormData({
            title: quiz.title || '',
            description: quiz.description || '',
            courseId: quiz.courseId || (courses.length > 0 ? courses[0].id : ''),
            difficultyLevel: quiz.difficultyLevel || 'INTERMEDIATE',
            passingScore: quiz.passingScore || 70,
            timeLimitMinutes: quiz.timeLimitMinutes || 15,
        });
        setFormErrors({});
        setIsEditModalOpen(true);
    };

    // Open Delete Confirmation Modal
    const handleOpenDeleteModal = (quiz) => {
        setSelectedQuiz(quiz);
        setIsDeleteModalOpen(true);
    };

    const validateForm = () => {
        const errs = {};
        if (!formData.title.trim()) errs.title = 'Quiz title is required';
        if (!formData.description.trim()) errs.description = 'Quiz description is required';
        if (!formData.courseId) errs.courseId = 'Associated course is required';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Create Quiz Submit
    const handleCreateQuiz = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setActionLoading(true);
        setError(null);
        try {
            await quizService.createQuiz({
                ...formData,
                courseId: Number(formData.courseId),
                passingScore: Number(formData.passingScore),
                timeLimitMinutes: Number(formData.timeLimitMinutes),
            });
            showNotification(`Quiz "${formData.title}" created successfully.`);
            setIsCreateModalOpen(false);
            fetchData();
        } catch (err) {
            setError(err.message || 'Failed to create quiz');
        } finally {
            setActionLoading(false);
        }
    };

    // Edit Quiz Submit
    const handleEditQuiz = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setActionLoading(true);
        setError(null);
        try {
            await quizService.updateQuiz(selectedQuiz.id, {
                ...formData,
                courseId: Number(formData.courseId),
                passingScore: Number(formData.passingScore),
                timeLimitMinutes: Number(formData.timeLimitMinutes),
            });
            showNotification(`Quiz "${formData.title}" updated successfully.`);
            setIsEditModalOpen(false);
            fetchData();
        } catch (err) {
            setError(err.message || 'Failed to update quiz');
        } finally {
            setActionLoading(false);
        }
    };

    // Delete Quiz Submit
    const handleDeleteQuiz = async () => {
        if (!selectedQuiz) return;
        setActionLoading(true);
        setError(null);
        try {
            await quizService.deleteQuiz(selectedQuiz.id);
            showNotification(`Quiz "${selectedQuiz.title}" deleted successfully.`);
            setIsDeleteModalOpen(false);
            setSelectedQuiz(null);
            fetchData();
        } catch (err) {
            setError(err.message || 'Failed to delete quiz');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="admin-page-root">
            {/* Header */}
            <div className="admin-header-row">
                <div>
                    <h1 className="admin-page-title">Quiz Management</h1>
                    <p className="admin-page-desc">
                        Create, evaluate, and configure interactive assessments, passing thresholds, and topic quizzes.
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={PlusIcon}
                    onClick={handleOpenCreateModal}
                >
                    Create New Quiz
                </Button>
            </div>

            {error && <ErrorMessage message={error} />}
            {successMsg && (
                <div className="alert-banner alert-success" style={{ padding: '0.75rem 1rem', background: '#d1fae5', color: '#065f46', borderRadius: 8, fontWeight: 600 }}>
                    ✓ {successMsg}
                </div>
            )}

            {/* Filter Bar */}
            <div className="admin-controls-bar">
                <div className="admin-search-box">
                    <Input
                        placeholder="Search quizzes by title, topic, or course..."
                        icon={SearchIcon}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="admin-filters-group">
                    <select
                        className="admin-select-input"
                        value={difficultyFilter}
                        onChange={(e) => setDifficultyFilter(e.target.value)}
                    >
                        <option value="ALL">All Difficulties</option>
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                    </select>
                </div>
            </div>

            {/* Quizzes Table */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">
                        Assessment Quizzes Catalog ({filteredQuizzes.length})
                    </h3>
                </div>

                {loading ? (
                    <LoadingSpinner text="Fetching quizzes..." />
                ) : filteredQuizzes.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <QuizIcon size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                        <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-secondary)' }}>No quizzes found</p>
                        <p style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}>Create an assessment to evaluate students.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-data-table">
                            <thead>
                                <tr>
                                    <th>Quiz Assessment</th>
                                    <th>Linked Course</th>
                                    <th>Difficulty</th>
                                    <th>Passing Score</th>
                                    <th>Time Limit</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedQuizzes.map((quiz) => (
                                    <tr key={quiz.id}>
                                        <td>
                                            <div>
                                                <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                                                    {quiz.title}
                                                </strong>
                                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {quiz.description}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                {courseMap[quiz.courseId] || `Course #${quiz.courseId}`}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`level-badge level-${quiz.difficultyLevel?.toLowerCase() || 'intermediate'}`}>
                                                {quiz.difficultyLevel || 'INTERMEDIATE'}
                                            </span>
                                        </td>
                                        <td>
                                            <strong style={{ color: '#059669' }}>{quiz.passingScore || 70}%</strong>
                                        </td>
                                        <td>{quiz.timeLimitMinutes ? `${quiz.timeLimitMinutes} min` : '15 min'}</td>
                                        <td>
                                            <div className="admin-actions-cell" style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    type="button"
                                                    className="table-action-btn"
                                                    onClick={() => handleOpenEditModal(quiz)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="table-action-btn btn-delete"
                                                    onClick={() => handleOpenDeleteModal(quiz)}
                                                >
                                                    <TrashIcon size={13} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredQuizzes.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>

            {/* Modal: Create Quiz */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Quiz Assessment"
                size="lg"
            >
                <form onSubmit={handleCreateQuiz} className="admin-modal-form">
                    <Input
                        label="Quiz Title"
                        placeholder="e.g. Java Object-Oriented Principles & Streams"
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        error={formErrors.title}
                        required
                    />

                    <div className="form-field-group">
                        <label className="form-field-label">Quiz Description</label>
                        <textarea
                            className="form-field-textarea"
                            rows={2}
                            placeholder="Briefly describe the focus area of this assessment..."
                            value={formData.description}
                            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                        />
                        {formErrors.description && (
                            <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.description}</span>
                        )}
                    </div>

                    <div className="form-field-group">
                        <label className="form-field-label">Associated Course</label>
                        <select
                            className="form-field-select"
                            value={formData.courseId}
                            onChange={(e) => setFormData((p) => ({ ...p, courseId: e.target.value }))}
                        >
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title} ({c.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-field-group">
                            <label className="form-field-label">Difficulty Level</label>
                            <select
                                className="form-field-select"
                                value={formData.difficultyLevel}
                                onChange={(e) => setFormData((p) => ({ ...p, difficultyLevel: e.target.value }))}
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>

                        <Input
                            label="Passing Score (%)"
                            type="number"
                            min="10"
                            max="100"
                            value={formData.passingScore}
                            onChange={(e) => setFormData((p) => ({ ...p, passingScore: e.target.value }))}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={actionLoading}
                        >
                            Create Quiz
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Edit Quiz */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit Quiz: ${selectedQuiz?.title}`}
                size="lg"
            >
                <form onSubmit={handleEditQuiz} className="admin-modal-form">
                    <Input
                        label="Quiz Title"
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        error={formErrors.title}
                        required
                    />

                    <div className="form-field-group">
                        <label className="form-field-label">Quiz Description</label>
                        <textarea
                            className="form-field-textarea"
                            rows={2}
                            value={formData.description}
                            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                        />
                        {formErrors.description && (
                            <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.description}</span>
                        )}
                    </div>

                    <div className="form-field-group">
                        <label className="form-field-label">Associated Course</label>
                        <select
                            className="form-field-select"
                            value={formData.courseId}
                            onChange={(e) => setFormData((p) => ({ ...p, courseId: e.target.value }))}
                        >
                            {courses.map((c) => (
                                <option key={c.id} value={c.id}>
                                    {c.title} ({c.category})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="form-grid-2">
                        <div className="form-field-group">
                            <label className="form-field-label">Difficulty Level</label>
                            <select
                                className="form-field-select"
                                value={formData.difficultyLevel}
                                onChange={(e) => setFormData((p) => ({ ...p, difficultyLevel: e.target.value }))}
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>

                        <Input
                            label="Passing Score (%)"
                            type="number"
                            min="10"
                            max="100"
                            value={formData.passingScore}
                            onChange={(e) => setFormData((p) => ({ ...p, passingScore: e.target.value }))}
                            required
                        />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={actionLoading}
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Delete Confirmation */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm Quiz Deletion"
                size="sm"
            >
                <div className="delete-confirm-box">
                    <p className="delete-warning-text">
                        Are you sure you want to permanently delete this quiz assessment?
                    </p>
                    <div className="delete-target-highlight">
                        <div><strong>{selectedQuiz?.title}</strong></div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>
                            Difficulty: {selectedQuiz?.difficultyLevel} • Course: {courseMap[selectedQuiz?.courseId] || `#${selectedQuiz?.courseId}`}
                        </div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        ⚠️ Warning: All student attempts, scores, and answered questions linked to this quiz will be permanently deleted.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            loading={actionLoading}
                            onClick={handleDeleteQuiz}
                        >
                            Confirm Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default QuizManagement;
