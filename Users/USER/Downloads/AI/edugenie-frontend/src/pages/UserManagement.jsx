import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { userService } from '../services/userService';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import Pagination from '../components/Pagination';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/formatters';
import {
    UsersIcon,
    SearchIcon,
    PlusIcon,
    TrashIcon,
    CheckCircleIcon,
    UserIcon,
} from '../components/Icons';
import './AdminPages.css';

const ITEMS_PER_PAGE = 6;

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMsg, setSuccessMsg] = useState('');

    // Filter & Pagination States
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('ALL');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal States
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT',
    });
    const [formErrors, setFormErrors] = useState({});

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await userService.getAllUsers();
            setUsers(data || []);
        } catch (err) {
            setError(err.message || 'Failed to load users from backend.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // Filter and paginate users
    const filteredUsers = useMemo(() => {
        return users.filter((u) => {
            const matchesSearch =
                u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                u.email?.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
            return matchesSearch && matchesRole;
        });
    }, [users, searchQuery, roleFilter]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE) || 1;
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    // Reset pagination to page 1 on filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, roleFilter]);

    const showNotification = (msg) => {
        setSuccessMsg(msg);
        setTimeout(() => setSuccessMsg(''), 3500);
    };

    // Open Create Modal
    const handleOpenCreateModal = () => {
        setFormData({ name: '', email: '', password: '', role: 'STUDENT' });
        setFormErrors({});
        setIsCreateModalOpen(true);
    };

    // Open Edit Modal
    const handleOpenEditModal = (user) => {
        setSelectedUser(user);
        setFormData({
            name: user.name || '',
            email: user.email || '',
            password: '',
            role: user.role || 'STUDENT',
        });
        setFormErrors({});
        setIsEditModalOpen(true);
    };

    // Open Delete Confirmation Modal
    const handleOpenDeleteModal = (user) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const validateForm = (isEdit = false) => {
        const errs = {};
        if (!formData.name.trim()) errs.name = 'Full name is required';
        if (!formData.email.trim()) {
            errs.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            errs.email = 'Please enter a valid email address';
        }
        if (!isEdit && (!formData.password || formData.password.length < 6)) {
            errs.password = 'Password must be at least 6 characters';
        }
        setFormErrors(errs);
        return Object.keys(errs).length === 0;
    };

    // Create User Submit
    const handleCreateUser = async (e) => {
        e.preventDefault();
        if (!validateForm(false)) return;

        setActionLoading(true);
        setError(null);
        try {
            await userService.createUser(formData);
            showNotification(`User "${formData.name}" created successfully.`);
            setIsCreateModalOpen(false);
            fetchUsers();
        } catch (err) {
            setError(err.message || 'Failed to create user');
        } finally {
            setActionLoading(false);
        }
    };

    // Edit User Submit
    const handleEditUser = async (e) => {
        e.preventDefault();
        if (!validateForm(true)) return;

        setActionLoading(true);
        setError(null);
        try {
            await userService.updateUser(selectedUser.id, formData);
            showNotification(`User "${formData.name}" updated successfully.`);
            setIsEditModalOpen(false);
            fetchUsers();
        } catch (err) {
            setError(err.message || 'Failed to update user');
        } finally {
            setActionLoading(false);
        }
    };

    // Delete User Confirmation Submit
    const handleDeleteUser = async () => {
        if (!selectedUser) return;
        setActionLoading(true);
        setError(null);
        try {
            await userService.deleteUser(selectedUser.id);
            showNotification(`User "${selectedUser.name}" deleted successfully.`);
            setIsDeleteModalOpen(false);
            setSelectedUser(null);
            fetchUsers();
        } catch (err) {
            setError(err.message || 'Failed to delete user');
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className="admin-page-root">
            {/* Header */}
            <div className="admin-header-row">
                <div>
                    <h1 className="admin-page-title">User Management</h1>
                    <p className="admin-page-desc">
                        Manage user directory, assign role privileges, and maintain platform accounts.
                    </p>
                </div>
                <Button
                    variant="primary"
                    icon={PlusIcon}
                    onClick={handleOpenCreateModal}
                >
                    Add New User
                </Button>
            </div>

            {error && <ErrorMessage message={error} />}
            {successMsg && (
                <div className="alert-banner alert-success" style={{ padding: '0.75rem 1rem', background: '#d1fae5', color: '#065f46', borderRadius: 8, fontWeight: 600 }}>
                    ✓ {successMsg}
                </div>
            )}

            {/* Filter Controls Bar */}
            <div className="admin-controls-bar">
                <div className="admin-search-box">
                    <Input
                        placeholder="Search users by name or email..."
                        icon={SearchIcon}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="admin-filters-group">
                    <label className="filter-label" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                        Filter Role:
                    </label>
                    <select
                        className="admin-select-input"
                        value={roleFilter}
                        onChange={(e) => setRoleFilter(e.target.value)}
                    >
                        <option value="ALL">All Roles ({users.length})</option>
                        <option value="STUDENT">Students</option>
                        <option value="INSTRUCTOR">Instructors</option>
                        <option value="ADMIN">Administrators</option>
                    </select>
                </div>
            </div>

            {/* Users Data Table */}
            <div className="admin-table-container">
                <div className="admin-table-header">
                    <h3 className="admin-table-title">
                        Registered Platform Users ({filteredUsers.length})
                    </h3>
                </div>

                {loading ? (
                    <LoadingSpinner text="Fetching user directory..." />
                ) : filteredUsers.length === 0 ? (
                    <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        <UsersIcon size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                        <p style={{ fontWeight: 700, margin: 0, color: 'var(--text-secondary)' }}>No users found</p>
                        <p style={{ fontSize: '0.8rem', margin: '0.25rem 0' }}>Try adjusting your search criteria or add a new user.</p>
                    </div>
                ) : (
                    <div className="table-responsive">
                        <table className="admin-data-table">
                            <thead>
                                <tr>
                                    <th>User Profile</th>
                                    <th>Email Address</th>
                                    <th>Role Privilege</th>
                                    <th>Registration Date</th>
                                    <th style={{ textAlign: 'right' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="admin-user-cell">
                                                <div className="admin-user-avatar">
                                                    {user.name ? user.name[0].toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <span className="admin-user-name">{user.name}</span>
                                                    <span className="admin-user-subtext">ID: #{user.id}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{user.email}</td>
                                        <td>
                                            <span className={`admin-role-badge role-${user.role?.toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>{formatDate(user.createdAt)}</td>
                                        <td>
                                            <div className="admin-actions-cell" style={{ justifyContent: 'flex-end' }}>
                                                <button
                                                    type="button"
                                                    className="table-action-btn"
                                                    onClick={() => handleOpenEditModal(user)}
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    type="button"
                                                    className="table-action-btn btn-delete"
                                                    onClick={() => handleOpenDeleteModal(user)}
                                                >
                                                    <TrashIcon size={13} />
                                                    Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredUsers.length}
                    itemsPerPage={ITEMS_PER_PAGE}
                    onPageChange={(page) => setCurrentPage(page)}
                />
            </div>

            {/* Modal: Create User */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Add New Platform User"
            >
                <form onSubmit={handleCreateUser} className="admin-modal-form">
                    <Input
                        label="Full Name"
                        name="name"
                        placeholder="e.g. Marie Curie"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        error={formErrors.name}
                        required
                    />
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        placeholder="e.g. marie@edugenie.com"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        error={formErrors.email}
                        required
                    />
                    <Input
                        label="Password"
                        name="password"
                        type="password"
                        placeholder="Minimum 6 characters"
                        value={formData.password}
                        onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                        error={formErrors.password}
                        required
                    />
                    <div className="form-field-group">
                        <label className="form-field-label">System Role</label>
                        <select
                            className="form-field-select"
                            value={formData.role}
                            onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                        >
                            <option value="STUDENT">Student (Learning & Quizzes)</option>
                            <option value="INSTRUCTOR">Instructor (Course & Content Creator)</option>
                            <option value="ADMIN">Administrator (Full System Control)</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsCreateModalOpen(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={actionLoading}
                        >
                            Create User
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Edit User */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                title={`Edit User: ${selectedUser?.name}`}
            >
                <form onSubmit={handleEditUser} className="admin-modal-form">
                    <Input
                        label="Full Name"
                        name="name"
                        value={formData.name}
                        onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                        error={formErrors.name}
                        required
                    />
                    <Input
                        label="Email Address"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                        error={formErrors.email}
                        required
                    />
                    <Input
                        label="Reset Password (Optional)"
                        name="password"
                        type="password"
                        placeholder="Leave blank to keep unchanged"
                        value={formData.password}
                        onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                        error={formErrors.password}
                    />
                    <div className="form-field-group">
                        <label className="form-field-label">Assigned Role</label>
                        <select
                            className="form-field-select"
                            value={formData.role}
                            onChange={(e) => setFormData((p) => ({ ...p, role: e.target.value }))}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="INSTRUCTOR">Instructor</option>
                            <option value="ADMIN">Administrator</option>
                        </select>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsEditModalOpen(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="primary"
                            loading={actionLoading}
                        >
                            Save Changes
                        </Button>
                    </div>
                </form>
            </Modal>

            {/* Modal: Delete Confirmation with warning */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Confirm User Deletion"
                size="sm"
            >
                <div className="delete-confirm-box">
                    <p className="delete-warning-text">
                        Are you sure you want to permanently remove this user from the system?
                    </p>
                    <div className="delete-target-highlight">
                        <div><strong>{selectedUser?.name}</strong></div>
                        <div style={{ fontSize: '0.8rem', opacity: 0.85 }}>{selectedUser?.email} • {selectedUser?.role}</div>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>
                        ⚠️ Warning: All progress, quiz logs, and chat records linked to this user will be removed.
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setIsDeleteModalOpen(false)}
                            disabled={actionLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="danger"
                            loading={actionLoading}
                            onClick={handleDeleteUser}
                        >
                            Confirm Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default UserManagement;
