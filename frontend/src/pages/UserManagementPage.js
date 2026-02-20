/**
 * UserManagementPage.js
 * Full admin user management: view, add, delete, toggle status for students & staff.
 */
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
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
    const [searchParams] = useSearchParams();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    // Form State
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState(emptyForm);
    const [formLoading, setFormLoading] = useState(false);

    const [search, setSearch] = useState('');

    // Admin guard
    useEffect(() => {
        if (user && user.role !== 'admin') navigate('/dashboard');
    }, [user, navigate]);

    // Handle Tab Logic from URL
    useEffect(() => {
        const tab = searchParams.get('tab');
        if (tab === 'staff') setActiveTab('staff');
        else if (tab === 'students') setActiveTab('students');
        else setActiveTab('overview');
    }, [searchParams]);

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
    const admins = users.filter(u => u.role === 'admin');
    const students = users.filter(u => u.role === 'student');
    const staffList = users.filter(u => u.role === 'staff');

    // Chart data
    const pieData = [
        { name: 'Students', value: students.length, fill: '#3b82f6' },
        { name: 'Staff', value: staffList.length, fill: '#8b5cf6' },
    ];
    const barData = [
        { name: 'Students', count: students.length, fill: '#3b82f6' },
        { name: 'Staff', count: staffList.length, fill: '#8b5cf6' },
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
                department: formData.department || (formData.role === 'student' ? 'General' : 'Administration'),
                studentId: formData.studentId || ''
            };
            if (formData.phone.trim()) payload.phone = formData.phone.trim();
            await api.post('/users/register', payload);
            toast.success(`${formData.role === 'staff' ? 'Staff' : 'Student'} account created!`);
            setShowForm(false);
            setFormData(emptyForm);
            fetchUsers();
            setActiveTab(formData.role === 'staff' ? 'staff' : 'students');
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to create user';
            toast.error(msg);
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
        if (u.id === user.id) {
            toast.error("You cannot delete your own admin account!");
            return;
        }
        if (!window.confirm(`Delete account of ${u.firstName} ${u.lastName}? This cannot be undone.`)) return;
        try {
            await api.delete(`/users/${u.id}`);
            toast.success(`${u.firstName} ${u.lastName} deleted`);
            fetchUsers();
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user');
        }
    };

    const UserTable = ({ list, roleType }) => (
        <div className="um-table-wrap" style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <table className="um-table">
                <thead>
                    <tr>
                        <th>Full Name</th>
                        <th>Email</th>
                        <th>Username</th>
                        <th>{roleType === 'student' ? 'Student ID' : 'Department'}</th>
                        <th>Status</th>
                        <th>Registration Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {list.length === 0 ? (
                        <tr><td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>No {roleType}s found</td></tr>
                    ) : (
                        list.map((u) => (
                            <tr key={u.id}>
                                <td className="um-name">{u.firstName} {u.lastName}</td>
                                <td>{u.email}</td>
                                <td>@{u.username}</td>
                                <td>{roleType === 'student' ? (u.studentId || 'N/A') : (u.department || 'General')}</td>
                                <td>
                                    <span style={{
                                        color: u.isActive ? '#10b981' : '#ef4444',
                                        fontWeight: '700',
                                        fontSize: '0.8rem',
                                        padding: '4px 10px',
                                        background: u.isActive ? '#10b98115' : '#ef444415',
                                        borderRadius: '20px'
                                    }}>
                                        {u.isActive ? 'ACTIVE' : 'INACTIVE'}
                                    </span>
                                </td>
                                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                                <td className="um-actions">
                                    <button className="um-btn um-btn-success" onClick={() => handleToggleStatus(u)} title="Toggle Status">⚙️</button>
                                    <button className="um-btn um-btn-danger" onClick={() => handleDelete(u)} title="Delete User">🗑️</button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );

    return (
        <div className="um-page fade-in">
            <header className="page-header header-admin" style={{ padding: '24px 40px' }}>
                <div className="header-accent-dot"></div>
                <div className="page-header-inner">
                    <div>
                        <h1 style={{ fontSize: '1.8rem' }}>👥 User Management Control</h1>
                        <p style={{ fontSize: '0.9rem' }}>Full administrative control over all campus accounts</p>
                    </div>
                    <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                        {showForm ? '✕ Close Form' : '➕ Add Student/Staff'}
                    </button>
                </div>

                <div className="um-tabs" style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
                    <button className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`} style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        background: activeTab === 'overview' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f8fafc',
                        color: activeTab === 'overview' ? 'white' : '#64748b',
                        boxShadow: activeTab === 'overview' ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
                    }} onClick={() => setActiveTab('overview')}>📊 Overview</button>

                    <button className={`tab-btn ${activeTab === 'students' ? 'active' : ''}`} style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        background: activeTab === 'students' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f8fafc',
                        color: activeTab === 'students' ? 'white' : '#64748b',
                        boxShadow: activeTab === 'students' ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
                    }} onClick={() => setActiveTab('students')}>🎓 Students ({students.length})</button>

                    <button className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`} style={{
                        padding: '10px 20px',
                        borderRadius: '10px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        border: 'none',
                        cursor: 'pointer',
                        background: activeTab === 'staff' ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#f8fafc',
                        color: activeTab === 'staff' ? 'white' : '#64748b',
                        boxShadow: activeTab === 'staff' ? '0 4px 12px rgba(99, 102, 241, 0.2)' : 'none'
                    }} onClick={() => setActiveTab('staff')}>👮 Staff ({staffList.length})</button>
                </div>
            </header>

            <div className="page-content" style={{ marginTop: '0px', padding: '0 20px' }}>
                {showForm && (
                    <div className="premium-card" style={{ marginBottom: '20px', padding: '24px' }}>
                        <h3 style={{ marginBottom: '16px', fontSize: '1.1rem' }}>Register New {formData.role.charAt(0).toUpperCase() + formData.role.slice(1)}</h3>
                        <form onSubmit={handleAddUser}>
                            <div className="um-role-selector" style={{ marginBottom: '16px', gap: '8px' }}>
                                <button type="button" className={`um-role-btn ${formData.role === 'student' ? 'selected' : ''}`} style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => setFormData({ ...formData, role: 'student' })}>Student</button>
                                <button type="button" className={`um-role-btn ${formData.role === 'staff' ? 'selected' : ''}`} style={{ padding: '8px 16px', fontSize: '0.8rem' }} onClick={() => setFormData({ ...formData, role: 'staff' })}>Staff</button>
                            </div>
                            <div className="um-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                                <input className="form-control" style={{ fontSize: '0.85rem', padding: '8px 12px' }} name="firstName" placeholder="First Name" required value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} />
                                <input className="form-control" style={{ fontSize: '0.85rem', padding: '8px 12px' }} name="lastName" placeholder="Last Name" required value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} />
                                <input className="form-control" style={{ fontSize: '0.85rem', padding: '8px 12px' }} name="username" placeholder="Username" required value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} />
                                <input className="form-control" style={{ fontSize: '0.85rem', padding: '8px 12px' }} name="email" type="email" placeholder="Email Address" required value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} />
                                <input className="form-control" style={{ fontSize: '0.85rem', padding: '8px 12px' }} name="password" type="password" placeholder="Password (min 8 chars)" required value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} />
                                {formData.role === 'student' ? (
                                    <input className="form-control" style={{ fontSize: '0.85rem', padding: '8px 12px' }} name="studentId" placeholder="Student ID (Roll No)" value={formData.studentId} onChange={e => setFormData({ ...formData, studentId: e.target.value })} />
                                ) : (
                                    <input className="form-control" style={{ fontSize: '0.85rem', padding: '8px 12px' }} name="department" placeholder="Department" value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} />
                                )}
                            </div>
                            <button type="submit" className="btn btn-primary" style={{ marginTop: '20px', width: '200px', fontSize: '0.85rem', padding: '10px' }} disabled={formLoading}>
                                {formLoading ? 'Registering...' : 'Register User'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'overview' && (
                    <>
                        <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
                            <div className="premium-card stat-card" style={{ padding: '12px 16px' }}>
                                <div className="stat-value" style={{ fontSize: '1.4rem' }}>{users.length}</div>
                                <div className="stat-label" style={{ fontSize: '0.7rem' }}>Total Users</div>
                            </div>
                            <div className="premium-card stat-card" style={{ padding: '12px 16px', borderBottom: '3px solid #3b82f6' }}>
                                <div className="stat-value" style={{ color: '#3b82f6', fontSize: '1.4rem' }}>{students.length}</div>
                                <div className="stat-label" style={{ fontSize: '0.7rem' }}>Total Students</div>
                            </div>
                            <div className="premium-card stat-card" style={{ padding: '12px 16px', borderBottom: '3px solid #8b5cf6' }}>
                                <div className="stat-value" style={{ color: '#8b5cf6', fontSize: '1.4rem' }}>{staffList.length}</div>
                                <div className="stat-label" style={{ fontSize: '0.7rem' }}>Total Staff</div>
                            </div>
                            <div className="premium-card stat-card" style={{ padding: '12px 16px', borderBottom: '3px solid #10b981' }}>
                                <div className="stat-value" style={{ color: '#10b981', fontSize: '1.4rem' }}>{admins.length}</div>
                                <div className="stat-label" style={{ fontSize: '0.7rem' }}>Admins</div>
                            </div>
                        </div>
                        <div className="um-charts" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
                            <div className="premium-card chart-card" style={{ padding: '16px' }}>
                                <h3 style={{ marginBottom: '12px', fontSize: '0.9rem' }}>User Distribution</h3>
                                <div style={{ height: 220 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie data={pieData} cx="50%" cy="45%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                                {pieData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                            </Pie>
                                            <Tooltip />
                                            <Legend verticalAlign="bottom" height={20} wrapperStyle={{ fontSize: '10px' }} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                            <div className="premium-card chart-card" style={{ padding: '16px' }}>
                                <h3 style={{ marginBottom: '12px', fontSize: '0.9rem' }}>Active User Growth</h3>
                                <div style={{ height: 220 }}>
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={barData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                                            <YAxis tick={{ fontSize: 10 }} />
                                            <Tooltip />
                                            <Bar dataKey="count" radius={[5, 5, 0, 0]}>
                                                {barData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                                            </Bar>
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {activeTab === 'students' && (
                    <div className="um-section">
                        <div className="um-search-bar" style={{ marginBottom: '16px' }}>
                            <input className="form-control" placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '300px', fontSize: '0.85rem', padding: '8px 12px' }} />
                        </div>
                        <h2 style={{ fontSize: '1rem', marginBottom: '12px', color: '#64748b', fontWeight: '800' }}>TABLE 1: Students Enrolled</h2>
                        <UserTable list={filterFn(students)} roleType="student" />
                    </div>
                )}

                {activeTab === 'staff' && (
                    <div className="um-section">
                        <div className="um-search-bar" style={{ marginBottom: '16px' }}>
                            <input className="form-control" placeholder="Search staff..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: '300px', fontSize: '0.85rem', padding: '8px 12px' }} />
                        </div>
                        <h2 style={{ fontSize: '1rem', marginBottom: '12px', color: '#64748b', fontWeight: '800' }}>TABLE 2: Staff Members</h2>
                        <UserTable list={filterFn(staffList)} roleType="staff" />
                    </div>
                )}
            </div>
        </div>
    );
}
