/**
 * Complaint AI Service - Enhanced Version
 * Handles AI-powered complaint processing:
 * - Category prediction from description
 * - Priority suggestion with urgency detection
 * - Department auto-assignment
 * - Smart summary generation
 * - Sentiment analysis with emotional keywords
 * - Automated response suggestions
 * - Duplicate complaint detection
 * 
 * This service is designed to be pluggable for future ML model integration
 */

// Category keywords mapping for categorization
const CATEGORY_KEYWORDS = {
  'Garbage': ['garbage', 'waste', 'trash', 'dump', 'litter', 'sweeping', 'sanitation', 'rubbish', 'debris'],
  'Road': ['road', 'pothole', 'asphalt', 'pavement', 'street', 'highway', 'lane', 'surface', 'broken', 'damaged'],
  'Water': ['water', 'sewage', 'drainage', 'pipe', 'leak', 'contaminated', 'supply', 'quality', 'flow'],
  'Electricity': ['electricity', 'power', 'blackout', 'short circuit', 'wiring', 'light', 'voltage', 'outage', 'electric'],
  'Drainage': ['drainage', 'sewer', 'clogged', 'blockage', 'flood', 'water logging', 'manhole', 'overflowing'],
  'Public_Safety': ['safety', 'accident', 'dangerous', 'hazard', 'injury', 'crime', 'assault', 'theft', 'emergency'],
  'Street_Lighting': ['light', 'streetlight', 'lamp', 'dark', 'lighting', 'illumination', 'bulb'],
  'Noise': ['noise', 'sound', 'loud', 'music', 'horn', 'pollution', 'disturbance'],
  'Air_Quality': ['air', 'smell', 'odor', 'smoke', 'pollution', 'fume', 'stench', 'dust']
};

// Priority scoring based on keywords
const PRIORITY_KEYWORDS = {
  high: [
    'urgent', 'emergency', 'danger', 'hazard', 'accident', 'injury', 'severe', 'critical',
    'injured', 'dying', 'fire', 'gas leak', 'immediate', 'life threat', 'deadly', 'collapse'
  ],
  medium: [
    'problem', 'issue', 'broken', 'damaged', 'blocked', 'concerns', 'important', 'needs fix',
    'malfunction', 'defect', 'failed', 'stopped working', 'significant'
  ],
  low: [
    'minor', 'small', 'slight', 'cosmetic', 'improvement', 'suggestion', 'aesthetic', 'maintenance'
  ]
};

// Department assignment rules
const DEPARTMENT_ASSIGNMENTS = {
  'Garbage': { dept: 'Sanitation Department', code: 'SAND' },
  'Road': { dept: 'Public Works Department', code: 'PWKS' },
  'Water': { dept: 'Water Supply Board', code: 'WSUP' },
  'Electricity': { dept: 'Electrical Department', code: 'ELEC' },
  'Drainage': { dept: 'Drainage Authority', code: 'DRAN' },
  'Public_Safety': { dept: 'Police Department', code: 'PLOD' }
};

/**
 * Predict complaint category from description using keyword matching
 * @param {string} description - The complaint description
 * @returns {string} - Predicted category
 */
export const predictCategory = (description) => {
  if (!description) return 'Road'; // default

  const lowerDesc = description.toLowerCase();
  let bestMatch = 'Road';
  let maxMatches = 0;

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter(keyword => lowerDesc.includes(keyword)).length;
    if (matches > maxMatches) {
      maxMatches = matches;
      bestMatch = category;
    }
  }

  return bestMatch;
};

/**
 * Suggest priority level based on description
 * @param {string} description - The complaint description
 * @returns {string} - Priority level ('high', 'medium', 'low')
 */
export const suggestPriority = (description) => {
  if (!description) return 'medium'; // default

  const lowerDesc = description.toLowerCase();

  // Check for high priority indicators
  const highCount = PRIORITY_KEYWORDS.high.filter(keyword => lowerDesc.includes(keyword)).length;
  if (highCount >= 2) return 'high';

  // Check for low priority indicators
  const lowCount = PRIORITY_KEYWORDS.low.filter(keyword => lowerDesc.includes(keyword)).length;
  if (lowCount >= 2) return 'low';

  // Medium is default
  return 'medium';
};

/**
 * Get department assignment based on category
 * @param {string} category - The complaint category
 * @returns {Object} - Department assignment {dept, code}
 */
export const suggestDepartment = (category) => {
  return DEPARTMENT_ASSIGNMENTS[category] || DEPARTMENT_ASSIGNMENTS['Road'];
};

/**
 * Generate smart summary from long description
 * @param {string} description - The complaint description
 * @param {number} maxWords - Maximum words in summary (default: 25)
 * @returns {string} - Summarized text
 */
export const generateSmartSummary = (description, maxWords = 25) => {
  if (!description) return '';

  const words = description.trim().split(/\s+/);
  if (words.length <= maxWords) return description;

  // Take first sentence or truncate by words
  const firstSentence = description.split(/[.!?]/)[0];
  if (firstSentence.split(/\s+/).length <= maxWords) {
    return firstSentence.trim() + '...';
  }

  return words.slice(0, maxWords).join(' ') + '...';
};

/**
 * Comprehensive AI analysis of complaint
 * Returns categorization, priority, department, and summary all at once
 * @param {Object} complaintData - {title, description, category}
 * @returns {Object} - AI analysis results
 */
