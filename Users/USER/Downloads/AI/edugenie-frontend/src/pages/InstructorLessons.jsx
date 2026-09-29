import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { courseService } from '../services/courseService';
import { lessonService } from '../services/lessonService';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import {
    LayersIcon,
    PlusIcon,
    BookIcon,
    TrashIcon,
    ChevronRightIcon,
    CheckCircleIcon,
} from '../components/Icons';
import './Courses.css';

const InstructorLessons = () => {
    const navigate = useNavigate();

    const [courses, setCourses] = useState([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [lessons, setLessons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lessonsLoading, setLessonsLoading] = useState(false);
    const [error, setError] = useState(null);

    // Modal
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newLesson, setNewLesson] = useState({
        title: '',
        content: '',
        lessonOrder: 1,
    });
    const [saveLoading, setSaveLoading] = useState(false);
    const [saveError, setSaveError] = useState('');

    useEffect(() => {
        const loadInitialData = async () => {
            setLoading(true);
            setError(null);
            try {
                const coursesData = await courseService.getAllCourses();
                setCourses(coursesData || []);
                if (coursesData && coursesData.length > 0) {
                    const firstId = coursesData[0].id;
                    setSelectedCourseId(firstId);
                    loadLessonsForCourse(firstId);
                }
            } catch (err) {
                setError(err.message || 'Failed to load instructor courses');
            } finally {
                setLoading(false);
            }
        };

        loadInitialData();
    }, []);

    const loadLessonsForCourse = async (courseId) => {
        if (!courseId) return;
        setLessonsLoading(true);
        try {
            const lessonsData = await lessonService.getLessonsByCourse(courseId);
            setLessons(lessonsData || []);
            setNewLesson((prev) => ({ ...prev, lessonOrder: (lessonsData?.length || 0) + 1 }));
        } catch (err) {
            console.error('Failed to load lessons', err);
        } finally {
            setLessonsLoading(false);
        }
    };

    const handleCourseChange = (e) => {
        const id = e.target.value;
        setSelectedCourseId(id);
        loadLessonsForCourse(id);
    };

    const handleCreateLesson = async (e) => {
        e.preventDefault();
        if (!newLesson.title.trim() || !newLesson.content.trim()) {
            setSaveError('Please enter lesson title and content');
            return;
        }

        setSaveLoading(true);
        setSaveError('');
        try {
            const created = await lessonService.createLesson(selectedCourseId, {
                title: newLesson.title,
                content: newLesson.content,
                lessonOrder: Number(newLesson.lessonOrder),
            });
            setLessons((prev) => [...prev, created].sort((a, b) => a.lessonOrder - b.lessonOrder));
            setIsAddModalOpen(false);
            setNewLesson({ title: '', content: '', lessonOrder: lessons.length + 2 });
        } catch (err) {
            setSaveError(err.message || 'Failed to save lesson');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDeleteLesson = async (lessonId, e) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to delete this lesson?')) return;

        try {
            await lessonService.deleteLesson(lessonId);
            setLessons((prev) => prev.filter((l) => l.id !== lessonId));
        } catch (err) {
            alert('Failed to delete lesson: ' + (err.message || 'Server error'));
        }
    };

    if (loading) {
        return <LoadingSpinner text="Loading instructor lessons workspace..." />;
    }

    const selectedCourse = courses.find((c) => String(c.id) === String(selectedCourseId));

    return (
        <div className="courses-page">
            <div className="page-title-row">
                <div>
                    <h1 className="page-heading">Curriculum & Lessons Manager</h1>
                    <p className="page-subheading">
                        Design course modules, write lesson content, and organize syllabi.
                    </p>
                </div>
                {selectedCourseId && (
                    <Button
                        variant="primary"
                        icon={PlusIcon}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Add Lesson to Curriculum
                    </Button>
                )}
            </div>

            {error && <ErrorMessage message={error} />}

            {/* Course Selector Card */}
            <Card>
                <div className="input-group" style={{ marginBottom: 0 }}>
                    <label className="input-label">Select Course to Manage Lessons</label>
                    <select
                        className="form-control"
                        value={selectedCourseId}
                        onChange={handleCourseChange}
                    >
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.title} ({course.category || 'General'})
                            </option>
                        ))}
                    </select>
                </div>
            </Card>

            {/* Lessons List */}
            {lessonsLoading ? (
                <LoadingSpinner text="Fetching lessons..." />
            ) : lessons.length === 0 ? (
                <Card>
                    <div className="empty-state">
                        <LayersIcon size={40} className="empty-icon" />
                        <h3>No lessons created for this course yet</h3>
                        <p>Start building the curriculum by adding your first lesson.</p>
                        <Button
                            variant="primary"
                            icon={PlusIcon}
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            Create First Lesson
                        </Button>
                    </div>
                </Card>
            ) : (
                <div className="lessons-syllabus-list">
                    {lessons.map((lesson, idx) => (
                        <div
                            key={lesson.id}
                            className="lesson-list-item"
                            onClick={() => navigate(`/courses/${selectedCourseId}/lessons/${lesson.id}`)}
                        >
                            <div className="lesson-left-info">
                                <div className="lesson-order-num">
                                    {lesson.lessonOrder || idx + 1}
                                </div>
                                <div>
                                    <h4 className="lesson-title-text">{lesson.title}</h4>
                                    <span className="lesson-meta-time">
                                        Lesson #{lesson.id} • {lesson.content?.length || 0} characters
                                    </span>
                                </div>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    icon={TrashIcon}
                                    onClick={(e) => handleDeleteLesson(lesson.id, e)}
                                >
                                    Delete
                                </Button>
                                <ChevronRightIcon size={18} style={{ color: '#94a3b8' }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Add Lesson Modal */}
            <Modal
                isOpen={isAddModalOpen}
                onClose={() => setIsAddModalOpen(false)}
                title={`Add Lesson to ${selectedCourse?.title || 'Course'}`}
                size="lg"
            >
                {saveError && <ErrorMessage message={saveError} />}
                <form onSubmit={handleCreateLesson}>
                    <Input
                        label="Lesson Title"
                        placeholder="e.g. Asynchronous Control Flow & Promises"
                        value={newLesson.title}
                        onChange={(e) => setNewLesson({ ...newLesson, title: e.target.value })}
                        required
                    />

                    <Input
                        label="Lesson Order Sequence"
                        type="number"
                        value={newLesson.lessonOrder}
                        onChange={(e) => setNewLesson({ ...newLesson, lessonOrder: e.target.value })}
                        required
                    />

                    <Input
                        label="Lesson Content"
                        type="textarea"
                        placeholder="Type comprehensive lesson lecture text and code examples..."
                        value={newLesson.content}
                        onChange={(e) => setNewLesson({ ...newLesson, content: e.target.value })}
                        rows={8}
                        required
                    />

                    <div className="modal-actions-right">
                        <Button
                            variant="secondary"
                            onClick={() => setIsAddModalOpen(false)}
                            disabled={saveLoading}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" loading={saveLoading}>
                            Save Lesson
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InstructorLessons;
