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
  const [systemStats, setSystemStats] = useState(null);
  const [userStats, setUserStats] = useState({ student: 0, staff: 0 });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsRes, complaintsRes, usersRes] = await Promise.all([
        api.get('/complaints/stats/overview'),
        api.get('/complaints?limit=5'),
        api.get('/users')
      ]);

      setSystemStats(statsRes.data.data || {});
      setRecentActivity(complaintsRes.data.data.complaints || []);

      const allUsers = usersRes.data.data.users || [];
      setUserStats({
        student: allUsers.filter(u => u.role === 'student').length,
        staff: allUsers.filter(u => u.role === 'staff').length
      });
      setError(null);
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setSystemStats({
        total: 0, resolved: 0, inProgress: 0, submitted: 0,
        byPriority: { low: 0, medium: 0, high: 0 },
        byCategory: {}
      });
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading Dashboard...</p>
      </div>
    );
  }

  const roleDistribution = [
    { name: 'Students', value: userStats.student, fill: '#3b82f6' },
    { name: 'Staff', value: userStats.staff, fill: '#8b5cf6' }
  ];

  const statusData = systemStats ? [
    { name: 'Submitted', value: systemStats.submitted || 0, fill: '#6366f1' },
    { name: 'In Progress', value: systemStats.inProgress || 0, fill: '#f59e0b' },
    { name: 'Resolved', value: systemStats.resolved || 0, fill: '#10b981' },
    { name: 'Closed', value: systemStats.closed || 0, fill: '#94a3b8' }
  ] : [];

  const priorityData = systemStats ? Object.entries(systemStats.byPriority || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value,
    fill: key === 'high' ? '#ef4444' : key === 'medium' ? '#f59e0b' : '#3b82f6'
  })) : [];

  const categoryData = systemStats ? Object.entries(systemStats.byCategory || {}).map(([key, value]) => ({
    name: key.replace(/_/g, ' '),
    value
  })) : [];

  return (
    <div className="admin-dashboard fade-in">
      {/* ===== Page Header ===== */}
      <header className="page-header header-admin" style={{ padding: '20px 40px' }}>
        <div className="header-accent-dot"></div>
        <div className="page-header-inner">
          <div>
            <h1 style={{ fontSize: '1.8rem' }}>🛡️ Operational Dashboard</h1>
            <p style={{ fontSize: '0.9rem' }}>Real-time overview of pending issues and system health</p>
          </div>
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => navigate('/admin/issues')} style={{ padding: '8px 16px', fontSize: '0.85rem', marginRight: '8px' }}>
              📝 Manage Issues
            </button>
            <button className="btn btn-secondary" onClick={() => navigate('/admin/analytics')} style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              📈 Detailed Analytics
            </button>
          </div>
        </div>
      </header>

      <div className="page-content" style={{ marginTop: '-10px' }}>
        {error && <div className="error-message">{error}</div>}

        {/* Global KPI Cards - Focused on Action */}
        <div className="stats-grid" style={{ marginBottom: '24px', gap: '16px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
          <div className="premium-card stat-card" style={{ padding: '20px' }}>
            <div className="stat-icon" style={{ background: '#fee2e2', color: '#ef4444' }}>⌛</div>
            <div>
              <div className="stat-value">{systemStats?.submitted || 0}</div>
              <div className="stat-label">Pending Review</div>
            </div>
          </div>
          <div className="premium-card stat-card" style={{ padding: '20px' }}>
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#d97706' }}>🔄</div>
            <div>
              <div className="stat-value">{systemStats?.inProgress || 0}</div>
              <div className="stat-label">Currently Working</div>
            </div>
          </div>
          <div className="premium-card stat-card" style={{ padding: '20px' }}>
            <div className="stat-icon" style={{ background: '#d1fae5', color: '#059669' }}>✅</div>
            <div>
              <div className="stat-value">{systemStats?.resolved || 0}</div>
              <div className="stat-label">Resolved Today</div>
            </div>
          </div>
        </div>

        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
          {/* Recent Activity Feed */}
          <div className="main-feed-column">
            <div className="premium-card" style={{ minHeight: '400px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', padding: '0 8px' }}>
                <h3 style={{ margin: 0, fontWeight: 800 }}>🚨 Critical Issues & Recent Activity</h3>
                <button className="link-btn" onClick={() => navigate('/admin/issues')} style={{ color: '#6366f1', fontWeight: 700, fontSize: '0.85rem' }}>See Management View</button>
              </div>

              <div className="activity-list">
                {recentActivity.length > 0 ? (
                  recentActivity.map(c => (
                    <div key={c.id} className="activity-item" style={{ padding: '16px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => navigate(`/admin/issues`)}>
                      <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                        <div className={`severity-badge ${c.priority}`} style={{
                          width: '4px', height: '40px', borderRadius: '4px',
                          background: c.priority === 'high' ? '#ef4444' : c.priority === 'medium' ? '#f59e0b' : '#3b82f6'
                        }}></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span style={{ fontWeight: 800, color: '#1e293b' }}>{c.category.replace(/_/g, ' ').toUpperCase()}</span>
                            <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{new Date(c.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '0.9rem', color: '#64748b' }}>{c.description.substring(0, 100)}...</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">All caught up! No recent activity.</div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Status & Alerts */}
          <div className="dashboard-sidebar" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="premium-card chart-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '0.95rem', fontWeight: '800', marginBottom: '20px' }}>Status Breakdown</h3>
              <div style={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend verticalAlign="bottom" height={36} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="premium-card" style={{ padding: '24px', background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem' }}>💡 Quick Tip</h3>
              <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.6 }}>
                Issues marked as <b>High Priority</b> should be assigned to staff within 2 hours of submission for optimal campus satisfaction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
