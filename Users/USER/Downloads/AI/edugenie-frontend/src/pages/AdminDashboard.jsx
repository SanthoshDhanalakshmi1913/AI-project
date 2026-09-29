import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { userService } from '../services/userService';
import { courseService } from '../services/courseService';
import { quizService } from '../services/quizService';
import { StatCard } from '../components/dashboard';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/formatters';
import {
    UsersIcon,
    UserIcon,
    AwardIcon,
    BookIcon,
    QuizIcon,
    SparklesIcon,
    TrendingUpIcon,
    ChevronRightIcon,
    PlusIcon,
    LayersIcon,
} from '../components/Icons';
import './AdminPages.css';

const AdminDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data states
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [quizzes, setQuizzes] = useState([]);

    // UI states
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAdminData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [statsRes, usersRes, coursesRes, quizzesRes] = await Promise.allSettled([
                userService.getAdminStats(),
                userService.getAllUsers(),
                courseService.getAllCourses(),
                quizService.getAllQuizzes(),
            ]);

            if (statsRes.status === 'fulfilled') {
                setStats(statsRes.value);
            }
            if (usersRes.status === 'fulfilled') {
                setUsers(usersRes.value || []);
            }
            if (coursesRes.status === 'fulfilled') {
                setCourses(coursesRes.value || []);
            }
            if (quizzesRes.status === 'fulfilled') {
                setQuizzes(quizzesRes.value || []);
            }
        } catch (err) {
            setError(err.message || 'Failed to load administrative analytics');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAdminData();
    }, [loadAdminData]);

    // Compute metrics
    const computedStats = useMemo(() => {
        const totalUsers = stats?.totalUsers ?? users.length;
        const students = stats?.studentsCount ?? users.filter((u) => u.role === 'STUDENT').length;
        const instructors = stats?.instructorsCount ?? users.filter((u) => u.role === 'INSTRUCTOR').length;
        const totalCourses = stats?.coursesCount ?? courses.length;
        const totalQuizzes = stats?.quizzesCount ?? quizzes.length;

        return {
            totalUsers,
            students,
            instructors,
            courses: totalCourses,
            quizzes: totalQuizzes,
        };
    }, [stats, users, courses, quizzes]);

    if (loading) {
        return <LoadingSpinner text="Connecting to EduGenie Administration Center..." fullPage />;
    }

    return (
        <div className="admin-page-root">
            {error && <ErrorMessage message={error} onRetry={loadAdminData} />}

            {/* Admin Header */}
            <div className="admin-header-row">
                <div>
                    <h1 className="admin-page-title">
                        Platform Administration Overview
                    </h1>
                    <p className="admin-page-desc">
                        System operations center: manage student directory, monitor curriculum, and configure assessments.
                    </p>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <Button
                        variant="secondary"
                        icon={PlusIcon}
                        onClick={() => navigate('/users')}
                    >
                        Manage Users
                    </Button>
                    <Button
                        variant="primary"
                        icon={PlusIcon}
                        onClick={() => navigate('/courses')}
                    >
                        Manage Courses
                    </Button>
                </div>
            </div>

            {/* 5 Required Statistics Cards */}
            <div className="admin-stats-grid">
                <StatCard
                    title="Total Users"
                    value={computedStats.totalUsers}
                    subtext="Registered platform accounts"
                    icon={UsersIcon}
                    colorTheme="indigo"
                />
                <StatCard
                    title="Students"
                    value={computedStats.students}
                    subtext="Active learners enrolled"
                    icon={UserIcon}
                    colorTheme="blue"
                />
                <StatCard
                    title="Instructors"
                    value={computedStats.instructors}
                    subtext="Academic course authors"
                    icon={AwardIcon}
                    colorTheme="amber"
                />
                <StatCard
                    title="Courses"
                    value={computedStats.courses}
                    subtext="Curriculum subjects"
                    icon={BookIcon}
                    colorTheme="emerald"
                />
                <StatCard
                    title="Quizzes"
                    value={computedStats.quizzes}
                    subtext="Assessment examinations"
                    icon={QuizIcon}
                    colorTheme="purple"
                />
            </div>

            {/* Quick Management Hub */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                <Card hoverable onClick={() => navigate('/users')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 8, background: '#e0e7ff', color: '#4338ca', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <UsersIcon size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>User Management</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{computedStats.totalUsers} Accounts</p>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                        Full CRUD control: Add students, grant instructor privileges, or reset passwords.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: 'var(--primary-color)', fontWeight: 700 }}>
                        <span>Open User Directory</span>
                        <ChevronRightIcon size={14} />
                    </div>
                </Card>

                <Card hoverable onClick={() => navigate('/courses')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 8, background: '#d1fae5', color: '#065f46', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <BookIcon size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Course Management</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{computedStats.courses} Active Courses</p>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                        Create courses, assign instructors, manage lesson content, and set prerequisites.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#059669', fontWeight: 700 }}>
                        <span>Open Courses Catalog</span>
                        <ChevronRightIcon size={14} />
                    </div>
                </Card>

                <Card hoverable onClick={() => navigate('/quizzes')} style={{ cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <div style={{ width: 38, height: 38, borderRadius: 8, background: '#f3e8ff', color: '#7e22ce', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <QuizIcon size={20} />
                        </div>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>Quiz Management</h3>
                            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{computedStats.quizzes} Assessments</p>
                        </div>
                    </div>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', margin: '0 0 0.75rem' }}>
                        Configure passing scores, time limits, question pools, and AI quiz generation.
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem', color: '#7e22ce', fontWeight: 700 }}>
                        <span>Open Quiz Console</span>
                        <ChevronRightIcon size={14} />
                    </div>
                </Card>
            </div>

            {/* Two Column Layout: Recent Users & Recent Courses */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '1.25rem' }}>
                {/* Recent Users Table */}
                <Card
                    title="Recently Registered Users"
                    subtitle="Latest account creations"
                    headerAction={
                        <Link to="/users" className="card-header-link" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-color)', textDecoration: 'none' }}>
                            View All Users →
                        </Link>
                    }
                >
                    <div className="table-responsive">
                        <table className="admin-data-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Role</th>
                                    <th>Joined</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.slice(0, 5).map((u) => (
                                    <tr key={u.id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-user-avatar" style={{ width: 28, height: 28, fontSize: '0.75rem' }}>
                                                    {u.name ? u.name[0].toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <span className="admin-user-name" style={{ fontSize: '0.84rem' }}>{u.name}</span>
                                                    <span className="admin-user-subtext" style={{ fontSize: '0.72rem' }}>{u.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`admin-role-badge role-${u.role?.toLowerCase()}`}>
                                                {u.role}
                                            </span>
                                        </td>
                                        <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                            {formatDate(u.createdAt)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </Card>

                {/* Course Catalog Snapshot */}
                <Card
                    title="Active Course Catalog"
                    subtitle="Published learning curriculum"
                    headerAction={
                        <Link to="/courses" className="card-header-link" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--primary-color)', textDecoration: 'none' }}>
                            Manage Courses →
                        </Link>
                    }
                >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {courses.slice(0, 4).map((c) => (
                            <div
                                key={c.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.65rem 0.85rem',
                                    backgroundColor: 'var(--bg-primary, #f8fafc)',
                                    borderRadius: 8,
                                    border: '1px solid var(--border-color, #e2e8f0)',
                                }}
                            >
                                <div style={{ minWidth: 0, flex: 1, paddingRight: '0.5rem' }}>
                                    <div style={{ fontWeight: 700, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        {c.title}
                                    </div>
                                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                        {c.category} • By {c.instructorName || 'Academic Lead'}
                                    </div>
                                </div>
                                <span className={`level-badge level-${c.level?.toLowerCase() || 'beginner'}`}>
                                    {c.level || 'BEGINNER'}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default AdminDashboard;
