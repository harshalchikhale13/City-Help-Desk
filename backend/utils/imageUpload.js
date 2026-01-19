/**
 * Image Upload Utilities
 * Handles image uploads for complaints and attachments
 */

const fs = require('fs');
const path = require('path');

// Image upload configuration
const UPLOAD_DIR = path.join(__dirname, '../uploads/complaints');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

// Ensure upload directory exists
function ensureUploadDir() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

/**
 * Validate image file
 */
function validateImageFile(file) {
  const errors = [];

  if (!file) {
    errors.push('No file provided');
  } else {
    if (!ALLOWED_TYPES.includes(file.mimetype)) {
      errors.push(`Invalid file type. Allowed: ${ALLOWED_TYPES.join(', ')}`);
    }
    if (file.size > MAX_FILE_SIZE) {
      errors.push(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate unique filename for uploaded image
 */
function generateFileName(originalName) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = path.extname(originalName);
  return `complaint_${timestamp}_${random}${ext}`;
}

/**
 * Save uploaded image to disk
 * Returns: { success: boolean, filename: string, path: string, error?: string }
 */
function saveImageFile(file) {
  ensureUploadDir();

  const validation = validateImageFile(file);
  if (!validation.isValid) {
    return {
      success: false,
      errors: validation.errors
    };
  }

  try {
    const filename = generateFileName(file.originalname);
    const filepath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filepath, file.buffer);

    return {
      success: true,
      filename,
      path: filepath,
      url: `/api/uploads/complaints/${filename}`,
      size: file.size,
      mimetype: file.mimetype
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to save image: ${error.message}`
    };
  }
}

/**
 * Save base64 image to disk
 * Returns: { success: boolean, filename: string, url: string, error?: string }
 */
function saveBase64Image(base64Data, complaintId) {
  ensureUploadDir();

  try {
    // Extract base64 data and file type
    const matches = base64Data.match(/^data:image\/([a-zA-Z0-9]+);base64,(.+)$/);
    if (!matches) {
      return { success: false, error: 'Invalid base64 image format' };
    }

    const fileType = matches[1];
    const buffer = Buffer.from(matches[2], 'base64');

    // Validate file size
    if (buffer.length > MAX_FILE_SIZE) {
      return { 
        success: false, 
        error: `Image size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit` 
      };
    }

    const filename = `complaint_${complaintId}_${Date.now()}.${fileType}`;
    const filepath = path.join(UPLOAD_DIR, filename);

    fs.writeFileSync(filepath, buffer);

    return {
      success: true,
      filename,
      path: filepath,
      url: `/api/uploads/complaints/${filename}`,
      size: buffer.length,
      mimetype: `image/${fileType}`
    };
  } catch (error) {
    return {
      success: false,
      error: `Failed to save image: ${error.message}`
    };
  }
}

/**
 * Delete image file
 */
function deleteImageFile(filename) {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      return { success: true };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Get image file
 */
function getImageFile(filename) {
  try {
    const filepath = path.join(UPLOAD_DIR, filename);
    if (fs.existsSync(filepath)) {
      return {
        success: true,
        filepath,
        data: fs.readFileSync(filepath)
      };
    }
    return { success: false, error: 'File not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

/**
 * Analyze image for AI insights (placeholder for ML integration)
 * Future: Can be integrated with ML models like TensorFlow.js
 */
function analyzeImageAI(filepath) {
  // Placeholder for future ML integration
  // Currently returns generic analysis
  return {
    hasText: false,
    hasObjects: true,
    quality: 'good',
    confidence: 0.75,
    tags: ['street', 'damage'],
    description: 'Image analysis unavailable - ML model integration pending'
  };
}

module.exports = {
  saveImageFile,
  saveBase64Image,
  deleteImageFile,
  getImageFile,
  analyzeImageAI,
  validateImageFile,
  generateFileName,
  ensureUploadDir,
  UPLOAD_DIR,
  MAX_FILE_SIZE,
  ALLOWED_TYPES
};
