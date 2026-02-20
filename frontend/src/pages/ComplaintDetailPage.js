/**
 * Enhanced Complaint Detail & Tracking Page
 * Shows complaint details, timeline, history, and real-time updates
 */


import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card,
  StatusBadge,
  PriorityBadge,
  Button,
  EmptyState,
  LoadingSpinner,
} from '../components/UIComponents';
import { useAuth } from '../context/AuthContext';
import './ComplaintDetail.css';

export default function ComplaintDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [officers, setOfficers] = useState([]);
  const [showAssignUI, setShowAssignUI] = useState(false);
  const [selectedOfficer, setSelectedOfficer] = useState('');

  /**
   * Fetch issue details
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
          setError('Issue not found');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaint();
  }, [id, token]);




  const fetchOfficers = useCallback(async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/stats/officers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOfficers(data);
      }
    } catch (err) {
      console.error('Failed to fetch staff', err);
    }
  }, [token]);

  useEffect(() => {
    if (user && (user.role === 'admin' || user.role === 'department_officer') && token) {
      fetchOfficers();
    }
  }, [user, token, fetchOfficers]);

  const handleAssignOfficer = async () => {
    if (!selectedOfficer) return;
    try {
      const response = await fetch(`http://localhost:5000/api/admin/complaints/${id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ officerId: selectedOfficer })
      });

      if (response.ok) {
        const data = await response.json();
        setComplaint(data.complaint);
        setShowAssignUI(false);
        alert('Staff assigned successfully');
      } else {
        alert('Failed to assign staff');
      }
    } catch (err) {
      console.error(err);
      alert('Error assigning staff');
    }
  };

  /**
   * Get category icon
   */
  const getCategoryIcon = (category) => {
    // Map to emoji for now as per previous design or use FontAwesome if available. 
    // Using Emojis to match rest of app style
    const emojiIcons = {
      hostel_issues: '🛌',
      classroom_issues: '🏫',
      laboratory_issues: '🧪',
      it_support: '💻',
      library_issues: '📚',
      campus_infrastructure: '🏗️',
      campus_safety: '🛡️',
    };
    return emojiIcons[category] || '📌';
  };



  if (loading) {
    return <LoadingSpinner size="lg" fullScreen />;
  }

  if (error || !complaint) {
    return (
      <div className="complaint-detail-container">
        <EmptyState
          icon="⚠️"
          title="Error Loading Issue"
          description={error || 'The issue could not be found'}
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
    <div className="complaint-detail-page fade-in">
      {/* ===== Page Header ===== */}
      <header className="page-header header-profile">
        <div className="header-accent-dot"></div>
        <div className="page-header-inner">
          <div>
            <div className="header-badges" style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              <StatusBadge status={complaint.status} />
              <PriorityBadge priority={complaint.priority} />
            </div>
            <h1>Issue #{complaint.complaint_id}</h1>
            <p>{complaint.description.length > 80 ? complaint.description.substring(0, 80) + '...' : complaint.description}</p>
          </div>
          <div>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              ← Back to List
            </button>
          </div>
        </div>
      </header>

      <div className="page-content">

        {/* Main Content Grid */}
        <div className="detail-grid">
          {/* Left Column: Details */}
          <div className="detail-main">

            {/* 1. Category & Date Card */}
            <Card className="modern-card" style={{ marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0 }}>📋 Issue Metadata</h3>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: '500' }}>
                  ID: #{complaint.complaint_id}
                </span>
              </div>
              <div className="detail-section">
                <div className="detail-row">
                  <span className="label">Category</span>
                  <span className="value" style={{ fontWeight: '700', color: '#4f46e5' }}>
                    {getCategoryIcon(complaint.category)} {complaint.category.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Reported Date</span>
                  <span className="value">
                    {new Date(complaint.created_at).toLocaleDateString('en-IN', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="label">Student ID</span>
                  <span className="value">#{complaint.student_id || 'N/A'}</span>
                </div>
                {complaint.department && (
                  <div className="detail-row">
                    <span className="label">Department</span>
                    <span className="value">{complaint.department}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* 2. Full Description Card */}
            <Card className="modern-card" style={{ marginBottom: '24px' }}>
              <h3>📝 Issue Description</h3>
              <div style={{
                background: '#f8fafc',
                padding: '24px',
                borderRadius: '16px',
                border: '1px solid #f1f5f9',
                color: '#475569',
                lineHeight: '1.8',
                fontSize: '1.1rem',
                whiteSpace: 'pre-wrap'
              }}>
                {complaint.description}
              </div>
            </Card>

            {/* 3. Detailed Location Card */}
            <Card className="modern-card" style={{ marginBottom: '24px' }}>
              <h3>📍 Location Details</h3>
              <div className="detail-grid-mini" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div style={{ padding: '16px', background: '#f5f3ff', borderRadius: '12px' }}>
                  <span className="label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem' }}>Area Type</span>
                  <span className="value" style={{ fontWeight: '700', color: '#7c3aed' }}>{complaint.issueLocation || 'Campus Area'}</span>
                </div>
                <div style={{ padding: '16px', background: '#f5f3ff', borderRadius: '12px' }}>
                  <span className="label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem' }}>Building</span>
                  <span className="value" style={{ fontWeight: '700', color: '#7c3aed' }}>{complaint.buildingName || 'N/A'}</span>
                </div>
                <div style={{ padding: '16px', background: '#f5f3ff', borderRadius: '12px' }}>
                  <span className="label" style={{ display: 'block', marginBottom: '4px', fontSize: '0.75rem' }}>Room / Office</span>
                  <span className="value" style={{ fontWeight: '700', color: '#7c3aed' }}>{complaint.roomNumber || 'N/A'}</span>
                </div>
              </div>
            </Card>

            {/* 4. Attachment Card */}
            {complaint.imageUrl && (
              <Card className="modern-card">
                <h3>🖼️ Attachment Ref</h3>
                <div style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #f1f5f9' }}>
                  <img
                    src={complaint.imageUrl}
                    alt="Issue reference"
                    style={{ width: '100%', display: 'block' }}
                  />
                </div>
              </Card>
            )}
          </div>

          {/* Right Column: Sidebar */}
          <div className="detail-sidebar">
            {/* Progress */}
            <Card className="progress-card modern-card">
              <h3>⏳ Monitor Progress</h3>
              <div className="progress-stepper">
                {['Submitted', 'In Progress', 'Resolved', 'Closed'].map((step, index) => {
                  const statusOrder = ['submitted', 'in_progress', 'resolved', 'closed'];
                  const currentIdx = statusOrder.indexOf(complaint.status);
                  const isCompleted = index <= currentIdx;

                  // Handle slight variations in status naming if backend differs
                  // Assuming 'in-progress' vs 'in_progress'

                  return (
                    <div
                      key={index}
                      className={`progress-step ${isCompleted ? 'completed' : ''}`}
                    >
                      <div className="step-dot" />
                      <div className="step-label">{step}</div>
                    </div>
                  )
                })}
              </div>
            </Card>


            {/* Estimated Resolution */}
            <Card className="estimate-card modern-card gradient-card">
              <h3>📅 Estimated Resolution</h3>
              <div className="estimate-content">
                <p className="estimate-time">3-5 business days</p>
                <p className="estimate-note">Standard turnaround for campus issues</p>
              </div>
            </Card>

            {/* Actions */}
            <Card className="actions-card modern-card">
              <h3>⚙️ Actions</h3>
              <Button variant="secondary" style={{ width: '100%', marginBottom: '10px' }}>
                📞 Contact Admin
              </Button>

              {user && (user.role === 'admin' || user.role === 'department_officer') && (
                <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '14px', color: '#555' }}>👮 Admin Actions</h4>
                  {!showAssignUI ? (
                    <Button variant="primary" style={{ width: '100%', background: '#2c3e50' }} onClick={() => setShowAssignUI(true)}>
                      Assign Staff
                    </Button>
                  ) : (
                    <div className="assign-box">
                      <select
                        style={{ width: '100%', padding: '8px', marginBottom: '8px', borderRadius: '4px', border: '1px solid #ddd' }}
                        value={selectedOfficer}
                        onChange={(e) => setSelectedOfficer(e.target.value)}
                      >
                        <option value="">Select Staff</option>
                        {officers.map(off => (
                          <option key={off.id} value={off.id}>{off.name} ({off.department})</option>
                        ))}
                      </select>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <Button variant="primary" onClick={handleAssignOfficer} disabled={!selectedOfficer} style={{ flex: 1, fontSize: '12px' }}>
                          Confirm
                        </Button>
                        <Button variant="secondary" onClick={() => setShowAssignUI(false)} style={{ flex: 1, fontSize: '12px' }}>
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
