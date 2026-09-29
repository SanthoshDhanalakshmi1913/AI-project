import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import {
    MenuIcon,
    SunIcon,
    MoonIcon,
    UserIcon,
    LogOutIcon,
    SparklesIcon,
    TrendingUpIcon,
    SearchIcon,
} from './Icons';
import './Navbar.css';

const Navbar = ({ onToggleSidebar }) => {
    const { user, isStudent, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const getInitials = (name) => {
        if (!name) return 'U';
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <header className="edu-navbar">
            <div className="navbar-left">
                <button
                    type="button"
                    className="sidebar-toggle-btn"
                    onClick={onToggleSidebar}
                    aria-label="Toggle navigation sidebar"
                >
                    <MenuIcon size={22} />
                </button>
                <div className="navbar-search">
                    <SearchIcon size={16} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search courses, lessons, topics..."
                        className="navbar-search-input"
                    />
                </div>
            </div>

            <div className="navbar-right">
                <Link to="/ai-chat" className="ai-assistant-pill">
                    <SparklesIcon size={16} className="ai-sparkle-icon" />
                    <span>Ask Genie AI</span>
                </Link>

                <button
                    type="button"
                    className="icon-btn theme-toggle-btn"
                    onClick={toggleTheme}
                    title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <MoonIcon size={18} /> : <SunIcon size={18} />}
                </button>

                {/* User Dropdown */}
                <div className="user-menu-container" ref={dropdownRef}>
                    <button
                        type="button"
                        className="user-profile-btn"
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        aria-expanded={dropdownOpen}
                    >
                        <div className="avatar-circle">
                            {getInitials(user?.name || user?.email)}
                        </div>
                        <div className="user-meta">
                            <span className="user-name">{user?.name || 'User'}</span>
                            <span className="user-role-badge">
                                {user?.role ? user.role.replace('ROLE_', '') : 'STUDENT'}
                            </span>
                        </div>
                    </button>

                    {dropdownOpen && (
                        <div className="user-dropdown-menu">
                            <div className="dropdown-user-header">
                                <p className="dropdown-user-name">{user?.name}</p>
                                <p className="dropdown-user-email">{user?.email}</p>
                            </div>
                            <div className="dropdown-divider" />
                            <Link
                                to="/profile"
                                className="dropdown-item"
                                onClick={() => setDropdownOpen(false)}
                            >
                                <UserIcon size={16} />
                                <span>My Profile</span>
                            </Link>
                            {isStudent && (
                                <Link
                                    to="/progress"
                                    className="dropdown-item"
                                    onClick={() => setDropdownOpen(false)}
                                >
                                    <TrendingUpIcon size={16} />
                                    <span>Learning Progress</span>
                                </Link>
                            )}
                            <div className="dropdown-divider" />
                            <button
                                type="button"
                                className="dropdown-item logout-btn"
                                onClick={handleLogout}
                            >
                                <LogOutIcon size={16} />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Navbar;
