/**
 * AI Routes
 * Exposes AI endpoints for client consumption
 */
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
// const { authenticateToken } = require('../middleware/auth'); // Optionally protect routes

router.post('/analyze', aiController.analyzeComplaint);
router.post('/chat', aiController.chatWithAI);

module.exports = router;
