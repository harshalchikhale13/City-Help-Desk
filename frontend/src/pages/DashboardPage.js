/**
 * DashboardPage Component
 * Shows citizen's complaints or all complaints for admin/officers
 */
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintAPI } from '../services/api';
import { formatDate, getStatusColor, getStatusLabel, getPriorityColor } from '../utils/helpers';
import { toast } from 'react-toastify';
import '../styles/Dashboard.css';

export default function DashboardPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: '',
    limit: 10,
    offset: 0,
  });
  const [total, setTotal] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If admin, redirect to admin dashboard
    if (user?.role === 'admin' || user?.role === 'department_officer') {
      navigate('/admin');
      // eslint-disable-next-line react-hooks/exhaustive-deps
      return;
    }
  }, [user]);

  useEffect(() => {
    // Only fetch if not admin
    if (user?.role !== 'admin' && user?.role !== 'department_officer') {
      fetchComplaints();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = { ...filters };

      // Fetch all complaints for all users
      const response = await complaintAPI.getAllComplaints(params);
      setComplaints(response.data.data.complaints);
      setTotal(response.data.data.total);
    } catch (error) {
      toast.error('Failed to fetch complaints');
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

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>
          {user?.role === 'citizen' ? 'My Complaints' : 'All Complaints'}
        </h1>
        {user?.role === 'citizen' && (
          <button
            className="btn btn-primary"
            onClick={() => navigate('/complaint/create')}
          >
            + Report New Issue
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="filters-section">
        <select
          name="status"
          value={filters.status}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="submitted">Submitted</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
          <option value="closed">Closed</option>
        </select>

        <select
          name="category"
          value={filters.category}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Categories</option>
          <option value="Garbage">Garbage</option>
          <option value="Road">Road</option>
          <option value="Water">Water</option>
          <option value="Electricity">Electricity</option>
          <option value="Drainage">Drainage</option>
          <option value="Public_Safety">Public Safety</option>
        </select>

        <select
          name="priority"
          value={filters.priority}
          onChange={handleFilterChange}
          className="filter-select"
        >
          <option value="">All Priority</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      {/* Complaints List */}
      <div className="complaints-list">
        {loading ? (
          <div className="loading">Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <p>No complaints found</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Complaint ID</th>
                  <th>Category</th>
                  <th>Description</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Submitted Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((complaint) => (
                  <tr key={complaint.id}>
                    <td className="complaint-id">{complaint.complaint_id}</td>
                    <td>{complaint.category}</td>
                    <td className="description">
                      {complaint.description.substring(0, 50)}...
                    </td>
                    <td>
                      <span
                        className="priority-badge"
                        style={{ backgroundColor: getPriorityColor(complaint.priority) }}
                      >
                        {complaint.priority.charAt(0).toUpperCase() + complaint.priority.slice(1)}
                      </span>
                    </td>
                    <td>
                      <span
                        className="status-badge"
                        style={{ backgroundColor: getStatusColor(complaint.status) }}
                      >
                        {getStatusLabel(complaint.status)}
                      </span>
                    </td>
                    <td>{formatDate(complaint.created_at)}</td>
                    <td>
                      <button
                        className="btn-view"
                        onClick={() => handleViewComplaint(complaint.id)}
                      >
                        View
                      </button>
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
        <div className="pagination-info">
          <p>
            Showing {complaints.length} of {total} complaints
          </p>
        </div>
      )}
    </div>
  );
}
