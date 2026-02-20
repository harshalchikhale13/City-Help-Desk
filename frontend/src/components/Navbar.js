/**
 * Navbar Component
 * Role-based navigation: student | staff | admin
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isStudent = user?.role === 'student';
  const isStaff = user?.role === 'staff';

  const roleBadgeColor = isAdmin ? '#ef4444' : isStaff ? '#f59e0b' : '#8b5cf6';
  const roleLabel = isAdmin ? 'Admin' : isStaff ? 'Staff' : 'Student';

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to={isAdmin ? '/admin' : '/dashboard'} className="navbar-logo">
          <span>🎓</span>
          <span className="navbar-logo-text">Campus-Help Desk</span>
        </Link>

        <div className={`nav-menu ${menuOpen ? 'active' : ''}`}>

          {/* Student & Staff Navigation */}
          {(isStudent || isStaff) && (
            <>
              <Link to="/dashboard" className="nav-link">
                📋 My Issues
              </Link>
              <Link to="/complaint/create" className="nav-link nav-link-primary">
                ✏️ Report Issue
              </Link>
            </>
          )}

          {/* Admin Navigation */}
          {isAdmin && (
            <>
              <Link to="/admin" className="nav-link nav-link-primary">
                🎛️ Dashboard
              </Link>
              <Link to="/admin/users" className="nav-link">
                👥 User Management
              </Link>
            </>
          )}

          <div className="nav-user">
            {/* Role Badge */}
            <span style={{
              background: roleBadgeColor,
              color: '#fff',
              padding: '2px 10px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.5px',
            }}>
              {roleLabel}
            </span>

            <Link to="/profile" className="nav-link">
              {user?.firstName || user?.username}
            </Link>
            <button className="btn-logout" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>

        <button
          className="hamburger"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          ☰
        </button>
      </div>
    </nav>
  );
}
