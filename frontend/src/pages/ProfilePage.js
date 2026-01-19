/**
 * ProfilePage Component
 */
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { userAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/Profile.css';

export default function ProfilePage() {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
      setLoading(false);
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const response = await userAPI.updateProfile(formData);
      
      // Update auth context with new user data
      const updatedUser = {
        ...user,
        firstName: response.data.data.first_name,
        lastName: response.data.data.last_name,
        phone: response.data.data.phone,
      };

      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <h1>👤 My Profile</h1>

        <div className="profile-section">
          <h3>Account Information</h3>
          <div className="info-item">
            <label>Username:</label>
            <p>{user?.username}</p>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <p>{user?.email}</p>
          </div>
          <div className="info-item">
            <label>Role:</label>
            <p className="role-badge">{user?.role.replace('_', ' ').toUpperCase()}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="profile-form">
          <h3>Edit Profile</h3>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="phone">Phone</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={updating}
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </div>
    </div>
  );
}
