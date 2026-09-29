import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { courseService } from '../services/courseService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
    BookIcon,
    SearchIcon,
    PlusIcon,
    PlayCircleIcon,
    UserIcon,
} from '../components/Icons';
import './Courses.css';

const CourseList = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Search and Filters
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [selectedLevel, setSelectedLevel] = useState('ALL');

    // Create Course Modal (for Instructors/Admins)
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [newCourse, setNewCourse] = useState({
        title: '',
        description: '',
        category: 'Computer Science',
        level: 'BEGINNER',
    });
    const [createLoading, setCreateLoading] = useState(false);
    const [createError, setCreateError] = useState('');

    const isInstructorOrAdmin = user?.role === 'ROLE_INSTRUCTOR' || user?.role === 'ROLE_ADMIN' || user?.role === 'INSTRUCTOR' || user?.role === 'ADMIN';

    const loadCourses = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await courseService.getAllCourses();
            setCourses(data || []);
        } catch (err) {
            setError(err.message || 'Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourses();
    }, []);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        if (!newCourse.title.trim() || !newCourse.description.trim()) {
            setCreateError('Please fill in both title and description');
            return;
        }

        setCreateLoading(true);
        setCreateError('');
        try {
            const created = await courseService.createCourse(newCourse);
            setCourses((prev) => [created, ...prev]);
            setIsCreateModalOpen(false);
            setNewCourse({
                title: '',
                description: '',
                category: 'Computer Science',
                level: 'BEGINNER',
            });
        } catch (err) {
            setCreateError(err.message || 'Failed to create course');
        } finally {
            setCreateLoading(false);
        }
    };

    // Filter courses
    const categories = ['ALL', ...new Set(courses.map((c) => c.category).filter(Boolean))];

    const filteredCourses = courses.filter((course) => {
        const matchesSearch =
            course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            course.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'ALL' || course.category === selectedCategory;
        const matchesLevel = selectedLevel === 'ALL' || course.level === selectedLevel;
        return matchesSearch && matchesCategory && matchesLevel;
    });

    return (
        <div className="courses-page">
            {/* Header Title & Actions */}
            <div className="page-title-row">
                <div>
                    <h1 className="page-heading">Course Catalog</h1>
                    <p className="page-subheading">
                        Discover expertly crafted courses powered with AI-assisted learning.
                    </p>
                </div>
                {isInstructorOrAdmin && (
                    <Button
                        variant="primary"
                        icon={PlusIcon}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        Create Course
                    </Button>
                )}
            </div>

            {error && <ErrorMessage message={error} onRetry={loadCourses} />}

            {/* Filter Bar */}
            <div className="courses-filter-bar">
                <div className="search-filter-input">
                    <Input
                        placeholder="Search by topic, skill, title..."
                        icon={SearchIcon}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-selects-group">
                    <select
                        className="filter-dropdown"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                    >
                        <option value="ALL">All Categories</option>
                        {categories.filter((c) => c !== 'ALL').map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>

                    <select
                        className="filter-dropdown"
                        value={selectedLevel}
                        onChange={(e) => setSelectedLevel(e.target.value)}
                    >
                        <option value="ALL">All Levels</option>
                        <option value="BEGINNER">Beginner</option>
                        <option value="INTERMEDIATE">Intermediate</option>
                        <option value="ADVANCED">Advanced</option>
                    </select>
                </div>
            </div>

            {/* Course Grid */}
            {loading ? (
                <LoadingSpinner text="Loading courses..." />
            ) : filteredCourses.length === 0 ? (
                <Card className="empty-courses-card">
                    <div className="empty-state">
                        <BookIcon size={48} className="empty-icon" />
                        <h3>No matching courses found</h3>
                        <p>Try adjusting your search criteria or explore other categories.</p>
                        <Button
                            variant="secondary"
                            onClick={() => {
                                setSearchQuery('');
                                setSelectedCategory('ALL');
                                setSelectedLevel('ALL');
                            }}
                        >
                            Reset Filters
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="course-grid">
                    {filteredCourses.map((course) => (
                        <Card
                            key={course.id}
                            hoverable
                            className="course-card-item"
                            onClick={() => navigate(`/courses/${course.id}`)}
                        >
                            <div className="course-card-badge-row">
                                <span className="category-pill">{course.category || 'General'}</span>
                                <span className="level-badge">{course.level || 'All Levels'}</span>
                            </div>

                            <h3 className="course-title">{course.title}</h3>
                            <p className="course-desc">{course.description}</p>

                            <div className="course-meta-info">
                                <div className="instructor-meta">
                                    <UserIcon size={14} />
                                    <span>{course.instructorName || 'Lead Instructor'}</span>
                                </div>
                            </div>

                            <div className="course-card-action">
                                <Button
                                    variant="primary"
                                    size="sm"
                                    icon={PlayCircleIcon}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        navigate(`/courses/${course.id}`);
                                    }}
                                >
                                    View Course
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>
            )}

            {/* Create Course Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Course"
                size="md"
            >
                {createError && <ErrorMessage message={createError} />}
                <form onSubmit={handleCreateCourse} className="create-course-form">
                    <Input
                        label="Course Title"
                        placeholder="e.g. Master React & Modern Web Dev"
                        value={newCourse.title}
                        onChange={(e) => setNewCourse({ ...newCourse, title: e.target.value })}
                        required
                    />

                    <Input
                        label="Course Category"
                        placeholder="e.g. Computer Science, AI, Web Dev"
                        value={newCourse.category}
                        onChange={(e) => setNewCourse({ ...newCourse, category: e.target.value })}
                        required
                    />

                    <div className="input-group">
                        <label className="input-label">Difficulty Level</label>
                        <select
                            className="form-control"
                            value={newCourse.level}
                            onChange={(e) => setNewCourse({ ...newCourse, level: e.target.value })}
                        >
                            <option value="BEGINNER">Beginner</option>
                            <option value="INTERMEDIATE">Intermediate</option>
                            <option value="ADVANCED">Advanced</option>
                        </select>
                    </div>

                    <Input
                        label="Course Description"
                        type="textarea"
                        placeholder="Explain what students will learn in this course..."
                        value={newCourse.description}
                        onChange={(e) => setNewCourse({ ...newCourse, description: e.target.value })}
                        rows={4}
                        required
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
                            Create Course
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CourseList;
