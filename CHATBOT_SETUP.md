# Chatbot Setup Guide

## Overview
The chatbot has been successfully integrated into your community infrastructure reporting platform. It uses Google's Gemini AI to provide intelligent assistance to users about reporting local issues, understanding the platform, and community safety.

## Features
- **AI-Powered Responses**: Uses Gemini AI for intelligent, contextual responses
- **Community-Focused**: Specialized in infrastructure reporting and community safety
- **User-Friendly Interface**: Modern, responsive chat interface
- **Real-time Interaction**: Instant responses with loading indicators
- **Mobile Responsive**: Works on all device sizes

## Setup Instructions

### 1. Configure Gemini API Key
You need to set up your Gemini API key in the backend environment:

1. **Get a Gemini API Key**:
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create a new API key
   - Copy the API key

2. **Add to Environment Variables**:
   Create or update the `.env` file in your `backend` directory:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   PORT=3000
   ```

### 2. Install Dependencies
The required package is already installed, but if you need to reinstall:
```bash
cd backend
npm install @google/generative-ai
```

### 3. Start the Application
1. **Start Backend**:
   ```bash
   cd backend
   npm start
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

## How to Use the Chatbot

### For Users
1. **Access**: The chatbot appears as a floating button in the bottom-right corner of the home page
2. **Open Chat**: Click the chat icon to open the conversation window
3. **Ask Questions**: Type your questions about:
   - How to report infrastructure issues
   - What types of problems to look for
   - How the platform works
   - Community safety tips
   - Photo guidelines for reports

### Example Questions Users Can Ask
- "How do I report a pothole?"
- "What types of infrastructure issues can I report?"
- "How does the AI analysis work?"
- "What makes a good photo for reporting?"
- "How can I help make my community safer?"
- "What happens after I submit a report?"

## Technical Details

### Frontend Components
- **Chatbot.jsx**: Main chatbot component with UI and interaction logic
- **Home.jsx**: Integrated chatbot into the home page

### Backend API
- **chatbot.js**: Express router handling chatbot requests
- **Gemini AI Integration**: Uses Google's Generative AI for responses
- **Error Handling**: Fallback responses if API fails

### API Endpoint
- **POST /api/chatbot**: Accepts user messages and returns AI-generated responses

## Customization

### Modifying System Prompt
You can customize the chatbot's behavior by editing the `systemPrompt` in `backend/routes/chatbot.js`:

```javascript
const systemPrompt = `Your custom prompt here...`;
```

### Styling
The chatbot uses Tailwind CSS classes. You can modify the styling in `frontend/src/components/Chatbot.jsx`.

### Response Types
The chatbot can handle various types of questions:
- Platform guidance
- Reporting instructions
- Safety information
- Community engagement
- Technical support

## Troubleshooting

### Common Issues
1. **"Gemini API key not configured"**
   - Ensure your `.env` file has the correct `GEMINI_API_KEY`
   - Restart the backend server after adding the key

2. **Chatbot not responding**
   - Check if the backend server is running
   - Verify the API endpoint is accessible
   - Check browser console for errors

3. **Slow responses**
   - This is normal for AI-generated responses
   - The chatbot shows loading indicators during processing

### Testing
1. Open the home page
2. Click the chat button in the bottom-right corner
3. Try asking: "How do I report a pothole?"
4. Verify you get a helpful response

## Security Notes
- The Gemini API key should be kept secure and not committed to version control
- The chatbot only processes text and doesn't store conversations
- All responses are generated in real-time

## Support
If you encounter any issues:
1. Check the browser console for frontend errors
2. Check the backend console for server errors
3. Verify your Gemini API key is valid and has sufficient quota
4. Ensure all dependencies are properly installed

