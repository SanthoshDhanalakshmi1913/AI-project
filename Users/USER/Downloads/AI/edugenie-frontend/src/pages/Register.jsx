import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import Button from '../components/Button';
import Input from '../components/Input';
import ErrorMessage from '../components/ErrorMessage';
import './AuthPages.css';

const Register = () => {
    const { register } = useAuth();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT',
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
        if (!formData.name.trim()) {
            newErrors.name = 'Full name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email address is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Password must be at least 6 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
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
            await register(formData.name, formData.email, formData.password, formData.role);
            navigate('/dashboard', { replace: true });
        } catch (err) {
            setServerError(err.message || 'Registration failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-card-inner">
            <div className="auth-header">
                <h2 className="auth-title">Create Account</h2>
                <p className="auth-subtitle">Join thousands of students learning with AI</p>
            </div>

            {serverError && (
                <ErrorMessage
                    title="Registration failed"
                    message={serverError}
                />
            )}

            <form onSubmit={handleSubmit} className="auth-form" noValidate>
                <Input
                    label="Full Name"
                    name="name"
                    placeholder="Alex Morgan"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                />

                <Input
                    label="Email Address"
                    name="email"
                    type="email"
                    placeholder="alex@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    error={errors.email}
                    required
                />

                <div className="form-row-2">
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

                    <Input
                        label="Confirm Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        error={errors.confirmPassword}
                        required
                    />
                </div>

                <div className="input-group">
                    <label className="input-label">I am joining as a</label>
                    <div className="role-selector-grid">
                        <button
                            type="button"
                            className={`role-option-btn ${formData.role === 'STUDENT' ? 'selected' : ''}`}
                            onClick={() => setFormData((p) => ({ ...p, role: 'STUDENT' }))}
                        >
                            <span className="role-title">🎓 Student</span>
                            <span className="role-desc">I want to take courses & quizzes</span>
                        </button>
                        <button
                            type="button"
                            className={`role-option-btn ${formData.role === 'INSTRUCTOR' ? 'selected' : ''}`}
                            onClick={() => setFormData((p) => ({ ...p, role: 'INSTRUCTOR' }))}
                        >
                            <span className="role-title">👨‍🏫 Instructor</span>
                            <span className="role-desc">I want to create courses & content</span>
                        </button>
                    </div>
                </div>

                <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    loading={loading}
                    className="auth-submit-btn"
                >
                    Create Free Account
                </Button>
            </form>

            <div className="auth-footer-link">
                <p>
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">
                        Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
