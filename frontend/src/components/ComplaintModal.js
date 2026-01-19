/**
 * ComplaintModal Component
 * Multi-step form for filing new complaints with AI-powered suggestions
 */

import React, { useState, useEffect } from 'react';
import {
  Modal,
  Input,
  Textarea,
  Select,
  Button,
  Alert,
  ProgressStepper,
  PriorityBadge,
  LoadingSpinner,
} from './UIComponents';
import complaintAIService from '../services/complaintAIService';
import './ComplaintModal.css';

const ComplaintModal = ({ isOpen, onClose, onSubmit, token }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
    locationAddress: '',
    latitude: '',
    longitude: '',
    imageUrl: '',
  });

  const [aiSuggestions, setAiSuggestions] = useState({
    category: null,
    priority: null,
    department: null,
    summary: null,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const categories = [
    { value: 'Garbage', label: '♻️ Garbage' },
    { value: 'Road', label: '🛣️ Road' },
    { value: 'Water', label: '💧 Water' },
    { value: 'Electricity', label: '⚡ Electricity' },
    { value: 'Drainage', label: '🚰 Drainage' },
    { value: 'Public_Safety', label: '🚨 Public Safety' },
  ];

  const priorityOptions = [
    { value: 'low', label: '🟢 Low' },
    { value: 'medium', label: '🟡 Medium' },
    { value: 'high', label: '🔴 High' },
  ];

  /**
   * Handle input change and trigger AI suggestions
   */
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // Clear validation error for this field
    if (validationErrors[name]) {
      setValidationErrors({ ...validationErrors, [name]: '' });
    }

    // Trigger AI suggestions when description or title changes
    if ((name === 'description' || name === 'title') && newFormData.description.length > 20) {
      const suggestions = complaintAIService.analyzeComplaint({
        title: newFormData.title,
        description: newFormData.description,
        category: newFormData.category,
      });

      setAiSuggestions({
        category: suggestions.category,
        priority: suggestions.priority,
        department: suggestions.department,
        summary: suggestions.summary,
      });
    }
  };

  /**
   * Validate current step
   */
  const validateStep = () => {
    const errors = {};

    if (step === 1) {
      if (!formData.title.trim()) errors.title = 'Title is required';
      if (!formData.description.trim()) errors.description = 'Description is required';
      if (formData.description.length < 20)
        errors.description = 'Description must be at least 20 characters';
      if (!formData.category) errors.category = 'Category is required';
      if (!formData.priority) errors.priority = 'Priority is required';
    } else if (step === 2) {
      if (!formData.locationAddress.trim()) errors.locationAddress = 'Location is required';
      if (!formData.latitude) errors.latitude = 'Latitude is required';
      if (!formData.longitude) errors.longitude = 'Longitude is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Move to next step
   */
  const handleNextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  /**
   * Move to previous step
   */
  const handlePrevStep = () => {
    setStep(step - 1);
  };

  /**
   * Accept AI suggestion
   */
  const acceptSuggestion = (field) => {
    if (field === 'category' && aiSuggestions.category) {
      setFormData({ ...formData, category: aiSuggestions.category });
    } else if (field === 'priority' && aiSuggestions.priority) {
      setFormData({ ...formData, priority: aiSuggestions.priority });
    }
  };

  /**
   * Detect current location
   */
  const handleDetectLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData({
            ...formData,
            latitude: position.coords.latitude.toFixed(6),
            longitude: position.coords.longitude.toFixed(6),
          });
          setLoading(false);
        },
        () => {
          setError('Could not get your location');
          setLoading(false);
        }
      );
    }
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateStep()) return;

    setLoading(true);
    setError(null);

    try {
      // Call onSubmit callback (parent handles API call)
      await onSubmit(formData);
      setSuccess(true);

      // Reset form after success
      setTimeout(() => {
        resetForm();
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Reset form to initial state
   */
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      priority: '',
      locationAddress: '',
      latitude: '',
      longitude: '',
      imageUrl: '',
    });
    setAiSuggestions({
      category: null,
      priority: null,
      department: null,
      summary: null,
    });
    setValidationErrors({});
    setStep(1);
    setError(null);
    setSuccess(false);
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    resetForm();
    onClose();
  };

  const steps = ['Complaint Details', 'Location', 'Review & Submit'];

  const footerButtons = (
    <div className="modal-footer-buttons">
      {step > 1 && (
        <Button variant="secondary" onClick={handlePrevStep} disabled={loading}>
          ← Back
        </Button>
      )}
      {step < 3 ? (
        <Button variant="primary" onClick={handleNextStep} loading={loading}>
          Next →
        </Button>
      ) : (
        <Button variant="success" onClick={handleSubmit} loading={loading}>
          🚀 Submit Complaint
        </Button>
      )}
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="📝 Report New Issue"
      size="lg"
      footer={footerButtons}
    >
      {success && (
        <Alert
          type="success"
          title="Success!"
          message="Your complaint has been submitted successfully. We'll get back to you soon!"
        />
      )}

      {error && (
        <Alert
          type="error"
          title="Error"
          message={error}
          onClose={() => setError(null)}
        />
      )}

      <ProgressStepper steps={steps} currentStep={step - 1} />

      <form className="complaint-form">
        {/* Step 1: Complaint Details */}
        {step === 1 && (
          <div className="form-step active">
            <h3>📋 Complaint Details</h3>

            <Input
              label="Title"
              placeholder="Brief title of the issue"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              error={validationErrors.title}
              required
            />

            <Textarea
              label="Description"
              placeholder="Describe the issue in detail..."
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              error={validationErrors.description}
              required
              maxLength={500}
              showCharCount
              rows={5}
            />

            {/* AI Suggestions */}
            {aiSuggestions.category && (
              <div className="ai-suggestions">
                <h4>🤖 AI Suggestions</h4>

                {aiSuggestions.category && (
                  <div className="suggestion-item">
                    <div className="suggestion-label">Suggested Category:</div>
                    <div className="suggestion-value">
                      <span>{aiSuggestions.category}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => acceptSuggestion('category')}
                      >
                        ✓ Accept
                      </Button>
                    </div>
                  </div>
                )}

                {aiSuggestions.priority && (
                  <div className="suggestion-item">
                    <div className="suggestion-label">Suggested Priority:</div>
                    <div className="suggestion-value">
                      <PriorityBadge priority={aiSuggestions.priority} />
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => acceptSuggestion('priority')}
                      >
                        ✓ Accept
                      </Button>
                    </div>
                  </div>
                )}

                {aiSuggestions.department && (
                  <div className="suggestion-item">
                    <div className="suggestion-label">Will be assigned to:</div>
                    <div className="suggestion-value">
                      {aiSuggestions.department.dept}
                    </div>
                  </div>
                )}
              </div>
            )}

            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              options={categories}
              error={validationErrors.category}
              required
            />

            <Select
              label="Priority"
              name="priority"
              value={formData.priority}
              onChange={handleInputChange}
              options={priorityOptions}
              error={validationErrors.priority}
              required
            />
          </div>
        )}

        {/* Step 2: Location */}
        {step === 2 && (
          <div className="form-step active">
            <h3>📍 Location Details</h3>

            <Input
              label="Address"
              placeholder="Enter the location address"
              name="locationAddress"
              value={formData.locationAddress}
              onChange={handleInputChange}
              error={validationErrors.locationAddress}
              required
            />

            <div className="location-actions">
              <Button
                variant="secondary"
                onClick={handleDetectLocation}
                disabled={loading}
              >
                📍 Detect My Location
              </Button>
            </div>

            <div className="coordinates">
              <Input
                label="Latitude"
                type="number"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                error={validationErrors.latitude}
                step="0.00001"
                placeholder="Auto-filled"
              />

              <Input
                label="Longitude"
                type="number"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                error={validationErrors.longitude}
                step="0.00001"
                placeholder="Auto-filled"
              />
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="form-step active">
            <h3>✓ Review Your Complaint</h3>

            <div className="review-section">
              <div className="review-item">
                <label>Title:</label>
                <p>{formData.title}</p>
              </div>

              <div className="review-item">
                <label>Category:</label>
                <p>{formData.category}</p>
              </div>

              <div className="review-item">
                <label>Priority:</label>
                <p>
                  <PriorityBadge priority={formData.priority} />
                </p>
              </div>

              <div className="review-item">
                <label>Location:</label>
                <p>
                  {formData.locationAddress}
                  <br />
                  <small>
                    ({formData.latitude}, {formData.longitude})
                  </small>
                </p>
              </div>

              <div className="review-item">
                <label>Description:</label>
                <p>{formData.description}</p>
              </div>

              {aiSuggestions.department && (
                <div className="review-item">
                  <label>Will be processed by:</label>
                  <p>{aiSuggestions.department.dept}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </form>

      {loading && <LoadingSpinner size="lg" />}
    </Modal>
  );
};

export default ComplaintModal;
