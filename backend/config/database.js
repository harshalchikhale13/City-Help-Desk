/**
 * JSON Storage Configuration
 * Replaces PostgreSQL with JSON file storage for development
 */

const storage = require('../utils/jsonStorage');
require('dotenv').config();

// Initialize storage files
storage.initializeStorage();

console.log('JSON Storage initialized successfully');
console.log('Data directory:', storage.DATA_DIR);

module.exports = storage;
