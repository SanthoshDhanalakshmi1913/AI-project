import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { courseService } from '../services/courseService';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/formatters';
import {
    BookIcon,
    SearchIcon,
    PlusIcon,
    TrashIcon,
    LayersIcon,
} from '../components/Icons';
import './AdminPages.css';

const ITEMS_PER_PAGE = 6;

const CourseManagement = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    // Filters & Pagination
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [levelFilter, setLevelFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    // Modals
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'Computer Science',
        level: 'BEGINNER',
    });
    const [formErrors, setFormErrors] = useState({});

    const fetchCourses = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await courseService.getAllCourses();
            setCourses(data || []);
        } catch (err) {
            setError(err.message || 'Failed to fetch courses from server.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCourses();
    }, [fetchCourses]);

    // Categories available
    const categories = useMemo(() => {
        const set = new Set(courses.map((c) => c.category).filter(Boolean));
        return ['ALL', ...Array.from(set)];
    }, [courses]);

    // Filter & Paginate
    const filteredCourses = useMemo(() => {
        return courses.filter((c) => {
            const query = searchQuery.toLowerCase();
            const matchesSearch =
                c.title?.toLowerCase().includes(query) ||
                c.description?.toLowerCase().includes(query) ||
                c.category?.toLowerCase().includes(query) ||
                c.instructorName?.toLowerCase().includes(query);
            const matchesCat = categoryFilter === 'ALL' || c.category === categoryFilter;
            const matchesLevel = levelFilter === 'ALL' || c.level === levelFilter;
            return matchesSearch && matchesCat && matchesLevel;
        });
    }, [courses, searchQuery, categoryFilter, levelFilter]);

    const totalPages = Math.ceil(filteredCourses.length / ITEMS_PER_PAGE) || 1;
    const paginatedCourses = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCourses.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredCourses, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, categoryFilter, levelFilter]);

    const showNotification = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3500);
    };

    // Open Create Modal
    const handleOpenCreateModal = () => {
        setFormData({
            title: '',
            description: '',
            category: 'Computer Science',
            level: 'BEGINNER',
        });
        setFormErrors({});
        setIsCreateModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEditModal = (course) => {
        setSelectedCourse(course);
        setFormData({
            title: course.title || '',
            description: course.description || '',
            category: course.category || 'Computer Science',
            level: course.level || 'BEGINNER',
        });
        setFormErrors({});
        setIsEditModalOpen(true);
    };

    // Open Delete Confirmation Modal
    const handleOpenDeleteModal = (course) => {
        setSelectedCourse(course);
        setIsDeleteModalOpen(true);
    };

    const validateForm = () => {
        const errs = {};
        if (!formData.title.trim()) errs.title = 'Course title is required';
        if (!formData.description.trim()) errs.description = 'Course description is required';
        if (!formData.category.trim()) errs.category = 'Category is required';
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Create Course Submit
    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setActionLoading(true);
        setError(null);
        try {
            await courseService.createCourse(formData);
            showNotification(`Course "${formData.title}" created successfully.`);
            setIsCreateModalOpen(false);
            fetchCourses();
        } catch (err) {
            setError(err.message || 'Failed to create course');
        } finally {
            setActionLoading(false);
        }
    };

    // Edit Course Submit
    const handleEditCourse = async (e) => {
        e.preventDefault();
        if (!validateForm()) return;

        setActionLoading(true);
        setError(null);
        try {
            await courseService.updateCourse(selectedCourse.id, formData);
            showNotification(`Course "${formData.title}" updated successfully.`);
            setIsEditModalOpen(false);
            fetchCourses();
        } catch (err) {
            setError(err.message || 'Failed to update course');
        } finally {
            setActionLoading(false);
        }
    };

    // Delete Course Submit
    const handleDeleteCourse = async () => {
        if (!selectedCourse) return;
        setActionLoading(true);
        setError(null);
        try {
            await courseService.deleteCourse(selectedCourse.id);
            showNotification(`Course "${selectedCourse.title}" deleted successfully.`);
            setIsDeleteModalOpen(false);
            setSelectedCourse(null);
            fetchCourses();
        } catch (err) {
            setError(err.message || 'Failed to delete course');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="admin-page-root">
            {/* Header */}
            <div className="admin-header-row">
                <div>
                    <h1 className="admin-page-title">Course Management</h1>
                    <p className="admin-page-desc">
                        Manage academic courses, syllabus metadata, learning tracks, and assignments.
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={PlusIcon}
                    onClick={handleOpenCreateModal}
                >
                    Create New Course
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
                        placeholder="Search courses by title, instructor, or topic..."
                        icon={SearchIcon}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="admin-filters-group">
                    <select
                        className="admin-select-input"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>
                                {cat === 'ALL' ? 'All Categories' : cat}
                            </option>
                        ))}
                    </select>

                    <select
                        className="admin-select-input"
                        value={levelFilter}
                        onChange={(e) => setLevelFilter(e.target.value)}
                    >
                        <option value="ALL">All Levels</option>
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                    </select>
                </div>
            </div>

            {/* Courses Table */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">
                        Academic Courses Catalog ({filteredCourses.length})
                    </h3>
                </div>

                {loading ? (
                    <LoadingSpinner text="Fetching courses..." />
                ) : filteredCourses.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <BookIcon size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                        <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-secondary)' }}>No courses found</p>
                        <p style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}>Adjust search filters or create a new course.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-data-table">
                            <thead>
                                <tr>
                                    <th>Course Title</th>
                                    <th>Category</th>
                                    <th>Difficulty Level</th>
                                    <th>Instructor</th>
                                    <th>Created Date</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedCourses.map((course) => (
                                    <tr key={course.id}>
                                        <td>
                                            <div>
                                                <strong style={{ color: 'var(--text-primary)', fontSize: '0.92rem' }}>
                                                    {course.title}
                                                </strong>
                                                <p style={{ margin: '0.2rem 0 0', fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: 300, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {course.description}
                                                </p>
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                                                {course.category || 'General'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`level-badge level-${course.level?.toLowerCase() || 'beginner'}`}>
                                                {course.level || 'BEGINNER'}
                                            </span>
                                        </td>
                                        <td>{course.instructorName || 'Academic Faculty'}</td>
                                        <td>{formatDate(course.createdAt)}</td>
                                        <td>
                                            <div className="admin-actions-cell" style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    type="button"
                                                    className="table-action-btn"
                                                    onClick={() => handleOpenEditModal(course)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="table-action-btn btn-delete"
                                                    onClick={() => handleOpenDeleteModal(course)}
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
                    totalItems={filteredCourses.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>

            {/* Modal: Create Course */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Academic Course"
                size="lg"
            >
                <form onSubmit={handleCreateCourse} className="admin-modal-form">
                    <Input
                        label="Course Title"
                        placeholder="e.g. Master Spring Boot & Microservices"
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        error={formErrors.title}
                        required
                    />

                    <div className="form-field-group">
                        <label className="form-field-label">Course Description</label>
                        <textarea
                            className="form-field-textarea"
                            rows={3}
                            placeholder="Provide a comprehensive summary of topics covered..."
                            value={formData.description}
                            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                        />
                        {formErrors.description && (
                            <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.description}</span>
                        )}
                    </div>

                    <div className="form-grid-2">
                        <Input
                            label="Category"
                            placeholder="e.g. Cloud Computing, AI, Web Dev"
                            value={formData.category}
                            onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                            error={formErrors.category}
                            required
                        />

                        <div className="form-field-group">
                            <label className="form-field-label">Difficulty Level</label>
                            <select
                                className="form-field-select"
                                value={formData.level}
                                onChange={(e) => setFormData((p) => ({ ...p, level: e.target.value }))}
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>
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
                            Create Course
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Edit Course */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit Course: ${selectedCourse?.title}`}
                size="lg"
            >
                <form onSubmit={handleEditCourse} className="admin-modal-form">
                    <Input
                        label="Course Title"
                        value={formData.title}
                        onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                        error={formErrors.title}
                        required
                    />

                    <div className="form-field-group">
                        <label className="form-field-label">Course Description</label>
                        <textarea
                            className="form-field-textarea"
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                        />
                        {formErrors.description && (
                            <span style={{ color: '#ef4444', fontSize: '0.75rem' }}>{formErrors.description}</span>
                        )}
                    </div>

                    <div className="form-grid-2">
                        <Input
                            label="Category"
                            value={formData.category}
                            onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                            error={formErrors.category}
                            required
                        />

                        <div className="form-field-group">
                            <label className="form-field-label">Difficulty Level</label>
                            <select
                                className="form-field-select"
                                value={formData.level}
                                onChange={(e) => setFormData((p) => ({ ...p, level: e.target.value }))}
                            >
                                <option value="BEGINNER">Beginner</option>
                                <option value="INTERMEDIATE">Intermediate</option>
                                <option value="ADVANCED">Advanced</option>
                            </select>
                        </div>
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
                title="Confirm Course Deletion"
                size="sm"
            >
                <div className="delete-confirm-box">
                    <p className="delete-warning-text">
                        Are you sure you want to permanently delete this course?
                    </p>
                    <div className="delete-target-highlight">
                        <div><strong>{selectedCourse?.title}</strong></div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>Category: {selectedCourse?.category} • Level: {selectedCourse?.level}</div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        ⚠️ Warning: All lessons, study notes, and student enrollment records under this course will also be removed.
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
                            onClick={handleDeleteCourse}
                        >
                            Confirm Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default CourseManagement;
