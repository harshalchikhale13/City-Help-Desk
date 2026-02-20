/**
 * Advanced AI Service - Sentiment, Categorization, Summarization, Chatbot Logic
 * Complements complaintAIService.js with advanced NLP capabilities
 */

// ==========================================
// 1. CONSTANTS & KEYWORDS
// ==========================================

const POSITIVE_WORDS = ['good', 'great', 'excellent', 'satisfied', 'pleased', 'grateful', 'appreciate', 'thanks', 'resolved', 'fixed', 'perfect'];
const NEGATIVE_WORDS = ['bad', 'terrible', 'awful', 'angry', 'upset', 'frustrated', 'disgusted', 'poor', 'broken', 'fail', 'problem', 'worse', 'never', 'worst'];
const URGENT_WORDS = ['emergency', 'urgent', 'critical', 'immediately', 'asap', 'danger', 'unsafe', 'risk', 'severe', 'serious', 'life-threatening', 'fire', 'leak', 'spark', 'flood', 'accident'];

// Category Keywords Mapping
const CATEGORY_KEYWORDS = {
  'it_support': ['wifi', 'internet', 'network', 'login', 'password', 'computer', 'printer', 'projector', 'software', 'server', 'monitor', 'keyboard', 'mouse', 'slow'],
  'electrical_issues': ['light', 'fan', 'switch', 'socket', 'power', 'blackout', 'spark', 'wire', 'fuse', 'ac', 'air conditioner', 'heater', 'tripped'],
  'cleaning_issues': ['dirty', 'dust', 'garbage', 'trash', 'dustbin', 'smell', 'odor', 'stain', 'clean', 'mess', 'spill', 'washroom', 'toilet', 'overflow'],
  'civil_infrastructure': ['door', 'window', 'glass', 'handle', 'lock', 'wall', 'paint', 'crack', 'roof', 'floor', 'tile', 'ceiling', 'water', 'leak'],
  'hostel_issues': ['bed', 'mattress', 'roommate', 'mess', 'food', 'water cooler', 'wardrobe', 'hostel', 'curtain'],
  'campus_safety': ['theft', 'lost', 'stolen', 'fight', 'harassment', 'security', 'guard', 'strange', 'suspicious', 'brawl', 'ragging'],
  'library_issues': ['book', 'return', 'fine', 'librarian', 'silence', 'seat', 'table', 'magazine', 'journal']
};

// Response Templates
const RESPONSE_TEMPLATES = {
  'default': [
    'Thank you for reporting this issue. We have received your complaint and will investigate shortly.',
    'Your complaint has been registered. Our team will review the details and take necessary action.',
    'We appreciate you bringing this to our attention. A support ticket has been created.'
  ],
  'campus_safety': [
    'Your safety is our top priority. Security team has been alerted.',
    'This incident has been flagged for immediate review by the Chief Security Officer.',
    'Please stay safe. We are dispatching a security patrol to your location.'
  ],
  'it_support': [
    'An IT ticket has been raised. A technician will contact you shortly.',
    'We are looking into the network issue. Service should be restored soon.',
    'Please try restarting your device while we check the backend systems.'
  ]
};

// ==========================================
// 2. CORE FUNCTIONS
// ==========================================

/**
 * Predicts category based on description text
 * Returns: { category: string, confidence: number, keywords: [] }
 */
function predictCategory(text) {
  if (!text) return { category: 'other', confidence: 0, keywords: [] };

  const lowerText = text.toLowerCase();
  let bestCategory = 'other';
  let maxScore = 0;
  let matchedKeywords = [];

  Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
    let score = 0;
    const currentMatches = [];

    keywords.forEach(word => {
      if (lowerText.includes(word)) {
        score += 1;
        currentMatches.push(word);
      }
    });

    if (score > maxScore) {
      maxScore = score;
      bestCategory = category;
      matchedKeywords = currentMatches;
    }
  });

  // Calculate confidence (capped at 100%)
  const confidence = maxScore > 0 ? Math.min(100, 30 + (maxScore * 15)) : 0;

  return {
    category: bestCategory,
    confidence,
    keywords: matchedKeywords
  };
}

/**
 * Predicts priority based on keywords and sentiment
 * Returns: { priority: 'low'|'medium'|'high', reason: string }
 */
function predictPriority(text) {
  if (!text) return { priority: 'medium', reason: 'Default' };

  const lowerText = text.toLowerCase();

  // Check for urgent keywords
  for (const word of URGENT_WORDS) {
    if (lowerText.includes(word)) {
      return { priority: 'high', reason: `Detected urgent keyword: "${word}"` };
    }
  }

  // Check for specific high intensity words
  if (lowerText.includes('unsafe') || lowerText.includes('dangerous') || lowerText.includes('hurt')) {
    return { priority: 'high', reason: 'Safety concern detected' };
  }

  // Medium priority checks
  if (lowerText.includes('not working') || lowerText.includes('broken') || lowerText.includes('fail')) {
    return { priority: 'medium', reason: 'Functional issue detected' };
  }

  return { priority: 'low', reason: 'Routine request' };
}

/**
 * Generates a short summary of the complaint
 * Returns: string
 */
function summarizeComplaint(text) {
  if (!text) return '';
  if (text.length < 50) return text;

  // Simple heuristic: First sentence or first 100 chars
  const firstSentence = text.split(/[.!?]/)[0];
  if (firstSentence.length > 20 && firstSentence.length < 100) {
    return firstSentence + '.';
  }

  return text.substring(0, 97) + '...';
}

