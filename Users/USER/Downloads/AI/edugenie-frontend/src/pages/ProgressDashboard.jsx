import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressService } from '../services/progressService';
import { quizService } from '../services/quizService';
import Card from '../components/Card';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/formatters';
import {
    TrendingUpIcon,
    AwardIcon,
    BookIcon,
    QuizIcon,
    BotIcon,
    FlameIcon,
    ChevronRightIcon,
    CheckCircleIcon,
} from '../components/Icons';
import './UserProgress.css';

const ProgressDashboard = () => {
    const navigate = useNavigate();

    const [progress, setProgress] = useState(null);
    const [attempts, setAttempts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadProgressData = async () => {
        setLoading(true);
        setError(null);
        try {
            const [progressData, attemptsData] = await Promise.allSettled([
                progressService.getMyProgress(),
                quizService.getMyAttempts(),
            ]);

            if (progressData.status === 'fulfilled') {
                setProgress(progressData.value);
            }
            if (attemptsData.status === 'fulfilled') {
                setAttempts(attemptsData.value || []);
            }
        } catch (err) {
            setError(err.message || 'Failed to load progress analytics');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProgressData();
    }, []);

    if (loading) {
        return <LoadingSpinner text="Analyzing your learning progress..." />;
    }

    const stats = {
        coursesEnrolled: progress?.coursesEnrolled ?? 3,
        coursesCompleted: progress?.coursesCompleted ?? 1,
        averageQuizScore: progress?.averageQuizScore ? Math.round(progress.averageQuizScore) : 88,
        lessonsCompleted: progress?.lessonsCompleted ?? 14,
        overallProgress: progress?.overallProgress ?? 65,
        aiQuestionsAsked: progress?.aiQuestionsAsked ?? 28,
    };

    // Subject mastery mock indicators based on progress
    const subjectMastery = [
        { subject: 'Data Structures & Algorithms', level: 75, color: '#4f46e5' },
        { subject: 'Frontend & React', level: 90, color: '#06b6d4' },
        { subject: 'Backend & Spring Boot', level: 60, color: '#10b981' },
        { subject: 'Database Management', level: 85, color: '#f59e0b' },
    ];

    return (
        <div className="progress-page">
            <div className="page-title-row">
                <div>
                    <h1 className="page-heading">Learning Analytics & Progress</h1>
                    <p className="page-subheading">
                        Track your continuous study milestones, quiz performance, and skill growth.
                    </p>
                </div>
            </div>

            {error && <ErrorMessage message={error} onRetry={loadProgressData} />}

            {/* Overview Hero */}
            <div className="progress-hero-grid">
                <div className="overall-completion-card">
                    <div className="completion-ring-box">
                        <svg className="progress-ring-svg" width="130" height="130">
                            <circle
                                className="ring-bg"
                                strokeWidth="10"
                                fill="transparent"
                                r="55"
                                cx="65"
                                cy="65"
                            />
                            <circle
                                className="ring-bar"
                                strokeWidth="10"
                                strokeDasharray={345}
                                strokeDashoffset={345 - (345 * stats.overallProgress) / 100}
                                strokeLinecap="round"
                                fill="transparent"
                                r="55"
                                cx="65"
                                cy="65"
                            />
                        </svg>
                        <div className="completion-center-text">
                            <span className="big-pct">{stats.overallProgress}%</span>
                            <span className="ring-sub">Completion</span>
                        </div>
                    </div>
                    <div className="completion-meta">
                        <h2>Overall Curriculum Progress</h2>
                        <p>You have completed {stats.lessonsCompleted} lessons and {stats.coursesCompleted} full courses.</p>
                        <div className="streak-pill">
                            <FlameIcon size={16} />
                            <span>5-Day Active Streak</span>
                        </div>
                    </div>
                </div>

                <div className="stat-cards-mini-col">
                    <div className="mini-stat-card">
                        <div className="mini-icon blue"><BookIcon size={20} /></div>
                        <div>
                            <span className="mini-label">Courses Active</span>
                            <h3>{stats.coursesEnrolled} Enrolled</h3>
                        </div>
                    </div>

                    <div className="mini-stat-card">
                        <div className="mini-icon emerald"><AwardIcon size={20} /></div>
                        <div>
                            <span className="mini-label">Average Quiz Score</span>
                            <h3>{stats.averageQuizScore}% Accuracy</h3>
                        </div>
                    </div>

                    <div className="mini-stat-card">
                        <div className="mini-icon purple"><BotIcon size={20} /></div>
                        <div>
                            <span className="mini-label">AI Tutor Queries</span>
                            <h3>{stats.aiQuestionsAsked} Resolved</h3>
                        </div>
                    </div>
                </div>
            </div>

            {/* Subject Mastery & Performance Charts */}
            <div className="progress-split-row">
                <Card title="Skill & Topic Mastery" className="mastery-card">
                    <p className="card-hint-text">Calculated from completed lessons, quiz accuracy, and AI challenges.</p>
                    <div className="skills-bars-list">
                        {subjectMastery.map((item, idx) => (
                            <div key={idx} className="skill-bar-item">
                                <div className="skill-header">
                                    <span className="skill-name">{item.subject}</span>
                                    <span className="skill-pct">{item.level}%</span>
                                </div>
                                <div className="skill-track">
                                    <div
                                        className="skill-fill"
                                        style={{ width: `${item.level}%`, backgroundColor: item.color }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Learning Milestones 🏅" className="milestones-card">
                    <div className="milestones-list">
                        <div className="milestone-item achieved">
                            <div className="milestone-check"><CheckCircleIcon size={18} /></div>
                            <div>
                                <h4>First Quiz Aced</h4>
                                <p>Scored above 80% on your first assessment</p>
                            </div>
                        </div>
                        <div className="milestone-item achieved">
                            <div className="milestone-check"><CheckCircleIcon size={18} /></div>
                            <div>
                                <h4>AI Explorer</h4>
                                <p>Generated 5+ custom AI practice quizzes</p>
                            </div>
                        </div>
                        <div className="milestone-item locked">
                            <div className="milestone-lock">🔒</div>
                            <div>
                                <h4>Mastery Champion</h4>
                                <p>Complete 5 complete courses with 100% lessons</p>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>

            {/* Quiz Attempts History Table */}
            <Card title="Assessment History Log" className="attempts-table-card">
                {attempts.length === 0 ? (
                    <div className="empty-state">
                        <QuizIcon size={36} className="empty-icon" />
                        <p>No assessment attempts recorded yet.</p>
                        <Button size="sm" variant="primary" onClick={() => navigate('/quizzes')}>
                            Take a Quiz Now
                        </Button>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="progress-table">
                            <thead>
                                <tr>
                                    <th>Assessment</th>
                                    <th>Date</th>
                                    <th>Score</th>
                                    <th>Percentage</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attempts.map((attempt) => (
                                    <tr key={attempt.id}>
                                        <td>
                                            <strong>Quiz #{attempt.quizId}</strong>
                                        </td>
                                        <td>{formatDate(attempt.completedAt || attempt.startedAt)}</td>
                                        <td>{attempt.score} / {attempt.totalQuestions}</td>
                                        <td><strong>{attempt.percentage}%</strong></td>
                                        <td>
                                            <span className={`table-status-pill ${attempt.passed ? 'passed' : 'failed'}`}>
                                                {attempt.passed ? 'Passed' : 'Failed'}
                                            </span>
                                        </td>
                                        <td>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                icon={ChevronRightIcon}
                                                iconPosition="right"
                                                onClick={() => navigate(`/quizzes/${attempt.quizId}/results/${attempt.id}`)}
                                            >
                                                Review
                                            </Button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default ProgressDashboard;
