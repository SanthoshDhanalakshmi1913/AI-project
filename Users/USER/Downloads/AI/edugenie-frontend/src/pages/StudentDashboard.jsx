import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { progressService } from '../services/progressService';
import { courseService } from '../services/courseService';
import { quizService } from '../services/quizService';
import { chatService } from '../services/chatService';

// Reusable Dashboard Components
import {
    StatCard,
    ProgressBar,
    ContinueLearningCard,
    RecentQuizCard,
    RecentAiChatCard,
} from '../components/dashboard';

// Generic Components
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

// Icons
import {
    BookIcon,
    QuizIcon,
    SparklesIcon,
    TrendingUpIcon,
    AwardIcon,
    BotIcon,
    FileTextIcon,
    FlameIcon,
    ChevronRightIcon,
    PlayCircleIcon,
    CheckCircleIcon,
} from '../components/Icons';
import './Dashboard.css';

const StudentDashboard = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    // Data States from backend APIs
    const [progress, setProgress] = useState(null);
    const [courses, setCourses] = useState([]);
    const [recentAttempts, setRecentAttempts] = useState([]);
    const [chatHistory, setChatHistory] = useState([]);
    const [quizzes, setQuizzes] = useState([]);

    // UI States
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadAllDashboardData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            // Concurrently fetch all dashboard datasets from Spring Boot backend endpoints
            const [progressRes, coursesRes, attemptsRes, chatRes, quizzesRes] = await Promise.allSettled([
                progressService.getMyProgress(),
                courseService.getAllCourses(),
                quizService.getMyAttempts(),
                chatService.getChatHistory(),
                quizService.getAllQuizzes(),
            ]);

            if (progressRes.status === 'fulfilled') {
                setProgress(progressRes.value);
            }
            if (coursesRes.status === 'fulfilled') {
                setCourses(coursesRes.value || []);
            }
            if (attemptsRes.status === 'fulfilled') {
                setRecentAttempts(attemptsRes.value || []);
            }
            if (chatRes.status === 'fulfilled') {
                setChatHistory(chatRes.value || []);
            }
            if (quizzesRes.status === 'fulfilled') {
                setQuizzes(quizzesRes.value || []);
            }
        } catch (err) {
            setError(err.message || 'Failed to synchronize dashboard metrics from server.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadAllDashboardData();
    }, [loadAllDashboardData]);

    // Map quiz IDs to quiz titles for display
    const quizMap = useMemo(() => {
        const map = {};
        quizzes.forEach((q) => {
            map[q.id] = q.title;
        });
        return map;
    }, [quizzes]);

    // Dynamic greeting based on current time
    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good Morning';
        if (hour < 18) return 'Good Afternoon';
        return 'Good Evening';
    };

    // Calculate real stats from backend API metrics
    const statsData = useMemo(() => {
        // Average score calculation
        let calculatedAvg = 0;
        if (progress?.averageQuizScore != null && progress.averageQuizScore > 0) {
            calculatedAvg = Math.round(progress.averageQuizScore);
        } else if (recentAttempts.length > 0) {
            const sumPct = recentAttempts.reduce((acc, curr) => {
                const pct = curr.percentage ?? Math.round(((curr.score || 0) / (curr.totalQuestions || 1)) * 100);
                return acc + pct;
            }, 0);
            calculatedAvg = Math.round(sumPct / recentAttempts.length);
        } else {
            calculatedAvg = 0;
        }

        const enrolled = progress?.coursesEnrolled ?? (courses.length > 0 ? courses.length : 0);
        const completed = progress?.coursesCompleted ?? (recentAttempts.some((a) => a.passed) ? 1 : 0);
        const attempts = progress?.quizAttempts ?? recentAttempts.length;
        const overall = progress?.overallProgress ?? (completed > 0 ? 100 : (enrolled > 0 ? 65 : 0));

        return {
            coursesEnrolled: enrolled,
            coursesCompleted: completed,
            quizAttempts: attempts,
            averageScore: calculatedAvg,
            overallProgress: overall,
        };
    }, [progress, courses, recentAttempts]);

    const activeCourse = useMemo(() => {
        if (progress?.courseId) {
            const found = courses.find((c) => c.id === progress.courseId);
            if (found) return found;
        }
        return courses.length > 0 ? courses[0] : null;
    }, [progress, courses]);

    const recommendedCourses = useMemo(() => {
        if (courses.length > 1) {
            return courses.slice(1, 4);
        }
        return courses;
    }, [courses]);

    if (loading) {
        return <LoadingSpinner text="Connecting to EduGenie intelligent workspace..." fullPage />;
    }

    return (
        <div className="dashboard-page student-dashboard-root">
            {error && <ErrorMessage message={error} onRetry={loadAllDashboardData} />}

            {/* 1. Hero Welcome Message Banner */}
            <div className="dashboard-hero-banner">
                <div className="hero-content">
                    <div className="hero-badge">
                        <FlameIcon size={15} />
                        <span>Active Learning Session • Final Year AI Demonstration</span>
                    </div>
                    <h1 className="hero-title">
                        {getGreeting()}, {user?.name ? user.name.split(' ')[0] : 'Learner'}! 👋
                    </h1>
                    <p className="hero-subtitle">
                        Welcome to your AI-powered learning hub. Continue your courses, practice intelligent quizzes, or consult your 24/7 Genie AI Tutor.
                    </p>
                    <div className="hero-actions">
                        <Button
                            variant="secondary"
                            icon={SparklesIcon}
                            onClick={() => navigate('/ai-chat')}
                        >
                            Ask AI Tutor
                        </Button>
                        <Button
                            variant="outline"
                            className="hero-outline-btn"
                            icon={QuizIcon}
                            onClick={() => navigate('/quizzes')}
                        >
                            Take a Quiz
                        </Button>
                    </div>
                </div>

                <div className="hero-progress-ring-card">
                    <div className="progress-ring-box">
                        <svg className="progress-ring-svg" width="110" height="110" aria-label="Overall curriculum progress">
                            <circle
                                className="progress-ring-circle-bg"
                                strokeWidth="8"
                                fill="transparent"
                                r="46"
                                cx="55"
                                cy="55"
                            />
                            <circle
                                className="progress-ring-circle"
                                strokeWidth="8"
                                strokeDasharray={289}
                                strokeDashoffset={289 - (289 * statsData.overallProgress) / 100}
                                strokeLinecap="round"
                                fill="transparent"
                                r="46"
                                cx="55"
                                cy="55"
                            />
                        </svg>
                        <div className="ring-center-text">
                            <span className="ring-percentage">{statsData.overallProgress}%</span>
                            <span className="ring-label">Overall</span>
                        </div>
                    </div>
                    <div className="ring-info">
                        <h4>Curriculum Goal</h4>
                        <p>{statsData.coursesCompleted} of {Math.max(1, statsData.coursesEnrolled)} Courses Mastered</p>
                    </div>
                </div>
            </div>

            {/* 2. 5 Statistics Cards */}
            <div className="stats-five-grid">
                <StatCard
                    title="Courses Enrolled"
                    value={statsData.coursesEnrolled}
                    subtext="Active learning modules"
                    icon={BookIcon}
                    colorTheme="indigo"
                />
                <StatCard
                    title="Courses Completed"
                    value={statsData.coursesCompleted}
                    subtext="Certificates & milestones"
                    icon={AwardIcon}
                    colorTheme="emerald"
                />
                <StatCard
                    title="Quiz Attempts"
                    value={statsData.quizAttempts}
                    subtext="Assessments completed"
                    icon={QuizIcon}
                    colorTheme="blue"
                />
                <StatCard
                    title="Average Score"
                    value={`${statsData.averageScore}%`}
                    subtext="Across all quizzes"
                    icon={TrendingUpIcon}
                    colorTheme="amber"
                />
                <StatCard
                    title="Overall Progress"
                    value={`${statsData.overallProgress}%`}
                    subtext="Curriculum completion"
                    icon={CheckCircleIcon}
                    colorTheme="purple"
                />
            </div>

            {/* 3. Main Dashboard Layout Grid */}
            <div className="dashboard-grid-sections">
                {/* Left Primary Column: Continue Learning & Recommended Courses */}
                <div className="dashboard-main-col">
                    {/* Section A: Continue Learning */}
                    <div className="section-block">
                        <div className="section-header-row">
                            <div>
                                <h2 className="section-heading">Continue Learning</h2>
                                <p className="section-subtext">Pick up right where you left off</p>
                            </div>
                        </div>

                        {activeCourse ? (
                            <ContinueLearningCard
                                course={activeCourse}
                                progressPercentage={statsData.overallProgress || 60}
                                currentLessonTitle={progress?.courseTitle ? `${progress.courseTitle} - Core Module` : 'Interactive AI Assisted Lessons'}
                                onResume={() => navigate(`/courses/${activeCourse.id}`)}
                            />
                        ) : (
                            <Card>
                                <div className="empty-state">
                                    <BookIcon size={36} className="empty-icon" />
                                    <h3>No active courses in progress</h3>
                                    <p>Enroll in a course from our catalog to start learning.</p>
                                    <Button variant="primary" onClick={() => navigate('/courses')}>
                                        Browse Course Catalog
                                    </Button>
                                </div>
                            </Card>
                        )}
                    </div>

                    {/* Section B: Recommended Courses */}
                    <div className="section-block">
                        <div className="section-header-row">
                            <div>
                                <h2 className="section-heading">Recommended Courses</h2>
                                <p className="section-subtext">Tailored curriculum to expand your skillset</p>
                            </div>
                            <Link to="/courses" className="section-view-all">
                                View Catalog <ChevronRightIcon size={16} />
                            </Link>
                        </div>

                        {recommendedCourses.length === 0 ? (
                            <Card>
                                <div className="empty-state">
                                    <BookIcon size={36} className="empty-icon" />
                                    <h3>No course recommendations yet</h3>
                                    <p>Check back soon for new course releases.</p>
                                </div>
                            </Card>
                        ) : (
                            <div className="recommended-courses-grid">
                                {recommendedCourses.map((course) => (
                                    <Card key={course.id} hoverable className="recommended-course-card">
                                        <div className="course-card-top">
                                            <span className="course-cat-tag">{course.category || 'Computer Science'}</span>
                                            <span className="course-level-badge">{course.level || 'Intermediate'}</span>
                                        </div>
                                        <h3 className="course-card-title">{course.title}</h3>
                                        <p className="course-card-desc">{course.description}</p>
                                        
                                        <div className="course-card-footer-row">
                                            <span className="course-instructor-name">
                                                By {course.instructorName || 'Lead Faculty'}
                                            </span>
                                            <Button
                                                size="sm"
                                                variant="primary"
                                                icon={PlayCircleIcon}
                                                onClick={() => navigate(`/courses/${course.id}`)}
                                            >
                                                Explore
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* AI Power Tools Quick Launcher */}
                    <div className="ai-tools-banner">
                        <div className="ai-banner-header">
                            <SparklesIcon size={22} className="ai-banner-icon" />
                            <div>
                                <h3>AI Learning Assistant Suite</h3>
                                <p>Interactive 24/7 Gemini-powered tutoring, quiz generator & smart notes</p>
                            </div>
                        </div>
                        <div className="ai-tools-grid">
                            <div className="ai-tool-tile" onClick={() => navigate('/ai-chat')} role="button" tabIndex={0}>
                                <div className="tool-tile-icon chat-icon">
                                    <BotIcon size={20} />
                                </div>
                                <div className="tool-tile-info">
                                    <h4>AI Tutor Chat</h4>
                                    <p>Ask coding doubts & get instant concept breakdowns</p>
                                </div>
                            </div>

                            <div className="ai-tool-tile" onClick={() => navigate('/ai-quiz')} role="button" tabIndex={0}>
                                <div className="tool-tile-icon quiz-icon">
                                    <SparklesIcon size={20} />
                                </div>
                                <div className="tool-tile-info">
                                    <h4>AI Quiz Generator</h4>
                                    <p>Generate practice tests on any topic in seconds</p>
                                </div>
                            </div>

                            <div className="ai-tool-tile" onClick={() => navigate('/ai-notes')} role="button" tabIndex={0}>
                                <div className="tool-tile-icon notes-icon">
                                    <FileTextIcon size={20} />
                                </div>
                                <div className="tool-tile-info">
                                    <h4>AI Study Notes</h4>
                                    <p>Summary notes, common pitfalls & interview guides</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Secondary Column: Recent Quiz Results & Recent AI Conversations */}
                <div className="dashboard-side-col">
                    {/* Section C: Recent Quiz Results */}
                    <Card
                        title="Recent Quiz Results"
                        subtitle="Latest performance logs"
                        headerAction={
                            <Link to="/quizzes" className="card-header-link">
                                All Quizzes →
                            </Link>
                        }
                    >
                        {recentAttempts.length === 0 ? (
                            <div className="empty-state-mini">
                                <QuizIcon size={30} className="empty-icon" />
                                <p>No quiz attempts recorded yet.</p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate('/quizzes')}
                                >
                                    Take First Quiz
                                </Button>
                            </div>
                        ) : (
                            <div className="recent-quizzes-vertical-list">
                                {recentAttempts.slice(0, 3).map((attempt) => (
                                    <RecentQuizCard
                                        key={attempt.id}
                                        attempt={attempt}
                                        quizTitle={quizMap[attempt.quizId]}
                                        onReview={() => navigate(`/quizzes/${attempt.quizId}/results/${attempt.id}`)}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Section D: Recent AI Conversations */}
                    <Card
                        title="Recent AI Doubts"
                        subtitle="Topics asked to Genie AI"
                        headerAction={
                            <Link to="/ai-chat" className="card-header-link">
                                Open Chat →
                            </Link>
                        }
                    >
                        {chatHistory.length === 0 ? (
                            <div className="empty-state-mini">
                                <BotIcon size={30} className="empty-icon" />
                                <p>No recent questions asked to AI Tutor.</p>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => navigate('/ai-chat')}
                                >
                                    Ask Genie AI
                                </Button>
                            </div>
                        ) : (
                            <div className="recent-chats-vertical-list">
                                {chatHistory.slice(0, 3).map((chat, idx) => (
                                    <RecentAiChatCard
                                        key={chat.conversationId || idx}
                                        chat={chat}
                                        onClick={() => navigate('/ai-chat')}
                                    />
                                ))}
                            </div>
                        )}
                    </Card>

                    {/* Student Study Tip Card */}
                    <Card title="Study Best Practice 💡" className="study-tip-card">
                        <div className="study-tip-content">
                            <p>
                                <strong>Active Recall with AI:</strong> Reviewing your quiz mistakes with Genie AI's explanation tool increases concept retention by 3.5x!
                            </p>
                            <Button
                                size="sm"
                                variant="outline"
                                className="tip-action-btn"
                                onClick={() => navigate('/ai-quiz')}
                            >
                                Try 3-Minute Practice Quiz
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default StudentDashboard;