/**
 * Analyzes sentiment of complaint description
 * Returns: { sentiment: 'positive'|'negative'|'neutral', score: 0-100, keywords: [] }
 */
function analyzeSentiment(text) {
  if (!text) return { sentiment: 'neutral', score: 50, keywords: [] };

  const lowerText = text.toLowerCase();
  let positiveCount = 0;
  let negativeCount = 0;
  let urgentCount = 0;
  const foundKeywords = [];

  POSITIVE_WORDS.forEach(word => {
    if (lowerText.includes(word)) {
      positiveCount++;
      foundKeywords.push(word);
    }
  });

  NEGATIVE_WORDS.forEach(word => {
    if (lowerText.includes(word)) {
      negativeCount++;
      foundKeywords.push(word);
    }
  });

  URGENT_WORDS.forEach(word => {
    if (lowerText.includes(word)) {
      urgentCount++;
      foundKeywords.push(`URGENT: ${word}`);
    }
  });

  // Calculate sentiment
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

  return {
    sentiment,
    score,
    keywords: [...new Set(foundKeywords)],
    hasNegativeWords: negativeCount > 0,
    hasUrgentWords: urgentCount > 0,
    emotionalIntensity: Math.max(positiveCount, negativeCount, urgentCount)
  };
}

/**
 * Generates response suggestions based on category and sentiment
 */
function generateResponseSuggestions(category, sentiment, priority) {
  let templates = RESPONSE_TEMPLATES[category] || RESPONSE_TEMPLATES['default'];

  // If no specific category template, try to find a partial match
  if (!RESPONSE_TEMPLATES[category]) {
    const parentCat = Object.keys(RESPONSE_TEMPLATES).find(k => category.includes(k));
    if (parentCat) templates = RESPONSE_TEMPLATES[parentCat];
  }

  let tone = 'professional';
  if (sentiment === 'urgent' || priority === 'high') {
    tone = 'urgent';
  } else if (sentiment === 'negative') {
    tone = 'empathetic';
  }

  // Adjust suggestion based on tone (mock logic)
  const suggestion = templates[Math.floor(Math.random() * templates.length)];

  return {
    suggestions: [suggestion],
    tone,
    confidence: 0.85,
    category,
    priority
  };
}

/**
 * Detects duplicate/similar complaints using text similarity
 */
function findSimilarComplaints(newComplaint, existingComplaints) {
  const similarities = [];

  existingComplaints.forEach(existing => {
    const similarity = calculateTextSimilarity(
      (newComplaint.description || '') + ' ' + (newComplaint.category || ''),
      (existing.description || '') + ' ' + (existing.category || '')
    );

    if (similarity > 40) {
      similarities.push({
        ...existing,
        similarity: Math.round(similarity),
        isDuplicate: similarity > 75
      });
    }
  });

  similarities.sort((a, b) => b.similarity - a.similarity);

  return {
    hasDuplicates: similarities.some(s => s.isDuplicate),
    totalSimilar: similarities.length,
    similar: similarities.slice(0, 5),
    duplicates: similarities.filter(s => s.isDuplicate),
    recommendation: similarities.length > 0
      ? similarities[0].isDuplicate
        ? 'Possible duplicate detected.'
        : 'Similar issues exist.' // Simplified message
      : 'Unique issue.'
  };
}

/**
 * Calculate text similarity using Jaccard index
 */
function calculateTextSimilarity(text1, text2) {
  const s1 = text1.toLowerCase().trim();
  const s2 = text2.toLowerCase().trim();

  const words1 = s1.split(/\s+/).filter(w => w.length > 3);
  const words2 = s2.split(/\s+/).filter(w => w.length > 3);

  if (words1.length === 0 || words2.length === 0) return 0;

  const set1 = new Set(words1);
  const set2 = new Set(words2);

  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  return (intersection.size / union.size) * 100;
}

/**
 * Analyzes complete complaint with all advanced features
 */
function analyzeComplaintComprehensive(complaint, existingComplaints = []) {
  const sentiment = analyzeSentiment(complaint.description);
  const categoryPrediction = predictCategory(complaint.description);
  const priorityPrediction = predictPriority(complaint.description);
  const summary = summarizeComplaint(complaint.description);
  const similar = findSimilarComplaints(complaint, existingComplaints);
  const responses = generateResponseSuggestions(
    categoryPrediction.category !== 'other' ? categoryPrediction.category : complaint.category,
    sentiment.sentiment,
    priorityPrediction.priority
  );

  return {
    sentimentAnalysis: sentiment,
    categoryPrediction,
    priorityPrediction,
    summary,
    responsesuggestions: responses,
    similarComplaints: similar,
    aiScore: {
      urgency: priorityPrediction.priority === 'high' ? 90 : 50,
      quality: 80
    }
  };
}

module.exports = {
  predictCategory,
  predictPriority,
  summarizeComplaint,
  analyzeSentiment,
  generateResponseSuggestions,
  findSimilarComplaints,
  calculateTextSimilarity,
  analyzeComplaintComprehensive,
  CATEGORY_KEYWORDS,
  RESPONSE_TEMPLATES,
  POSITIVE_WORDS,
  NEGATIVE_WORDS,
  URGENT_WORDS
};