export const analyzeComplaint = (complaintData) => {
  const { title, description, category = null } = complaintData;

  // Combine title and description for better analysis
  const fullText = `${title} ${description}`.toLowerCase();

  return {
    category: category || predictCategory(fullText),
    priority: suggestPriority(fullText),
    department: suggestDepartment(category || predictCategory(fullText)),
    summary: generateSmartSummary(description, 25),
    confidence: calculateConfidence(fullText),
  };
};

/**
 * Calculate confidence score for AI predictions (0-100)
 * @param {string} text - The analyzed text
 * @returns {number} - Confidence score
 */
const calculateConfidence = (text) => {
  // Simple confidence based on text length and keyword specificity
  const words = text.split(/\s+/).length;
  const baseConfidence = Math.min(100, (words / 50) * 100);
  return Math.round(baseConfidence);
};

/**
 * SENTIMENT ANALYSIS - Analyze emotional tone of complaint
 */
const SENTIMENT_KEYWORDS = {
  positive: ['good', 'great', 'excellent', 'satisfied', 'pleased', 'grateful', 'appreciate', 'thanks', 'resolved'],
  negative: ['bad', 'terrible', 'awful', 'angry', 'upset', 'frustrated', 'disgusted', 'poor', 'broken', 'fail'],
  urgent: ['emergency', 'urgent', 'critical', 'immediately', 'asap', 'danger', 'unsafe', 'severe']
};

/**
 * Analyze sentiment of complaint description
 * @param {string} description - Complaint description
 * @returns {object} - Sentiment analysis with score and keywords
 */
const analyzeSentiment = (description) => {
  if (!description) return { sentiment: 'neutral', score: 50, keywords: [] };
  
  const text = description.toLowerCase();
  let positiveCount = 0, negativeCount = 0, urgentCount = 0;
  const keywords = [];

  SENTIMENT_KEYWORDS.positive.forEach(word => {
    if (text.includes(word)) {
      positiveCount++;
      keywords.push(word);
    }
  });

  SENTIMENT_KEYWORDS.negative.forEach(word => {
    if (text.includes(word)) {
      negativeCount++;
      keywords.push(word);
    }
  });

  SENTIMENT_KEYWORDS.urgent.forEach(word => {
    if (text.includes(word)) {
      urgentCount++;
      keywords.push(`⚠️ ${word}`);
    }
  });

  let sentiment = 'neutral';
  let score = 50;

  if (urgentCount > 0) {
    sentiment = 'urgent';
    score = Math.min(100, 75 + urgentCount * 5);
  } else if (negativeCount > positiveCount) {
    sentiment = 'negative';
    score = Math.max(0, 50 - (negativeCount - positiveCount) * 10);
  } else if (positiveCount > negativeCount) {
    sentiment = 'positive';
    score = Math.min(100, 50 + (positiveCount - negativeCount) * 10);
  }

  return { sentiment, score, keywords: [...new Set(keywords)], intensity: Math.max(positiveCount, negativeCount, urgentCount) };
};

/**
 * RESPONSE SUGGESTIONS - Generate appropriate responses
 */
const RESPONSE_TEMPLATES = {
  'Garbage': 'Thank you for reporting sanitation issues. Our cleaning team will address this area within 24 hours.',
  'Road': 'We appreciate your report. Our road maintenance team will inspect and repair the damage within 3-5 days.',
  'Water': 'Water supply issues are our priority. Our technical team will investigate immediately.',
  'Electricity': 'We will address the electrical issue as soon as possible. Our maintenance team has been notified.',
  'Drainage': 'Drainage problems are critical. We will prioritize this location for urgent repairs.',
  'Public_Safety': 'Your safety concern is important. We will take immediate action.',
  'Street_Lighting': 'Street lighting will be restored within 2-3 days. We value public safety.',
  'Noise': 'We will investigate the noise disturbance and take appropriate action.',
  'Air_Quality': 'Air quality is our concern. We will conduct tests and investigation in your area.'
};

/**
 * Generate AI response suggestions based on category and sentiment
 */
const generateResponseSuggestions = (category, sentiment, priority) => {
  const baseResponse = RESPONSE_TEMPLATES[category] || 'Thank you for your complaint. We will take action shortly.';
  
  let tonePrefix = '';
  if (sentiment === 'urgent') {
    tonePrefix = '🚨 URGENT: ';
  } else if (sentiment === 'negative') {
    tonePrefix = '💙 We understand your concern: ';
  } else {
    tonePrefix = '✅ ';
  }

  return {
    primary: tonePrefix + baseResponse,
    alternatives: [
      `Your complaint has been logged with ID #${Math.random().toString(36).substr(2, 9).toUpperCase()}. We will keep you updated.`,
      `We take your report seriously. A team will be assigned to handle this matter.`,
      priority === 'high' ? 'This has been marked as high priority for faster resolution.' : 'Expected resolution time: 3-7 days.'
    ],
    tone: sentiment === 'urgent' ? 'urgent' : sentiment === 'negative' ? 'empathetic' : 'professional'
  };
};

/**
 * DUPLICATE DETECTION - Find similar complaints
 */
const calculateSimilarity = (text1, text2) => {
  const words1 = text1.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  const words2 = text2.toLowerCase().split(/\s+/).filter(w => w.length > 3);
  
  const intersection = words1.filter(w => words2.includes(w));
  const union = [...new Set([...words1, ...words2])];
  
  return Math.round((intersection.length / union.length) * 100) || 0;
};

/**
 * AI Service - Main export object
 * Provides all AI-powered complaint processing functions
 */
const complaintAIService = {
  predictCategory,
  suggestPriority,
  suggestDepartment,
  analyzeSentiment,
  generateResponseSuggestions,
  calculateSimilarity,
  generateSmartSummary,
  analyzeComplaint,
};

export default complaintAIService;
