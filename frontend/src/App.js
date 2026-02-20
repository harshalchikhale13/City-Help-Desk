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
import ProfilePage from './pages/ProfilePage';
import NotFoundPage from './pages/NotFoundPage';

// Layouts
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Protected Route Component
const ProtectedRoute = ({ element, allowedRoles = [] }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    // Redirect admins to admin page, others to dashboard
    return <Navigate to={user?.role === 'admin' ? '/admin' : '/dashboard'} />;
  }

  return element;
};

function AppContent() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <div className="loading-spinner">Loading...</div>;
  }

  return (
    <div className="app">
      {isAuthenticated && <Navbar />}

      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Student & Staff Routes */}
        <Route
          path="/dashboard"
          element={<ProtectedRoute element={<DashboardPage />} allowedRoles={['student', 'staff']} />}
        />
        <Route
          path="/complaint/create"
          element={<ProtectedRoute element={<CreateComplaintPage />} allowedRoles={['student', 'staff']} />}
        />
        <Route
          path="/complaint/:id"
          element={<ProtectedRoute element={<ComplaintDetailPage />} />}
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={<ProtectedRoute element={<AdminDashboardPage />} allowedRoles={['admin']} />}
        />
        <Route
          path="/admin/users"
          element={<ProtectedRoute element={<UserManagementPage />} allowedRoles={['admin']} />}
        />

        {/* Profile (all roles) */}
        <Route
          path="/profile"
          element={<ProtectedRoute element={<ProfilePage />} />}
        />

        {/* Default redirect based on role */}
        <Route path="/" element={
          isAuthenticated
            ? user?.role === 'admin'
              ? <Navigate to="/admin" />
              : <Navigate to="/dashboard" />
            : <Navigate to="/login" />
        } />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {isAuthenticated && <Footer />}
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
