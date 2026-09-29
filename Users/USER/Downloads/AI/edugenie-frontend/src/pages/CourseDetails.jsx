import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { courseService } from '../services/courseService';
import { lessonService } from '../services/lessonService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
    BookIcon,
    PlayCircleIcon,
    PlusIcon,
    SparklesIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    AwardIcon,
    ClockIcon,
} from '../components/Icons';
import './Courses.css';

const CourseDetails = () => {
    const { id } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Add Lesson Modal
    const [isAddLessonOpen, setIsAddLessonOpen] = useState(false);
    const [newLesson, setNewLesson] = useState({
        title: '',
        content: '',
        lessonOrder: 1,
    });
    const [lessonLoading, setLessonLoading] = useState(false);
    const [lessonError, setLessonError] = useState('');

    const isInstructorOrAdmin =
        user?.role === 'ROLE_INSTRUCTOR' ||
        user?.role === 'ROLE_ADMIN' ||
        user?.role === 'INSTRUCTOR' ||
        user?.role === 'ADMIN';

    const loadCourseData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [courseData, lessonsData] = await Promise.all([
                courseService.getCourseById(id),
                lessonService.getLessonsByCourse(id),
            ]);
            setCourse(courseData);
            setLessons(lessonsData || []);
            setNewLesson((prev) => ({ ...prev, lessonOrder: (lessonsData?.length || 0) + 1 }));
        } catch (err) {
            setError(err.message || 'Failed to load course details');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCourseData();
    }, [id]);

    const handleAddLesson = async (e) => {
        e.preventDefault();
        if (!newLesson.title.trim() || !newLesson.content.trim()) {
            setLessonError('Please fill in title and content');
            return;
        }

        setLessonLoading(true);
        setLessonError('');
        try {
            const created = await lessonService.createLesson(id, {
                title: newLesson.title,
                content: newLesson.content,
                lessonOrder: Number(newLesson.lessonOrder),
            });
            setLessons((prev) => [...prev, created].sort((a, b) => a.lessonOrder - b.lessonOrder));
            setIsAddLessonOpen(false);
            setNewLesson({
                title: '',
                content: '',
                lessonOrder: lessons.length + 2,
            });
        } catch (err) {
            setLessonError(err.message || 'Failed to add lesson');
        } finally {
            setLessonLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading course syllabus..." />;
    }

    if (error || !course) {
        return (
            <div className="course-details-page">
                <ErrorMessage message={error || 'Course not found'} onRetry={loadCourseData} />
                <Button variant="secondary" icon={ChevronLeftIcon} onClick={() => navigate('/courses')}>
                    Back to Courses
                </Button>
            </div>
        );
    }

    const firstLessonId = lessons.length > 0 ? lessons[0].id : null;

    return (
        <div className="course-details-page">
            <div className="back-nav">
                <Link to="/courses" className="section-view-all">
                    <ChevronLeftIcon size={16} /> Back to Courses
                </Link>
            </div>

            {/* Course Header Banner */}
            <div className="course-hero-header">
                <div className="course-card-badge-row">
                    <span className="category-pill">{course.category || 'Computer Science'}</span>
                    <span className="level-badge">{course.level || 'Intermediate'}</span>
                </div>
                <h1 className="course-detail-title">{course.title}</h1>
                <p className="course-detail-desc">{course.description}</p>

                <div className="course-instructor-banner">
                    <div className="course-instructor-avatar">
                        {course.instructorName ? course.instructorName[0].toUpperCase() : 'I'}
                    </div>
                    <div>
                        <strong>Instructor: {course.instructorName || 'Dr. Alan Turing'}</strong>
                        <p style={{ margin: 0, fontSize: '0.8rem', color: '#c7d2fe' }}>Course Author</p>
                    </div>
                </div>
            </div>

            {/* Course Content & Sidebar */}
            <div className="course-details-layout">
                {/* Main Syllabus */}
                <div className="course-main-content">
                    <div className="section-header-row" style={{ marginBottom: '1rem' }}>
                        <div>
                            <h2 className="section-heading">Course Syllabus ({lessons.length} Lessons)</h2>
                            <p className="page-subheading">Step-by-step curriculum with interactive lessons</p>
                        </div>
                        {isInstructorOrAdmin && (
                            <Button
                                size="sm"
                                variant="primary"
                                icon={PlusIcon}
                                onClick={() => setIsAddLessonOpen(true)}
                            >
                                Add Lesson
                            </Button>
                        )}
                    </div>

                    {lessons.length === 0 ? (
                        <Card>
                            <div className="empty-state">
                                <BookIcon size={36} className="empty-icon" />
                                <h3>No lessons published yet</h3>
                                <p>Lessons for this course are being prepared.</p>
                            </div>
                        </Card>
                    ) : (
                        <div className="lessons-syllabus-list">
                            {lessons.map((lesson, idx) => (
                                <div
                                    key={lesson.id}
                                    className="lesson-list-item"
                                    onClick={() => navigate(`/courses/${course.id}/lessons/${lesson.id}`)}
                                >
                                    <div className="lesson-left-info">
                                        <div className="lesson-order-num">
                                            {lesson.lessonOrder || idx + 1}
                                        </div>
                                        <div>
                                            <h4 className="lesson-title-text">{lesson.title}</h4>
                                            <span className="lesson-meta-time">
                                                ~10 min read • Interactive AI enabled
                                            </span>
                                        </div>
                                    </div>
                                    <ChevronRightIcon size={18} style={{ color: '#94a3b8' }} />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Action Sidebar */}
                <div className="course-side-panel">
                    <Card title="Start Learning" className="course-action-card">
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                            Master this subject at your own pace with our AI interactive tutor available anytime.
                        </p>

                        {firstLessonId ? (
                            <Button
                                variant="primary"
                                size="lg"
                                icon={PlayCircleIcon}
                                style={{ width: '100%', marginBottom: '0.75rem' }}
                                onClick={() => navigate(`/courses/${course.id}/lessons/${firstLessonId}`)}
                            >
                                Start Course
                            </Button>
                        ) : (
                            <Button variant="secondary" disabled style={{ width: '100%' }}>
                                No Lessons Yet
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            icon={SparklesIcon}
                            style={{ width: '100%' }}
                            onClick={() => navigate('/ai-chat')}
                        >
                            Ask AI About Course
                        </Button>
                    </Card>

                    <Card title="Course Highlights" style={{ marginTop: '1.25rem' }}>
                        <ul style={{ paddingLeft: '1.25rem', margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <li>Instant AI concept simplifications</li>
                            <li>Integrated progress tracking</li>
                            <li>Topic-specific AI quiz generator</li>
                            <li>Self-paced verifiable completion</li>
                        </ul>
                    </Card>
                </div>
            </div>

            {/* Add Lesson Modal */}
            <Modal
                isOpen={isAddLessonOpen}
                onClose={() => setIsAddLessonOpen(false)}
                title="Add New Lesson"
                size="lg"
            >
                {lessonError && <ErrorMessage message={lessonError} />}
                <form onSubmit={handleAddLesson}>
                    <Input
                        label="Lesson Title"
                        placeholder="e.g. Introduction to State Management"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                        required
                    />

                    <Input
                        label="Lesson Order Number"
                        type="number"
                        value={newLesson.lessonOrder}
                        onChange={(e) => setNewLesson({ ...newLesson, lessonOrder: e.target.value })}
                        required
                    />

                    <Input
                        label="Lesson Content (Markdown / Text)"
                        type="textarea"
                        placeholder="Write the comprehensive lesson content here..."
                        value={newLesson.content}
                        onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                        rows={10}
                        required
                    />

                    <div className="modal-actions-right">
                        <Button
                            variant="secondary"
                            onClick={() => setIsAddLessonOpen(false)}
                            disabled={lessonLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={lessonLoading}
                        >
                            Save Lesson
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CourseDetails;
