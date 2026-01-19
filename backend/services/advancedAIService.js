/**
 * Advanced AI Service - Sentiment Analysis, Response Suggestions, Duplicate Detection
 * Complements complaintAIService.js with advanced NLP capabilities
 */

// Sentiment Analysis Keywords
const POSITIVE_WORDS = ['good', 'great', 'excellent', 'satisfied', 'pleased', 'grateful', 'appreciate', 'thanks', 'resolved', 'fixed', 'perfect'];
const NEGATIVE_WORDS = ['bad', 'terrible', 'awful', 'angry', 'upset', 'frustrated', 'disgusted', 'poor', 'broken', 'fail', 'problem', 'worse', 'never', 'worst'];
const URGENT_WORDS = ['emergency', 'urgent', 'critical', 'immediately', 'asap', 'danger', 'unsafe', 'risk', 'severe', 'serious', 'life-threatening'];

// Response suggestion templates based on categories
const RESPONSE_TEMPLATES = {
  'road-damage': [
    'Thank you for reporting this road damage. We will inspect the area within 24-48 hours.',
    'Your report has been forwarded to the Road Maintenance Department. Expected repair time: 3-5 days.',
    'We appreciate your vigilance. A repair team will be assigned to this location shortly.'
  ],
  'pothole': [
    'Your pothole report is critical for our safety initiatives. We will prioritize this location.',
    'This has been marked as high priority. Repair crew will visit within 24 hours.',
    'Thank you for reporting. Our street maintenance team is already aware of this area.'
  ],
  'water-supply': [
    'Water supply issues are our top priority. We will investigate immediately.',
    'Your complaint has been escalated to the Water Board emergency response team.',
    'We will send a technician to your location as soon as possible.'
  ],
  'sanitation': [
    'We take sanitation seriously. Our cleaning team will address this area today.',
    'Your report helps us maintain community hygiene standards. We will act immediately.',
    'Thank you for reporting. Sanitation workers have been notified.'
  ],
  'street-lighting': [
    'We are committed to community safety. The lighting issue will be resolved within 2-3 days.',
    'Your concern about street lighting is important. Maintenance team has been assigned.',
    'We will schedule a repair as soon as possible to ensure safe public spaces.'
  ],
  'public-facilities': [
    'We appreciate your report on public facility conditions. We will inspect and repair shortly.',
    'Your feedback helps us improve community spaces. Action will be taken within 48 hours.',
    'Maintenance crew will visit the location to assess and repair the issue.'
  ],
  'noise-pollution': [
    'Noise complaints are important to us. We will investigate and take necessary action.',
    'Our environmental health team will look into this matter.',
    'Thank you for helping us maintain a peaceful community environment.'
  ],
  'air-quality': [
    'Air quality is a priority concern. We will investigate the source of the issue.',
    'Your complaint has been logged with our environmental monitoring team.',
    'We will conduct air quality tests in your area.'
  ]
};

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
 * Returns: { suggestions: [], tone: 'empathetic'|'professional'|'urgent' }
 */
function generateResponseSuggestions(category, sentiment, priority) {
  const templates = RESPONSE_TEMPLATES[category.toLowerCase().replace(/\s+/g, '-')] || 
                   RESPONSE_TEMPLATES['public-facilities'];
  
  let tone = 'professional';
  if (sentiment === 'urgent' || priority === 'high') {
    tone = 'urgent';
  } else if (sentiment === 'negative') {
    tone = 'empathetic';
  }

  // Select suggestions based on tone
  let suggestions = [];
  if (tone === 'urgent') {
    suggestions = templates.slice(0, 2);
  } else if (tone === 'empathetic') {
    suggestions = [templates[templates.length - 1], ...templates.slice(0, 1)];
  } else {
    suggestions = templates;
  }

  // Enhance suggestions with sentiment-aware closings
  const closings = {
    urgent: 'This is our priority. We will keep you updated.',
    empathetic: 'Your concern matters to us. We are here to help.',
    professional: 'Thank you for your cooperation.'
  };

  suggestions = suggestions.map(s => `${s} ${closings[tone]}`);

  return {
    suggestions,
    tone,
    confidence: 0.85,
    category: category,
    priority: priority
  };
}

