import express from 'express';
import { GoogleGenerativeAI } from '@google/generative-ai';

const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// System prompt for the community assistant
const systemPrompt = `You are a helpful community assistant for a platform called "crowdsource.ai" that helps citizens report local infrastructure issues like potholes, waterlogging, poor road conditions, and other community problems.

Your role is to:
1. Help users understand how to report issues effectively
2. Provide guidance on what types of issues can be reported
3. Explain the platform's features and benefits
4. Answer questions about community safety and infrastructure
5. Guide users through the reporting process
6. Provide tips for taking good photos of issues
7. Explain how the AI analysis works
8. Help with general community improvement questions

Key information about the platform:
- Users can upload photos of infrastructure issues
- AI analyzes the images for safety assessment (Danger, Moderate, Safe)
- Reports are shared with local authorities
- The platform helps build safer communities
- Users can like and comment on reports
- There's an admin dashboard for managing reports

Be friendly, helpful, and encouraging. Keep responses concise but informative. Always promote community engagement and safety.`;

router.post('/', async (req, res) => {
    try {
        const { message, context } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: 'Message is required' });
        }

        if (!process.env.GEMINI_API_KEY) {
            return res.status(500).json({ 
                error: 'Gemini API key not configured',
                response: 'I apologize, but I\'m currently experiencing technical difficulties. Please try again later or contact support.'
            });
        }

        // Create a new model instance
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prepare the conversation
        const prompt = `${systemPrompt}

User Question: ${message}

Please provide a helpful response that addresses the user's question in the context of community infrastructure reporting and safety.`;

        // Generate response
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ 
            response: text,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('Chatbot error:', error);
        
        // Provide a fallback response
        const fallbackResponses = [
            "I'm here to help you with community infrastructure reporting! You can ask me about how to report issues, what types of problems to look for, or how the platform works.",
            "I'd be happy to help you with reporting local issues! Feel free to ask me about potholes, waterlogging, road conditions, or any other infrastructure problems in your community.",
            "I'm your community assistant! I can help you understand how to make your neighborhood safer by reporting infrastructure issues. What would you like to know?"
        ];
        
        const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        
        res.status(500).json({ 
            error: 'Failed to generate response',
            response: randomResponse
        });
    }
});

export default router;
