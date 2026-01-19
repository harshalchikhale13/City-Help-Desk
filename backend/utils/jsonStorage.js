/**
 * JSON Storage Utility
 * Replaces PostgreSQL with JSON file storage for development
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * Initialize storage files if they don't exist
 */
function initializeStorage() {
  const files = {
    'users.json': [],
    'complaints.json': [],
    'complaint_updates.json': [],
    'notifications.json': [],
    'departments.json': [],
  };

  for (const [filename, defaultData] of Object.entries(files)) {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
  }
}

/**
 * Read data from JSON file
 */
function read(filename) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return [];
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data || '[]');
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return [];
  }
}

/**
 * Write data to JSON file
 */
function write(filename, data) {
  try {
    const filePath = path.join(DATA_DIR, filename);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Error writing to ${filename}:`, error);
    return false;
  }
}

/**
 * Get all records from a file
 */
function getAll(filename) {
  return read(filename);
}

/**
 * Find record by ID
 */
function findById(filename, id) {
  const data = read(filename);
  return data.find((item) => item.id === id);
}

/**
 * Find records by query
 */
function find(filename, query) {
  const data = read(filename);
  return data.filter((item) => {
    for (const [key, value] of Object.entries(query)) {
      if (item[key] !== value) return false;
    }
    return true;
  });
}

/**
 * Find one record by query
 */
function findOne(filename, query) {
  const data = read(filename);
  return data.find((item) => {
    for (const [key, value] of Object.entries(query)) {
      if (item[key] !== value) return false;
    }
    return true;
  });
}

/**
 * Insert a new record
 */
function insert(filename, record) {
  const data = read(filename);
  const id = data.length > 0 ? Math.max(...data.map((r) => r.id || 0)) + 1 : 1;
  const newRecord = { id, ...record, created_at: new Date().toISOString() };
  data.push(newRecord);
  write(filename, data);
  return newRecord;
}

/**
 * Update a record by ID
 */
function updateById(filename, id, updates) {
  const data = read(filename);
  const index = data.findIndex((item) => item.id === id);
  if (index === -1) return null;
  data[index] = { ...data[index], ...updates, updated_at: new Date().toISOString() };
  write(filename, data);
  return data[index];
}

/**
 * Delete a record by ID
 */
function deleteById(filename, id) {
  const data = read(filename);
  const filtered = data.filter((item) => item.id !== id);
  if (filtered.length === data.length) return false;
  write(filename, filtered);
  return true;
}

/**
 * Check if record exists
 */
function exists(filename, query) {
  return findOne(filename, query) !== undefined;
}

module.exports = {
  initializeStorage,
  read,
  write,
  getAll,
  findById,
  find,
  findOne,
  insert,
  updateById,
  deleteById,
  exists,
  DATA_DIR,
};
