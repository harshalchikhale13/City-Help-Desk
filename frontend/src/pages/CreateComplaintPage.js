/**
 * CreateComplaintPage Component
 */
import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { complaintAPI, aiAPI } from '../services/api';
import { toast } from 'react-toastify';
import '../styles/CreateComplaint.css';

export default function CreateComplaintPage() {
  const [formData, setFormData] = useState({
    category: '',
    description: '',
    priority: 'medium',
    studentId: '', // Ideally pre-filled from user context if available
    department: '',
    buildingName: '',
    roomNumber: '',
    issueLocation: 'Classroom',
    imageUrl: '',
    customCategory: '',
  });

  const [loading, setLoading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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

  const handleAIAnalyze = async () => {
    if (!formData.description || formData.description.length < 5) {
      toast.info('Please describe the issue first!');
      return;
    }

    setIsAnalyzing(true);
    try {
      const res = await aiAPI.analyze({ description: formData.description });
      const { category, priority } = res.data.data;

      setFormData(prev => ({
        ...prev,
        category: category !== 'other' ? category : prev.category,
        priority: priority
      }));

      toast.success(`AI Detect: ${category.replace('_', ' ')} (${priority} priority)`);
    } catch (err) {
      console.error(err);
      toast.error('AI Analysis unable to complete');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.category || !formData.description || !formData.issueLocation || !formData.studentId) {
        toast.error('Please fill all required fields');
        setLoading(false);
        return;
      }

      const dataToSubmit = {
        category: formData.category === 'other' ? formData.customCategory : formData.category,
        description: formData.description,
        priority: formData.priority,
        studentId: formData.studentId,
        department: formData.department,
        buildingName: formData.buildingName,
        roomNumber: formData.roomNumber,
        issueLocation: formData.issueLocation,
        imageUrl: formData.imageUrl || null
      };

      const response = await complaintAPI.createComplaint(dataToSubmit);
      toast.success('Issue reported successfully!');
      navigate(`/complaint/${response.data.data.complaint_id}`);
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to submit issue';
      toast.error(message);
      console.error('Error:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container" style={{ padding: '32px 40px' }}>
      <div className="page-header" style={{ marginBottom: '32px' }}>
        <h1 style={{
          fontSize: '2rem',
          fontWeight: '800',
          color: 'var(--text-primary)',
          marginBottom: '8px',
          background: 'linear-gradient(135deg, #ef4444 0%, #8b5cf6 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Report Campus Issue
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
          Submit a new issue for campus maintenance or support.
        </p>
      </div>

      <div className="create-complaint-card" style={{ maxWidth: '800px', margin: '0', background: 'white', padding: '32px', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)' }}>
        <form onSubmit={handleSubmit} className="complaint-form">

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div className="form-group">
              <label htmlFor="studentId" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Student ID <span className="required" style={{ color: '#ef4444' }}>*</span>
              </label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                value={formData.studentId}
                onChange={handleInputChange}
                placeholder="e.g. STU-2024-001"
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="department" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Department</label>
              <input
                type="text"
                id="department"
                name="department"
                value={formData.department}
                onChange={handleInputChange}
                placeholder="e.g. Computer Science"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label htmlFor="description" style={{ fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Issue Description <span className="required" style={{ color: '#ef4444' }}>*</span>
              </label>
              <button
                type="button"
                onClick={handleAIAnalyze}
                disabled={isAnalyzing}
                style={{
                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '20px',
                  padding: '4px 12px',
                  fontSize: '0.75rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  opacity: isAnalyzing ? 0.7 : 1
                }}
              >
                {isAnalyzing ? 'Analyzing...' : '✨ AI Auto-Fill'}
              </button>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              onBlur={() => { if (formData.description.length > 10 && !formData.category) handleAIAnalyze(); }}
              placeholder="Describe the issue in detail..."
              rows="3"
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontFamily: 'inherit' }}
            ></textarea>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <small style={{ color: 'var(--text-tertiary)', fontSize: '0.8rem' }}>{formData.description.length}/1000 characters</small>
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="category" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              Issue Category <span className="required" style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              required
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', background: 'white' }}
            >
              <option value="" disabled>Select a category</option>
              <option value="hostel_issues">Hostel Issues</option>
              <option value="classroom_issues">Classroom Issues</option>
              <option value="laboratory_issues">Laboratory Issues</option>
              <option value="it_support">IT Support</option>
              <option value="library_issues">Library Issues</option>
              <option value="campus_infrastructure">Campus Infrastructure</option>
              <option value="campus_safety">Campus Safety & Security</option>
              <option value="electrical_issues">Electrical Issues</option>
              <option value="cleaning_issues">Cleaning/Housekeeping</option>
              <option value="other">Other</option>
            </select>

            {formData.category === 'other' && (
              <input
                type="text"
                name="customCategory"
                value={formData.customCategory || ''}
                onChange={handleInputChange}
                placeholder="Please specify the category"
                className="mt-2"
                style={{ marginTop: '8px', width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                required
              />
            )}
          </div>

          <div className="form-row" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '16px' }}>
            <div className="form-group">
              <label htmlFor="issueLocation" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                Location Type <span className="required" style={{ color: '#ef4444' }}>*</span>
              </label>
              <select
                id="issueLocation"
                name="issueLocation"
                value={formData.issueLocation}
                onChange={handleInputChange}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', background: 'white' }}
              >
                <option value="Classroom">Classroom</option>
                <option value="Hostel">Hostel</option>
                <option value="Laboratory">Laboratory</option>
                <option value="Library">Library</option>
                <option value="Common Area">Common Area</option>
                <option value="Office">Office</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="buildingName" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Building Name</label>
              <input
                type="text"
                id="buildingName"
                name="buildingName"
                value={formData.buildingName}
                onChange={handleInputChange}
                placeholder="e.g. Block A"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
              />
            </div>

            <div className="form-group">
              <label htmlFor="roomNumber" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Room Number</label>
              <input
                type="text"
                id="roomNumber"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleInputChange}
                placeholder="e.g. 101"
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
              />
            </div>
          </div>

          <div className="form-group" style={{ marginBottom: '16px' }}>
            <label htmlFor="priority" style={{ display: 'block', marginBottom: '6px', fontWeight: '500', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Priority</label>
            <select
              id="priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.9rem', background: 'white' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div className="form-group" style={{ marginBottom: '32px' }}>
            <label htmlFor="image" style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: 'var(--text-secondary)' }}>Upload Image (Optional)</label>
            <div className="file-upload" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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
                className="btn-secondary"
                onClick={() => fileInputRef.current.click()}
                style={{ padding: '8px 16px', background: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', color: '#475569' }}
              >
                📸 Choose Image
              </button>
              {previewImage && (
                <div className="image-preview" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '4px', borderRadius: '6px' }}>
                  <img src={previewImage} alt="Preview" style={{ height: '50px', borderRadius: '4px' }} />
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData(prev => ({ ...prev, imageUrl: '' }));
                    }}
                    style={{ marginLeft: '8px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '1.2rem' }}
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="form-actions" style={{ display: 'flex', gap: '16px' }}>
            <button
              type="submit"
              className="btn-submit"
              disabled={loading}
              style={{
                background: 'linear-gradient(135deg, #ef4444 0%, #8b5cf6 100%)',
                color: 'white',
                border: 'none',
                padding: '12px 32px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.3)',
                transition: 'transform 0.2s'
              }}
            >
              {loading ? 'Submitting...' : 'Submit Issue'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/dashboard')}
              style={{
                background: 'white',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                padding: '12px 24px',
                borderRadius: '8px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
