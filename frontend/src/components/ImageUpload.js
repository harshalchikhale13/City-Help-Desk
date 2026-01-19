/**
 * Image Upload Component
 * Handles image uploads for complaints with preview and validation
 */

import React, { useState, useRef } from 'react';
import './ImageUpload.css';

const ImageUpload = ({ onImagesChange, maxImages = 3, maxSize = 5242880 }) => {
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    
    if (!validTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid file type. Only JPEG, PNG, GIF, WebP allowed.' };
    }
    
    if (file.size > maxSize) {
      return { valid: false, error: `File size exceeds ${maxSize / 1024 / 1024}MB limit` };
    }
    
    return { valid: true };
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    const newErrors = [];
    const validFiles = [];

    // Check image count
    if (images.length + files.length > maxImages) {
      newErrors.push(`Maximum ${maxImages} images allowed`);
      setErrors(newErrors);
      return;
    }

    // Validate each file
    files.forEach(file => {
      const validation = validateFile(file);
      if (validation.valid) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const newImage = {
            id: Date.now() + Math.random(),
            name: file.name,
            size: file.size,
            data: event.target.result, // base64
            type: file.type
          };
          setImages(prev => {
            const updated = [...prev, newImage];
            onImagesChange(updated);
            return updated;
          });
        };
        reader.readAsDataURL(file);
      } else {
        newErrors.push(validation.error);
      }
    });

    setErrors(newErrors);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveImage = (id) => {
    const updated = images.filter(img => img.id !== id);
    setImages(updated);
    onImagesChange(updated);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    const files = e.dataTransfer.files;
    handleFileSelect({ target: { files } });
  };

  return (
    <div className="image-upload-container">
      <div className="upload-section">
        <div
          className="upload-area"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-content">
            <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <h3>Upload Images</h3>
            <p>Drag and drop images here or click to browse</p>
            <small>Max {maxImages} images, {maxSize / 1024 / 1024}MB each</small>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>

        <button
          className="upload-button"
          onClick={() => fileInputRef.current?.click()}
          disabled={images.length >= maxImages}
        >
          Choose Files
        </button>
      </div>

      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, idx) => (
            <div key={idx} className="error-message">
              ⚠️ {error}
            </div>
          ))}
        </div>
      )}

      {images.length > 0 && (
        <div className="image-preview-grid">
          <h4>Uploaded Images ({images.length}/{maxImages})</h4>
          <div className="preview-grid">
            {images.map((image) => (
              <div key={image.id} className="preview-item">
                <img src={image.data} alt={image.name} />
                <div className="image-info">
                  <div className="image-name">{image.name}</div>
                  <div className="image-size">{(image.size / 1024).toFixed(0)} KB</div>
                </div>
                <button
                  className="remove-button"
                  onClick={() => handleRemoveImage(image.id)}
                  title="Remove image"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
