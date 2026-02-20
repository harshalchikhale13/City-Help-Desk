import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import api from '../services/api';
import {
  PieChart, Pie, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

const AdminDashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [systemStats, setSystemStats] = useState(null);
  const [officerStats, setOfficerStats] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddComplaint, setShowAddComplaint] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    category: 'classroom_issues',
    description: '',
    priority: 'medium',
    studentId: '',
    department: '',
    buildingName: '',
    roomNumber: '',
    issueLocation: 'Classroom',
    imageUrl: '',
  });
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef();

  const [filters, setFilters] = useState({
    status: '',
    priority: '',
  });
  const [showAddOfficer, setShowAddOfficer] = useState(false);
  const [newOfficer, setNewOfficer] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    department: '',
    phone: ''
  });

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, officerRes, complaintsRes, usersRes] = await Promise.all([
        api.get('/complaints/stats/overview'),
        api.get('/users?role=staff'),
        api.get('/complaints'),
        api.get('/users'),
      ]);

      setSystemStats(statsRes.data.data || {});
      setOfficerStats(officerRes.data.data.users || []);
      setComplaints(complaintsRes.data.data.complaints || []);
      setAllUsers(usersRes.data.data.users || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setSystemStats({
        total: 0, resolved: 0, inProgress: 0, submitted: 0,
        byPriority: { low: 0, medium: 0, high: 0 },
        byCategory: {}
      });
      setError('Failed to load some dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setNewComplaint(prev => ({ ...prev, imageUrl: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddComplaint = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/complaints', newComplaint);
      if (response.data.success) {
        alert('Issue reported successfully!');
        setShowAddComplaint(false);
        setNewComplaint({
          category: 'classroom_issues',
          description: '',
          priority: 'medium',
          studentId: '',
          department: '',
          buildingName: '',
          roomNumber: '',
          issueLocation: 'Classroom',
          imageUrl: '',
        });
        setPreviewImage(null);
        // Navigate to the detail page of the new complaint
        // Ensure we handle potential different response structures if needed, but assuming standard here
        const newComplaintId = response.data.data.complaint_id || response.data.data.id;
        navigate(`/complaint/${newComplaintId}`);
      }
    } catch (err) {
      console.error('Error adding issue:', err);
      alert(err.response?.data?.message || err.message);
    }
  };

  const handleStatusChange = async (complaintId, newStatus) => {
    try {
      const response = await api.put(`/complaints/${complaintId}/status`, {
        status: newStatus,
        resolutionDescription: newStatus === 'resolved' ? 'Marked as resolved by admin' : '',
      });
      if (response.data.success) {
        alert('Status updated successfully!');
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    }
  };

  const handleAddOfficer = async (e) => {
    e.preventDefault();
    try {
      // Auto-generate username from first+last if blank
      const username = newOfficer.username.trim() ||
        (newOfficer.firstName + newOfficer.lastName).toLowerCase().replace(/\s+/g, '');

      // Build payload — omit empty phone so optional validator doesn't reject it
      const payload = {
        username,
        firstName: newOfficer.firstName,
        lastName: newOfficer.lastName,
        email: newOfficer.email,
        password: newOfficer.password,
        role: 'staff',
      };
      if (newOfficer.phone && newOfficer.phone.trim()) {
        payload.phone = newOfficer.phone.trim();
      }

      const response = await api.post('/users/register', payload);
      if (response.data.success) {
        alert('Staff officer created successfully!');
        setShowAddOfficer(false);
        setNewOfficer({ username: '', firstName: '', lastName: '', email: '', password: '', department: '', phone: '' });
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error creating staff:', err);
      // Show actual backend validation errors if available
      const backendErrors = err.response?.data?.errors;
      const backendMsg = err.response?.data?.message;
      if (backendErrors && backendErrors.length > 0) {
        alert('Validation failed:\n' + backendErrors.map(e => `• ${e.field}: ${e.message}`).join('\n'));
      } else {
        alert(backendMsg || 'Failed to create staff officer');
      }
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this issue?')) return;
    try {
      const response = await api.delete(`/complaints/${complaintId}`);
      if (response.data.success) {
        alert('Issue deleted successfully!');
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error deleting issue:', err);
      alert('Failed to delete issue');
    }
  };

  const handleViewComplaint = (complaintId) => {
    navigate(`/complaint/${complaintId}`);
  };

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Loading College Portal...</h2>
        </div>
      </div>
    );
  }

  const statusData = systemStats ? [
    { name: 'Submitted', value: systemStats.submitted || 0, fill: '#FF6B6B' },
    { name: 'In Progress', value: systemStats.inProgress || 0, fill: '#FFA500' },
    { name: 'Resolved', value: systemStats.resolved || 0, fill: '#4ECDC4' },
    { name: 'Closed', value: systemStats.closed || 0, fill: '#95E1D3' }
  ] : [];

  const priorityData = systemStats ? Object.entries(systemStats.byPriority || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    fill: key === 'high' ? '#e74c3c' : key === 'medium' ? '#f39c12' : '#3498db'
  })) : [];

  const categoryData = systemStats ? Object.entries(systemStats.byCategory || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' '),
    value
  })) : [];

  return (
    <div className="admin-dashboard-page" style={{ width: '100%', padding: 0, background: 'none' }}>

      {/* ===== Gradient Page Header ===== */}
      <div className="page-header">
        <div className="page-header-inner">
          <div>
            <h1>🎛️ College Issue Management Portal</h1>
            <p>Campus Administration · Analytics · Issue Tracking</p>
          </div>
          <div className="page-header-actions">
            <button
              style={{
                background: 'linear-gradient(135deg, #ef4444, #8b5cf6)',
                border: 'none',
                color: '#fff',
                padding: '10px 22px',
                borderRadius: '10px',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: '0.95rem',
                boxShadow: '0 4px 14px rgba(239, 68, 68, 0.4)',
              }}
              onClick={() => setShowAddComplaint(!showAddComplaint)}
            >
              ➕ {showAddComplaint ? 'Cancel' : 'Report Issue'}
            </button>
          </div>
        </div>
      </div>

      {/* ===== Page body ===== */}
      <div className="page-content">

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {showAddComplaint && (
          <div className="add-complaint-form">
            <h3>Report Campus Issue</h3>
            <form onSubmit={handleAddComplaint}>
              <div className="form-row">
                <div className="form-group">
                  <label>Student ID</label>
                  <input type="text" value={newComplaint.studentId} onChange={(e) => setNewComplaint({ ...newComplaint, studentId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Department</label>
                  <input type="text" value={newComplaint.department} onChange={(e) => setNewComplaint({ ...newComplaint, department: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={newComplaint.category}
                  onChange={(e) => setNewComplaint({ ...newComplaint, category: e.target.value })}
                >
                  <option value="hostel_issues">Hostel Issues</option>
                  <option value="classroom_issues">Classroom Issues</option>
                  <option value="laboratory_issues">Laboratory Issues</option>
                  <option value="it_support">IT Support</option>
                  <option value="library_issues">Library Issues</option>
                  <option value="campus_infrastructure">Campus Infrastructure</option>
                  <option value="campus_safety">Campus Safety</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location Type</label>
                <select
                  value={newComplaint.issueLocation}
                  onChange={(e) => setNewComplaint({ ...newComplaint, issueLocation: e.target.value })}
                >
                  <option value="Classroom">Classroom</option>
                  <option value="Hostel">Hostel</option>
                  <option value="Laboratory">Laboratory</option>
                  <option value="Library">Library</option>
                  <option value="Common Area">Common Area</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Building Name</label>
                  <input
                    type="text"
                    value={newComplaint.buildingName}
                    onChange={(e) => setNewComplaint({ ...newComplaint, buildingName: e.target.value })}
                    placeholder="e.g. Block A"
                  />
                </div>
                <div className="form-group">
                  <label>Room Number</label>
                  <input
                    type="text"
                    value={newComplaint.roomNumber}
                    onChange={(e) => setNewComplaint({ ...newComplaint, roomNumber: e.target.value })}
                    placeholder="e.g. 101"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                  placeholder="Describe the issue..."
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newComplaint.priority}
                  onChange={(e) => setNewComplaint({ ...newComplaint, priority: e.target.value })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Upload Image</label>
                <div className="file-upload-admin">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    hidden
                  />
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => fileInputRef.current.click()}
                  >
                    📸 Choose Image
                  </button>
                  {previewImage && (
                    <div className="image-preview-mini">
                      <img src={previewImage} alt="Preview" style={{ height: '50px', marginLeft: '10px', verticalAlign: 'middle' }} />
                      <button
                        type="button"
                        className="btn-remove-sm"
                        onClick={() => {
                          setPreviewImage(null);
                          setNewComplaint(prev => ({ ...prev, imageUrl: '' }));
                        }}
                        style={{ marginLeft: '5px', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">Submit Issue</button>
                <button type="button" className="btn-cancel" onClick={() => setShowAddComplaint(false)}>Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="admin-tabs">
          <button
            className={`tab-button ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            📊 Overview
          </button>
          <button
            className={`tab-button ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => setActiveTab('complaints')}
          >
            📋 All Issues
          </button>
          <button
            className={`tab-button ${activeTab === 'officers' ? 'active' : ''}`}
            onClick={() => setActiveTab('officers')}
          >
            👔 Staff Management
          </button>
          <button
            className={`tab-button ${activeTab === 'users' ? 'active' : ''}`}
            onClick={() => setActiveTab('users')}
          >
            👥 User Management
          </button>
        </div>

        {activeTab === 'overview' && systemStats && (
          <div className="tab-content">
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-value">{systemStats.total}</div>
                <div className="stat-label">📋 Total Issues</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#10b981' }}>{systemStats.resolved}</div>
                <div className="stat-label">✅ Resolved</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#f59e0b' }}>{systemStats.inProgress}</div>
                <div className="stat-label">⏳ In Progress</div>
              </div>
              <div className="stat-card">
                <div className="stat-value" style={{ color: '#ef4444' }}>{systemStats.submitted}</div>
                <div className="stat-label">📋 Pending</div>
              </div>
              <div className="stat-card" style={{ borderTop: '4px solid #3b82f6' }}>
                <div className="stat-value" style={{ color: '#3b82f6' }}>{allUsers.filter(u => u.role === 'student').length}</div>
                <div className="stat-label">🎓 Students</div>
              </div>
              <div className="stat-card" style={{ borderTop: '4px solid #8b5cf6' }}>
                <div className="stat-value" style={{ color: '#8b5cf6' }}>{allUsers.filter(u => u.role === 'staff').length}</div>
                <div className="stat-label">👔 Staff</div>
              </div>
            </div>

            <div className="charts-container">
              <div className="chart-wrapper">
                <h3>Issue Status Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-wrapper">
                <h3>Priority Distribution</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={priorityData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-wrapper">
                <h3>Issue Categories</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={categoryData}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={150} />
                    <Tooltip />
                    <Bar dataKey="value" fill="#667eea" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="tab-content">
            <div className="complaints-section">
              <h2>All Campus Issues</h2>
              <div className="complaints-filters">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="filter-select"
                >
                  <option value="">All Status</option>
                  <option value="submitted">Submitted</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
              </div>

              {complaints.length > 0 ? (
                <div className="complaints-table-container">
                  <table className="complaints-table">
                    <thead>
                      <tr>
                        <th>Issue ID</th>
                        <th>Category</th>
                        <th>Location</th>
                        <th>Description</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Reported</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {complaints
                        .filter(c => !filters.status || c.status === filters.status)
                        .map(complaint => (
                          <tr key={complaint.id}>
                            <td><strong>{complaint.complaint_id}</strong></td>
                            <td>{complaint.category.replace(/_/g, ' ')}</td>
                            <td>{complaint.building_name || complaint.issueLocation || 'N/A'}</td>
                            <td>{complaint.description.substring(0, 50)}...</td>
                            <td>
                              <span className={`priority-badge priority-${complaint.priority}`}>
                                {complaint.priority.toUpperCase()}
                              </span>
                            </td>
                            <td>
                              <select
                                value={complaint.status}
                                onChange={(e) => handleStatusChange(complaint.id, e.target.value)}
                                className="status-select"
                              >
                                <option value="submitted">Submitted</option>
                                <option value="in-progress">In Progress</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                              </select>
                            </td>
                            <td>{new Date(complaint.created_at).toLocaleDateString()}</td>
                            <td>
                              <button
                                className="action-btn"
                                onClick={() => handleViewComplaint(complaint.complaint_id)}
                              >
                                View
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() => handleDeleteComplaint(complaint.id)}
                              >
                                🗑️
                              </button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="empty-state">No issues found</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'officers' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>Staff / Faculty Management</h2>
              <button
                className="btn-add-complaint"
                onClick={() => setShowAddOfficer(!showAddOfficer)}
              >
                ➕ {showAddOfficer ? 'Cancel' : 'Register New Staff'}
              </button>
            </div>
            {showAddOfficer && (
              <div className="add-complaint-form">
                <h3>Register New Staff Member</h3>
                <form onSubmit={handleAddOfficer}>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name</label>
                      <input type="text" autoComplete="given-name" value={newOfficer.firstName} onChange={e => setNewOfficer({ ...newOfficer, firstName: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Last Name</label>
                      <input type="text" autoComplete="family-name" value={newOfficer.lastName} onChange={e => setNewOfficer({ ...newOfficer, lastName: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Username</label>
                      <input type="text" autoComplete="username" value={newOfficer.username} onChange={e => setNewOfficer({ ...newOfficer, username: e.target.value })} placeholder="e.g. officer_john" required />
                    </div>
                    <div className="form-group">
                      <label>Phone (Optional)</label>
                      <input type="tel" autoComplete="tel" value={newOfficer.phone} onChange={e => setNewOfficer({ ...newOfficer, phone: e.target.value })} placeholder="Mobile number" />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Email</label>
                      <input type="email" autoComplete="email" value={newOfficer.email} onChange={e => setNewOfficer({ ...newOfficer, email: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input type="password" autoComplete="new-password" value={newOfficer.password} onChange={e => setNewOfficer({ ...newOfficer, password: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Department</label>
                    <select value={newOfficer.department} onChange={e => setNewOfficer({ ...newOfficer, department: e.target.value })}>
                      <option value="">Select Department</option>
                      <option value="IT Support">IT Support</option>
                      <option value="Hostel Administration">Hostel Administration</option>
                      <option value="Maintenance">Maintenance</option>
                      <option value="Academic Affairs">Academic Affairs</option>
                      <option value="Library">Library</option>
                      <option value="Security">Security</option>
                    </select>
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn-submit">Register Staff</button>
                  </div>
                </form>
              </div>
            )}

            {officerStats.length > 0 ? (
              <div className="officers-table-container">
                <table className="officers-table">
                  <thead>
                    <tr>
                      <th>Staff Name</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {officerStats.map((officer, idx) => (
                      <tr key={`officer - ${officer.id} -${idx} `}>
                        <td><strong>{officer.firstName} {officer.lastName}</strong></td>
                        <td>{officer.email}</td>
                        <td>{officer.role}</td>
                        <td>{officer.isActive ? 'Active' : 'Inactive'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-state">No staff found.</div>
            )}
          </div>
        )}
        {activeTab === 'users' && (
          <div className="tab-content">
            <div className="section-header">
              <h2>👥 User Management</h2>
              <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {allUsers.filter(u => u.role !== 'admin').length} total users
              </span>
            </div>

            {/* Students */}
            <h3 style={{ margin: '20px 0 10px', color: '#3b82f6' }}>🎓 Students ({allUsers.filter(u => u.role === 'student').length})</h3>
            <div className="complaints-table-container">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.filter(u => u.role === 'student').map((u, idx) => (
                    <tr key={`student - ${u.id} -${idx} `}>
                      <td><strong>{u.firstName} {u.lastName}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.username}</td>
                      <td>
                        <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>Student</span>
                      </td>
                      <td>
                        <span style={{ color: u.isActive ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                          {u.isActive ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Staff */}
            <h3 style={{ margin: '28px 0 10px', color: '#8b5cf6' }}>👔 Staff ({allUsers.filter(u => u.role === 'staff').length})</h3>
            <div className="complaints-table-container">
              <table className="complaints-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Registered</th>
                  </tr>
                </thead>
                <tbody>
                  {allUsers.filter(u => u.role === 'staff').map((u, idx) => (
                    <tr key={`staff - ${u.id} -${idx} `}>
                      <td><strong>{u.firstName} {u.lastName}</strong></td>
                      <td>{u.email}</td>
                      <td>{u.username}</td>
                      <td>
                        <span style={{ background: '#ede9fe', color: '#7c3aed', padding: '2px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 700 }}>Staff</span>
                      </td>
                      <td>
                        <span style={{ color: u.isActive ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
                          {u.isActive ? '● Active' : '○ Inactive'}
                        </span>
                      </td>
                      <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>  {/* page-content */}
    </div>
  );
};

export default AdminDashboardPage;
