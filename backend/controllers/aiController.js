/**
 * AI Controller
 * Handles AI-powered features: categorization, summarization, chatbot
 */
const advancedAIService = require('../services/advancedAIService');

exports.analyzeComplaint = async (req, res) => {
    try {
        const { description } = req.body;
        if (!description) {
            return res.status(400).json({ status: 'error', message: 'Description is required' });
        }

        const categoryResult = advancedAIService.predictCategory(description);
        const priorityResult = advancedAIService.predictPriority(description);
        const sentimentResult = advancedAIService.analyzeSentiment(description);
        const summary = advancedAIService.summarizeComplaint(description);

        res.status(200).json({
            status: 'success',
            data: {
                category: categoryResult.category,
                confidence: categoryResult.confidence,
                priority: priorityResult.priority,
                priorityReason: priorityResult.reason,
                sentiment: sentimentResult.sentiment,
                summary
            }
        });

    } catch (error) {
        console.error('AI Analysis Error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to analyze complaint' });
    }
};

exports.chatWithAI = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) {
            return res.status(400).json({ status: 'error', message: 'Message is required' });
        }

        const lowerMsg = message.toLowerCase();
        let response = "I'm not sure how to help with that. Please try asking about reporting an issue or checking status.";

        // Simple Rule-based Chatbot Logic
        if (lowerMsg.includes('hello') || lowerMsg.includes('hi')) {
            response = "Hello! I am the Campus AI Assistant. How can I help you today? You can report an issue or check status.";
        } else if (lowerMsg.includes('report') || lowerMsg.includes('issue') || lowerMsg.includes('complaint')) {
            response = "To report an issue, please go to the 'Report Issue' page. I can help you categorize it if you describe the problem.";
        } else if (lowerMsg.includes('status') || lowerMsg.includes('check')) {
            response = "You can check the status of your complaints in the Dashboard. Do you need help navigating there?";
        } else if (lowerMsg.includes('thank')) {
            response = "You're welcome! Let me know if you need anything else.";
        } else {
            // Try to categorize the message as if it were a complaint description
            const categoryPred = advancedAIService.predictCategory(message);
            if (categoryPred.confidence > 50) {
                response = `It sounds like you are talking about a ${categoryPred.category.replace('_', ' ')} issue. Would you like to report it?`;
            }
        }

        res.status(200).json({
            status: 'success',
            data: {
                response,
                sender: 'ai',
                timestamp: new Date()
            }
        });

    } catch (error) {
        console.error('Chat Error:', error);
        res.status(500).json({ status: 'error', message: 'Chat service failed' });
    }
};
