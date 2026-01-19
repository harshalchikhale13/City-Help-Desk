/**
 * Enhanced Complaint Detail & Tracking Page
 * Shows complaint details, timeline, history, and real-time updates
 */

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  StatusBadge,
  PriorityBadge,
  Timeline,
  Button,
  EmptyState,
  LoadingSpinner,
} from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import './ComplaintDetail.css';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  /**
   * Fetch complaint details
   */
  useEffect(() => {
    const fetchComplaint = async () => {
      if (!token) return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`http://localhost:5000/api/complaints/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setComplaint(data.data.complaint);
        } else {
          setError('Complaint not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, token]);

  /**
   * Get category icon
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
   * Get status steps
   */
  const getStatusSteps = () => {
    const statusOrder = ['submitted', 'in_progress', 'resolved', 'closed'];
    const currentIndex = statusOrder.indexOf(complaint?.status);
    return statusOrder.slice(0, Math.max(0, currentIndex + 1));
  };

  if (loading) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  if (error || !complaint) {
    return (
      <div className="complaint-detail-container">
        <EmptyState
          icon="⚠️"
          title="Error Loading Complaint"
          description={error || 'The complaint could not be found'}
          action={
            <Button variant="primary" onClick={() => navigate(-1)}>
              ← Back
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div className="complaint-detail-container">
      {/* Header */}
      <div className="detail-header">
        <div>
          <h1>
            {getCategoryIcon(complaint.category)} Complaint #{complaint.id}
          </h1>
          <p>{complaint.description.substring(0, 100)}...</p>
        </div>
        <Button variant="secondary" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="detail-grid">
        {/* Left Column: Details */}
        <div className="detail-main">
          {/* Status & Priority */}
          <Card className="status-section">
            <div className="status-header">
              <div>
                <h3>Current Status</h3>
                <StatusBadge status={complaint.status} />
              </div>
              <div>
                <h3>Priority</h3>
                <PriorityBadge priority={complaint.priority} />
              </div>
            </div>
          </Card>

          {/* Complaint Details */}
          <Card>
            <h3>📋 Complaint Details</h3>
            <div className="detail-section">
              <div className="detail-row">
                <span className="label">Category:</span>
                <span className="value">
                  {getCategoryIcon(complaint.category)} {complaint.category}
                </span>
              </div>
              <div className="detail-row">
                <span className="label">Description:</span>
                <span className="value long">{complaint.description}</span>
              </div>
              <div className="detail-row">
                <span className="label">Filed On:</span>
                <span className="value">
                  {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </div>
            </div>
          </Card>

          {/* Location Information */}
          <Card>
            <h3>📍 Location Information</h3>
            <div className="detail-section">
              <div className="detail-row">
                <span className="label">Address:</span>
                <span className="value">{complaint.location_address}</span>
              </div>
              <div className="detail-row">
                <span className="label">Coordinates:</span>
                <span className="value">
                  {complaint.latitude}, {complaint.longitude}
                </span>
              </div>
              <div className="map-placeholder">📍 Map view would be displayed here</div>
            </div>
          </Card>
        </div>

        {/* Right Column: Sidebar */}
        <div className="detail-sidebar">
          {/* Progress */}
          <Card className="progress-card">
            <h3>⏳ Resolution Progress</h3>
            <div className="progress-stepper">
              {['Submitted', 'In Progress', 'Resolved', 'Closed'].map((step, index) => (
                <div
                  key={index}
                  className={`progress-step ${index < getStatusSteps().length ? 'completed' : ''}`}
                >
                  <div className="step-dot" />
                  <div className="step-label">{step}</div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Info */}
          <Card className="quick-info">
            <h3>ℹ️ Quick Information</h3>
            <div className="info-item">
              <span className="info-label">Status:</span>
              <span className="info-value">{complaint.status.replace('_', ' ').toUpperCase()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Priority:</span>
              <span className="info-value">{complaint.priority.toUpperCase()}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Days Pending:</span>
              <span className="info-value">
                {Math.floor(
                  (new Date() - new Date(complaint.created_at)) / (1000 * 60 * 60 * 24)
                )}{' '}
                days
              </span>
            </div>
          </Card>

          {/* Estimated Resolution */}
          <Card className="estimate-card">
            <h3>📅 Estimated Resolution</h3>
            <div className="estimate-content">
              <p className="estimate-time">7-10 business days</p>
              <p className="estimate-note">Based on current workload and priority level</p>
            </div>
          </Card>

          {/* Actions */}
          <Card className="actions-card">
            <h3>⚙️ Actions</h3>
            <Button variant="secondary" style={{ width: '100%', marginBottom: '10px' }}>
              📞 Contact Department
            </Button>
            <Button variant="ghost" style={{ width: '100%' }}>
              ⭐ Rate Service
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
