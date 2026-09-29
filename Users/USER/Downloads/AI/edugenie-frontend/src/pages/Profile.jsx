import React, { useState } from 'react';
import useAuth from '../hooks/useAuth';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import ErrorMessage from '../components/ErrorMessage';
import {
    UserIcon,
    AwardIcon,
    CheckCircleIcon,
    LogOutIcon,
    SparklesIcon,
} from '../components/Icons';
import './UserProgress.css';

const Profile = () => {
    const { user, updateUser, logout } = useAuth();

    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');
    const [aiTone, setAiTone] = useState('detailed');
    const [savedMsg, setSavedMsg] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSaveProfile = (e) => {
        e.preventDefault();
        setLoading(true);
        setSavedMsg('');

        setTimeout(() => {
            updateUser({ name });
            setLoading(false);
            setSavedMsg('Profile updated successfully!');
            setTimeout(() => setSavedMsg(''), 3000);
        }, 400);
    };

    return (
        <div className="profile-page">
            <div className="page-title-row">
                <div>
                    <h1 className="page-heading">Account & Learning Profile</h1>
                    <p className="page-subheading">
                        Manage your credentials, learning preferences, and AI tutor behavior.
                    </p>
                </div>
            </div>

            {savedMsg && (
                <div className="success-banner">
                    <CheckCircleIcon size={18} />
                    <span>{savedMsg}</span>
                </div>
            )}

            <div className="profile-layout-grid">
                {/* Left Profile Overview Card */}
                <Card className="profile-overview-card">
                    <div className="profile-avatar-large">
                        {user?.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <h2 className="profile-user-name">{user?.name || 'EduGenie Learner'}</h2>
                    <p className="profile-user-email">{user?.email}</p>
                    <div className="profile-role-tag">
                        {user?.role ? user.role.replace('ROLE_', '') : 'STUDENT'}
                    </div>

                    <div className="profile-meta-stats">
                        <div className="p-stat">
                            <span className="p-stat-val">5</span>
                            <span className="p-stat-lbl">Streak Days</span>
                        </div>
                        <div className="p-stat">
                            <span className="p-stat-val">88%</span>
                            <span className="p-stat-lbl">Avg Score</span>
                        </div>
                        <div className="p-stat">
                            <span className="p-stat-val">14</span>
                            <span className="p-stat-lbl">Lessons</span>
                        </div>
                    </div>

                    <div className="profile-logout-section">
                        <Button
                            variant="danger"
                            size="sm"
                            icon={LogOutIcon}
                            onClick={logout}
                            style={{ width: '100%' }}
                        >
                            Sign Out
                        </Button>
                    </div>
                </Card>

                {/* Right Form Settings */}
                <div className="profile-forms-col">
                    <Card title="Personal Information">
                        <form onSubmit={handleSaveProfile} className="profile-edit-form">
                            <Input
                                label="Full Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />

                            <Input
                                label="Email Address"
                                value={email}
                                disabled
                                helperText="Email address cannot be changed once registered."
                            />

                            <Input
                                label="Assigned Role"
                                value={user?.role ? user.role.replace('ROLE_', '') : 'STUDENT'}
                                disabled
                            />

                            <div className="form-submit-right">
                                <Button type="submit" variant="primary" loading={loading}>
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    </Card>

                    <Card title="Genie AI Tutor Preferences" style={{ marginTop: '1.5rem' }}>
                        <p className="card-hint-text">
                            Customize how the Gemini AI Assistant responds to your queries.
                        </p>
                        <div className="ai-preferences-grid">
                            <label className={`pref-option-card ${aiTone === 'concise' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="aiTone"
                                    value="concise"
                                    checked={aiTone === 'concise'}
                                    onChange={() => setAiTone('concise')}
                                />
                                <div>
                                    <strong>Concise & Fast</strong>
                                    <p>Bullet points and quick direct solutions</p>
                                </div>
                            </label>

                            <label className={`pref-option-card ${aiTone === 'detailed' ? 'selected' : ''}`}>
                                <input
                                    type="radio"
                                    name="aiTone"
                                    value="detailed"
                                    checked={aiTone === 'detailed'}
                                    onChange={() => setAiTone('detailed')}
                                />
                                <div>
                                    <strong>Comprehensive & In-Depth</strong>
                                    <p>Detailed step-by-step concepts and code examples</p>
                                </div>
                            </label>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Profile;
