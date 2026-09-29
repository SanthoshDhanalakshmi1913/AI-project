import React from 'react';
import { Outlet, Link, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { GraduationCapIcon, SparklesIcon, BookIcon, QuizIcon } from '../components/Icons';
import './AuthLayout.css';

const AuthLayout = () => {
    const { isAuthenticated, loading } = useAuth();

    if (!loading && isAuthenticated) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="auth-layout">
            <div className="auth-split-left">
                <div className="auth-branding">
                    <Link to="/" className="auth-logo-link">
                        <div className="auth-logo-box">
                            <GraduationCapIcon size={28} />
                        </div>
                        <span className="auth-brand-name">EduGenie</span>
                    </Link>
                </div>

                <div className="auth-hero-content">
                    <div className="auth-badge">
                        <SparklesIcon size={16} />
                        <span>AI-Powered Adaptive Learning</span>
                    </div>
                    <h1 className="auth-hero-title">
                        Elevate your learning journey with intelligent AI tutoring.
                    </h1>
                    <p className="auth-hero-desc">
                        Interactive course modules, smart AI quiz generation, real-time AI study notes, and adaptive personalized progress tracking.
                    </p>

                    <div className="auth-features-list">
                        <div className="feature-item">
                            <div className="feature-icon-box">
                                <BookIcon size={18} />
                            </div>
                            <div>
                                <h4>Structured Learning</h4>
                                <p>Comprehensive courses and granular bite-sized lessons.</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon-box">
                                <QuizIcon size={18} />
                            </div>
                            <div>
                                <h4>Interactive Quizzes</h4>
                                <p>Test knowledge retention with instant scoring and AI feedback.</p>
                            </div>
                        </div>

                        <div className="feature-item">
                            <div className="feature-icon-box">
                                <SparklesIcon size={18} />
                            </div>
                            <div>
                                <h4>24/7 AI Tutor</h4>
                                <p>Ask questions, generate custom quizzes, and get instant study summaries.</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-hero-footer">
                    <p>© {new Date().getFullYear()} EduGenie Academy. All rights reserved.</p>
                </div>
            </div>

            <div className="auth-split-right">
                <div className="auth-form-card">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AuthLayout;
