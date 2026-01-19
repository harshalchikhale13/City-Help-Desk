/**
 * Complaint ID Generator
 * Generates unique complaint IDs
 */
const { v4: uuidv4 } = require('uuid');

/**
 * Generate unique complaint ID
 * Format: CMP-TIMESTAMP-RANDOM
 * @returns {string} Unique complaint ID
 */
const generateComplaintId = () => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `CMP-${timestamp}-${random}`;
};

/**
 * Generate UUID
 * @returns {string} UUID
 */
const generateUUID = () => {
  return uuidv4();
};

module.exports = {
  generateComplaintId,
  generateUUID,
};
