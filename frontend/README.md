# Image Data Analysis System - Frontend

This React application provides a comprehensive interface for uploading, viewing, and analyzing infrastructure images using AI-powered safety assessment with location tracking and user information.

## Features

- **Image Upload with Location**: Upload images with automatic location capture and user details
- **User Information Collection**: Collect name, area, and pincode for each upload
- **Location Services**: GPS location capture with reverse geocoding for address
- **Image Gallery**: View all uploaded images with user and location data
- **AI Analysis**: Analyze images using Google Gemini AI for safety assessment
- **Safety Scoring**: Automatic safety assessment with percentage scores
- **Real-time Updates**: Images refresh automatically after upload
- **Admin Dashboard**: Dedicated analysis page with statistics and management tools

## Pages & Routes

### `/` - Home Page
- **Image Upload Form**: Upload images with location and user information
- **Image Gallery**: Display all uploaded images with metadata
- **Quick Actions**: Navigation to admin dashboard

### `/admin` - Admin Dashboard
- **Statistics Dashboard**: Overview of total images, analyzed count, safety breakdown
- **Image Analysis Grid**: Browse and analyze images with AI
- **Analysis Panel**: Real-time safety assessment results
- **Safety Scoring**: Visual safety indicators and percentages

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. The app will be available at `http://localhost:5173`

## Environment Variables

Create a `.env` file in the frontend directory:

```env
# Backend URL (required)
VITE_BACKEND_URL=http://localhost:3000

# Google Maps API Key (optional - for reverse geocoding address)
# Get from: https://console.cloud.google.com/apis/credentials
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

## How It Works

1. **Upload Images with Location**: 
   - Select an image file
   - Fill in your name, area, and pincode
   - Click "Use Current Location" to capture GPS coordinates
   - Upload image with all information

2. **View Images**: All uploaded images appear in the gallery with:
   - User information (name, area, pincode)
   - Location coordinates (latitude, longitude)
   - Upload timestamp
   - Location status indicator

3. **Analyze Safety**: 
   - Navigate to `/admin` for the analysis dashboard
   - Click "Analyze Image" to get AI-powered safety assessment
   - View safety percentage and risk level (Safe/Moderate/Danger)

4. **Admin Dashboard**: 
   - View comprehensive statistics
   - Analyze multiple images efficiently
   - Track safety trends across all uploads

## Location Features

- **GPS Capture**: Uses browser geolocation API
- **Permission Handling**: Manages location permissions gracefully
- **Reverse Geocoding**: Converts coordinates to readable addresses (requires Google Maps API key)
- **Fallback Support**: Works without Google Maps API key

## Safety Assessment

The AI analyzes images for:
- Road surface conditions (potholes, cracks)
- Drainage issues (flooding, standing water)
- Structural damage (cracks, erosion)
- Environmental hazards
- Safety recommendations

## Technologies Used

- React 19
- React Router DOM (for navigation)
- Vite
- Tailwind CSS
- Google Gemini AI
- Browser Geolocation API
- Google Maps Geocoding API (optional)
- Cloudinary (image storage)
- MongoDB (metadata storage)
