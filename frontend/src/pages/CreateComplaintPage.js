/**
 * CreateComplaintPage Component
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/CreateComplaint.css';

export default function CreateComplaintPage() {
  const [formData, setFormData] = useState({
    category: 'pothole',
    description: '',
    priority: 'medium',
    locationAddress: '',
    latitude: '28.7041',
    longitude: '77.1025',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const fileInputRef = useRef();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
        setFormData(prev => ({
          ...prev,
          imageUrl: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            latitude: position.coords.latitude.toFixed(8),
            longitude: position.coords.longitude.toFixed(8),
          }));
          toast.success('Location retrieved successfully');
        },
        (error) => {
          toast.error('Failed to get location: ' + error.message);
        }
      );
    } else {
      toast.error('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.category || !formData.description || !formData.locationAddress) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      // Convert coordinates to numbers
      const dataToSubmit = {
        category: formData.category,
        description: formData.description,
        priority: formData.priority,
        locationAddress: formData.locationAddress,
        latitude: parseFloat(formData.latitude) || 28.7041,
        longitude: parseFloat(formData.longitude) || 77.1025,
        imageUrl: formData.imageUrl || null
      };

      const response = await complaintAPI.createComplaint(dataToSubmit);
      toast.success('Complaint submitted successfully!');
      navigate(`/complaint/${response.data.data.complaint_id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit complaint';
      toast.error(message);
      console.error('Error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-complaint-container">
      <div className="create-complaint-card">
        <h1>📋 Report New Issue</h1>

        <form onSubmit={handleSubmit} className="complaint-form">
          <div className="form-group">
            <label htmlFor="category">
              Category <span className="required">*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
            >
              <option value="pothole">Pothole</option>
              <option value="streetlight">Street Light</option>
              <option value="water_supply">Water Supply</option>
              <option value="electricity">Electricity</option>
              <option value="drainage">Drainage</option>
              <option value="garbage">Garbage</option>
              <option value="public_safety">Public Safety</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="description">
              Description <span className="required">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Describe the issue in detail..."
              rows="5"
              required
            ></textarea>
            <small>{formData.description.length}/1000 characters</small>
          </div>

          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="locationAddress">
              Location Address <span className="required">*</span>
            </label>
            <input
              type="text"
              id="locationAddress"
              name="locationAddress"
              value={formData.locationAddress}
              onChange={handleInputChange}
              placeholder="Enter the location address"
              required
            />
          </div>

          <div className="form-group">
            <label>
              Coordinates <span style={{ color: '#999' }}>(Optional)</span>
            </label>
            <div className="coordinates">
              <input
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                placeholder="Latitude"
                step="0.00000001"
              />
              <input
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                placeholder="Longitude"
                step="0.00000001"
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={getCurrentLocation}
              >
                📍 Use Current Location
              </button>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="image">Upload Image (Optional)</label>
            <div className="file-upload">
              <input
                type="file"
                id="image"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                hidden
              />
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => fileInputRef.current.click()}
              >
                📸 Choose Image
              </button>
              {previewImage && (
                <div className="image-preview">
                  <img src={previewImage} alt="Preview" />
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData(prev => ({ ...prev, imageUrl: '' }));
                    }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-large"
            disabled={loading}
          >
            {loading ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </form>
      </div>
    </div>
  );
}