/**
 * Detects duplicate/similar complaints using text similarity
 * Returns: { isDuplicate: boolean, similarComplaints: [], similarity: 0-100 }
 */
function findSimilarComplaints(newComplaint, existingComplaints) {
  const similarities = [];

  existingComplaints.forEach(existing => {
    const similarity = calculateTextSimilarity(
      newComplaint.description + ' ' + newComplaint.category,
      existing.description + ' ' + existing.category
    );

    if (similarity > 40) {
      similarities.push({
        ...existing,
        similarity: Math.round(similarity),
        isDuplicate: similarity > 75
      });
    }
  });

  // Sort by similarity descending
  similarities.sort((a, b) => b.similarity - a.similarity);

  return {
    hasDuplicates: similarities.some(s => s.isDuplicate),
    totalSimilar: similarities.length,
    similar: similarities.slice(0, 5), // Top 5 similar complaints
    duplicates: similarities.filter(s => s.isDuplicate),
    recommendation: similarities.length > 0 
      ? similarities[0].isDuplicate 
        ? 'This appears to be a duplicate complaint. Consider merging with existing complaint.'
        : 'Similar complaints found. Review before processing.'
      : 'No similar complaints detected.'
  };
}

/**
 * Calculate text similarity using Levenshtein-like algorithm
 * Returns: similarity percentage (0-100)
 */
function calculateTextSimilarity(text1, text2) {
  const s1 = text1.toLowerCase().trim();
  const s2 = text2.toLowerCase().trim();

  // Extract key words
  const words1 = s1.split(/\s+/).filter(w => w.length > 3);
  const words2 = s2.split(/\s+/).filter(w => w.length > 3);

  // Calculate Jaccard similarity
  const intersection = new Set([...words1].filter(x => words2.includes(x)));
  const union = new Set([...words1, ...words2]);

  const similarity = (intersection.size / union.size) * 100;

  // Bonus for exact substring match
  if (s2.includes(s1) || s1.includes(s2)) {
    return Math.min(100, similarity + 20);
  }

  return similarity;
}

/**
 * Analyzes complete complaint with all advanced features
 * Returns comprehensive analysis object
 */
function analyzeComplaintComprehensive(complaint, existingComplaints = []) {
  const sentiment = analyzeSentiment(complaint.description);
  const responses = generateResponseSuggestions(
    complaint.category, 
    sentiment.sentiment, 
    complaint.priority
  );
  const similar = findSimilarComplaints(complaint, existingComplaints);

  return {
    sentimentAnalysis: sentiment,
    responsesuggestions: responses,
    similarComplaints: similar,
    aiScore: {
      overall: Math.round(
        (sentiment.score * 0.3 + (100 - similar.totalSimilar * 5) * 0.3 + 75 * 0.4)
      ),
      sentiment: sentiment.score,
      uniqueness: Math.max(0, 100 - similar.totalSimilar * 5),
      quality: 75
    },
    recommendations: [
      ...similar.hasDuplicates ? ['Merge with similar complaint'] : [],
      sentiment.hasUrgentWords ? ['Flag as priority for faster response'] : [],
      sentiment.emotionalIntensity > 3 ? ['Assign experienced officer'] : [],
      responses.tone === 'empathetic' ? ['Include apology in response'] : []
    ]
  };
}

// Export all functions
module.exports = {
  analyzeSentiment,
  generateResponseSuggestions,
  findSimilarComplaints,
  calculateTextSimilarity,
  analyzeComplaintComprehensive,
  RESPONSE_TEMPLATES,
  POSITIVE_WORDS,
  NEGATIVE_WORDS,
  URGENT_WORDS
};
