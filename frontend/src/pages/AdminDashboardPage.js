import React, { useState, useEffect } from 'react';
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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAddComplaint, setShowAddComplaint] = useState(false);
  const [newComplaint, setNewComplaint] = useState({
    category: 'pothole',
    description: '',
    priority: 'medium',
    latitude: 28.6139,
    longitude: 77.2090,
    locationAddress: '',
  });
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
  });

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'department_officer')) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      console.log('Fetching dashboard data for admin...');
      const [statsRes, officerRes, complaintsRes] = await Promise.all([
        api.get('/admin/stats/system'),
        api.get('/admin/stats/officers'),
        api.get('/complaints')
      ]);

      console.log('Dashboard data loaded:', { statsRes, officerRes, complaintsRes });
      setSystemStats(statsRes.data);
      setOfficerStats(officerRes.data || []);
      setComplaints(complaintsRes.data.data.complaints || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      console.error('Error details:', {
        message: err.message,
        response: err.response?.data,
        status: err.response?.status,
      });
      setError(err.response?.data?.message || err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddComplaint = async (e) => {
    e.preventDefault();
    
    try {
      if (!newComplaint.description || !newComplaint.locationAddress) {
        alert('Please fill in all required fields');
        return;
      }

      const response = await api.post('/complaints', {
        category: newComplaint.category,
        description: newComplaint.description,
        priority: newComplaint.priority,
        latitude: parseFloat(newComplaint.latitude),
        longitude: parseFloat(newComplaint.longitude),
        locationAddress: newComplaint.locationAddress,
      });

      if (response.data.success) {
        alert('Complaint added successfully!');
        setShowAddComplaint(false);
        setNewComplaint({
          category: 'pothole',
          description: '',
          priority: 'medium',
          latitude: 28.6139,
          longitude: 77.2090,
          locationAddress: '',
        });
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error adding complaint:', err);
      
      // Handle validation errors
      let errorMessage = 'Failed to add complaint';
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        errorMessage = 'Validation errors:\n' + err.response.data.errors
          .map(e => `${e.field}: ${e.message}`)
          .join('\n');
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      alert(errorMessage);
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
      alert('Failed to update status: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    if (!window.confirm('Are you sure you want to delete this complaint? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await api.delete(`/complaints/${complaintId}`);

      if (response.data.success) {
        alert('Complaint deleted successfully!');
        fetchDashboardData();
      }
    } catch (err) {
      console.error('Error deleting complaint:', err);
      alert('Failed to delete complaint: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleViewComplaint = (complaintId) => {
    navigate(`/complaint/${complaintId}`);
  };

  if (!user || (user.role !== 'admin' && user.role !== 'department_officer')) {
    return (
      <div className="admin-dashboard-page">
        <div style={{ padding: '20px', color: '#d32f2f', textAlign: 'center' }}>
          <h2>Access Denied</h2>
          <p>Admin access only. Please login as an admin account.</p>
          <p style={{ fontSize: '0.9rem', marginTop: '10px' }}>Current role: {user?.role || 'Not logged in'}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="admin-dashboard-page">
        <div style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '2rem', marginBottom: '20px' }}>⏳</div>
          <h2>Loading Admin Dashboard...</h2>
          <p style={{ color: '#666', marginTop: '10px' }}>Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard-page">
      <div className="admin-header">
        <div>
          <h1>Admin Control Center</h1>
          <p>System Management & Analytics</p>
        </div>
        <button 
          className="btn-add-complaint"
          onClick={() => setShowAddComplaint(!showAddComplaint)}
        >
          ➕ {showAddComplaint ? 'Cancel' : 'Add Complaint'}
        </button>
      </div>

      {error && (
        <div style={{ padding: '15px', background: '#ffebee', color: '#d32f2f', borderRadius: '4px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {showAddComplaint && (
        <div className="add-complaint-form">
          <h3>Add New Complaint</h3>
          <form onSubmit={handleAddComplaint}>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={newComplaint.category}
                onChange={(e) => setNewComplaint({...newComplaint, category: e.target.value})}
                required
              >
                <option value="pothole">Pothole</option>
                <option value="streetlight">Street Light</option>
                <option value="water_supply">Water Supply</option>
                <option value="garbage">Garbage</option>
                <option value="electricity">Electricity</option>
                <option value="drainage">Drainage</option>
                <option value="public_safety">Public Safety</option>
              </select>
            </div>

            <div className="form-group">
              <label>Description * <span style={{fontSize: '0.85rem', color: '#666'}}>(minimum 5 characters)</span></label>
              <textarea
                value={newComplaint.description}
                onChange={(e) => setNewComplaint({...newComplaint, description: e.target.value})}
                placeholder="Describe the issue..."
                rows="3"
                required
              />
              <small style={{color: '#666'}}>Characters: {newComplaint.description.length}/1000</small>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Priority</label>
                <select
                  value={newComplaint.priority}
                  onChange={(e) => setNewComplaint({...newComplaint, priority: e.target.value})}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location Address * <span style={{fontSize: '0.85rem', color: '#666'}}>(minimum 3 characters)</span></label>
                <input
                  type="text"
                  value={newComplaint.locationAddress}
                  onChange={(e) => setNewComplaint({...newComplaint, locationAddress: e.target.value})}
                  placeholder="Street, Area, City"
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Latitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newComplaint.latitude}
                  onChange={(e) => setNewComplaint({...newComplaint, latitude: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Longitude</label>
                <input
                  type="number"
                  step="0.0001"
                  value={newComplaint.longitude}
                  onChange={(e) => setNewComplaint({...newComplaint, longitude: e.target.value})}
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-submit">Submit Complaint</button>
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
          Overview
        </button>
        <button
          className={`tab-button ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}
        >
          All Complaints
        </button>
        <button
          className={`tab-button ${activeTab === 'officers' ? 'active' : ''}`}
          onClick={() => setActiveTab('officers')}
        >
          Officers
        </button>
      </div>

      {activeTab === 'overview' && systemStats && (
        <div className="tab-content">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{systemStats.totalComplaints}</div>
              <div className="stat-label">Total Complaints</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{systemStats.complaintsByStatus.resolved}</div>
              <div className="stat-label">✅ Resolved</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{systemStats.complaintsByStatus['in-progress']}</div>
              <div className="stat-label">⏳ In Progress</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{systemStats.pendingCount}</div>
              <div className="stat-label">📋 Pending</div>
            </div>
          </div>

          <div className="charts-container">
            <div className="chart-wrapper">
              <h3>Complaint Status Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Submitted', value: systemStats.complaintsByStatus.submitted, fill: '#FF6B6B' },
                      { name: 'In Progress', value: systemStats.complaintsByStatus['in-progress'], fill: '#FFA500' },
                      { name: 'Resolved', value: systemStats.complaintsByStatus.resolved, fill: '#4ECDC4' },
                      { name: 'Closed', value: systemStats.complaintsByStatus.closed, fill: '#95E1D3' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[].map((entry, index) => (
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
                <BarChart data={[
                  { name: 'Low', value: systemStats.complaintsByPriority.low, fill: '#3498db' },
                  { name: 'Medium', value: systemStats.complaintsByPriority.medium, fill: '#f39c12' },
                  { name: 'High', value: systemStats.complaintsByPriority.high, fill: '#e74c3c' }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="#8884d8" radius={[8, 8, 0, 0]}>
                    {[].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-wrapper">
              <h3>Complaint Categories</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={Object.entries(systemStats.complaintsByCategory).map(([name, value]) => ({
                    name: name.replace(/_/g, ' '),
                    value
                  }))}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="value" fill="#667eea" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="chart-wrapper metrics">
              <h3>Key Metrics</h3>
              <div className="metrics-grid">
                <div className="metric-item">
                  <div className="metric-label">Assignment Rate</div>
                  <div className="metric-value">{systemStats.assignmentRate}%</div>
                  <div className="metric-bar">
                    <div className="metric-progress" style={{width: systemStats.assignmentRate + '%'}}></div>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">Average Resolution Time</div>
                  <div className="metric-value">{systemStats.averageResolutionTime} days</div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">Resolution Rate</div>
                  <div className="metric-value">
                    {systemStats.totalComplaints > 0 
                      ? Math.round((systemStats.complaintsByStatus.resolved / systemStats.totalComplaints) * 100)
                      : 0}%
                  </div>
                  <div className="metric-bar">
                    <div className="metric-progress" style={{
                      width: (systemStats.totalComplaints > 0 
                        ? Math.round((systemStats.complaintsByStatus.resolved / systemStats.totalComplaints) * 100)
                        : 0) + '%'
                    }}></div>
                  </div>
                </div>
                <div className="metric-item">
                  <div className="metric-label">Overdue Complaints</div>
                  <div className="metric-value">{systemStats.overdueCount}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'complaints' && (
        <div className="tab-content">
          <div className="complaints-section">
            <h2>All Complaints</h2>
            <div className="complaints-filters">
              <select 
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="filter-select"
              >
                <option value="">All Status</option>
                <option value="submitted">Submitted</option>
                <option value="in-progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
              <select 
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
                className="filter-select"
              >
                <option value="">All Priority</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            {complaints.length > 0 ? (
              <div className="complaints-table-container">
                <table className="complaints-table">
                  <thead>
                    <tr>
                      <th>Complaint ID</th>
                      <th>Category</th>
                      <th>Description</th>
                      <th>Priority</th>
                      <th>Status</th>
                      <th>Submitted Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {complaints
                      .filter(c => !filters.status || c.status === filters.status)
                      .filter(c => !filters.priority || c.priority === filters.priority)
                      .map(complaint => (
                      <tr key={complaint.id}>
                        <td><strong>{complaint.complaint_id}</strong></td>
                        <td>{complaint.category}</td>
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
                            title="Delete complaint"
                          >
                            🗑️ Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{padding: '20px', textAlign: 'center', color: '#666'}}>
                No complaints found
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'officers' && (
        <div className="tab-content">
          <h2>Officer Performance</h2>
          {officerStats.length > 0 ? (
            <div className="officers-table-container">
              <table className="officers-table">
                <thead>
                  <tr>
                    <th>Officer Name</th>
                    <th>Assigned</th>
                    <th>Resolved</th>
                    <th>Pending</th>
                    <th>Resolution Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {officerStats.map(officer => (
                    <tr key={officer.id}>
                      <td>{officer.name}</td>
                      <td>{officer.totalAssigned}</td>
                      <td>{officer.resolved}</td>
                      <td>{officer.pending}</td>
                      <td>{officer.resolutionRate}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div>No officer data available</div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminDashboardPage;
