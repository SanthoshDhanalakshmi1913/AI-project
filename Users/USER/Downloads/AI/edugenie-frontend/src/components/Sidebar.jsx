import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import {
    DashboardIcon,
    BookIcon,
    QuizIcon,
    BotIcon,
    SparklesIcon,
    FileTextIcon,
    TrendingUpIcon,
    UserIcon,
    UsersIcon,
    LayersIcon,
    LogOutIcon,
    GraduationCapIcon,
    CloseIcon,
} from './Icons';
import { ROLES } from '../utils/constants';
import './Sidebar.css';

const Sidebar = ({ isOpen, onClose }) => {
    const { user, role, isStudent, isInstructor, isAdmin, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <>
            {isOpen && <div className="sidebar-backdrop" onClick={onClose} />}
            <aside className={`edu-sidebar ${isOpen ? 'is-open' : ''}`}>
                <div className="sidebar-brand">
                    <div className="brand-logo">
                        <GraduationCapIcon size={26} className="brand-icon" />
                    </div>
                    <div className="brand-text">
                        <span className="brand-title">EduGenie</span>
                        <span className="brand-badge">{role} Portal</span>
                    </div>
                    <button
                        type="button"
                        className="sidebar-close-mobile"
                        onClick={onClose}
                        aria-label="Close navigation"
                    >
                        <CloseIcon size={20} />
                    </button>
                </div>

                <div className="sidebar-content">
                    {/* STUDENT NAVIGATION */}
                    {role === ROLES.STUDENT && (
                        <div className="nav-group">
                            <span className="nav-group-label">Navigation</span>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <DashboardIcon size={19} className="nav-icon" />
                                <span>Dashboard</span>
                            </NavLink>
                            <NavLink
                                to="/courses"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <BookIcon size={19} className="nav-icon" />
                                <span>Courses</span>
                            </NavLink>
                            <NavLink
                                to="/quizzes"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <QuizIcon size={19} className="nav-icon" />
                                <span>Quizzes</span>
                            </NavLink>
                            <NavLink
                                to="/ai-chat"
                                className={({ isActive }) => `nav-link ai-nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <BotIcon size={19} className="nav-icon" />
                                <span>AI Assistant</span>
                                <span className="nav-pill">24/7</span>
                            </NavLink>
                            <NavLink
                                to="/progress"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <TrendingUpIcon size={19} className="nav-icon" />
                                <span>Progress</span>
                            </NavLink>
                            <NavLink
                                to="/profile"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <UserIcon size={19} className="nav-icon" />
                                <span>Profile</span>
                            </NavLink>
                        </div>
                    )}

                    {/* INSTRUCTOR NAVIGATION */}
                    {role === ROLES.INSTRUCTOR && (
                        <div className="nav-group">
                            <span className="nav-group-label">Navigation</span>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <DashboardIcon size={19} className="nav-icon" />
                                <span>Dashboard</span>
                            </NavLink>
                            <NavLink
                                to="/courses"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <BookIcon size={19} className="nav-icon" />
                                <span>Courses</span>
                            </NavLink>
                            <NavLink
                                to="/lessons"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <LayersIcon size={19} className="nav-icon" />
                                <span>Lessons</span>
                            </NavLink>
                            <NavLink
                                to="/quizzes"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <QuizIcon size={19} className="nav-icon" />
                                <span>Quizzes</span>
                            </NavLink>
                        </div>
                    )}

                    {/* ADMIN NAVIGATION */}
                    {role === ROLES.ADMIN && (
                        <div className="nav-group">
                            <span className="nav-group-label">Navigation</span>
                            <NavLink
                                to="/dashboard"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <DashboardIcon size={19} className="nav-icon" />
                                <span>Dashboard</span>
                            </NavLink>
                            <NavLink
                                to="/users"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <UsersIcon size={19} className="nav-icon" />
                                <span>Users</span>
                            </NavLink>
                            <NavLink
                                to="/courses"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <BookIcon size={19} className="nav-icon" />
                                <span>Courses</span>
                            </NavLink>
                            <NavLink
                                to="/quizzes"
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                                onClick={onClose}
                            >
                                <QuizIcon size={19} className="nav-icon" />
                                <span>Quizzes</span>
                            </NavLink>
                        </div>
                    )}
                </div>

                <div className="sidebar-footer">
                    <div className="sidebar-user-card">
                        <div className="user-avatar-small">
                            {user?.name ? user.name[0].toUpperCase() : 'U'}
                        </div>
                        <div className="sidebar-user-info">
                            <span className="user-display-name">{user?.name || 'User'}</span>
                            <span className="user-display-role">{role}</span>
                        </div>
                        <button
                            type="button"
                            className="sidebar-logout-btn"
                            onClick={handleLogout}
                            title="Sign Out"
                            aria-label="Sign Out"
                        >
                            <LogOutIcon size={18} />
                        </button>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;
