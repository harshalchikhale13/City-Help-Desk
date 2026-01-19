/**
 * Enhanced Dashboard Page
 * Shows complaint statistics, recent activity, charts, and AI insights
 */

import React, { useState, useMemo } from 'react';
import { Card, StatCard, Timeline, EmptyState, Button, Badge } from '../components/UIComponents';
import useComplaints from '../hooks/useComplaints';
import { useAuth } from '../context/AuthContext';
import ComplaintModal from '../components/ComplaintModal';
import './EnhancedDashboard.css';

const EnhancedDashboardPage = () => {
  const { user, token } = useAuth();
  const {
    complaints,
    getStatistics,
    getRecentComplaints,
    getByStatus,
    fetchComplaints,
  } = useComplaints(token);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const stats = useMemo(() => getStatistics(), [complaints]);
  const recentComplaints = useMemo(() => getRecentComplaints(5), [complaints]);

  /**
   * Handle complaint submission
   */
  const handleSubmitComplaint = async (formData) => {
    try {
      const response = await fetch('http://localhost:5000/api/complaints', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setNotification({
          type: 'success',
          message: 'Complaint submitted successfully! 🎉',
        });
        await fetchComplaints();
        setTimeout(() => setNotification(null), 3000);
      } else {
        throw new Error('Failed to submit complaint');
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: error.message || 'Failed to submit complaint',
      });
    }
  };

  /**
   * Get icon for category
   */
  const getCategoryIcon = (category) => {
    const icons = {
      Garbage: '♻️',
      Road: '🛣️',
      Water: '💧',
      Electricity: '⚡',
      Drainage: '🚰',
      Public_Safety: '🚨',
    };
    return icons[category] || '📌';
  };

  /**
   * Get color for status
   */
  const getStatusColor = (status) => {
    const colors = {
      submitted: '#0066cc',
      in_progress: '#ffc107',
      resolved: '#28a745',
      closed: '#dc3545',
    };
    return colors[status] || '#999';
  };

  /**
   * Build timeline from recent complaints
   */
  const timelineItems = recentComplaints.map((complaint) => ({
    time: new Date(complaint.created_at).toLocaleDateString('en-IN', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
    title: `#${complaint.id} - ${complaint.category}`,
    description: complaint.description.substring(0, 50) + '...',
  }));

  return (
    <div className="enhanced-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <h1>👋 Welcome, {user?.firstName}!</h1>
          <p>Here's your complaint dashboard overview</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          📝 Report New Issue
        </Button>
      </div>

      {/* Notification */}
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.type === 'success' ? '✅' : '❌'} {notification.message}
        </div>
      )}

      {/* Statistics Cards */}
      <div className="dashboard-grid">
        <StatCard
          icon="📋"
          label="Total Complaints"
          value={stats.total}
          trend={`${Math.round((stats.inProgress / stats.total) * 100 || 0)}% in progress`}
        />
        <StatCard
          icon="⏳"
          label="In Progress"
          value={stats.inProgress}
          trend={`${Math.round((stats.inProgress / stats.total) * 100 || 0)}%`}
        />
        <StatCard
          icon="✅"
          label="Resolved"
          value={stats.resolved}
          trend={`${Math.round((stats.resolved / stats.total) * 100 || 0)}%`}
        />
        <StatCard
          icon="🚨"
          label="High Priority"
          value={stats.highPriority}
          trend={stats.highPriority > 0 ? 'Needs attention' : 'All clear'}
        />
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        {/* Status Breakdown */}
        <Card className="status-breakdown">
          <h3>📊 Complaint Status Breakdown</h3>
          <div className="status-items">
            <div className="status-item">
              <div className="status-bar">
                <div
                  className="status-fill"
                  style={{
                    width: `${(stats.submitted / stats.total) * 100 || 0}%`,
                    backgroundColor: getStatusColor('submitted'),
                  }}
                />
              </div>
              <span>
                Submitted: {stats.submitted}
                <small>
                  {stats.total > 0
                    ? `${Math.round((stats.submitted / stats.total) * 100)}%`
                    : '0%'}
                </small>
              </span>
            </div>

            <div className="status-item">
              <div className="status-bar">
                <div
                  className="status-fill"
                  style={{
                    width: `${(stats.inProgress / stats.total) * 100 || 0}%`,
                    backgroundColor: getStatusColor('in_progress'),
                  }}
                />
              </div>
              <span>
                In Progress: {stats.inProgress}
                <small>
                  {stats.total > 0
                    ? `${Math.round((stats.inProgress / stats.total) * 100)}%`
                    : '0%'}
                </small>
              </span>
            </div>

            <div className="status-item">
              <div className="status-bar">
                <div
                  className="status-fill"
                  style={{
                    width: `${(stats.resolved / stats.total) * 100 || 0}%`,
                    backgroundColor: getStatusColor('resolved'),
                  }}
                />
              </div>
              <span>
                Resolved: {stats.resolved}
                <small>
                  {stats.total > 0
                    ? `${Math.round((stats.resolved / stats.total) * 100)}%`
                    : '0%'}
                </small>
              </span>
            </div>

            <div className="status-item">
              <div className="status-bar">
                <div
                  className="status-fill"
                  style={{
                    width: `${(stats.closed / stats.total) * 100 || 0}%`,
                    backgroundColor: getStatusColor('closed'),
                  }}
                />
              </div>
              <span>
                Closed: {stats.closed}
                <small>
                  {stats.total > 0
                    ? `${Math.round((stats.closed / stats.total) * 100)}%`
                    : '0%'}
                </small>
              </span>
            </div>
          </div>
        </Card>

        {/* Recent Activity */}
        <Card className="recent-activity">
          <h3>📝 Recent Activity</h3>
          {recentComplaints.length > 0 ? (
            <Timeline items={timelineItems} />
          ) : (
            <EmptyState
              icon="📭"
              title="No Complaints Yet"
              description="Start by filing your first complaint!"
            />
          )}
        </Card>
      </div>

      {/* Recent Complaints List */}
      <Card>
        <h3>📋 Latest Complaints</h3>
        {complaints.length > 0 ? (
          <div className="complaints-list">
            {complaints.slice(0, 5).map((complaint) => (
              <div key={complaint.id} className="complaint-card">
                <div className="complaint-header">
                  <div className="complaint-title">
                    <span className="complaint-id">#{complaint.id}</span>
                    <span className="complaint-category">
                      {getCategoryIcon(complaint.category)} {complaint.category}
                    </span>
                  </div>
                  <div className="complaint-badges">
                    <Badge
                      label={complaint.status.replace('_', ' ').toUpperCase()}
                      variant={
                        complaint.status === 'resolved'
                          ? 'success'
                          : complaint.status === 'in_progress'
                          ? 'warning'
                          : 'info'
                      }
                      size="sm"
                    />
                    <Badge
                      label={complaint.priority.toUpperCase()}
                      variant={
                        complaint.priority === 'high'
                          ? 'error'
                          : complaint.priority === 'medium'
                          ? 'warning'
                          : 'success'
                      }
                      size="sm"
                    />
                  </div>
                </div>
                <p className="complaint-description">{complaint.description.substring(0, 100)}...</p>
                <div className="complaint-meta">
                  <span>📍 {complaint.location_address}</span>
                  <span>📅 {new Date(complaint.created_at).toLocaleDateString('en-IN')}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState
            icon="📭"
            title="No Complaints Found"
            description="You haven't filed any complaints yet."
            action={
              <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                🚀 File Your First Complaint
              </Button>
            }
          />
        )}
      </Card>

      {/* Complaint Modal */}
      <ComplaintModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitComplaint}
        token={token}
      />
    </div>
  );
};

export default EnhancedDashboardPage;
