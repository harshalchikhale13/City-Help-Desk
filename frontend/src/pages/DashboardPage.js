/**
 * DashboardPage Component
 * Shows student's issues or all issues for admin/staff
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

export default function DashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    limit: 50, // Increased limit for better visibility
    offset: 0,
  });
  const [total, setTotal] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch complaints when filters change
    fetchComplaints();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = { ...filters };

      // Fetch all complaints for all users
      const response = await complaintAPI.getAllComplaints(params);
      setComplaints(response.data.data.complaints || []);
      setTotal(response.data.data.total || 0);
    } catch (error) {
      toast.error('Failed to fetch issues');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      offset: 0, // Reset pagination
    }));
  };

  const handleViewComplaint = (id) => {
    navigate(`/complaint/${id}`);
  };

  const formatCategory = (category) => {
    if (!category) return '';
    return category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const formatLocation = (c) => {
    const parts = [];
    if (c.buildingName) parts.push(c.buildingName);
    if (c.roomNumber) parts.push(`Room ${c.roomNumber}`);
    if (c.issueLocation) parts.push(c.issueLocation);

    // Fallback if fields are different (e.g. from old data)
    if (parts.length === 0 && c.building_name) parts.push(c.building_name);
    if (parts.length === 0 && c.room_number) parts.push(c.room_number);
    if (parts.length === 0 && c.issue_location) parts.push(c.issue_location);

    if (parts.length === 0) return 'N/A';
    return parts.join(' - ');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted': return '#6366f1';
      case 'in_progress': return '#f59e0b';
      case 'resolved': return '#10b981';
      case 'closed': return '#94a3b8';
      default: return '#cbd5e1';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ef4444'; // Red
      case 'medium': return '#f59e0b'; // Orange
      case 'low': return '#3b82f6'; // Blue
      default: return '#cbd5e1';
    }
  };

  return (
    <div className="dashboard-page fade-in">
      <header className="page-header header-dashboard">
        <div className="header-accent-dot"></div>
        <div className="page-header-inner">
          <div>
            <h1>
              {user?.role === 'staff' ? '🏢 Staff Issues Dashboard' :
                user?.role === 'admin' ? '🛡️ All Campus Issues' : '🎓 My Reported Issues'}
            </h1>
            <p>
              {user?.role === 'staff'
                ? 'Track and manage issues assigned to your department'
                : user?.role === 'admin'
                  ? 'View and manage all reported issues across the campus'
                  : 'Track the status and progress of your campus issue reports'}
            </p>
          </div>

          {(user?.role === 'student' || user?.role === 'staff') && (
            <button
              className="btn btn-primary"
              onClick={() => navigate('/complaint/create')}
            >
              <span>✏️</span> Report New Issue
            </button>
          )}
        </div>
      </header>

      <div className="page-content">
        {/* Filters */}
        <div className="filters-section">
          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Status</option>
              <option value="submitted">Submitted</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              name="category"
              value={filters.category}
              onChange={handleFilterChange}
            >
              <option value="">All Categories</option>
              <option value="hostel_issues">Hostel Issues</option>
              <option value="classroom_issues">Classroom Issues</option>
              <option value="laboratory_issues">Laboratory Issues</option>
              <option value="it_support">IT Support</option>
              <option value="library_issues">Library Issues</option>
              <option value="campus_infrastructure">Campus Infrastructure</option>
              <option value="campus_safety">Campus Safety</option>
              <option value="electrical_issues">Electrical Issues</option>
              <option value="cleaning_issues">Cleaning/Housekeeping</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <select
              name="priority"
              value={filters.priority}
              onChange={handleFilterChange}
            >
              <option value="">All Priority</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Complaints List */}
        <div className="complaints-list" style={{ background: 'white', borderRadius: '16px', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading issues...</div>
          ) : complaints.length === 0 ? (
            <div className="empty-state" style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📋</div>
              <h3>No issues found</h3>
              <p>You haven't reported any issues yet, or none match your filters.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="complaints-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f8fafc', borderBottom: '1px solid var(--border-color)' }}>
                  <tr>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Issue ID</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Category</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Location</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Description</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Priority</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Status</th>
                    <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: 'var(--text-secondary)', fontSize: '0.75rem', textTransform: 'uppercase' }}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {complaints.map((complaint) => (
                    <tr
                      key={complaint.id}
                      style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer', transition: 'background 0.2s' }}
                      onClick={() => handleViewComplaint(complaint.complaint_id || complaint.id)}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#f8fafc'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
                    >
                      <td style={{ padding: '10px 12px', fontWeight: '600', color: 'var(--text-primary)' }}>{complaint.complaint_id}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-primary)' }}>{formatCategory(complaint.category)}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{formatLocation(complaint)}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-secondary)', maxWidth: '200px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {complaint.description}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <span style={{
                          padding: '4px 12px',
                          borderRadius: '20px',
                          fontSize: '0.7rem',
                          fontWeight: '700',
                          textTransform: 'uppercase',
                          backgroundColor: getPriorityColor(complaint.priority) + '20',
                          color: getPriorityColor(complaint.priority)
                        }}>
                          {complaint.priority.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: getStatusColor(complaint.status) }}></span>
                          <span style={{ fontWeight: '500', fontSize: '0.85rem', color: 'var(--text-primary)', textTransform: 'capitalize' }}>
                            {complaint.status.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-tertiary)', fontSize: '0.85rem' }}>
                        {new Date(complaint.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Info */}
        {complaints.length > 0 && (
          <div className="pagination-info" style={{ marginTop: '20px', textAlign: 'right', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Showing {complaints.length} of {total} issues
          </div>
        )}
      </div>
    </div>
  );
}
