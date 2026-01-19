/**
 * Logging Middleware
 * Logs HTTP requests
 */
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

/**
 * Request logging middleware
 */
const requestLogger = (req, res, next) => {
  const start = Date.now();

  // Capture response
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logMessage = `[${new Date().toISOString()}] ${req.method} ${req.path} - Status: ${res.statusCode} - ${duration}ms\n`;

    // Write to console
    console.log(logMessage.trim());

    // Write to file
    const logFile = path.join(logsDir, 'app.log');
    fs.appendFileSync(logFile, logMessage);
  });

  next();
};

module.exports = {
  requestLogger,
};
