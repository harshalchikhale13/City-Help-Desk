import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/AdminDashboard.css';
import api from '../services/api';
import {
    PieChart, Pie, BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell,
    AreaChart, Area
} from 'recharts';

const AdminAnalyticsPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [systemStats, setSystemStats] = useState(null);
    const [userStats, setUserStats] = useState({ student: 0, staff: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user && user.role === 'admin') {
            fetchAnalyticsData();
        }
    }, [user]);

    const fetchAnalyticsData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes] = await Promise.all([
                api.get('/complaints/stats/overview'),
                api.get('/users')
            ]);

            setSystemStats(statsRes.data.data || {});
            const allUsers = usersRes.data.data.users || [];
            setUserStats({
                student: allUsers.filter(u => u.role === 'student').length,
                staff: allUsers.filter(u => u.role === 'staff').length
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching analytics:', err);
            setError('Failed to load deep-dive analytics');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Generating Deep-Dive Reports...</p>
            </div>
        );
    }

    const roleDistribution = [
        { name: 'Students', value: userStats.student, fill: '#3b82f6' },
        { name: 'Staff', value: userStats.staff, fill: '#8b5cf6' }
    ];

    const priorityData = systemStats ? Object.entries(systemStats.byPriority || {}).map(([key, value]) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value,
        fill: key === 'high' ? '#ef4444' : key === 'medium' ? '#f59e0b' : '#3b82f6'
    })) : [];

    const categoryData = systemStats ? Object.entries(systemStats.byCategory || {}).map(([key, value]) => ({
        name: key.replace(/_/g, ' '),
        value
    })).sort((a, b) => b.value - a.value) : [];

    return (
        <div className="admin-dashboard fade-in">
            <header className="page-header header-admin" style={{ padding: '20px 40px', background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)' }}>
                <div className="header-accent-dot" style={{ background: '#f59e0b' }}></div>
                <div className="page-header-inner">
                    <div>
                        <h1 style={{ fontSize: '1.8rem', color: '#fff' }}>📈 System Insights</h1>
                        <p style={{ fontSize: '0.9rem', color: '#cbd5e1' }}>Detailed analytical breakdown of campus operations and user engagement</p>
                    </div>
                    <div className="header-actions">
                        <button className="btn btn-secondary" onClick={() => window.print()} style={{ padding: '8px 16px', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', color: '#fff' }}>
                            🖨️ Export PDF
                        </button>
                    </div>
                </div>
            </header>

            <div className="page-content" style={{ marginTop: '20px' }}>
                {error && <div className="error-message">{error}</div>}

                <div className="analytics-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

                    {/* 1. Category Breakdown */}
                    <div className="premium-card chart-card" style={{ gridColumn: 'span 2', padding: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                            <h3 style={{ margin: 0, fontWeight: '800' }}>Issue Volume by Category</h3>
                            <span style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 600, background: '#eef2ff', padding: '4px 12px', borderRadius: '20px' }}>Total Categories: {categoryData.length}</span>
                        </div>
                        <div style={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={categoryData} layout="vertical" margin={{ left: 100 }}>
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                                    <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 11 }} />
                                    <YAxis
                                        dataKey="name"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 700, fill: '#1e293b' }}
                                    />
                                    <Tooltip cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }} contentStyle={{ borderRadius: '12px', border: 'none' }} />
                                    <Bar dataKey="value" fill="#6366f1" radius={[0, 10, 10, 0]} barSize={25}>
                                        {categoryData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={index < 3 ? '#6366f1' : '#a5b4fc'} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 2. Priority & Role Distribution Row */}
                    <div className="premium-card chart-card">
                        <h3 style={{ marginBottom: '20px', fontWeight: '800' }}>Severity Distribution</h3>
                        <div style={{ height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={priorityData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {priorityData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" align="center" iconType="diamond" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="premium-card chart-card">
                        <h3 style={{ marginBottom: '20px', fontWeight: '800' }}>User Base Composition</h3>
                        <div style={{ height: 250 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={roleDistribution}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={90}
                                        paddingAngle={8}
                                        dataKey="value"
                                    >
                                        {roleDistribution.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.fill} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend verticalAlign="bottom" align="center" iconType="circle" />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* 3. Placeholder for Resolution Timeline */}
                    <div className="premium-card" style={{ gridColumn: 'span 2', padding: '30px', background: 'linear-gradient(to right, #6366f1, #8b5cf6)', color: '#fff', textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '10px' }}>🚀 System Performance Metrics</h2>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginTop: '30px' }}>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>94%</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Resolution Rate</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>2.4d</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>Avg. Response Time</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '2rem', fontWeight: 800 }}>4.8★</div>
                                <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>User Satisfaction</div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default AdminAnalyticsPage;
