/**
 * Reusable UI Components
 * - Card: Container component
 * - Badge: Status/Priority badges
 * - Timeline: Timeline display
 * - ProgressStepper: Multi-step progress indicator
 * - EmptyState: Empty state placeholder
 * - LoadingSpinner: Loading indicator
 */

import React from 'react';
import './UIComponents.css';

/**
 * Card Component - Reusable container with shadow and hover effects
 */
export const Card = ({ children, className = '', onClick, style = {} }) => (
  <div className={`ui-card ${className}`} onClick={onClick} style={style}>
    {children}
  </div>
);

/**
 * Badge Component - Status/Priority indicators
 */
export const Badge = ({ label, variant = 'info', size = 'md' }) => {
  const variants = {
    success: 'badge-success',
    error: 'badge-error',
    warning: 'badge-warning',
    info: 'badge-info',
    primary: 'badge-primary',
  };

  const sizes = {
    sm: 'badge-sm',
    md: 'badge-md',
    lg: 'badge-lg',
  };

  return (
    <span className={`ui-badge ${variants[variant]} ${sizes[size]}`}>
      {label}
    </span>
  );
};

/**
 * Status Badge Component - For complaint status
 */
export const StatusBadge = ({ status }) => {
  const statusConfig = {
    submitted: { variant: 'info', label: '📋 Submitted' },
    in_progress: { variant: 'warning', label: '⏳ In Progress' },
    resolved: { variant: 'success', label: '✅ Resolved' },
    closed: { variant: 'error', label: '❌ Closed' },
  };

  const config = statusConfig[status] || statusConfig.submitted;
  return <Badge label={config.label} variant={config.variant} />;
};

/**
 * Priority Badge Component
 */
export const PriorityBadge = ({ priority }) => {
  const priorityConfig = {
    high: { variant: 'error', label: '🔴 High' },
    medium: { variant: 'warning', label: '🟡 Medium' },
    low: { variant: 'success', label: '🟢 Low' },
  };

  const config = priorityConfig[priority] || priorityConfig.medium;
  return <Badge label={config.label} variant={config.variant} size="sm" />;
};

/**
 * Timeline Component - Display chronological events
 */
export const Timeline = ({ items = [] }) => (
  <div className="ui-timeline">
    {items.map((item, index) => (
      <div key={index} className="timeline-item">
        <div className="timeline-marker" />
        <div className="timeline-content">
          <div className="timeline-time">{item.time}</div>
          <div className="timeline-title">{item.title}</div>
          {item.description && (
            <div className="timeline-description">{item.description}</div>
          )}
        </div>
      </div>
    ))}
  </div>
);

/**
 * Progress Stepper Component - Multi-step progress indicator
 */
export const ProgressStepper = ({ steps = [], currentStep = 0 }) => (
  <div className="ui-stepper">
    <div className="stepper-track" />
    <div className="stepper-steps">
      {steps.map((step, index) => (
        <div
          key={index}
          className={`stepper-step ${
            index < currentStep ? 'completed' : index === currentStep ? 'active' : ''
          }`}
        >
          <div className="step-circle">{index + 1}</div>
          <div className="step-label">{step}</div>
        </div>
      ))}
    </div>
  </div>
);

/**
 * Empty State Component
 */
export const EmptyState = ({ icon = '📭', title, description, action }) => (
  <div className="ui-empty-state">
    <div className="empty-icon">{icon}</div>
    <h3>{title}</h3>
    <p>{description}</p>
    {action && <div className="empty-action">{action}</div>}
  </div>
);

/**
 * Loading Spinner Component
 */
export const LoadingSpinner = ({ size = 'md', fullScreen = false }) => (
  <div className={`ui-spinner ${size} ${fullScreen ? 'fullscreen' : ''}`}>
    <div className="spinner-circle" />
  </div>
);

/**
 * Stat Card Component - For dashboard statistics
 */
export const StatCard = ({ icon, label, value, trend, onClick }) => (
  <Card className="stat-card" onClick={onClick}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {trend && <div className="stat-trend">{trend}</div>}
  </Card>
);

/**
 * Alert Component
 */
export const Alert = ({ type = 'info', title, message, onClose }) => {
  const typeClasses = {
    info: 'alert-info',
    success: 'alert-success',
    warning: 'alert-warning',
    error: 'alert-error',
  };

  return (
    <div className={`ui-alert ${typeClasses[type]}`}>
      <div className="alert-content">
        <div className="alert-title">{title}</div>
        <p className="alert-message">{message}</p>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose}>
          ✕
        </button>
      )}
    </div>
  );
};

/**
 * Button Component
 */
export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  loading = false,
  className = '',
}) => {
  const variants = {
    primary: 'btn-primary',
    secondary: 'btn-secondary',
    danger: 'btn-danger',
    success: 'btn-success',
    ghost: 'btn-ghost',
  };

  const sizes = {
    sm: 'btn-sm',
    md: 'btn-md',
    lg: 'btn-lg',
  };

  return (
    <button
      className={`ui-button ${variants[variant]} ${sizes[size]} ${className}`}
      onClick={onClick}
      disabled={disabled || loading}
    >
      {loading ? '⏳ ' : ''}
      {children}
    </button>
  );
};

/**
 * Input Component
 */
export const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false,
  ...props
}) => (
  <div className="ui-form-group">
    {label && (
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
    )}
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`ui-input ${error ? 'error' : ''}`}
      {...props}
    />
    {error && <span className="form-error">{error}</span>}
  </div>
);

/**
 * Textarea Component
 */
export const Textarea = ({
  label,
  placeholder,
  value,
  onChange,
  error,
  required = false,
  rows = 4,
  maxLength,
  showCharCount = false,
  ...props
}) => (
  <div className="ui-form-group">
    {label && (
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
    )}
    <div className="textarea-wrapper">
      <textarea
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`ui-textarea ${error ? 'error' : ''}`}
        rows={rows}
        maxLength={maxLength}
        {...props}
      />
      {showCharCount && maxLength && (
        <div className="char-count">
          {value.length}/{maxLength}
        </div>
      )}
    </div>
    {error && <span className="form-error">{error}</span>}
  </div>
);

/**
 * Select Component
 */
export const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  required = false,
  ...props
}) => (
  <div className="ui-form-group">
    {label && (
      <label className="form-label">
        {label}
        {required && <span className="required">*</span>}
      </label>
    )}
    <select
      value={value}
      onChange={onChange}
      className={`ui-select ${error ? 'error' : ''}`}
      {...props}
    >
      <option value="">Select {label?.toLowerCase()}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <span className="form-error">{error}</span>}
  </div>
);

/**
 * Modal Component
 */
export const Modal = ({ isOpen, onClose, title, children, footer, size = 'md' }) => {
  if (!isOpen) return null;

  return (
    <div className="ui-modal-overlay" onClick={onClose}>
      <div
        className={`ui-modal modal-${size}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
};
