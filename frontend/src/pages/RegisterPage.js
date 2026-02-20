/**
 * RegisterPage Component
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { validatePassword, validateEmail } from '../utils/helpers';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    role: 'student',
  });
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!validateEmail(formData.email)) {
      toast.error('Invalid email address');
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await userAPI.register({
        username: formData.username,
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: formData.role,
      });

      const { data, token } = response.data.data;
      login(data, token);
      toast.success('Registration successful! Welcome to Campus-Help Desk.');
      // Both student and staff go to their dashboard
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Static chart data for visual consistency
  const chartData = [
    { name: 'Mon', solved: 45, pending: 24 },
    { name: 'Tue', solved: 52, pending: 18 },
    { name: 'Wed', solved: 38, pending: 20 },
    { name: 'Thu', solved: 65, pending: 15 },
    { name: 'Fri', solved: 48, pending: 12 },
  ];

  return (
    <div className="login-page-container">
      {/* Left Hero Section */}
      <div className="login-hero-section">
        <div className="hero-content">
          <h1>Join Our <br /> <span className="highlight-text">Campus Community.</span></h1>
          <p className="hero-subtitle">
            Sign up to report issues instantly, track resolutions in real-time, and make your voice heard for a better campus environment.
          </p>

          <div className="hero-stats-card">
            <div className="chart-header">
              <h3>Impact Overview</h3>
              <div className="live-indicator">
                <span className="dot"></span> Live Data
              </div>
            </div>

            {/* Recharts Graph Visualization */}
            <div style={{ width: '100%', height: 160 }}>
              <div className="mock-graph">
                {chartData.map((d, i) => (
                  <div key={i} className="graph-bar-group">
                    <div className="bar-fill solved" style={{ height: `${d.solved}%` }}></div>
                    <div className="bar-fill pending" style={{ height: `${d.pending}%` }}></div>
                    <span className="bar-label">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="stats-row">
              <div className="stat-item">
                <span className="stat-value">1200+</span>
                <span className="stat-label">Active Students</span>
              </div>
              <div className="stat-item">
                <span className="stat-value">98%</span>
                <span className="stat-label">Resolution Rate</span>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-overlay"></div>
      </div>

      {/* Right Form Section */}
      <div className="login-form-section">
        <div className="login-card" style={{ maxWidth: '100%' }}>
          <div className="login-header" style={{ marginBottom: '20px' }}>
            <div className="logo-icon" style={{ fontSize: '3rem' }}>🎓</div>
            <h2>Create Account</h2>
            <p>Get started with Campus-Help Desk</p>
          </div>

          <form onSubmit={handleSubmit} className="login-form" style={{ gap: '20px' }}>

            {/* Name Row */}
            <div className="form-row-modern">
              <div className="form-group-modern">
                <label htmlFor="firstName">First Name</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="First name"
                  required
                />
              </div>
              <div className="form-group-modern">
                <label htmlFor="lastName">Last Name</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Last name"
                  required
                />
              </div>
            </div>

            {/* Username & Phone Row */}
            <div className="form-row-modern">
              <div className="form-group-modern">
                <label htmlFor="username">Username</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="Username"
                  required
                />
              </div>
              <div className="form-group-modern">
                <label htmlFor="phone">Phone (Optional)</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Mobile number"
                />
              </div>
            </div>

            <div className="form-group-modern">
              <label htmlFor="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@college.edu"
                required
              />
            </div>

            {/* Password Row */}
            <div className="form-row-modern">
              <div className="form-group-modern">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div className="form-group-modern">
                <label htmlFor="confirmPassword">Confirm</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {/* Role Selection */}
            <div className="form-group-modern">
              <label>I am joining as</label>
              <div style={{ display: 'flex', gap: '12px' }}>
                {[
                  { value: 'student', label: '🎓 Student', desc: 'Report campus issues' },
                  { value: 'staff', label: '👔 Staff', desc: 'Report & track issues' },
                ].map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => setFormData(p => ({ ...p, role: opt.value }))}
                    style={{
                      flex: 1,
                      padding: '14px',
                      border: formData.role === opt.value ? '2px solid #8b5cf6' : '2px solid #e5e7eb',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: formData.role === opt.value ? '#f5f3ff' : '#f9fafb',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                    }}
                  >
                    <div style={{ fontSize: '1.5rem', marginBottom: '4px' }}>{opt.label.split(' ')[0]}</div>
                    <div style={{ fontWeight: 700, color: formData.role === opt.value ? '#8b5cf6' : '#374151', fontSize: '0.95rem' }}>
                      {opt.label.split(' ').slice(1).join(' ')}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#6b7280', marginTop: '2px' }}>{opt.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <button type="submit" className="btn-modern-primary" disabled={loading}>
              {loading ? 'Creating Account...' : `Sign Up as ${formData.role === 'student' ? 'Student' : 'Staff'}`}
            </button>
          </form>

          <div className="login-footer">
            <p>
              Already have an account?
              <Link to="/login" className="link-modern">
                Login here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
