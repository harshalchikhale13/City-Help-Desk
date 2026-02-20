/**
 * UserManagementPage.js
 * Full admin user management: view, add, delete, toggle status for students & staff.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../services/api';
import {
    PieChart, Pie, Cell, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import '../styles/UserManagement.css';

const ROLE_COLORS = { student: '#3b82f6', staff: '#8b5cf6' };

const emptyForm = { username: '', firstName: '', lastName: '', email: '', password: '', phone: '', role: 'student' };

export default function UserManagementPage() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [formLoading, setFormLoading] = useState(false);
    const [search, setSearch] = useState('');

    // Admin guard
    useEffect(() => {
        if (user && user.role !== 'admin') navigate('/dashboard');
    }, [user, navigate]);

    const fetchUsers = useCallback(async () => {
        try {
            setLoading(true);
            const res = await api.get('/users');
            setUsers(res.data.data.users || []);
        } catch {
            toast.error('Failed to load users');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchUsers(); }, [fetchUsers]);

    // Derived lists
    const students = users.filter(u => u.role === 'student');
    const staff = users.filter(u => u.role === 'staff');

    // Chart data
    const pieData = [
        { name: 'Students', value: students.length, fill: '#3b82f6' },
        { name: 'Staff', value: staff.length, fill: '#8b5cf6' },
    ];
    const barData = [
        { name: 'Students', count: students.length, fill: '#3b82f6' },
        { name: 'Staff', count: staff.length, fill: '#8b5cf6' },
    ];

    // Search filter
    const filterFn = (list) => {
        if (!search.trim()) return list;
        const q = search.toLowerCase();
        return list.filter(u =>
            `${u.firstName} ${u.lastName}`.toLowerCase().includes(q) ||
            u.email.toLowerCase().includes(q) ||
            u.username.toLowerCase().includes(q)
        );
    };

    // Add user
    const handleAddUser = async (e) => {
        e.preventDefault();
        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters');
            return;
        }
        try {
            setFormLoading(true);
            const payload = {
                username: formData.username.trim() || `${formData.firstName}${formData.lastName}`.toLowerCase(),
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                role: formData.role,
            };
            if (formData.phone.trim()) payload.phone = formData.phone.trim();
            await api.post('/users/register', payload);
            toast.success(`${formData.role === 'staff' ? 'Staff' : 'Student'} account created!`);
            setShowForm(false);
            setFormData(emptyForm);
            fetchUsers();
        } catch (err) {
            const errs = err.response?.data?.errors;
            const msg = err.response?.data?.message;
            if (errs?.length) toast.error('Validation: ' + errs.map(e => e.message).join(', '));
            else toast.error(msg || 'Failed to create user');
        } finally {
            setFormLoading(false);
        }
    };

    // Toggle status
    const handleToggleStatus = async (u) => {
        try {
            await api.put(`/users/${u.id}/toggle-status`);
            toast.success(`${u.firstName} ${u.isActive ? 'deactivated' : 'activated'}`);
            fetchUsers();
        } catch {
            toast.error('Failed to update status');
        }
    };

    // Delete user
    const handleDelete = async (u) => {
        if (!window.confirm(`Delete account of ${u.firstName} ${u.lastName}? This cannot be undone.`)) return;
        try {
            await api.delete(`/users/${u.id}`);
            toast.success(`${u.firstName} ${u.lastName} deleted`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const UserTable = ({ list, emptyMsg }) => (
        list.length === 0 ? (
            <div className="um-empty">{emptyMsg}</div>
        ) : (
            <div className="um-table-wrap">
                <table className="um-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Full Name</th>
                            <th>Email</th>
                            <th>Username</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Registered</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((u, idx) => (
                            <tr key={`${u.role}-${u.id}`}>
                                <td className="um-num">{idx + 1}</td>
                                <td className="um-name">{u.firstName} {u.lastName}</td>
                                <td className="um-email">{u.email}</td>
                                <td>@{u.username}</td>
                                <td>
                                    <span className={`um-badge um-badge-${u.role}`}>
                                        {u.role === 'staff' ? '👔 Staff' : '🎓 Student'}
                                    </span>
                                </td>
                                <td>
                                    <span className={`um-status ${u.isActive ? 'active' : 'inactive'}`}>
                                        {u.isActive ? '● Active' : '○ Inactive'}
                                    </span>
                                </td>
                                <td className="um-date">
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'}
                                </td>
                                <td className="um-actions">
                                    <button
                                        className={`um-btn ${u.isActive ? 'um-btn-warn' : 'um-btn-success'}`}
                                        onClick={() => handleToggleStatus(u)}
                                        title={u.isActive ? 'Deactivate' : 'Activate'}
                                    >
                                        {u.isActive ? '⏸' : '▶'}
                                    </button>
                                    <button
                                        className="um-btn um-btn-danger"
                                        onClick={() => handleDelete(u)}
                                        title="Delete user"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    );

    return (
        <div style={{ width: '100%', padding: 0 }}>

            {/* ===== Gradient Page Header ===== */}
            <div className="page-header">
                <div className="page-header-inner">
                    <div>
                        <h1>👥 User Management</h1>
                        <p>Manage all students and staff accounts across the campus portal</p>
                    </div>
                    <div className="page-header-actions">
                        <button
                            style={{
                                background: showForm ? '#fff' : 'linear-gradient(135deg, #ef4444, #8b5cf6)',
                                border: showForm ? '1px solid #ef4444' : 'none',
                                color: showForm ? '#ef4444' : '#fff',
                                padding: '10px 22px',
                                borderRadius: '10px',
                                cursor: 'pointer',
                                fontWeight: 700,
                                fontSize: '0.95rem',
                                boxShadow: showForm ? 'none' : '0 4px 14px rgba(239, 68, 68, 0.4)',
                            }}
                            onClick={() => { setShowForm(s => !s); setFormData(emptyForm); }}
                        >
                            {showForm ? '✕ Cancel' : '➕ Add User'}
                        </button>
                    </div>
                </div>
            </div>

            {/* ===== Page body ===== */}
            <div className="page-content">
                {/* Add User Form */}
                {showForm && (
                    <div className="um-form-card">
                        <h3>Register New User</h3>
                        <form onSubmit={handleAddUser} className="um-form">
                            {/* Role selector */}
                            <div className="um-role-selector">
                                {['student', 'staff'].map(r => (
                                    <button
                                        key={r}
                                        type="button"
                                        className={`um-role-btn ${formData.role === r ? 'selected' : ''}`}
                                        style={formData.role === r ? { borderColor: ROLE_COLORS[r], color: ROLE_COLORS[r], background: `${ROLE_COLORS[r]}15` } : {}}
                                        onClick={() => setFormData(p => ({ ...p, role: r }))}
                                    >
                                        {r === 'student' ? '🎓 Student' : '👔 Staff'}
                                    </button>
                                ))}
                            </div>

                            <div className="um-form-grid">
                                <div className="um-field">
                                    <label>First Name *</label>
                                    <input required value={formData.firstName} onChange={e => setFormData(p => ({ ...p, firstName: e.target.value }))} placeholder="First name" autoComplete="given-name" />
                                </div>
                                <div className="um-field">
                                    <label>Last Name *</label>
                                    <input required value={formData.lastName} onChange={e => setFormData(p => ({ ...p, lastName: e.target.value }))} placeholder="Last name" autoComplete="family-name" />
                                </div>
                                <div className="um-field">
                                    <label>Username *</label>
                                    <input required value={formData.username} onChange={e => setFormData(p => ({ ...p, username: e.target.value }))} placeholder="e.g. john_doe" autoComplete="username" />
                                </div>
                                <div className="um-field">
                                    <label>Phone (Optional)</label>
                                    <input type="tel" value={formData.phone} onChange={e => setFormData(p => ({ ...p, phone: e.target.value }))} placeholder="10-digit number" autoComplete="tel" />
                                </div>
                                <div className="um-field">
                                    <label>Email *</label>
                                    <input required type="email" value={formData.email} onChange={e => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="user@college.edu" autoComplete="email" />
                                </div>
                                <div className="um-field">
                                    <label>Password * (min 8 chars)</label>
                                    <input required type="password" value={formData.password} onChange={e => setFormData(p => ({ ...p, password: e.target.value }))} placeholder="••••••••" autoComplete="new-password" />
                                </div>
                            </div>

                            <div className="um-form-actions">
                                <button type="submit" className="um-submit-btn" disabled={formLoading}>
                                    {formLoading ? 'Creating...' : `Create ${formData.role === 'staff' ? 'Staff' : 'Student'} Account`}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Summary Cards */}
                <div className="um-cards">
                    <div className="um-card" style={{ borderTop: '4px solid #6366f1' }}>
                        <div className="um-card-icon">👥</div>
                        <div className="um-card-val">{students.length + staff.length}</div>
                        <div className="um-card-label">Total Users</div>
                    </div>
                    <div className="um-card" style={{ borderTop: `4px solid ${ROLE_COLORS.student}` }}>
                        <div className="um-card-icon">🎓</div>
                        <div className="um-card-val" style={{ color: ROLE_COLORS.student }}>{students.length}</div>
                        <div className="um-card-label">Students</div>
                    </div>
                    <div className="um-card" style={{ borderTop: `4px solid ${ROLE_COLORS.staff}` }}>
                        <div className="um-card-icon">👔</div>
                        <div className="um-card-val" style={{ color: ROLE_COLORS.staff }}>{staff.length}</div>
                        <div className="um-card-label">Staff</div>
                    </div>
                    <div className="um-card" style={{ borderTop: '4px solid #10b981' }}>
                        <div className="um-card-icon">✅</div>
                        <div className="um-card-val" style={{ color: '#10b981' }}>
                            {users.filter(u => u.isActive && u.role !== 'admin').length}
                        </div>
                        <div className="um-card-label">Active Accounts</div>
                    </div>
                </div>

                {/* Charts */}
                {(students.length + staff.length) > 0 && (
                    <div className="um-charts">
                        <div className="um-chart-card">
                            <h3>User Distribution</h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%" cy="50%"
                                        outerRadius={90}
                                        dataKey="value"
                                        label={({ name, value }) => `${name} (${value})`}
                                        labelLine={false}
                                    >
                                        {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="um-chart-card">
                            <h3>User Count by Role</h3>
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={barData} barSize={50}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="name" />
                                    <YAxis allowDecimals={false} />
                                    <Tooltip />
                                    <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                                        {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}

                {/* Search */}
                <div className="um-search-bar">
                    <input
                        type="text"
                        placeholder="🔍  Search by name, email, or username..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="um-search-input"
                    />
                    {search && (
                        <button className="um-clear-btn" onClick={() => setSearch('')}>✕ Clear</button>
                    )}
                </div>

                {loading ? (
                    <div className="um-loading">
                        <div className="um-spinner" />
                        Loading users...
                    </div>
                ) : (
                    <>
                        {/* Students Table */}
                        <section className="um-section">
                            <div className="um-section-header" style={{ borderLeft: `4px solid ${ROLE_COLORS.student}` }}>
                                <h2>🎓 Students</h2>
                                <span className="um-count">{filterFn(students).length} of {students.length}</span>
                            </div>
                            <UserTable list={filterFn(students)} emptyMsg="No students found." />
                        </section>

                        {/* Staff Table */}
                        <section className="um-section">
                            <div className="um-section-header" style={{ borderLeft: `4px solid ${ROLE_COLORS.staff}` }}>
                                <h2>👔 Staff</h2>
                                <span className="um-count">{filterFn(staff).length} of {staff.length}</span>
                            </div>
                            <UserTable list={filterFn(staff)} emptyMsg="No staff accounts found." />
                        </section>
                    </>
                )}
            </div>
        </div>
    );
}


