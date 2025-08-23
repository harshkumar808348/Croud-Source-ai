import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

const router = express.Router();

// Check if GEMINI_API_KEY is available
if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY is not set in environment variables');
    console.error('Please add GEMINI_API_KEY to your .env file');
} else {
    console.log('✅ GEMINI_API_KEY is available');
}

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Function to extract safety information from analysis text
const extractSafetyInfoFromText = (analysisText) => {
    const lowerText = analysisText.toLowerCase();
    
    // Check for danger indicators
    const dangerKeywords = ['danger', 'unsafe', 'hazard', 'flood', 'pothole', 'damage', 'crack', 'critical', 'emergency', 'severe', 'collapsed', 'broken', 'eroded'];
    const safeKeywords = ['safe', 'good', 'normal', 'stable', 'intact', 'excellent', 'fine', 'well-maintained', 'solid', 'secure'];
    
    let dangerCount = 0;
    let safeCount = 0;
    
    dangerKeywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = analysisText.match(regex);
        if (matches) dangerCount += matches.length;
    });
    
    safeKeywords.forEach(keyword => {
        const regex = new RegExp(keyword, 'gi');
        const matches = analysisText.match(regex);
        if (matches) safeCount += matches.length;
    });
    
    // Calculate safety percentage
    const total = dangerCount + safeCount;
    if (total > 0) {
        const safetyPercentage = Math.round((safeCount / total) * 100);
        return {
            percentage: safetyPercentage,
            level: safetyPercentage >= 70 ? 'Safe' : safetyPercentage >= 40 ? 'Moderate' : 'Danger'
        };
    }
    
    // Default to moderate if no clear indicators
    return { percentage: 50, level: 'Moderate' };
};

// POST route for analyzing images
router.post('/analyze', async (req, res) => {
    try {
        const { imageUrl } = req.body;
        
        if (!imageUrl) {
            return res.status(400).json({
                success: false,
                message: 'Image URL is required'
            });
        }

        // Convert image URL to base64 for Gemini
        const imageResponse = await fetch(imageUrl);
        if (!imageResponse.ok) {
            throw new Error('Failed to fetch image from URL');
        }
        
        const imageBuffer = await imageResponse.arrayBuffer();
        const base64Image = Buffer.from(imageBuffer).toString('base64');
        const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

        // Try different Gemini models with fallback
        const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
        let analysis = null;
        let modelUsed = null;

        for (const modelName of models) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                
                const prompt = `Analyze this infrastructure image for safety assessment. Focus on identifying:
1. Road surface conditions (potholes, cracks, erosion)
2. Drainage issues (flooding, standing water, blocked drains)
3. Structural damage (cracks, erosion, instability)
4. Environmental hazards
5. Overall safety level

Provide a detailed analysis with specific observations and safety recommendations. Be thorough in identifying any potential dangers or safety concerns.`;

                const result = await model.generateContent([prompt, {
                    inlineData: {
                        mimeType: mimeType,
                        data: base64Image
                    }
                }]);

                analysis = result.response.text();
                modelUsed = modelName;
                break;
                
            } catch (error) {
                continue;
            }
        }

        if (!analysis) {
            throw new Error('All Gemini models failed to analyze the image');
        }

        // Extract safety information from analysis
        const safetyInfo = extractSafetyInfoFromText(analysis);

        res.json({
            success: true,
            analysis: analysis,
            safetyScore: safetyInfo.level,
            safetyPercentage: safetyInfo.percentage,
            modelUsed: modelUsed
        });

    } catch (error) {
        console.error('❌ Analysis error:', error);
        res.status(500).json({
            success: false,
            message: 'Analysis failed on the server.',
            error: error.message
        });
    }
});

export default router;