/**
 * LoginPage Component
 */
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/Auth.css';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Attempting login with:', { email, password: '***' });
      const response = await userAPI.login(email, password);
      console.log('Full response:', response);
      console.log('response.data:', response.data);
      console.log('response.data.data:', response.data.data);
      
      if (!response.data.data) {
        throw new Error('Invalid response structure');
      }
      
      const { user, token } = response.data.data;
      console.log('Extracted user:', user);
      console.log('Extracted token:', token ? 'present' : 'missing');

      if (!user || !token) {
        throw new Error('Missing user or token in response');
      }

      login(user, token);
      toast.success('Login successful!');
      
      // Redirect based on role
      if (user.role === 'admin' || user.role === 'department_officer') {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Login error full:', error);
      console.error('Error message:', error.message);
      console.error('Error response:', error.response);
      const message = error.message || error.response?.data?.message || 'Login failed';
      console.error('Final error message:', message);
      try {
        toast.error(message);
      } catch (toastError) {
        console.error('Toast error:', toastError);
        alert(message);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>🏛️ City-Help Desk</h1>
          <h2>Login</h2>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to="/register" className="link">
              Register here
            </Link>
          </p>
        </div>

        {/* Demo credentials */}
        <div className="demo-credentials">
          <p><strong>Demo Credentials:</strong></p>
          <p>Citizen: citizen@example.com / Password123!</p>
          <p>Admin: admin@example.com / Password123!</p>
          <p>Officer: officer@example.com / Password123!</p>
        </div>
      </div>
    </div>
  );
}
