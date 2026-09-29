import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/Button';
import Input from '../components/Input';
import ErrorMessage from '../components/ErrorMessage';
import { SparklesIcon } from '../components/Icons';
import './AuthPages.css';

const Login = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || '/dashboard';

    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [errors, setErrors] = useState({});
    const [serverError, setServerError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: '' }));
        }
        setServerError('');
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);
        setServerError('');
        try {
            await login(formData.email, formData.password);
            navigate(from, { replace: true });
        } catch (err) {
            setServerError(err.message || 'Invalid email or password');
        } finally {
            setLoading(false);
        }
    };

    const setDemoUser = (email, password) => {
        setFormData({ email, password });
        setErrors({});
        setServerError('');
    };

    return (
        <div className="auth-card-inner">
            <div className="auth-header">
                <h2 className="auth-title">Welcome back</h2>
                <p className="auth-subtitle">Log in to continue your learning journey</p>
            </div>

            {serverError && (
                <ErrorMessage
                    title="Login failed"
                    message={serverError}
                />
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="student@edugenie.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                />

                <Input
                    label="Password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    error={errors.password}
                    required
                />

                <div className="auth-form-extra">
                    <label className="remember-me">
                        <input type="checkbox" defaultChecked />
                        <span>Remember me</span>
                    </label>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="auth-submit-btn"
                >
                    Sign In to EduGenie
                </Button>
            </form>

            {/* Quick Demo Credentials for evaluation */}
            <div className="demo-credentials-box">
                <div className="demo-title">
                    <SparklesIcon size={14} />
                    <span>Quick Fill Demo Credentials</span>
                </div>
                <div className="demo-btns">
                    <button
                        type="button"
                        className="demo-btn"
                        onClick={() => setDemoUser('student@edugenie.com', 'student123')}
                    >
                        Demo Student
                    </button>
                    <button
                        type="button"
                        className="demo-btn"
                        onClick={() => setDemoUser('instructor@edugenie.com', 'instructor123')}
                    >
                        Demo Instructor
                    </button>
                    <button
                        type="button"
                        className="demo-btn"
                        onClick={() => setDemoUser('admin@edugenie.com', 'admin123')}
                    >
                        Demo Admin
                    </button>
                </div>
            </div>

            <div className="auth-footer-link">
                <p>
                    Don't have an account?{' '}
                    <Link to="/register" className="auth-link">
                        Create Account
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
