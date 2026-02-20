/**
 * App.js
 * Main React component with routing
 * Roles: student | staff | admin
 */
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ComplaintDetailPage from './pages/ComplaintDetailPage';
import CreateComplaintPage from './pages/CreateComplaintPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import UserManagementPage from './pages/UserManagementPage';
import AdminIssueManagementPage from './pages/AdminIssueManagementPage';
import AdminAnalyticsPage from './pages/AdminAnalyticsPage';
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Layouts
import Sidebar from './components/Sidebar';
import AIChatbot from './components/AIChatbot';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect admins to admin page, others to dashboard
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} />;
  }

  return children;
};

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="app">
      {isAuthenticated && <Sidebar />}

      <main className="main-content">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
          <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={<ProtectedRoute allowedRoles={['student', 'staff', 'admin']}><DashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/complaint/create"
            element={<ProtectedRoute allowedRoles={['student', 'staff']}><CreateComplaintPage /></ProtectedRoute>}
          />
          <Route
            path="/complaint/:id"
            element={<ProtectedRoute><ComplaintDetailPage /></ProtectedRoute>}
          />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboardPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/users"
            element={<ProtectedRoute allowedRoles={['admin']}><UserManagementPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/issues"
            element={<ProtectedRoute allowedRoles={['admin']}><AdminIssueManagementPage /></ProtectedRoute>}
          />
          <Route
            path="/admin/analytics"
            element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalyticsPage /></ProtectedRoute>}
          />

          <Route
            path="/profile"
            element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
          />

          <Route path="/" element={
            isAuthenticated
              ? (user?.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />)
              : <Navigate to="/login" />
          } />

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>

      {/* Global Components */}
      {isAuthenticated && <AIChatbot />}
      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
