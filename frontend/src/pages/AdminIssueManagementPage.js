import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api, { complaintAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

const AdminIssueManagementPage = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState(null);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [filters, setFilters] = useState({
        status: '',
        category: '',
        priority: '',
        search: ''
    });
    const { user } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchComplaints();
        fetchStats();
    }, []);

    const fetchComplaints = async () => {
        try {
            setLoading(true);
            const response = await complaintAPI.getAllComplaints();
            // In a real app we'd pass filters to the API
            setComplaints(response.data.data.complaints || []);
        } catch (error) {
            toast.error('Failed to fetch issues');
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const res = await api.get('/complaints/stats/overview');
            setStats(res.data.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!window.confirm("Are you sure you want to delete this issue? This action is permanent.")) return;
        try {
            await api.delete(`/complaints/${id}`);
            toast.success("Issue deleted successfully");
            fetchComplaints();
            fetchStats();
        } catch (err) {
            toast.error("Failed to delete issue");
        }
    };

    const handleStatusUpdate = async (id, newStatus, e) => {
        if (e) e.stopPropagation();
        try {
            await api.put(`/complaints/${id}/status`, { status: newStatus });
            toast.success(`Status updated to ${newStatus.replace('_', ' ')}`);
            fetchComplaints();
            fetchStats();
        } catch (err) {
            toast.error("Failed to update status");
        }
    };

    const formatCategory = (cat) => cat ? cat.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') : 'General';

    const getPriorityColor = (p) => {
        if (p === 'high') return '#ef4444';
        if (p === 'medium') return '#f59e0b';
        return '#3b82f6';
    };

    const getStatusColor = (s) => {
        if (s === 'resolved') return '#10b981';
        if (s === 'in_progress') return '#f59e0b';
        if (s === 'submitted') return '#6366f1';
        return '#94a3b8';
    };

    const filteredComplaints = complaints.filter(c => {
        const matchesStatus = !filters.status || c.status === filters.status;
        const matchesCategory = !filters.category || c.category === filters.category;
        const matchesPriority = !filters.priority || c.priority === filters.priority;
        const matchesSearch = !filters.search ||
            c.complaint_id?.toLowerCase().includes(filters.search.toLowerCase()) ||
            c.description?.toLowerCase().includes(filters.search.toLowerCase()) ||
            c.user_name?.toLowerCase().includes(filters.search.toLowerCase());
        return matchesStatus && matchesCategory && matchesPriority && matchesSearch;
    });

    return (
        <div className="dashboard-page fade-in" style={{ padding: '0 24px', background: '#f8fafc' }}>
            <header className="page-header header-admin" style={{
                background: 'linear-gradient(135deg, #fdf2f8 0%, #f5f3ff 100%)',
                padding: '24px 32px',
                marginBottom: '20px',
                borderRadius: '0 0 24px 24px',
                border: '1px solid #fce7f3',
                borderTop: 'none',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.02)'
            }}>
                <div className="header-accent-dot" style={{ background: '#ec4899' }}></div>
                <div className="page-header-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'white',
                            borderRadius: '14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '24px',
                            boxShadow: '0 4px 12px rgba(236, 72, 153, 0.1)'
                        }}>📑</div>
                        <div>
                            <h1 style={{ fontSize: '1.6rem', fontWeight: '850', margin: 0, background: 'linear-gradient(135deg, #db2777, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Issues Management</h1>
                            <p style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b', margin: '2px 0 0' }}>Review and optimize campus support workload</p>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '10px' }}>
                        <div style={{
                            padding: '10px 18px',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#fef2f2',
                            border: '1px solid #fee2e2'
                        }}>
                            <span style={{ color: '#ef4444', fontWeight: '900', fontSize: '1.1rem' }}>{stats?.submitted || 0}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#ef4444', letterSpacing: '0.05em' }}>PENDING</span>
                        </div>
                        <div style={{
                            padding: '10px 18px',
                            borderRadius: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            background: '#ecfdf5',
                            border: '1px solid #d1fae5'
                        }}>
                            <span style={{ color: '#10b981', fontWeight: '900', fontSize: '1.1rem' }}>{stats?.resolved || 0}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#10b981', letterSpacing: '0.05em' }}>RESOLVED</span>
                        </div>
                    </div>
                </div>
            </header>

            <div className="page-content" style={{ marginTop: 0 }}>
                {/* Filters */}
                <div className="premium-card" style={{
                    marginBottom: '20px',
                    padding: '16px',
                    display: 'flex',
                    gap: '12px',
                    flexWrap: 'wrap',
                    alignItems: 'center',
                    background: 'white',
                    borderRadius: '20px',
                    border: '1px solid #f1f5f9'
                }}>
                    <div style={{ flex: 1, minWidth: '250px', position: 'relative' }}>
                        <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: '#94a3b8' }}>🔍</span>
                        <input
                            className="form-control"
                            placeholder="Find by ID, student, or description..."
                            style={{ width: '100%', fontSize: '0.85rem', padding: '10px 12px 10px 38px', borderRadius: '12px', border: '1px solid #e2e8f0', background: '#f8fafc' }}
                            value={filters.search}
                            onChange={e => setFilters({ ...filters, search: e.target.value })}
                        />
                    </div>
                    <select className="form-control" style={{ width: '140px', fontSize: '0.85rem', padding: '10px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', fontWeight: '600' }} value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })}>
                        <option value="">All Statuses</option>
                        <option value="submitted">⏳ Pending</option>
                        <option value="in_progress">🔄 Process</option>
                        <option value="resolved">✅ Resolved</option>
                        <option value="closed">🔒 Closed</option>
                    </select>
                    <select className="form-control" style={{ width: '140px', fontSize: '0.85rem', padding: '10px', borderRadius: '12px', background: '#f8fafc', border: '1px solid #e2e8f0', fontWeight: '600' }} value={filters.priority} onChange={e => setFilters({ ...filters, priority: e.target.value })}>
                        <option value="">All Priorities</option>
                        <option value="high">🔴 High</option>
                        <option value="medium">🟡 Medium</option>
                        <option value="low">🟢 Low</option>
                    </select>
                    <button className="btn" style={{
                        padding: '10px 20px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        borderRadius: '12px',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: 'none'
                    }} onClick={() => setFilters({ status: '', category: '', priority: '', search: '' })}>Reset</button>
                </div>

                <div className="premium-card" style={{ padding: '0', overflow: 'hidden', border: '1px solid #eef2f6' }}>
                    <div className="table-responsive">
                        <table className="um-table" style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                            <thead>
                                <tr style={{ background: 'linear-gradient(to right, #f8fafc, #f1f5f9)', borderBottom: '2px solid #e2e8f0' }}>
                                    <th style={{ padding: '16px', fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Issue Details</th>
                                    <th style={{ padding: '16px', fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Applicant</th>
                                    <th style={{ padding: '16px', fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                                    <th style={{ padding: '16px', fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</th>
                                    <th style={{ padding: '16px', fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Urgency</th>
                                    <th style={{ padding: '16px', fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                    <th style={{ padding: '16px', fontSize: '0.7rem', color: '#64748b', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>Management</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>Loading issues...</td></tr>
                                ) : filteredComplaints.length === 0 ? (
                                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: '30px' }}>No issues found.</td></tr>
                                ) : (
                                    filteredComplaints.map(c => (
                                        <tr
                                            key={c.id}
                                            className="admin-table-row"
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                transition: 'all 0.2s ease',
                                                cursor: 'pointer'
                                            }}
                                            onClick={() => setSelectedComplaint(c)}
                                        >
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    background: 'linear-gradient(135deg, #f5f3ff, #ede9fe)',
                                                    color: '#7c3aed',
                                                    borderRadius: '10px',
                                                    fontWeight: '800',
                                                    fontSize: '0.75rem',
                                                    border: '1px solid #ddd6fe',
                                                    boxShadow: '0 2px 4px rgba(124, 58, 237, 0.05)'
                                                }}>
                                                    #{c.complaint_id}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <div style={{ fontWeight: '700', color: '#1e293b' }}>{c.user_name || 'N/A'}</div>
                                                <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>{c.user_email || ''}</div>
                                            </td>
                                            <td style={{ padding: '16px', maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: '600', color: '#475569' }}>{formatCategory(c.category)}</td>
                                            <td style={{ padding: '16px', fontSize: '0.8rem', color: '#64748b', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                <span title={c.buildingName || c.issueLocation}>{c.buildingName || c.issueLocation || 'N/A'}</span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    padding: '6px 12px',
                                                    borderRadius: '12px',
                                                    fontSize: '0.7rem',
                                                    fontWeight: '800',
                                                    background: getPriorityColor(c.priority) + '15',
                                                    color: getPriorityColor(c.priority),
                                                    border: `1px solid ${getPriorityColor(c.priority)}40`,
                                                    display: 'inline-block',
                                                    textAlign: 'center',
                                                    minWidth: '75px'
                                                }}>
                                                    {c.priority?.toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }}>
                                                <span style={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '6px',
                                                    padding: '6px 12px',
                                                    borderRadius: '12px',
                                                    background: getStatusColor(c.status) + '15',
                                                    color: getStatusColor(c.status),
                                                    border: `1px solid ${getStatusColor(c.status)}40`,
                                                    fontSize: '0.75rem',
                                                    fontWeight: '800'
                                                }}>
                                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: getStatusColor(c.status) }}></div>
                                                    {c.status?.replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px' }} onClick={(e) => e.stopPropagation()}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                                                    <select
                                                        className="form-control"
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            padding: '6px 10px',
                                                            width: '125px',
                                                            height: '34px',
                                                            borderRadius: '10px',
                                                            border: '1px solid #e2e8f0',
                                                            cursor: 'pointer',
                                                            background: '#f8fafc',
                                                            fontWeight: '700',
                                                            color: '#475569'
                                                        }}
                                                        value={c.status}
                                                        onChange={(e) => handleStatusUpdate(c.id, e.target.value)}
                                                    >
                                                        <option value="submitted">⏳ PENDING</option>
                                                        <option value="in_progress">🔄 PROCESS</option>
                                                        <option value="resolved">✅ RESOLVED</option>
                                                        <option value="closed">🔒 CLOSED</option>
                                                    </select>
                                                    <button
                                                        onClick={(e) => handleDelete(c.id, e)}
                                                        title="Delete Issue"
                                                        style={{
                                                            width: '34px',
                                                            height: '34px',
                                                            borderRadius: '10px',
                                                            border: '1px solid #fee2e2',
                                                            background: '#fef2f2',
                                                            color: '#ef4444',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            cursor: 'pointer',
                                                            transition: 'all 0.2s',
                                                            fontSize: '1rem'
                                                        }}
                                                        onMouseOver={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                                                        onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Issue Detail Modal */}
            {selectedComplaint && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(15, 23, 42, 0.4)',
                    backdropFilter: 'blur(8px)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000,
                    padding: '20px'
                }} onClick={() => setSelectedComplaint(null)}>
                    <div style={{
                        background: 'white',
                        width: '100%',
                        maxWidth: '650px',
                        borderRadius: '28px',
                        overflow: 'hidden',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)',
                        animation: 'modalSlideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                    }} onClick={e => e.stopPropagation()}>
                        {/* Modal Header */}
                        <div style={{
                            background: 'linear-gradient(135deg, #7c3aed 0%, #db2777 100%)',
                            padding: '32px',
                            position: 'relative',
                            color: 'white'
                        }}>
                            <button
                                onClick={() => setSelectedComplaint(null)}
                                style={{
                                    position: 'absolute',
                                    right: '24px',
                                    top: '24px',
                                    background: 'rgba(255, 255, 255, 0.2)',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    color: 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'}
                            >✕</button>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '12px' }}>
                                <span style={{
                                    padding: '6px 14px',
                                    background: 'rgba(255, 255, 255, 0.15)',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: '800',
                                    backdropFilter: 'blur(4px)',
                                    border: '1px solid rgba(255, 255, 255, 0.2)'
                                }}>
                                    #{selectedComplaint.complaint_id}
                                </span>
                                <span style={{
                                    padding: '6px 14px',
                                    background: getPriorityColor(selectedComplaint.priority) + '30',
                                    borderRadius: '12px',
                                    fontSize: '0.8rem',
                                    fontWeight: '850',
                                    textTransform: 'uppercase',
                                    border: `1px solid ${getPriorityColor(selectedComplaint.priority)}50`
                                }}>
                                    {selectedComplaint.priority} Priority
                                </span>
                            </div>
                            <h2 style={{ fontSize: '1.8rem', fontWeight: '850', margin: 0, lineHeight: 1.2 }}>
                                {formatCategory(selectedComplaint.category)} Issue
                            </h2>
                            <p style={{ margin: '8px 0 0', opacity: 0.9, fontWeight: '600' }}>
                                Submitted by {selectedComplaint.user_name || 'Anonymous Student'}
                            </p>
                        </div>

                        {/* Modal Body */}
                        <div style={{ padding: '32px', maxHeight: '70vh', overflowY: 'auto' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
                                <div style={{
                                    padding: '20px',
                                    background: '#f8fafc',
                                    borderRadius: '20px',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <h4 style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📍 Department/Area</h4>
                                    <p style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>{selectedComplaint.buildingName || selectedComplaint.issueLocation || 'N/A'}</p>
                                </div>
                                <div style={{
                                    padding: '20px',
                                    background: '#f8fafc',
                                    borderRadius: '20px',
                                    border: '1px solid #f1f5f9'
                                }}>
                                    <h4 style={{ margin: '0 0 8px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🔄 Current Status</h4>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(selectedComplaint.status) }}></div>
                                        <p style={{ margin: 0, fontWeight: '700', color: '#1e293b', textTransform: 'capitalize' }}>{selectedComplaint.status?.replace('_', ' ')}</p>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: '32px' }}>
                                <h4 style={{ margin: '0 0 12px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>📝 Issue Description</h4>
                                <div style={{
                                    padding: '24px',
                                    background: '#f5f3ff',
                                    borderRadius: '20px',
                                    color: '#4c1d95',
                                    lineHeight: 1.6,
                                    fontSize: '1rem',
                                    fontWeight: '500',
                                    whiteSpace: 'pre-wrap'
                                }}>
                                    {selectedComplaint.description}
                                </div>
                            </div>

                            {selectedComplaint.imageUrl && (
                                <div style={{ marginBottom: '32px' }}>
                                    <h4 style={{ margin: '0 0 12px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>🖼️ Attached Reference</h4>
                                    <img
                                        src={selectedComplaint.imageUrl}
                                        alt="Issue ref"
                                        style={{ width: '100%', borderRadius: '20px', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.05)' }}
                                    />
                                </div>
                            )}

                            <div>
                                <h4 style={{ margin: '0 0 12px', fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>👤 Applicant Details</h4>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                    <div style={{
                                        width: '44px',
                                        height: '44px',
                                        borderRadius: '50%',
                                        background: '#ede9fe',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1.2rem'
                                    }}>🎓</div>
                                    <div>
                                        <p style={{ margin: 0, fontWeight: '700', color: '#1e293b' }}>{selectedComplaint.user_name || 'N/A'}</p>
                                        <p style={{ margin: 0, fontSize: '0.85rem', color: '#64748b' }}>{selectedComplaint.user_email || 'No email provided'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div style={{
                            padding: '24px 32px',
                            background: '#f8fafc',
                            borderTop: '1px solid #f1f5f9',
                            display: 'flex',
                            justifyContent: 'flex-end',
                            gap: '12px'
                        }}>
                            <button
                                onClick={() => setSelectedComplaint(null)}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '14px',
                                    border: '1px solid #e2e8f0',
                                    background: 'white',
                                    color: '#64748b',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => e.currentTarget.style.background = '#f1f5f9'}
                                onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                            >Close View</button>
                            <button
                                onClick={(e) => {
                                    handleDelete(selectedComplaint.id, e);
                                    setSelectedComplaint(null);
                                }}
                                style={{
                                    padding: '12px 24px',
                                    borderRadius: '14px',
                                    border: 'none',
                                    background: '#fef2f2',
                                    color: '#ef4444',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s'
                                }}
                                onMouseOver={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = 'white'; }}
                                onMouseOut={(e) => { e.currentTarget.style.background = '#fef2f2'; e.currentTarget.style.color = '#ef4444'; }}
                            >Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
                @keyframes modalSlideUp {
                    from { transform: translateY(30px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
};

export default AdminIssueManagementPage;
