import React, { useState, useEffect } from 'react';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { formatDate } from '../utils/formatters';
import {
    UsersIcon,
    SearchIcon,
    UserIcon,
    AwardIcon,
    CheckCircleIcon,
} from '../components/Icons';
import './UserProgress.css';

const MOCK_USERS_LIST = [
    { id: 1, name: 'Alex Morgan', email: 'student@edugenie.com', role: 'STUDENT', createdAt: '2026-09-01T10:00:00Z', status: 'ACTIVE' },
    { id: 2, name: 'Dr. Alan Turing', email: 'instructor@edugenie.com', role: 'INSTRUCTOR', createdAt: '2026-08-15T09:30:00Z', status: 'ACTIVE' },
    { id: 3, name: 'System Administrator', email: 'admin@edugenie.com', role: 'ADMIN', createdAt: '2026-08-01T08:00:00Z', status: 'ACTIVE' },
    { id: 4, name: 'Sarah Connor', email: 'sarah.c@example.com', role: 'STUDENT', createdAt: '2026-09-10T14:20:00Z', status: 'ACTIVE' },
    { id: 5, name: 'Prof. Ada Lovelace', email: 'ada@example.com', role: 'INSTRUCTOR', createdAt: '2026-08-20T11:00:00Z', status: 'ACTIVE' },
];

const AdminUsers = () => {
    const [users, setUsers] = useState(MOCK_USERS_LIST);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState('ALL');
    const [loading, setLoading] = useState(false);

    const filteredUsers = users.filter((u) => {
        const matchesSearch =
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = selectedRole === 'ALL' || u.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    return (
        <div className="progress-page">
            <div className="page-title-row">
                <div>
                    <h1 className="page-heading">User Management & Roles</h1>
                    <p className="page-subheading">
                        System administration directory: manage user roles, student accounts, and instructor privileges.
                    </p>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="courses-filter-bar">
                <div className="search-filter-input">
                    <Input
                        placeholder="Search users by name or email..."
                        icon={SearchIcon}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-selects-group">
                    <select
                        className="filter-dropdown"
                        value={selectedRole}
                        onChange={(e) => setSelectedRole(e.target.value)}
                    >
                        <option value="ALL">All Roles</option>
                        <option value="STUDENT">Students</option>
                        <option value="INSTRUCTOR">Instructors</option>
                        <option value="ADMIN">Administrators</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <Card title={`System Registered Users (${filteredUsers.length})`}>
                <div className="table-responsive">
                    <table className="progress-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Registered</th>
                                <th>Account Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                            <div className="avatar-circle" style={{ width: 32, height: 32, fontSize: '0.8rem' }}>
                                                {user.name[0]}
                                            </div>
                                            <strong>{user.name}</strong>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>
                                        <span
                                            className="user-role-badge"
                                            style={{
                                                backgroundColor:
                                                    user.role === 'ADMIN'
                                                        ? '#fee2e2'
                                                        : user.role === 'INSTRUCTOR'
                                                        ? '#fef3c7'
                                                        : '#e0e7ff',
                                                color:
                                                    user.role === 'ADMIN'
                                                        ? '#dc2626'
                                                        : user.role === 'INSTRUCTOR'
                                                        ? '#d97706'
                                                        : '#4f46e5',
                                            }}
                                        >
                                            {user.role}
                                        </span>
                                    </td>
                                    <td>{formatDate(user.createdAt)}</td>
                                    <td>
                                        <span className="table-status-pill passed">
                                            {user.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
};

export default AdminUsers;
