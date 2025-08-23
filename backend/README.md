# Backend Setup

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
# MongoDB Connection
MONGODB_URI=mongodb://localhost:27017/image_analysis

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key

# Server Configuration
PORT=3000
```

## Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the server:
   ```bash
   npm start
   ```

## Features

- Image upload to Cloudinary
- MongoDB storage for image metadata
- Gemini AI analysis for infrastructure safety assessment
- RESTful API endpoints for image management

## Gemini AI Models

The system automatically tries these models in order:
1. `gemini-1.5-flash` (recommended - fastest)
2. `gemini-1.5-pro` (fallback)
3. `gemini-pro` (legacy fallback)

## Troubleshooting

### Gemini API Issues
- Ensure your `GEMINI_API_KEY` is valid and has access to the models
- Check the [Google AI Studio](https://makersuite.google.com/app/apikey) for API key status
- The system will automatically try different models if one fails

### Image Analysis
- Images are processed through Cloudinary for optimization
- Analysis focuses on infrastructure safety (potholes, flooding, structural damage)
- Results include safety scoring and recommendations
